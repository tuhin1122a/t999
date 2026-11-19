import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const AGENT_JWT_SECRET =
  process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export interface AgentAuthPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
}

export function signAgentToken(payload: AgentAuthPayload): string {
  return jwt.sign(
    {
      sub: payload.adminId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      scope: "agent_app",
    },
    AGENT_JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export async function verifyAgentRequest(
  req: NextRequest
): Promise<AgentAuthPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, AGENT_JWT_SECRET) as {
      sub?: string;
      scope?: string;
    };
    if (!decoded?.sub || decoded.scope !== "agent_app") {
      return null;
    }

    const admin = await db.admin.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) return null;

    return {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  } catch {
    return null;
  }
}

export interface AutoMatchResult {
  matched: boolean;
  status: "MATCHED" | "UNMATCHED" | "AMOUNT_MISMATCH";
  depositId?: string;
  userId?: string;
  amount?: number;
  note: string;
}

/**
 * Matches an IncomingSms against a PENDING Deposit by TrxID (case-insensitive) + exact amount.
 * Credits ONLY the deposit amount + 1x turnover (bonus intentionally skipped).
 */
export async function tryAutoApproveDepositBySms(
  smsId: string,
  trxId: string,
  smsAmount: number
): Promise<AutoMatchResult> {
  const cleanTrxId = trxId.trim().toUpperCase();
  if (!cleanTrxId || !Number.isFinite(smsAmount) || smsAmount <= 0) {
    return { matched: false, status: "UNMATCHED", note: "Invalid TrxID or amount" };
  }

  const pendingDeposit = await db.deposit.findFirst({
    where: {
      status: "PENDING",
      trxID: { equals: cleanTrxId, mode: "insensitive" },
    },
    include: {
      user: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!pendingDeposit) {
    return {
      matched: false,
      status: "UNMATCHED",
      note: "Saved. Waiting for player to submit this TrxID.",
    };
  }

  const depositAmount = Number(pendingDeposit.amount);
  if (Math.abs(depositAmount - smsAmount) > 0.01) {
    const note = `Amount mismatch: SMS=৳${smsAmount.toFixed(2)}, Deposit=৳${depositAmount.toFixed(2)}`;
    await db.incomingSms
      .update({
        where: { id: smsId },
        data: {
          status: "AMOUNT_MISMATCH",
          matchedDepositId: pendingDeposit.id,
          matchedUserId: pendingDeposit.userId,
          note,
        },
      })
      .catch(() => {});
    return {
      matched: false,
      status: "AMOUNT_MISMATCH",
      depositId: pendingDeposit.id,
      userId: pendingDeposit.userId,
      amount: depositAmount,
      note,
    };
  }

  const approved = await db.$transaction(
    async (tx) => {
      const depUpdated = await tx.deposit.updateMany({
        where: { id: pendingDeposit.id, status: "PENDING" },
        data: { status: "APPROVED" },
      });
      if (depUpdated.count === 0) return false;

      const smsUpdated = await tx.incomingSms.updateMany({
        where: { id: smsId, status: { not: "MATCHED" } },
        data: {
          status: "MATCHED",
          matchedDepositId: pendingDeposit.id,
          matchedUserId: pendingDeposit.userId,
          note: `Auto-approved for ${pendingDeposit.user?.phone || pendingDeposit.userId}`,
          processedAt: new Date(),
        },
      });
      if (smsUpdated.count === 0) {
        throw new Error("SMS_ALREADY_MATCHED");
      }

      await tx.wallet.update({
        where: { userId: pendingDeposit.userId },
        data: {
          balance: { increment: new Prisma.Decimal(depositAmount) },
          turnOver: { increment: new Prisma.Decimal(depositAmount) },
        },
      });

      await tx.notification
        .create({
          data: {
            title: "Deposit Auto-Approved!",
            description: `৳${depositAmount.toFixed(2)} (TrxID: ${cleanTrxId}) has been automatically added to your wallet.`,
            icon: "DEPOSIT",
            userId: pendingDeposit.userId,
          },
        })
        .catch(() => {});

      return true;
    },
    { maxWait: 5000, timeout: 10000 }
  );

  if (!approved) {
    return {
      matched: false,
      status: "UNMATCHED",
      note: "Deposit was already processed.",
    };
  }

  return {
    matched: true,
    status: "MATCHED",
    depositId: pendingDeposit.id,
    userId: pendingDeposit.userId,
    amount: depositAmount,
    note: `Auto-approved ৳${depositAmount.toFixed(2)} for ${pendingDeposit.user?.phone || "player"}`,
  };
}

/**
 * Reverse check: called right after a player submits a deposit on Web or Mobile App.
 * If the matching SMS already arrived earlier, auto-approve immediately!
 */
export async function tryAutoMatchExistingSmsForDeposit(
  depositId: string
): Promise<AutoMatchResult | null> {
  try {
    const deposit = await db.deposit.findUnique({
      where: { id: depositId },
    });
    if (!deposit || deposit.status !== "PENDING" || !deposit.trxID) {
      return null;
    }

    const cleanTrxId = deposit.trxID.trim().toUpperCase();
    const existingSms = await db.incomingSms.findFirst({
      where: {
        trxId: { equals: cleanTrxId, mode: "insensitive" },
        status: { in: ["UNMATCHED", "AMOUNT_MISMATCH"] },
      },
    });

    if (!existingSms) return null;

    return await tryAutoApproveDepositBySms(
      existingSms.id,
      existingSms.trxId,
      Number(existingSms.amount)
    );
  } catch (err) {
    console.error("[agentAutoDeposit] Reverse SMS match error:", err);
    return null;
  }
}
