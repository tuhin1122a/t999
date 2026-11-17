import { NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await findCurrentUser();

    // Fetch site bonus settings from database
    const bonusSettings = await db.bonus.findFirst().catch(() => null);
    const signinBonusPercent = bonusSettings?.signinBonus ?? 10;
    const referralBonusPercent = bonusSettings?.referralBonus ?? 15;

    // Check lucky wheel setting & user's daily spins
    const wheelSetting = await db.luckyWheelSetting.findFirst().catch(() => null);
    const freeSpinsPerDay = wheelSetting?.freeSpinsPerDay ?? 1;
    const isWheelActive = wheelSetting?.isActive !== false;

    // ── GUEST USER ────────────────────────────────────────────────────────
    if (!sessionUser) {
      // Only return active promotions where targetType is ALL (Admin configured)
      const dbPromos = await db.promotion
        .findMany({
          where: { isActive: true, targetType: "ALL" },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        })
        .catch(() => []);

      const mappedPromos = dbPromos.map((p: any) => {
        let userStatus: "GUEST" | "ELIGIBLE" | "AVAILABLE" | "CLAIMED" = "GUEST";
        let statusBadge = "Login to Claim";
        let statusBadgeColor = "bg-blue-500/20 text-blue-300 border border-blue-500/40";
        let actionUrl = "/login?redirect=/promotion";
        let actionLabel = "Log In to Claim";

        if (p.category === "cashback") {
          actionUrl = "/vip";
          actionLabel = "View VIP Cashback";
          statusBadge = "VIP Program";
          statusBadgeColor = "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40";
        } else if (p.category === "referral") {
          actionUrl = "/login?redirect=/invite-friends";
          actionLabel = "Log In to Refer";
        } else if (p.category === "sports") {
          actionUrl = "/login?redirect=/promotion";
          actionLabel = "Log In for Sports";
          statusBadge = "Cricket & Sports 🏏";
          statusBadgeColor = "bg-orange-500/20 text-orange-300 border border-orange-500/40";
        } else if (p.category === "live") {
          actionUrl = "/login?redirect=/promotion";
          actionLabel = "Log In for Live";
          statusBadge = "Live Casino 🎲";
          statusBadgeColor = "bg-teal-500/20 text-teal-300 border border-teal-500/40";
        }

        return {
          id: p.id,
          title: p.title,
          context: p.context,
          category: p.category,
          badge: p.badge,
          badgeColor: p.badgeColor,
          turnover: p.turnover,
          minDeposit: p.minDeposit,
          description: p.description,
          content: p.content,
          image: p.image,
          userStatus,
          statusBadge,
          statusBadgeColor,
          actionUrl,
          actionLabel,
        };
      });

      return NextResponse.json({
        authenticated: false,
        user: null,
        stats: {
          totalBonusReceived: 0,
          depositCount: 0,
          totalDepositAmount: 0,
          walletBalance: 0,
          isFirstDepositEligible: true,
          referredCount: 0,
          vipTierName: "Member",
          vipCashbackRate: "1%",
        },
        bonusSettings: {
          signinBonusPercent,
          referralBonusPercent,
        },
        luckyWheel: {
          isActive: isWheelActive,
          canSpin: false,
          remainingSpins: 0,
          requiresLogin: true,
        },
        promotions: mappedPromos,
      });
    }

    // ── AUTHENTICATED USER ─────────────────────────────────────────────────
    const [dbUser, approvedDeposits, referredCount, todaySpins] = await Promise.all([
      db.user.findUnique({
        where: { id: sessionUser.id },
        include: {
          wallet: true,
          bettingRecord: true,
        },
      }),
      db.deposit.findMany({
        where: {
          userId: sessionUser.id,
          status: "APPROVED",
        },
        select: {
          id: true,
          amount: true,
          bonus: true,
          bonusFor: true,
          createdAt: true,
        },
      }),
      db.user.count({
        where: { invitedById: sessionUser.id },
      }),
      db.luckyWheelSpin.count({
        where: {
          userId: sessionUser.id,
          prizeType: { not: "RESPIN" },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }).catch(() => 0),
    ]);

    const depositCount = approvedDeposits.length;
    const totalDepositAmount = approvedDeposits.reduce((acc, d) => acc + Number(d.amount || 0), 0);
    const totalBonusReceived = approvedDeposits.reduce((acc, d) => acc + Number(d.bonus || 0), 0);
    const walletBalance = Number(dbUser?.wallet?.balance || 0);
    const totalWagered = Number(dbUser?.bettingRecord?.totalBet || 0);
    const isFirstDepositEligible = Boolean(dbUser?.wallet?.signinBonus || depositCount === 0);

    // Calculate remaining daily lucky spins
    const remainingSpins = Math.max(0, freeSpinsPerDay - todaySpins);
    const canSpinWheel = isWheelActive && remainingSpins > 0;

    // Determine user's VIP tier & cashback
    let vipTierName = "Member";
    let vipCashbackRate = "1%";
    if (totalWagered >= 5000000) {
      vipTierName = "Diamond Elite";
      vipCashbackRate = "20%";
    } else if (totalWagered >= 1000000) {
      vipTierName = "Platinum VIP";
      vipCashbackRate = "14%";
    } else if (totalWagered >= 250000) {
      vipTierName = "Gold VIP";
      vipCashbackRate = "8%";
    } else if (totalWagered >= 50000) {
      vipTierName = "Silver VIP";
      vipCashbackRate = "5%";
    } else if (totalWagered >= 10000) {
      vipTierName = "Bronze VIP";
      vipCashbackRate = "2%";
    }

    // Fetch promotions from database strictly:
    // User sees: targetType === "ALL" OR targetUserIds contains sessionUser.id OR dbUser.playerId!
    const dbPromos = await db.promotion
      .findMany({
        where: {
          isActive: true,
          OR: [
            { targetType: "ALL" },
            { targetUserIds: { has: sessionUser.id } },
            ...(dbUser?.playerId ? [{ targetUserIds: { has: dbUser.playerId } }] : []),
          ],
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      })
      .catch(() => []);

    // Map each promotion with the user's real eligibility and action URL
    const mappedPromos = dbPromos.map((p: any) => {
      const isTargetedToUser =
        p.targetType === "SPECIFIC" &&
        (p.targetUserIds?.includes(sessionUser.id) ||
          p.targetUserIds?.includes(dbUser?.playerId));

      let userStatus: "GUEST" | "ELIGIBLE" | "AVAILABLE" | "CLAIMED" = "AVAILABLE";
      let statusBadge = isTargetedToUser ? "Exclusive for You 🎯" : "Active Offer";
      let statusBadgeColor = isTargetedToUser
        ? "bg-purple-500/30 text-purple-200 border border-purple-500/50"
        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
      let actionUrl = "/deposit";
      let actionLabel = "Claim Bonus";

      if (isTargetedToUser) {
        userStatus = "ELIGIBLE";
        actionUrl = "/deposit";
        actionLabel = "Claim VIP Offer 🎁";
      } else if (p.category === "welcome") {
        if (isFirstDepositEligible) {
          userStatus = "ELIGIBLE";
          statusBadge = "Ready to Claim 🎁";
          statusBadgeColor = "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40";
          actionUrl = "/deposit?bonus=signinBonus";
          actionLabel = "Deposit & Claim 100%";
        } else {
          userStatus = "CLAIMED";
          statusBadge = "Claimed ✓";
          statusBadgeColor = "bg-gray-700/50 text-gray-400 border border-gray-600/40";
          actionUrl = "/deposit";
          actionLabel = "View Reload Offers";
        }
      } else if (p.category === "reload") {
        userStatus = "AVAILABLE";
        statusBadge = "Unlimited Boost ⚡";
        statusBadgeColor = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
        actionUrl = "/deposit";
        actionLabel = "Deposit to Boost";
      } else if (p.category === "cashback") {
        userStatus = "AVAILABLE";
        statusBadge = `${vipCashbackRate} Active (${vipTierName})`;
        statusBadgeColor = "bg-blue-500/20 text-cyan-300 border border-blue-500/40";
        actionUrl = "/vip";
        actionLabel = "Open VIP Lounge";
      } else if (p.category === "referral") {
        userStatus = "AVAILABLE";
        statusBadge = `${referredCount} Friends Invited 👥`;
        statusBadgeColor = "bg-purple-500/20 text-purple-300 border border-purple-500/40";
        actionUrl = "/invite-friends";
        actionLabel = "Invite Friends & Earn";
      } else if (p.category === "sports") {
        userStatus = "AVAILABLE";
        statusBadge = "Cricket & Football 🏏";
        statusBadgeColor = "bg-orange-500/20 text-orange-300 border border-orange-500/40";
        actionUrl = "/deposit";
        actionLabel = "Claim Sports Match";
      } else if (p.category === "live") {
        userStatus = "AVAILABLE";
        statusBadge = "Live Dealer 50% 🎲";
        statusBadgeColor = "bg-teal-500/20 text-teal-300 border border-teal-500/40";
        actionUrl = "/deposit";
        actionLabel = "Claim Live Booster";
      }

      return {
        id: p.id,
        title: p.title,
        context: p.context,
        category: p.category,
        badge: p.badge,
        badgeColor: p.badgeColor,
        turnover: p.turnover,
        minDeposit: p.minDeposit,
        description: p.description,
        content: p.content,
        image: p.image,
        userStatus,
        statusBadge,
        statusBadgeColor,
        actionUrl,
        actionLabel,
        isTargetedToUser,
      };
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionUser.id,
        name: dbUser?.name || sessionUser.name,
        phone: dbUser?.phone || sessionUser.phone,
        playerId: dbUser?.playerId || "",
        referId: dbUser?.referId || "",
      },
      stats: {
        totalBonusReceived,
        depositCount,
        totalDepositAmount,
        walletBalance,
        isFirstDepositEligible,
        referredCount,
        vipTierName,
        vipCashbackRate,
      },
      bonusSettings: {
        signinBonusPercent,
        referralBonusPercent,
      },
      luckyWheel: {
        isActive: isWheelActive,
        canSpin: canSpinWheel,
        remainingSpins,
        freeSpinsPerDay,
        todaySpins,
      },
      promotions: mappedPromos,
    });
  } catch (error) {
    console.error("Error fetching promotions status:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions status" },
      { status: 500 }
    );
  }
}
