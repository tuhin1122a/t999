// src/app/api/deposit/route.ts
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export const POST = async (req: NextRequest) => {
  try {
    const { amount: inputAmount, bonusFor, senderNumber, trxID, walletId, walletNumber } = await req.json();

    const amount = parseFloat(inputAmount);

    if (!amount || amount <= 0 || !senderNumber || !trxID || !walletId || !walletNumber) {
      return NextResponse.json({ success: false, message: "Missing required fields: amount, senderNumber, trxID, walletId, and walletNumber are required." }, { status: 400 });
    }

    const user: any = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 });
    }

    // 1️⃣ Validate deposit wallet and limits
    const wallet = await db.depositWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return NextResponse.json({ success: false, message: "Invalid payment method wallet selected." }, { status: 400 });
    }

    const minDeposit = parseFloat(wallet.minDeposit.toString());
    const maxDeposit = parseFloat(wallet.maximumDeposit.toString());

    if (amount < minDeposit || amount > maxDeposit) {
      return NextResponse.json({ success: false, message: `Deposit amount must be between ${minDeposit} BDT and ${maxDeposit} BDT.` }, { status: 400 });
    }

    // 2️⃣ Check for duplicate Transaction ID (TrxID)
    const existingDeposit = await db.deposit.findFirst({
      where: { trxID },
    });

    if (existingDeposit) {
      return NextResponse.json({ success: false, message: "This Transaction ID (TrxID) has already been submitted." }, { status: 400 });
    }

    // 3️⃣ Securely calculate bonus amount in backend and verify eligibility
    let bonusAmount = 0;
    if (bonusFor && bonusFor !== "none") {
      if (bonusFor === "signinBonus") {
        const userWallet = await db.wallet.findUnique({
          where: { userId: user.id },
        });
        const approvedDepositsCount = await db.deposit.count({
          where: {
            userId: user.id,
            status: "APPROVED",
          },
        });
        const isSigninBonusActive = userWallet?.signinBonus || approvedDepositsCount === 0;
        if (!isSigninBonusActive) {
          return NextResponse.json({ success: false, message: "You are not eligible for the First Deposit (Sign-in) bonus." }, { status: 400 });
        }
      }

      try {
        const bonusSettings = await db.bonus.findFirst();
        if (bonusSettings) {
          const percent = bonusFor === "signinBonus" ? bonusSettings.signinBonus : bonusFor === "referralBonus" ? bonusSettings.referralBonus : 0;
          bonusAmount = Math.round((amount * percent) / 100);
        }
      } catch (err) {
        console.error("Failed to query bonus settings:", err);
      }
    }

    // 4️⃣ Generate unique tracking number
    const trackingNumber = "DEP" + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);

    // 5️⃣ Create manual deposit record in database
    const newDeposit = await db.deposit.create({
      data: {
        amount: new Prisma.Decimal(amount),
        bonus: new Prisma.Decimal(bonusAmount),
        bonusFor: bonusFor || "none",
        senderNumber: senderNumber,
        trxID: trxID,
        walletId: walletId,
        walletNumber: walletNumber,
        trackingNumber: trackingNumber,
        expire: new Date(Date.now() + 2 * 60 * 60 * 1000), // Expires in 2 hours
        status: "PENDING",
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      payload: {
        message: "Deposit submitted successfully! Waiting for Admin approval.",
        depositId: newDeposit.id,
        trackingNumber: newDeposit.trackingNumber,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error("Manual deposit submission error:", error);
    return NextResponse.json({ message: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
