import { findCurrentUser } from "@/data/user";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user: any = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const userId = user.id || user.sub;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    // Try finding wallet by userId or playerId
    let [wallet, bettingRecord, siteSettings] = await Promise.all([
      db.wallet.findFirst({
        where: {
          OR: [
            { userId: userId },
            ...(user.playerId ? [{ playerId: user.playerId }] : []),
          ],
        },
      }),
      db.bettingRecord.findUnique({
        where: { userId: userId },
        select: { totalBet: true },
      }),
      db.siteSetting.findFirst(),
    ]);

    // If wallet doesn't exist yet, auto-create one for the user so page doesn't 404
    if (!wallet) {
      wallet = await db.wallet.create({
        data: {
          userId: userId,
          playerId: user.playerId || null,
          balance: 0,
          turnOver: 0,
          currency: "BDT",
        },
      });
    }

    const currentBalance = parseFloat(wallet.balance?.toString() || "0") || 0;
    let currentTurnOver = parseFloat(wallet.turnOver?.toString() || "0") || 0;

    // Zero-Balance Turnover Reset Protection:
    // If a player's wallet balance is below 1 BDT, clear any leftover turnover automatically
    if (currentBalance < 1 && currentTurnOver > 0) {
      await db.wallet.update({
        where: { id: wallet.id },
        data: { turnOver: 0 },
      });
      currentTurnOver = 0;
    }

    const availableBalance = currentTurnOver > 0 ? 0 : currentBalance;
    const totalWagered = bettingRecord?.totalBet
      ? parseFloat(bettingRecord.totalBet.toString()) || 0
      : 0;

    const totalTarget = totalWagered + currentTurnOver;
    const turnoverProgressPercent =
      currentTurnOver <= 0
        ? 100
        : totalTarget > 0
        ? Math.min(99, Math.round((totalWagered / totalTarget) * 100))
        : 0;

    const maxWithdraw = siteSettings?.maxWithdraw
      ? parseFloat(siteSettings.maxWithdraw.toString()) || 50000
      : 50000;
    const minWithdraw = siteSettings?.minWithdraw
      ? parseFloat(siteSettings.minWithdraw.toString()) || 100
      : 100;
    const remainingWithdrawal = 10;

    return NextResponse.json({
      availableBalance: availableBalance.toString(),
      mainBalance: currentBalance.toString(),
      remainingWithdrawal: remainingWithdrawal.toString(),
      turnOver: currentTurnOver,
      totalWagered,
      turnoverProgressPercent,
      currency: wallet.currency || "BDT",
      minWithdraw: minWithdraw.toString(),
      maxWithdraw: maxWithdraw.toString(),
    });
  } catch (error) {
    console.error("Withdraw page data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
