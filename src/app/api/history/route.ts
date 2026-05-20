/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/lib/db";
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "all"; // 'deposit', 'withdraw', or 'all'
    const status = searchParams.get("status") || "all"; // 'Pending', 'Success', or 'all'

    const user: any = await findCurrentUser();
    if (!user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const skip = (page - 1) * limit;

    let deposits: any[] = [];
    let withdraws: any[] = [];
    let depositCount = 0;
    let withdrawCount = 0;

    // --- Build status filter ---
    const depositStatusMap: Record<string, string> = {
      Pending: "PENDING",
      Success: "APPROVED",
      Rejected: "REJECTED",
    };

    const depositStatusFilter =
      status !== "all" && depositStatusMap[status]
        ? { status: depositStatusMap[status] as any }
        : {};

    const withdrawStatusFilter =
      status !== "all" && depositStatusMap[status]
        ? { status: depositStatusMap[status] as any }
        : {};

    // --- Fetch Deposits ---
    if (type === "all" || type === "deposit") {
      const dbDeposits = await db.deposit.findMany({
        where: {
          userId: user.id,
          ...depositStatusFilter,
        },
        include: {
          wallet: true,
        },
        orderBy: { createdAt: "desc" },
        skip: type === "deposit" ? skip : 0,
        take: type === "deposit" ? limit : Math.ceil(limit / 2),
      });

      depositCount = await db.deposit.count({
        where: { userId: user.id, ...depositStatusFilter },
      });

      // Fetch payment wallet logos for each deposit
      const paymentWalletIds = [
        ...new Set(dbDeposits.map((d) => d.wallet?.paymentWalletId).filter(Boolean)),
      ] as string[];

      const paymentWallets =
        paymentWalletIds.length > 0
          ? await db.paymentWallet.findMany({
              where: { id: { in: paymentWalletIds } },
            })
          : [];

      deposits = dbDeposits.map((deposit) => {
        const pw = paymentWallets.find(
          (p) => p.id === deposit.wallet?.paymentWalletId
        );
        return {
          id: deposit.id,
          type: "deposit",
          amount: parseFloat(deposit.amount.toString()),
          bonus: deposit.bonus ? parseFloat(deposit.bonus.toString()) : 0,
          bonusFor: deposit.bonusFor,
          status: deposit.status, // PENDING | APPROVED | REJECTED
          senderNumber: deposit.senderNumber,
          trxID: deposit.trxID,
          agentNumber: deposit.walletNumber,
          trackingNumber: deposit.trackingNumber,
          paymentMethod: pw?.walletName || deposit.wallet?.trxType || "Manual",
          image: pw?.walletLogo || null,
          createdAt: deposit.createdAt,
        };
      });
    }

    // --- Fetch Withdrawals ---
    if (type === "all" || type === "withdraw") {
      const dbWithdraws = await db.withdraw.findMany({
        where: {
          userId: user.id,
          ...withdrawStatusFilter,
        },
        include: {
          card: {
            include: {
              container: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: type === "withdraw" ? skip : 0,
        take: type === "withdraw" ? limit : Math.ceil(limit / 2),
      });

      withdrawCount = await db.withdraw.count({
        where: { userId: user.id, ...withdrawStatusFilter },
      });

      // Get payment wallet logos for cards
      const cardPaymentWalletIds = [
        ...new Set(
          dbWithdraws.map((w) => w.card?.paymentWalletid).filter(Boolean)
        ),
      ] as string[];

      const cardPaymentWallets =
        cardPaymentWalletIds.length > 0
          ? await db.paymentWallet.findMany({
              where: { id: { in: cardPaymentWalletIds } },
            })
          : [];

      withdraws = dbWithdraws.map((withdraw) => {
        const pw = cardPaymentWallets.find(
          (p) => p.id === withdraw.card?.paymentWalletid
        );
        return {
          id: withdraw.id,
          type: "withdraw",
          amount: parseFloat(withdraw.amount.toString()),
          status: withdraw.status, // PENDING | APPROVED | REJECTED
          cardNumber: withdraw.card?.cardNumber || null,
          walletNumber: withdraw.card?.walletNumber || null,
          paymentMethod: pw?.walletName || "Wallet",
          image: pw?.walletLogo || null,
          createdAt: withdraw.createdAt,
        };
      });
    }

    // --- Combine and sort ---
    let allTransactions = [...deposits, ...withdraws].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (type === "all") {
      allTransactions = allTransactions.slice(0, limit);
    }

    const total =
      type === "deposit"
        ? depositCount
        : type === "withdraw"
        ? withdrawCount
        : depositCount + withdrawCount;

    return Response.json(
      {
        data: allTransactions,
        total,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transaction history error:", error);
    return Response.json({ message: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
