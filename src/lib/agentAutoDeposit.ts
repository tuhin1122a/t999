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
  status: "MATCHED" | "UNMATCHED" | "DUPLICATE_TRX";
  depositId?: string;
  userId?: string;
  amount?: number;
  note: string;
}

/**
 * Matches an IncomingSms against a PENDING Deposit by TrxID (case-insensitive).
 *
 * KEY RULES:
 * 1. Always credits the ACTUAL SMS AMOUNT received (e.g., if user requested ৳400
 *    but actually sent ৳500 via bKash, deposit is updated to ৳500 and wallet gets ৳500).
 * 2. Credits ONLY the actual SMS amount + 1x turnover (bonus intentionally skipped).
 * 3. Strictly prevents duplicate TrxID reuse — once a TrxID is approved on any deposit
 *    or matched in IncomingSms, it can NEVER be credited again.
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

  // Guard 1: Check if this TrxID was already used on any APPROVED deposit
  const alreadyApproved = await db.deposit.findFirst({
    where: {
      status: "APPROVED",
      trxID: { equals: cleanTrxId, mode: "insensitive" },
    },
    select: { id: true, userId: true },
  });

  if (alreadyApproved) {
    const note = `Duplicate TrxID blocked (already approved on deposit ${alreadyApproved.id})`;
    await db.incomingSms
      .update({
        where: { id: smsId },
        data: {
          status: "MATCHED",
          matchedDepositId: alreadyApproved.id,
          matchedUserId: alreadyApproved.userId,
          note,
          processedAt: new Date(),
        },
      })
      .catch(() => {});
    return {
      matched: false,
      status: "DUPLICATE_TRX",
      depositId: alreadyApproved.id,
      note,
    };
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

  const requestedAmount = Number(pendingDeposit.amount);
  const actualCreditAmount = Number(smsAmount.toFixed(2));
  const amountChanged = Math.abs(requestedAmount - actualCreditAmount) > 0.01;
  const creditDecimal = new Prisma.Decimal(actualCreditAmount.toFixed(2));

  const noteText = amountChanged
    ? `Auto-approved ৳${actualCreditAmount.toFixed(2)} (requested ৳${requestedAmount.toFixed(2)}) for ${pendingDeposit.user?.phone || pendingDeposit.userId}`
    : `Auto-approved ৳${actualCreditAmount.toFixed(2)} for ${pendingDeposit.user?.phone || pendingDeposit.userId}`;

  const approved = await db.$transaction(
    async (tx) => {
      // Atomic re-check: ensure no other deposit with this TrxID was approved concurrently
      const dupCount = await tx.deposit.count({
        where: {
          status: "APPROVED",
          trxID: { equals: cleanTrxId, mode: "insensitive" },
        },
      });
      if (dupCount > 0) return false;

      // Update deposit status to APPROVED and set amount to the ACTUAL SMS amount received
      const depUpdated = await tx.deposit.updateMany({
        where: { id: pendingDeposit.id, status: "PENDING" },
        data: {
          status: "APPROVED",
          amount: creditDecimal,
        },
      });
      if (depUpdated.count === 0) return false;

      const smsUpdated = await tx.incomingSms.updateMany({
        where: { id: smsId, status: { not: "MATCHED" } },
        data: {
          status: "MATCHED",
          matchedDepositId: pendingDeposit.id,
          matchedUserId: pendingDeposit.userId,
          note: noteText,
          processedAt: new Date(),
        },
      });
      if (smsUpdated.count === 0) {
        throw new Error("SMS_ALREADY_MATCHED");
      }

      // Reject any other duplicate PENDING deposits that submitted the same TrxID
      await tx.deposit
        .updateMany({
          where: {
            id: { not: pendingDeposit.id },
            status: "PENDING",
            trxID: { equals: cleanTrxId, mode: "insensitive" },
          },
          data: { status: "REJECTED" },
        })
        .catch(() => {});

      // Credit EXACT SMS amount + 1x turnover (no bonus)
      await tx.wallet.update({
        where: { userId: pendingDeposit.userId },
        data: {
          balance: { increment: creditDecimal },
          turnOver: { increment: creditDecimal },
        },
      });

      await tx.notification
        .create({
          data: {
            title: "Deposit Auto-Approved!",
            description: amountChanged
              ? `৳${actualCreditAmount.toFixed(2)} received via SMS (TrxID: ${cleanTrxId}, requested ৳${requestedAmount.toFixed(2)}) has been added to your wallet.`
              : `৳${actualCreditAmount.toFixed(2)} (TrxID: ${cleanTrxId}) has been automatically added to your wallet.`,
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
      status: "DUPLICATE_TRX",
      note: "Deposit or TrxID was already processed.",
    };
  }

  return {
    matched: true,
    status: "MATCHED",
    depositId: pendingDeposit.id,
    userId: pendingDeposit.userId,
    amount: actualCreditAmount,
    note: noteText,
  };
}

/**
 * Reverse check: called right after a player submits a deposit on Web or Mobile App.
 * If the matching SMS already arrived earlier, auto-approve immediately with the SMS amount!
 * Also blocks reuse if the TrxID was already approved on a previous deposit.
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

    // If this TrxID was already approved earlier, auto-reject this duplicate request
    const alreadyUsed = await db.deposit.findFirst({
      where: {
        status: "APPROVED",
        trxID: { equals: cleanTrxId, mode: "insensitive" },
      },
      select: { id: true },
    });
    if (alreadyUsed) {
      await db.deposit
        .update({
          where: { id: deposit.id },
          data: { status: "REJECTED" },
        })
        .catch(() => {});
      return {
        matched: false,
        status: "DUPLICATE_TRX",
        note: "Duplicate TrxID rejected automatically",
      };
    }

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
