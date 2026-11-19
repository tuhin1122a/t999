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
    const withdrawId = String(body?.withdrawId || "").trim();
    const action = String(body?.action || "").toLowerCase();

    if (!withdrawId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { success: false, error: "withdrawId and action (approve|reject) required" },
        { status: 400 }
      );
    }

    const withdraw = await db.withdraw.findUnique({
      where: { id: withdrawId },
      include: { user: { select: { id: true, phone: true } } },
    });

    if (!withdraw) {
      return NextResponse.json(
        { success: false, error: "Withdraw request not found" },
        { status: 404 }
      );
    }

    if (withdraw.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Withdraw request already processed" },
        { status: 400 }
      );
    }

    const processed = await db.$transaction(
      async (tx) => {
        const updated = await tx.withdraw.updateMany({
          where: { id: withdrawId, status: "PENDING" },
          data: { status: action === "approve" ? "APPROVED" : "REJECTED" },
        });
        if (updated.count === 0) return false;

        if (action === "reject") {
          // Refund deducted balance back to player wallet atomically
          await tx.wallet.update({
            where: { userId: withdraw.userId },
            data: { balance: { increment: withdraw.amount } },
          });
        }

        await tx.notification
          .create({
            data: {
              title:
                action === "approve"
                  ? "Withdraw Approved!"
                  : "Withdraw Rejected & Refunded",
              description:
                action === "approve"
                  ? `Your withdrawal of ৳${Number(withdraw.amount).toFixed(2)} has been sent.`
                  : `Your withdrawal of ৳${Number(withdraw.amount).toFixed(2)} was rejected and refunded to your wallet.`,
              icon: "WITHDRAW",
              userId: withdraw.userId,
            },
          })
          .catch(() => {});

        return true;
      },
      { maxWait: 5000, timeout: 10000 }
    );

    if (!processed) {
      return NextResponse.json(
        { success: false, error: "Withdraw request already processed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Withdrawal approved successfully"
          : "Withdrawal rejected & balance refunded",
    });
  } catch (err: any) {
    console.error("[agent-app/withdrawals] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
