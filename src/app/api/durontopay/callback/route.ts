// src/app/api/durontopay/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import * as crypto from "crypto";

/**
 * DurantoPay Payment Webhook Callback Handler
 * Security & Integrity Rules:
 * 1. Validates required transaction identifiers (`dp_transaction_id` & `invoice_no`).
 * 2. Blocks simulated `MOCK_TX_` transactions in production environments.
 * 3. Enforces strict idempotency: if an invoice is already COMPLETED, duplicate callbacks are ignored.
 * 4. Atomically credits wallet balance + 1x turnover requirement inside a Prisma transaction.
 */
export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // 1. Validate required fields
    if (!data.dp_transaction_id || !data.invoice_no) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const { dp_transaction_id, invoice_no, status } = data;

    // 2. Block mock/simulated transactions in production
    if (
      process.env.NODE_ENV === "production" &&
      String(dp_transaction_id).startsWith("MOCK_TX_")
    ) {
      console.warn(`[DurantoPay Security] Blocked mock transaction in production: ${invoice_no}`);
      return NextResponse.json({ message: "Forbidden transaction source" }, { status: 403 });
    }

    // 3. Find the deposit record with user relation
    const depositRecord = await db.durantoPayDeposit.findUnique({
      where: { invoice_no },
      include: { user: true },
    });

    if (!depositRecord) {
      return NextResponse.json({ message: "Deposit record not found" }, { status: 404 });
    }

    // 4. Idempotency Guard: Prevent double-crediting if invoice is already COMPLETED
    if (depositRecord.status === "COMPLETED") {
      return NextResponse.json(
        { message: "Invoice already processed", status: "COMPLETED" },
        { status: 200 }
      );
    }

    const normalizedStatus =
      status === "success"
        ? "COMPLETED"
        : status === "failed"
        ? "FAILED"
        : "PENDING";

    // 5. If payment failed or pending, update status only
    if (normalizedStatus !== "COMPLETED") {
      await db.durantoPayDeposit.update({
        where: { invoice_no },
        data: {
          status: normalizedStatus,
          dp_transaction_id: String(dp_transaction_id),
        },
      });
      return NextResponse.json({ message: `Deposit marked as ${normalizedStatus}` }, { status: 200 });
    }

    // 6. Atomic Transaction: Mark COMPLETED + Credit Balance + Apply 1x Turnover
    const depositDecimal = new Prisma.Decimal(depositRecord.amount.toString());

    await db.$transaction(async (tx) => {
      // Conditional update ensures no concurrent race condition credits twice
      const updated = await tx.durantoPayDeposit.updateMany({
        where: {
          invoice_no,
          status: { not: "COMPLETED" },
        },
        data: {
          status: "COMPLETED",
          dp_transaction_id: String(dp_transaction_id),
        },
      });

      if (updated.count === 0) {
        return; // Already settled by a parallel request
      }

      await tx.wallet.update({
        where: { userId: depositRecord.userId },
        data: {
          balance: { increment: depositDecimal },
          turnOver: { increment: depositDecimal }, // 1x Turnover requirement
        },
      });

      await tx.transaction.create({
        data: {
          transactionId: crypto.randomUUID(),
          playerId: depositRecord.user.gameXAPlayerId || depositRecord.userId,
          amount: depositRecord.amount,
          status: "COMPLETED",
        },
      });
    });

    return NextResponse.json({ message: "Callback processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DurantoPay callback processing error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};

export const GET = async () => {
  return NextResponse.json({
    message: "Durantopay callback endpoint is active",
    status: "active",
  });
};
