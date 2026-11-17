import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findCurrentUser } from "@/data/user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await findCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "ALL").toUpperCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      userId: user.id,
    };
    if (status === "WIN" || status === "LOSS" || status === "REFUND") {
      whereClause.status = status;
    }

    const [record, historyRows, totalCount, allRoundsCount] = await Promise.all([
      db.bettingRecord.findUnique({
        where: { userId: user.id },
      }),
      db.betHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.betHistory.count({
        where: whereClause,
      }),
      db.betHistory.count({
        where: { userId: user.id },
      }),
    ]);

    const totalBet = record ? Number(record.totalBet) : 0;
    const totalWin = record ? Number(record.totalWin) : 0;
    const netProfitLoss = Number((totalWin - totalBet).toFixed(2));
    const winningRate =
      totalBet > 0 ? Number(((totalWin / totalBet) * 100).toFixed(2)) : 0;

    const records = historyRows.map((row) => {
      const bAmt = Number(row.betAmount);
      const wAmt = Number(row.winAmount);
      const mult = bAmt > 0 ? Number((wAmt / bAmt).toFixed(2)) : 0;
      return {
        id: row.id,
        serialNumber: row.serialNumber,
        gameUid: row.gameUid,
        gameName: row.gameName,
        provider: row.provider,
        brandId: row.brandId,
        category: row.category,
        gameRound: row.gameRound,
        betAmount: bAmt,
        winAmount: wAmt,
        multiplier: mult,
        creditAmount: Number(row.creditAmount),
        status: row.status,
        freeSpinBonus: row.freeSpinBonus,
        createdAt: row.createdAt,
      };
    });

    return NextResponse.json({
      totalBet,
      totalWin,
      netProfitLoss,
      winningRate,
      totalRounds: allRoundsCount,
      records,
      total: totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching betting record:", error);
    return NextResponse.json(
      { error: "Failed to fetch betting record" },
      { status: 500 }
    );
  }
}
