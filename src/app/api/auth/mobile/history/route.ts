import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();
    let decoded: { sub?: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded?.sub;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tab = (searchParams.get("tab") || "bets").toLowerCase();
    const status = (searchParams.get("status") || "ALL").toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "25", 10))
    );
    const skip = (page - 1) * limit;

    if (tab === "transactions") {
      const [deposits, withdraws] = await Promise.all([
        db.deposit.findMany({
          where: { userId },
          include: { wallet: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        db.withdraw.findMany({
          where: { userId },
          include: { card: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ]);

      const paymentWallets = await db.paymentWallet.findMany();

      const mappedDeposits = deposits.map((d) => {
        const pw = paymentWallets.find(
          (p) => p.id === d.wallet?.paymentWalletId
        );
        return {
          id: d.id,
          type: "DEPOSIT",
          amount: Number(d.amount),
          bonus: d.bonus ? Number(d.bonus) : 0,
          status: d.status,
          method: pw?.walletName || d.wallet?.trxType || "Mobile Banking",
          accountNumber: d.senderNumber,
          agentNumber: d.walletNumber,
          trxId: d.trxID || d.trackingNumber,
          createdAt: d.createdAt,
        };
      });

      const mappedWithdraws = withdraws.map((w) => {
        const pw = paymentWallets.find(
          (p) => p.id === w.card?.paymentWalletid
        );
        return {
          id: w.id,
          type: "WITHDRAW",
          amount: Number(w.amount),
          bonus: 0,
          status: w.status,
          method: pw?.walletName || "Mobile Banking",
          accountNumber: w.card?.walletNumber || w.card?.cardNumber || "",
          agentNumber: "",
          trxId: w.id.slice(-8).toUpperCase(),
          createdAt: w.createdAt,
        };
      });

      let merged = [...mappedDeposits, ...mappedWithdraws].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
        merged = merged.filter((t) => t.status === status);
      }

      const total = merged.length;
      const paged = merged.slice(skip, skip + limit);

      return NextResponse.json({
        success: true,
        tab: "transactions",
        transactions: paged,
        total,
        page,
        limit,
      });
    }

    // Default: tab === "bets"
    const whereClause: Record<string, unknown> = { userId };
    if (status === "WIN" || status === "LOSS" || status === "REFUND") {
      whereClause.status = status;
    }

    const [bettingRecord, betRows, totalFiltered, totalRounds] =
      await Promise.all([
        db.bettingRecord.findUnique({ where: { userId } }),
        db.betHistory.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        db.betHistory.count({ where: whereClause }),
        db.betHistory.count({ where: { userId } }),
      ]);

    const totalBet = bettingRecord ? Number(bettingRecord.totalBet) : 0;
    const totalWin = bettingRecord ? Number(bettingRecord.totalWin) : 0;
    const netProfitLoss = Number((totalWin - totalBet).toFixed(2));
    const winningRate =
      totalBet > 0 ? Number(((totalWin / totalBet) * 100).toFixed(2)) : 0;

    const bets = betRows.map((r) => {
      const bAmt = Number(r.betAmount);
      const wAmt = Number(r.winAmount);
      const mult = bAmt > 0 ? Number((wAmt / bAmt).toFixed(2)) : 0;
      return {
        id: r.id,
        serialNumber: r.serialNumber,
        gameUid: r.gameUid,
        gameName: r.gameName,
        provider: r.provider,
        brandId: r.brandId,
        category: r.category,
        gameRound: r.gameRound,
        betAmount: bAmt,
        winAmount: wAmt,
        multiplier: mult,
        creditAmount: Number(r.creditAmount),
        status: r.status,
        freeSpinBonus: r.freeSpinBonus,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      tab: "bets",
      summary: {
        totalBet,
        totalWin,
        netProfitLoss,
        winningRate,
        totalRounds,
      },
      bets,
      total: totalFiltered,
      page,
      limit,
    });
  } catch (error) {
    console.error("Mobile History API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
