// src/app/api/deposit/callback/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/action/notifications";

/**
 * Secondary Deposit Webhook Callback Handler
 * Enforces idempotency so a completed deposit cannot be credited more than once.
 */
export async function POST(req: Request) {
  try {
    const { invoice_no, status, amount } = await req.json();

    if (!invoice_no) {
      return NextResponse.json({ message: "Missing invoice_no" }, { status: 400 });
    }

    const depositRecord = await db.durantoPayDeposit.findUnique({
      where: { invoice_no },
      include: { user: true },
    });

    if (!depositRecord) {
      return NextResponse.json({ message: "Deposit record not found" }, { status: 404 });
    }

    // Idempotency Guard: Ignore if already COMPLETED
    if (depositRecord.status === "COMPLETED") {
      return NextResponse.json({ message: "Deposit already processed" }, { status: 200 });
    }

    if (status !== "success") {
      await db.durantoPayDeposit.update({
        where: { invoice_no },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ message: "Transaction failed" });
    }

    const depositAmount = Number(depositRecord.amount || amount || 0);

    await db.$transaction(async (tx) => {
      const updated = await tx.durantoPayDeposit.updateMany({
        where: {
          invoice_no,
          status: { not: "COMPLETED" },
        },
        data: { status: "COMPLETED" },
      });

      if (updated.count === 0) return;

      if (depositAmount > 0) {
        await tx.wallet.update({
          where: { userId: depositRecord.user.id },
          data: {
            balance: { increment: depositAmount },
            turnOver: { increment: depositAmount }, // 1x Turnover requirement
          },
        });
      }
    });

    await createNotification({
      title: "Deposit Successful",
      description: `Your deposit of ${depositAmount} BDT has been added (1x Turnover applicable).`,
      userId: depositRecord.user.id,
      icon: "MONEY",
    }).catch(() => {});

    return NextResponse.json({ message: "Deposit successful" });
  } catch (err: any) {
    console.error("Deposit callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
