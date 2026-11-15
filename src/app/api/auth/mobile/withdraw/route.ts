import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { createNotification } from "@/action/notifications";
import { cardNumberGenerate } from "@/lib/helpers";
import bcrypt from "bcryptjs";
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

    const { account_number, amount, password, ps } = await req.json();

    if (!account_number || !amount || !password || !ps) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: account_number, amount, password, and ps are required" },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid withdrawal amount" },
        { status: 400 }
      );
    }

    // Verify Password
    const passwordToCompare = user.withdrawPassword || user.password;
    const isPasswordMatch = await bcrypt.compare(password, passwordToCompare);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 400 }
      );
    }

    // Check user wallet
    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Enforce Site Settings limits
    const siteSettings = await db.siteSetting.findFirst();
    if (siteSettings) {
      const minLimit = siteSettings.minWithdraw ? parseFloat(siteSettings.minWithdraw.toString()) : 100;
      const maxLimit = siteSettings.maxWithdraw ? parseFloat(siteSettings.maxWithdraw.toString()) : 50000;

      if (withdrawAmount < minLimit) {
        return NextResponse.json(
          { success: false, error: `Minimum withdrawal amount is ${minLimit} BDT.` },
          { status: 400 }
        );
      }
      if (withdrawAmount > maxLimit) {
        return NextResponse.json(
          { success: false, error: `Maximum withdrawal amount is ${maxLimit} BDT.` },
          { status: 400 }
        );
      }
    }

    // Enforce 1x Turnover requirement
    const currentBalance = parseFloat(wallet.balance.toString());
    let turnOverVal = parseFloat(wallet.turnOver.toString());

    if (currentBalance < 1 && turnOverVal > 0) {
      await db.wallet.update({
        where: { id: wallet.id },
        data: { turnOver: 0 },
      });
      turnOverVal = 0;
    }

    if (turnOverVal > 0) {
      return NextResponse.json(
        { success: false, error: `1x Turnover requirement not met. উইথড্র করতে আপনাকে আরও ৳ ${turnOverVal.toFixed(2)} বেট করতে হবে।` },
        { status: 400 }
      );
    }

    // Check user balance
    if (parseFloat(wallet.balance.toString()) < withdrawAmount) {
      return NextResponse.json(
        { success: false, error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Find Payment Wallet mapping to 'ps' (case-insensitive)
    const paymentWallet = await db.paymentWallet.findFirst({
      where: {
        walletName: {
          equals: ps,
          mode: "insensitive"
        }
      }
    });

    if (!paymentWallet) {
      return NextResponse.json(
        { success: false, error: `Invalid payment method selected: ${ps}` },
        { status: 400 }
      );
    }

    // Find or create a Card
    let card = await db.card.findFirst({
      where: {
        walletNumber: account_number,
        paymentWalletid: paymentWallet.id,
        container: {
          userId: user.id
        }
      }
    });

    if (!card) {
      let container = await db.cardContainer.findUnique({
        where: { userId: user.id }
      });

      if (!container) {
        const dummyContainerPassHash = await bcrypt.hash(password, 10);
        container = await db.cardContainer.create({
          data: {
            ownerName: user.name || "User",
            password: dummyContainerPassHash,
            userId: user.id
          }
        });
      }

      const cardNumber = await cardNumberGenerate();
      card = await db.card.create({
        data: {
          cardNumber,
          walletNumber: account_number,
          paymentWalletid: paymentWallet.id,
          containerId: container.id
        }
      });
    }

    // Atomic Transaction: Conditionally decrement wallet balance & create pending Withdraw record
    // Prevents concurrent race-condition double withdrawals
    let newWithdraw: any = null;
    try {
      newWithdraw = await db.$transaction(async (tx) => {
        const deducted = await tx.wallet.updateMany({
          where: {
            userId: user.id,
            balance: { gte: new Prisma.Decimal(withdrawAmount) },
            turnOver: { lte: 0 },
          },
          data: {
            balance: { decrement: withdrawAmount },
          },
        });

        if (deducted.count === 0) {
          throw new Error("INSUFFICIENT_BALANCE_OR_TURNOVER");
        }

        return await tx.withdraw.create({
          data: {
            amount: new Prisma.Decimal(withdrawAmount),
            expire: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expiry in 24 hours
            status: "PENDING",
            cardId: card.id,
            userId: user.id,
          },
        });
      });
    } catch (txError: any) {
      if (txError?.message === "INSUFFICIENT_BALANCE_OR_TURNOVER") {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient balance or active 1x turnover requirement not met.",
          },
          { status: 400 }
        );
      }
      throw txError;
    }

    // Create system notification
    await createNotification({
      title: "Withdraw Initiated",
      description: `Your withdraw of ${withdrawAmount} BDT has been initiated and is under review.`,
      userId: user.id,
      icon: "MONEY"
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully! Waiting for Admin approval.",
      withdrawId: newWithdraw.id
    });
  } catch (error: any) {
    console.error("Mobile Withdraw Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
