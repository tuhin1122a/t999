// src/app/api/withdraw/route.ts
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createNotification } from "@/action/notifications";
import { cardNumberGenerate } from "@/lib/helpers";
import bcrypt from "bcryptjs";

export const POST = async (req: NextRequest) => {
  try {
    const { account_number, amount, password, ps } = await req.json();

    // 1️⃣ Validate required fields
    if (!account_number || !amount || !password || !ps) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: account_number, amount, password, and ps are required"
      }, { status: 400 });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid withdrawal amount" }, { status: 400 });
    }

    // 2️⃣ Authenticate current user
    const user: any = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 });
    }

    // Fetch full user details (including passwords)
    const dbUser = await db.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 3️⃣ Verify password (withdrawPassword takes priority; fall back to login password if not set)
    const passwordToCompare = dbUser.withdrawPassword || dbUser.password;
    const isPasswordMatch = await bcrypt.compare(password, passwordToCompare);
    if (!isPasswordMatch) {
      return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 400 });
    }

    // 4️⃣ Check user wallet
    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      return NextResponse.json({ success: false, message: "Wallet not found" }, { status: 404 });
    }

    // 5️⃣ Enforce Site Settings min/max withdrawal limits (check before balance)
    const siteSettings = await db.siteSetting.findFirst();
    if (siteSettings) {
      const minLimit = siteSettings.minWithdraw ? parseFloat(siteSettings.minWithdraw.toString()) : 100;
      const maxLimit = siteSettings.maxWithdraw ? parseFloat(siteSettings.maxWithdraw.toString()) : 50000;

      if (withdrawAmount < minLimit) {
        return NextResponse.json({ success: false, message: `Minimum withdrawal amount is ${minLimit} BDT.` }, { status: 400 });
      }
      if (withdrawAmount > maxLimit) {
        return NextResponse.json({ success: false, message: `Maximum withdrawal amount is ${maxLimit} BDT.` }, { status: 400 });
      }
    }

    // 6️⃣ Enforce Turnover requirement: User cannot withdraw if turnOver > 0
    const turnOverVal = parseFloat(wallet.turnOver.toString());
    if (turnOverVal > 0) {
      return NextResponse.json({
        success: false,
        message: `Turnover requirement not met. You must bet ${turnOverVal} BDT more before you can withdraw.`
      }, { status: 400 });
    }

    // 7️⃣ Check user balance
    if (parseFloat(wallet.balance.toString()) < withdrawAmount) {
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
    }

    // 8️⃣ Find active Payment Wallet mapping to 'ps' (case-insensitive)
    const paymentWallet = await db.paymentWallet.findFirst({
      where: {
        walletName: {
          equals: ps,
          mode: "insensitive"
        }
      }
    });

    if (!paymentWallet) {
      return NextResponse.json({ success: false, message: `Invalid payment method selected: ${ps}` }, { status: 400 });
    }

    // 8️⃣ Find or create a Card for mapping in manual Withdraw model
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
      // Find or create CardContainer for user
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

      // Generate card number and create card
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

    // 9️⃣ Create manual pending Withdraw record (will show up in admin panel & user history)
    const newWithdraw = await db.withdraw.create({
      data: {
        amount: new Prisma.Decimal(withdrawAmount),
        expire: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expiry in 24 hours
        status: "PENDING",
        cardId: card.id,
        userId: user.id
      }
    });

    // 🔟 Decrement wallet balance
    await db.wallet.update({
      where: { userId: user.id },
      data: {
        balance: { decrement: withdrawAmount }
      }
    });

    // 1️⃣1️⃣ Create system notification for user
    await createNotification({
      title: "Withdraw Initiated",
      description: `Your withdraw of ${withdrawAmount} BDT has been initiated and is under review.`,
      userId: user.id,
      icon: "MONEY"
    });

    return NextResponse.json({
      success: true,
      payload: {
        message: "Withdrawal request submitted successfully! Waiting for Admin approval.",
        withdrawId: newWithdraw.id
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json({ success: false, message: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
