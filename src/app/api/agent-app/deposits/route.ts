import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAgentRequest } from "@/lib/agentAutoDeposit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const agent = await verifyAgentRequest(req);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const depositId = String(body?.depositId || "").trim();
    const action = String(body?.action || "").toLowerCase();

    if (!depositId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { success: false, error: "depositId and action (approve|reject) required" },
        { status: 400 }
      );
    }

    const deposit = await db.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      return NextResponse.json(
        { success: false, error: "Deposit not found" },
        { status: 404 }
      );
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Deposit already processed" },
        { status: 400 }
      );
    }

    const processed = await db.$transaction(
      async (tx) => {
        const updated = await tx.deposit.updateMany({
          where: { id: depositId, status: "PENDING" },
          data: { status: action === "approve" ? "APPROVED" : "REJECTED" },
        });
        if (updated.count === 0) return false;

        if (action === "approve") {
          // Credit exact deposit amount + 1x turnover (bonus intentionally skipped)
          await tx.wallet.update({
            where: { userId: deposit.userId },
            data: {
              balance: { increment: deposit.amount },
              turnOver: { increment: deposit.amount },
            },
          });

          if (deposit.trxID) {
            await tx.incomingSms
              .updateMany({
                where: {
                  trxId: { equals: deposit.trxID.trim().toUpperCase(), mode: "insensitive" },
                  status: { not: "MATCHED" },
                },
                data: {
                  status: "MATCHED",
                  matchedDepositId: deposit.id,
                  matchedUserId: deposit.userId,
                  note: "Manually approved via Agent App",
                  processedAt: new Date(),
                },
              })
              .catch(() => {});
          }
        }

        await tx.notification
          .create({
            data: {
              title:
                action === "approve"
                  ? "Deposit Approved!"
                  : "Deposit Rejected",
              description:
                action === "approve"
                  ? `Your deposit of ৳${Number(deposit.amount).toFixed(2)} has been added to your wallet.`
                  : `Your deposit of ৳${Number(deposit.amount).toFixed(2)} was rejected.`,
              icon: "DEPOSIT",
              userId: deposit.userId,
            },
          })
          .catch(() => {});

        return true;
      },
      { maxWait: 5000, timeout: 10000 }
    );

    if (!processed) {
      return NextResponse.json(
        { success: false, error: "Deposit already processed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Deposit approved successfully"
          : "Deposit rejected",
    });
  } catch (err: any) {
    console.error("[agent-app/deposits] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process deposit" },
      { status: 500 }
    );
  }
}
