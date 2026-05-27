import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { success: false, error: "Your account has been banned by the administrator." },
        { status: 403 }
      );
    }

    const { amount: inputAmount, bonusFor, senderNumber, trxID, walletId, walletNumber } = await req.json();
    const amount = parseFloat(inputAmount);

    if (!amount || amount <= 0 || !trxID || !walletId || !walletNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: amount, trxID, walletId, and walletNumber are required." },
        { status: 400 }
      );
    }

    // 1️⃣ Validate deposit wallet and limits
    const wallet = await db.depositWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Invalid payment method wallet selected." },
        { status: 400 }
      );
    }

    const minDeposit = parseFloat(wallet.minDeposit.toString());
    const maxDeposit = parseFloat(wallet.maximumDeposit.toString());

    if (amount < minDeposit || amount > maxDeposit) {
      return NextResponse.json(
        { success: false, error: `Deposit amount must be between ${minDeposit} BDT and ${maxDeposit} BDT.` },
        { status: 400 }
      );
    }

    // 2️⃣ Check for duplicate Transaction ID (TrxID)
    const existingDeposit = await db.deposit.findFirst({
      where: { trxID },
    });

    if (existingDeposit) {
      return NextResponse.json(
        { success: false, error: "This Transaction ID (TrxID) has already been submitted." },
        { status: 400 }
      );
    }

    // 3️⃣ Securely calculate bonus amount in backend
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
          return NextResponse.json(
            { success: false, error: "You are not eligible for the First Deposit (Sign-in) bonus." },
            { status: 400 }
          );
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
        senderNumber: senderNumber || "",
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
      message: "Deposit submitted successfully! Waiting for Admin approval.",
      depositId: newDeposit.id,
      trackingNumber: newDeposit.trackingNumber,
    });
  } catch (error: any) {
    console.error("Mobile Deposit Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
