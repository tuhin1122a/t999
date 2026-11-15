import { findCurrentUser } from "@/data/user";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    const [wallet, bettingRecord, siteSettings] = await Promise.all([
      db.wallet.findUnique({
        where: { userId: user.id },
      }),
      db.bettingRecord.findUnique({
        where: { userId: user.id },
        select: { totalBet: true },
      }),
      db.siteSetting.findFirst(),
    ]);

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const currentBalance = parseFloat(wallet.balance.toString());
    let currentTurnOver = parseFloat(wallet.turnOver.toString());

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
    const totalWagered = bettingRecord?.totalBet ? parseFloat(bettingRecord.totalBet.toString()) : 0;

    const totalTarget = totalWagered + currentTurnOver;
    const turnoverProgressPercent =
      currentTurnOver <= 0
        ? 100
        : totalTarget > 0
        ? Math.min(99, Math.round((totalWagered / totalTarget) * 100))
        : 0;

    const maxWithdraw = siteSettings?.maxWithdraw ? parseFloat(siteSettings.maxWithdraw.toString()) : 50000;
    const minWithdraw = siteSettings?.minWithdraw ? parseFloat(siteSettings.minWithdraw.toString()) : 100;
    const remainingWithdrawal = 10;

    return NextResponse.json({
      availableBalance: availableBalance.toString(),
      mainBalance: currentBalance.toString(),
      remainingWithdrawal: remainingWithdrawal.toString(),
      turnOver: currentTurnOver,
      totalWagered,
      turnoverProgressPercent,
      currency: wallet.currency,
      minWithdraw: minWithdraw.toString(),
      maxWithdraw: maxWithdraw.toString(),
    });
  } catch (error) {
    console.error("Withdraw page data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
