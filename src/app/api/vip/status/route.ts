import { NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await findCurrentUser();

    if (!sessionUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        stats: {
          walletBalance: 0,
          totalWagered: 0,
          totalWon: 0,
          totalDepositAmount: 0,
          totalDepositCount: 0,
          estimatedCashback: 0,
        },
        tier: {
          level: 0,
          name: "Guest",
          tag: "Not Logged In",
          icon: "👤",
          cashbackRate: "0%",
          levelBonus: "0 ৳",
          minWager: 0,
          targetWager: 10000,
          remainingWager: 10000,
          progressPercent: 0,
          nextTierName: "Bronze VIP",
        },
      });
    }

    // Fetch user details, wallet, betting record, and approved deposits
    const [dbUser, approvedDeposits] = await Promise.all([
      db.user.findUnique({
        where: { id: sessionUser.id },
        include: {
          wallet: true,
          bettingRecord: true,
        },
      }),
      db.deposit.aggregate({
        where: {
          userId: sessionUser.id,
          status: "APPROVED",
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
    ]);

    const totalWagered = Number(dbUser?.bettingRecord?.totalBet || 0);
    const totalWon = Number(dbUser?.bettingRecord?.totalWin || 0);
    const walletBalance = Number(dbUser?.wallet?.balance || 0);
    const totalDepositAmount = Number(approvedDeposits._sum.amount || 0);
    const totalDepositCount = approvedDeposits._count || 0;

    // Real VIP Tier logic:
    // Tier 0 (Member): 0 - 9,999 ৳
    // Tier 1 (Bronze VIP): 10,000 - 49,999 ৳
    // Tier 2 (Silver VIP): 50,000 - 249,999 ৳
    // Tier 3 (Gold VIP): 250,000 - 999,999 ৳
    // Tier 4 (Platinum VIP): 1,000,000 - 4,999,999 ৳
    // Tier 5 (Diamond Elite VIP): 5,000,000+ ৳

    let currentTier = {
      level: 0,
      name: "Member",
      tag: "Regular Player",
      icon: "🎖️",
      cashbackRate: "1%",
      levelBonus: "0 ৳",
      minWager: 0,
      nextTierName: "Bronze VIP",
      targetWager: 10000,
    };

    if (totalWagered >= 5000000) {
      currentTier = {
        level: 5,
        name: "Diamond Elite",
        tag: "Supreme Royal VIP",
        icon: "👑",
        cashbackRate: "20%",
        levelBonus: "200,000 ৳",
        minWager: 5000000,
        nextTierName: "Maximum VIP Achieved",
        targetWager: 5000000,
      };
    } else if (totalWagered >= 1000000) {
      currentTier = {
        level: 4,
        name: "Platinum",
        tag: "Tier 4 VIP",
        icon: "💎",
        cashbackRate: "14%",
        levelBonus: "50,000 ৳",
        minWager: 1000000,
        nextTierName: "Diamond Elite",
        targetWager: 5000000,
      };
    } else if (totalWagered >= 250000) {
      currentTier = {
        level: 3,
        name: "Gold",
        tag: "Tier 3 VIP",
        icon: "🥇",
        cashbackRate: "8%",
        levelBonus: "10,000 ৳",
        minWager: 250000,
        nextTierName: "Platinum VIP",
        targetWager: 1000000,
      };
    } else if (totalWagered >= 50000) {
      currentTier = {
        level: 2,
        name: "Silver",
        tag: "Tier 2 VIP",
        icon: "🥈",
        cashbackRate: "5%",
        levelBonus: "2,500 ৳",
        minWager: 50000,
        nextTierName: "Gold VIP",
        targetWager: 250000,
      };
    } else if (totalWagered >= 10000) {
      currentTier = {
        level: 1,
        name: "Bronze",
        tag: "Tier 1 VIP",
        icon: "🥉",
        cashbackRate: "2%",
        levelBonus: "500 ৳",
        minWager: 10000,
        nextTierName: "Silver VIP",
        targetWager: 50000,
      };
    }

    // Calculate real progress percentage:
    let progressPercent = 0;
    let remainingWager = Math.max(0, currentTier.targetWager - totalWagered);

    if (currentTier.level === 5) {
      progressPercent = 100;
      remainingWager = 0;
    } else {
      const range = currentTier.targetWager - currentTier.minWager;
      const progressInRange = totalWagered - currentTier.minWager;
      progressPercent =
        range > 0
          ? Math.min(100, Math.max(0, Math.round((progressInRange / range) * 100)))
          : 0;
    }

    // Estimated weekly cashback (based on net loss: max(0, totalWagered - totalWon))
    const netLoss = Math.max(0, totalWagered - totalWon);
    const cashbackPercentNum = parseFloat(currentTier.cashbackRate) / 100;
    const estimatedCashback = Math.round(netLoss * cashbackPercentNum);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser?.id,
        name: dbUser?.name,
        phone: dbUser?.phone,
        playerId: dbUser?.playerId,
      },
      stats: {
        walletBalance,
        totalWagered,
        totalWon,
        totalDepositAmount,
        totalDepositCount,
        estimatedCashback,
      },
      tier: {
        level: currentTier.level,
        name: currentTier.name,
        tag: currentTier.tag,
        icon: currentTier.icon,
        cashbackRate: currentTier.cashbackRate,
        levelBonus: currentTier.levelBonus,
        minWager: currentTier.minWager,
        targetWager: currentTier.targetWager,
        remainingWager,
        progressPercent,
        nextTierName: currentTier.nextTierName,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load VIP status";
    console.error("[VIP Status API] Error:", error);
    return NextResponse.json(
      { error: message, authenticated: false },
      { status: 500 }
    );
  }
}

