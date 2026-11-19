import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tryAutoMatchExistingSmsForDeposit } from "@/lib/agentAutoDeposit";
import { getScopedDepositWalletsForUser } from "@/lib/depositWallets";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization header missing or invalid", error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token", error: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found", error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account has been banned by the administrator.",
          error: "Your account has been banned by the administrator.",
        },
        { status: 403 }
      );
    }

    const {
      amount: inputAmount,
      bonusFor,
      senderNumber,
      trxID,
      walletId,
      walletNumber,
    } = await req.json();
    const amount = parseFloat(inputAmount);

    if (!amount || amount <= 0 || !trxID || !walletId || !walletNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: amount, trxID, walletId, and walletNumber are required.",
          error: "Missing required fields: amount, trxID, walletId, and walletNumber are required.",
        },
        { status: 400 }
      );
    }

    // 1️⃣ Validate deposit wallet belongs to user's allowed wallet scope and limits
    const { depositWallets: allowedWallets } = await getScopedDepositWalletsForUser(user.id);
    const wallet = allowedWallets.find((w) => w.id === walletId);

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or unavailable payment method wallet selected.",
          error: "Invalid or unavailable payment method wallet selected.",
        },
        { status: 400 }
      );
    }

    if (
      Array.isArray(wallet.walletsNumber) &&
      wallet.walletsNumber.length > 0 &&
      !wallet.walletsNumber.includes(walletNumber)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected receiver number does not match this payment gateway.",
          error: "Selected receiver number does not match this payment gateway.",
        },
        { status: 400 }
      );
    }

    const minDeposit = parseFloat(wallet.minDeposit.toString());
    const maxDeposit = parseFloat(wallet.maximumDeposit.toString());

    if (amount < minDeposit || amount > maxDeposit) {
      return NextResponse.json(
        {
          success: false,
          message: `Deposit amount must be between ${minDeposit} BDT and ${maxDeposit} BDT.`,
          error: `Deposit amount must be between ${minDeposit} BDT and ${maxDeposit} BDT.`,
        },
        { status: 400 }
      );
    }

    // 2️⃣ Check for duplicate Transaction ID (TrxID)
    const cleanTrxId = String(trxID).trim();
    const existingDeposit = await db.deposit.findFirst({
      where: { trxID: cleanTrxId },
    });

    if (existingDeposit) {
      return NextResponse.json(
        {
          success: false,
          message: "This Transaction ID (TrxID) has already been submitted.",
          error: "This Transaction ID (TrxID) has already been submitted.",
        },
        { status: 400 }
      );
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
          return NextResponse.json(
            {
              success: false,
              message: "You are not eligible for the First Deposit (Sign-in) bonus.",
              error: "You are not eligible for the First Deposit (Sign-in) bonus.",
            },
            { status: 400 }
          );
        }
      }

      try {
        const bonusSettings = await db.bonus.findFirst();
        if (bonusSettings) {
          const percent =
            bonusFor === "signinBonus"
              ? bonusSettings.signinBonus
              : bonusFor === "referralBonus"
              ? bonusSettings.referralBonus
              : 0;
          bonusAmount = Math.round((amount * percent) / 100);
        }
      } catch (err) {
        console.error("Failed to query bonus settings:", err);
      }
    }

    // 4️⃣ Generate unique tracking number
    const trackingNumber =
      "DEP" + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);

    // 5️⃣ Create manual deposit record in database
    const newDeposit = await db.deposit.create({
      data: {
        amount: new Prisma.Decimal(amount),
        bonus: new Prisma.Decimal(bonusAmount),
        bonusFor: bonusFor || "none",
        senderNumber: senderNumber || "",
        trxID: cleanTrxId,
        walletId: walletId,
        walletNumber: walletNumber,
        trackingNumber: trackingNumber,
        expire: new Date(Date.now() + 2 * 60 * 60 * 1000), // Expires in 2 hours
        status: "PENDING",
        userId: user.id,
      },
    });

    // 6️⃣ Instant Auto-Match if SMS already arrived earlier
    const autoMatch = await tryAutoMatchExistingSmsForDeposit(newDeposit.id);
    const msg = autoMatch?.matched
      ? "Deposit auto-approved instantly! Balance added to your wallet."
      : "Deposit submitted successfully! Waiting for Admin approval.";

    return NextResponse.json({
      success: true,
      message: msg,
      depositId: newDeposit.id,
      trackingNumber: newDeposit.trackingNumber,
      autoApproved: Boolean(autoMatch?.matched),
      payload: {
        message: msg,
        deposit: newDeposit,
      },
    });
  } catch (error: any) {
    console.error("Mobile Deposit Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
