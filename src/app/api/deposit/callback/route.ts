// src/app/api/deposit/callback/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/action/notifications";

export async function POST(req: Request) {
  try {
    const { invoice_no, status, amount } = await req.json();

    // Find the deposit record to get user information
    const depositRecord = await db.durantoPayDeposit.findUnique({
      where: { invoice_no },
      include: { user: true }
    });

    if (!depositRecord) {
      return NextResponse.json({ message: "Deposit record not found" }, { status: 404 });
    }

    if (status !== "success") {
      await db.durantoPayDeposit.update({
        where: { invoice_no },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ message: "Transaction failed" });
    }

    if (depositRecord.status !== "COMPLETED") {
      await db.durantoPayDeposit.update({
        where: { invoice_no },
        data: { status: "COMPLETED" },
      });

      const depositAmount = Number(amount || depositRecord.amount || 0);
      if (depositAmount > 0) {
        await db.wallet.update({
          where: { userId: depositRecord.user.id },
          data: {
            balance: { increment: depositAmount },
            turnOver: { increment: depositAmount }, // 1x Turnover requirement
          },
        });
      }
    }

    await createNotification({
      title: "Deposit Successful",
      description: `Your deposit of ${amount || depositRecord.amount} BDT has been added (1x Turnover applicable).`,
      userId: depositRecord.user.id,
      icon: "MONEY",
    });

    return NextResponse.json({ message: "Deposit successful" });

  } catch (err: any) {
    console.error("Deposit callback error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
