// src/app/api/deposit/route.ts
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createPayment, generateInvoiceNumber } from "@/lib/api/durantoPayApi";

export const POST = async (req: NextRequest) => {
  try {
    const { amount, ps } = await req.json();

    if (!amount || !ps) {
      return NextResponse.json({ success: false, message: "Missing required fields: amount and ps are required" }, { status: 400 });
    }

    const user: any = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 });
    }

    const invoice_no = generateInvoiceNumber();

    // 1️⃣ Create Durantopay payment
    const isMock = !process.env.DURANTOPAY_APP_KEY || process.env.DURANTOPAY_APP_KEY.trim() === "";
    let paymentResponse;

    if (isMock) {
      const mockTxId = `MOCK_TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      paymentResponse = {
        status: 0,
        message: "Mock payment initiated",
        data: {
          dp_transaction_id: mockTxId,
          payment_url: `/mock-payment?invoice_no=${invoice_no}&amount=${amount}&ps=${ps}`,
          transaction_status: "PENDING"
        }
      };
    } else {
      try {
        paymentResponse = await createPayment({ invoice_no, paymentType: ps, amount: amount.toString() });
      } catch (apiError: any) {
        console.error("Durantopay API call failed:", apiError);
        return NextResponse.json({ success: false, message: `Payment service error: ${apiError.message}` }, { status: 500 });
      }
    }

    if (!paymentResponse || paymentResponse.status !== 0) {
      return NextResponse.json({ success: false, message: "Deposit Failed: " + (paymentResponse?.message || "Payment service error") }, { status: 500 });
    }

    // 2️⃣ Save pending deposit
    await db.durantoPayDeposit.create({
      data: {
        invoice_no,
        dp_transaction_id: String(paymentResponse.data?.dp_transaction_id || paymentResponse.dp_transaction_id || ""),
        amount: new Prisma.Decimal(amount),
        paymentType: ps,
        status: "PENDING",
        user: { connect: { id: user.id } },
      },
    });

    // 3️⃣ Return payment URL for frontend
    const paymentUrl =
      paymentResponse.data?.payment_url ||
      paymentResponse.data?.paymentUrl ||
      paymentResponse.payment_url ||
      null;

    const transactionId = String(paymentResponse.data?.dp_transaction_id || paymentResponse.dp_transaction_id || "");
    const transactionStatus = paymentResponse.data?.transaction_status || paymentResponse.data?.status || paymentResponse.transaction_status || "unverified";

    if (!paymentUrl) {
      console.error("No payment URL found. Full response:", paymentResponse);
      return NextResponse.json({
        success: false,
        message: "Payment request created but payment URL is not available. Contact support.",
        debug: {
          hasData: !!paymentResponse.data,
          dataKeys: paymentResponse.data ? Object.keys(paymentResponse.data) : [],
          responseKeys: Object.keys(paymentResponse),
        },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payload: { dp_transaction_id: transactionId, payment_url: paymentUrl, transaction_status: transactionStatus, invoice_no },
    }, { status: 200 });

  } catch (error: any) {
    console.error("Deposit error:", error);
    return NextResponse.json({ message: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
