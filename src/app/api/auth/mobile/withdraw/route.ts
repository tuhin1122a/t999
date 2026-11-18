import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { createNotification } from "@/action/notifications";
import { cardNumberGenerate } from "@/lib/helpers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
    return decoded?.sub || null;
  } catch {
    return null;
  }
}

// GET /api/auth/mobile/withdraw
// Returns exact web WithdrawPageData + user's bound Wallet Cards + available PaymentWallets
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const [wallet, bettingRecord, siteSettings, paymentWallets, cardContainer] =
      await Promise.all([
        db.wallet.findUnique({ where: { userId } }),
        db.bettingRecord.findUnique({
          where: { userId },
          select: { totalBet: true },
        }),
        db.siteSetting.findFirst(),
        db.paymentWallet.findMany(),
        db.cardContainer.findFirst({ where: { userId } }),
      ]);

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(wallet.balance.toString());
    let currentTurnOver = parseFloat(wallet.turnOver.toString());

    // Zero-Balance Turnover Reset Protection (matches web /api/withdraw/page)
    if (currentBalance < 1 && currentTurnOver > 0) {
      await db.wallet.update({
        where: { id: wallet.id },
        data: { turnOver: 0 },
      });
      currentTurnOver = 0;
    }

    const availableBalance = currentTurnOver > 0 ? 0 : currentBalance;
    const totalWagered = bettingRecord?.totalBet
      ? parseFloat(bettingRecord.totalBet.toString())
      : 0;

    const totalTarget = totalWagered + currentTurnOver;
    const turnoverProgressPercent =
      currentTurnOver <= 0
        ? 100
        : totalTarget > 0
        ? Math.min(99, Math.round((totalWagered / totalTarget) * 100))
        : 0;

    const maxWithdraw = siteSettings?.maxWithdraw
      ? parseFloat(siteSettings.maxWithdraw.toString())
      : 50000;
    const minWithdraw = siteSettings?.minWithdraw
      ? parseFloat(siteSettings.minWithdraw.toString())
      : 100;
    const remainingWithdrawal = 10;

    let cardsWithWallet: any[] = [];
    if (cardContainer) {
      const rawCards: any[] = await db.card.findMany({
        where: { containerId: cardContainer.id },
        orderBy: { createdAt: "asc" },
        include: { container: true },
      });

      const pwMap = new Map(paymentWallets.map((pw) => [pw.id, pw]));
      cardsWithWallet = rawCards.map((c) => ({
        ...c,
        paymentWallet: pwMap.get(c.paymentWalletid) || {
          id: c.paymentWalletid,
          walletName: "bKash",
          walletLogo: "",
        },
      }));
    }

    return NextResponse.json(
      {
        success: true,
        availableBalance,
        mainBalance: currentBalance,
        remainingWithdrawal,
        turnOver: currentTurnOver,
        totalWagered,
        turnoverProgressPercent,
        currency: wallet.currency || "BDT",
        minWithdraw,
        maxWithdraw,
        hasCardContainer: Boolean(cardContainer),
        ownerName: cardContainer?.ownerName || "",
        cards: cardsWithWallet,
        paymentWallets,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Mobile Withdraw GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/auth/mobile/withdraw
// Binds a new Wallet Card (matches web /api/card/new and /api/card)
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { walletNumber, paymentWalletId, ownerName, password } = body;

    if (!walletNumber || !paymentWalletId || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fill in wallet number, payment method, and password",
        },
        { status: 400 }
      );
    }

    const cleanWalletNumber = String(walletNumber).trim();
    const existingCard = await db.card.findFirst({
      where: { walletNumber: cleanWalletNumber },
    });

    if (existingCard) {
      return NextResponse.json(
        {
          success: false,
          error: "This wallet number is already bound! Try another number.",
        },
        { status: 400 }
      );
    }

    let cardContainer = await db.cardContainer.findFirst({
      where: { userId: user.id },
      include: { cards: true },
    });

    if (!cardContainer) {
      if (!ownerName || !String(ownerName).trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Please enter the Account Holder Name",
          },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // Also set user.withdrawPassword if not set yet so withdrawal password stays synced
      if (!user.withdrawPassword) {
        await db.user
          .update({
            where: { id: user.id },
            data: { withdrawPassword: hashedPassword },
          })
          .catch(() => {});
      }

      cardContainer = await db.cardContainer.create({
        data: {
          ownerName: String(ownerName).trim(),
          password: hashedPassword,
          userId: user.id,
        },
        include: { cards: true },
      });
    } else {
      // Verify password against cardContainer password OR user withdraw/login password
      const matchContainer = await bcrypt.compare(
        password,
        cardContainer.password
      );
      const userPassToCompare = user.withdrawPassword || user.password;
      const matchUser = await bcrypt.compare(password, userPassToCompare);

      if (!matchContainer && !matchUser) {
        return NextResponse.json(
          { success: false, error: "Incorrect withdrawal security password" },
          { status: 400 }
        );
      }

      if (cardContainer.cards.length >= 5) {
        return NextResponse.json(
          { success: false, error: "Maximum 5 wallet cards limit reached" },
          { status: 400 }
        );
      }
    }

    const cardNumber = await cardNumberGenerate();
    const newCard: any = await db.card.create({
      data: {
        walletNumber: cleanWalletNumber,
        paymentWalletid: paymentWalletId,
        cardNumber,
        containerId: cardContainer.id,
      },
      include: { container: true },
    });

    const paymentWallet = await db.paymentWallet.findUnique({
      where: { id: paymentWalletId },
    });
    newCard.paymentWallet = paymentWallet;

    return NextResponse.json({
      success: true,
      message: "Wallet card added successfully!",
      card: newCard,
    });
  } catch (error: any) {
    console.error("Mobile Add Card Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add wallet card" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization header missing or invalid",
          error: "Authorization header missing or invalid",
        },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
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

    const { account_number, amount, password, ps } = await req.json();

    if (!account_number || !amount || !password || !ps) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: account_number, amount, password, and ps are required",
          error:
            "Missing required fields: account_number, amount, password, and ps are required",
        },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal amount",
          error: "Invalid withdrawal amount",
        },
        { status: 400 }
      );
    }

    // Verify Password (check user.withdrawPassword, user.password, and cardContainer.password)
    const passwordToCompare = user.withdrawPassword || user.password;
    let isPasswordMatch = await bcrypt.compare(password, passwordToCompare);
    if (!isPasswordMatch) {
      const container = await db.cardContainer.findUnique({
        where: { userId: user.id },
      });
      if (container) {
        isPasswordMatch = await bcrypt.compare(password, container.password);
      }
    }

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect password",
          error: "Incorrect password",
        },
        { status: 400 }
      );
    }

    // Check user wallet
    const wallet = await db.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet not found",
          error: "Wallet not found",
        },
        { status: 404 }
      );
    }

    // Enforce Site Settings limits
    const siteSettings = await db.siteSetting.findFirst();
    if (siteSettings) {
      const minLimit = siteSettings.minWithdraw
        ? parseFloat(siteSettings.minWithdraw.toString())
        : 100;
      const maxLimit = siteSettings.maxWithdraw
        ? parseFloat(siteSettings.maxWithdraw.toString())
        : 50000;

      if (withdrawAmount < minLimit) {
        return NextResponse.json(
          {
            success: false,
            message: `Minimum withdrawal amount is ${minLimit} BDT.`,
            error: `Minimum withdrawal amount is ${minLimit} BDT.`,
          },
          { status: 400 }
        );
      }
      if (withdrawAmount > maxLimit) {
        return NextResponse.json(
          {
            success: false,
            message: `Maximum withdrawal amount is ${maxLimit} BDT.`,
            error: `Maximum withdrawal amount is ${maxLimit} BDT.`,
          },
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
        {
          success: false,
          message: `1x Turnover requirement not met. উইথড্র করতে আপনাকে আরও ৳ ${turnOverVal.toFixed(2)} বেট করতে হবে।`,
          error: `1x Turnover requirement not met. উইথড্র করতে আপনাকে আরও ৳ ${turnOverVal.toFixed(2)} বেট করতে হবে।`,
        },
        { status: 400 }
      );
    }

    // Check user balance
    if (parseFloat(wallet.balance.toString()) < withdrawAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance",
          error: "Insufficient balance",
        },
        { status: 400 }
      );
    }

    // Find Payment Wallet mapping to 'ps' (case-insensitive)
    const paymentWallet = await db.paymentWallet.findFirst({
      where: {
        walletName: {
          equals: ps,
          mode: "insensitive",
        },
      },
    });

    if (!paymentWallet) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid payment method selected: ${ps}`,
          error: `Invalid payment method selected: ${ps}`,
        },
        { status: 400 }
      );
    }

    // Find or create a Card
    let card = await db.card.findFirst({
      where: {
        walletNumber: account_number,
        paymentWalletid: paymentWallet.id,
        container: {
          userId: user.id,
        },
      },
    });

    if (!card) {
      let container = await db.cardContainer.findUnique({
        where: { userId: user.id },
      });

      if (!container) {
        const dummyContainerPassHash = await bcrypt.hash(password, 10);
        container = await db.cardContainer.create({
          data: {
            ownerName: user.name || "User",
            password: dummyContainerPassHash,
            userId: user.id,
          },
        });
      }

      const cardNumber = await cardNumberGenerate();
      card = await db.card.create({
        data: {
          cardNumber,
          walletNumber: account_number,
          paymentWalletid: paymentWallet.id,
          containerId: container.id,
        },
      });
    }

    // Atomic Transaction: Conditionally decrement wallet balance & create pending Withdraw record
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
            expire: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
            message:
              "Insufficient balance or active 1x turnover requirement not met.",
            error:
              "Insufficient balance or active 1x turnover requirement not met.",
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
      icon: "MONEY",
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully!",
      withdrawId: newWithdraw.id,
    });
  } catch (error: any) {
    console.error("Mobile Withdraw Error:", error);
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
