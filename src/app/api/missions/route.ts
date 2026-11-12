import { NextRequest, NextResponse } from "next/server";
import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface MissionDefinition {
  id: string;
  category: "DAILY" | "WEEKLY" | "ACHIEVEMENT";
  title: string;
  description: string;
  reward: number;
  target: number;
  unit: string;
  iconType: string;
  badge?: string;
}

const MISSION_DEFINITIONS: MissionDefinition[] = [
  // DAILY MISSIONS
  {
    id: "daily_login",
    category: "DAILY",
    title: "দৈনিক লগইন রিওয়ার্ড (Daily Login)",
    description: "প্রতিদিন প্ল্যাটফর্মে লগইন করুন এবং বিনামূল্যে রিওয়ার্ড ক্লেইম করুন।",
    reward: 20,
    target: 1,
    unit: "দিন",
    iconType: "login",
    badge: "ইনস্ট্যান্ট",
  },
  {
    id: "daily_deposit_500",
    category: "DAILY",
    title: "আজকের প্রথম ডিপোজিট (Daily 1st Deposit)",
    description: "আজ কমপক্ষে ৫০০ ৳ ডিপোজিট সম্পন্ন করুন এবং ক্যাশব্যাক পান।",
    reward: 50,
    target: 500,
    unit: "৳",
    iconType: "deposit",
    badge: "জনপ্রিয়",
  },
  {
    id: "daily_turnover_1000",
    category: "DAILY",
    title: "টার্নওভার স্প্রিন্ট (১,০০০ ৳ টার্নওভার)",
    description: "যেকোনো স্লট, ক্র্যাশ বা লাইভ গেমে ১,০০০ ৳ বেট সম্পন্ন করুন।",
    reward: 60,
    target: 1000,
    unit: "৳",
    iconType: "game",
  },
  {
    id: "daily_turnover_3000",
    category: "DAILY",
    title: "ক্যাসিনো চ্যাম্পিয়ন (৩,০০০ ৳ টার্নওভার)",
    description: "আজ মোট ৩,০০০ ৳ টার্নওভার সম্পন্ন করে অতিরিক্ত বোনাস লুফে নিন।",
    reward: 120,
    target: 3000,
    unit: "৳",
    iconType: "dice",
  },
  {
    id: "daily_mega_turnover",
    category: "DAILY",
    title: "হাই-রোলার চ্যালেঞ্জ (১০,০০০ ৳ টার্নওভার)",
    description: "দিনে ১০,০০০ ৳ মেগা টার্নওভার সম্পন্ন করে ভিআইপি ক্যাশ রিওয়ার্ড ক্লেইম করুন।",
    reward: 350,
    target: 10000,
    unit: "৳",
    iconType: "crown",
    badge: "মেগা বোনাস",
  },

  // WEEKLY MISSIONS
  {
    id: "weekly_active_days",
    category: "WEEKLY",
    title: "সাপ্তাহিক একটিভ প্লেয়ার (Active Streak)",
    description: "এই সপ্তাহে অন্তত ৫ দিন গেম খেলুন বা ডিপোজিট করুন।",
    reward: 250,
    target: 5,
    unit: "দিন",
    iconType: "calendar",
    badge: "উইকলি",
  },
  {
    id: "weekly_deposit_5000",
    category: "WEEKLY",
    title: "সাপ্তাহিক ডিপোজিট রাশ (৫,০০০ ৳ ডিপোজিট)",
    description: "এই সপ্তাহে মোট ৫,০০০ ৳ বা তার বেশি ডিপোজিট সম্পন্ন করুন।",
    reward: 300,
    target: 5000,
    unit: "৳",
    iconType: "wallet",
  },
  {
    id: "weekly_turnover_50000",
    category: "WEEKLY",
    title: "৫০,০০০ ৳ সাপ্তাহিক টার্নওভার মাস্টার",
    description: "এই সপ্তাহে মোট ৫০,০০০ ৳ টার্নওভার লক্ষ্য পূরণ করে ১,০০০ ৳ মেগা প্রাইজ পান।",
    reward: 1000,
    target: 50000,
    unit: "৳",
    iconType: "trophy",
    badge: "১,০০০ ৳ রিওয়ার্ড",
  },
  {
    id: "weekly_invite_friends",
    category: "WEEKLY",
    title: "ইনভাইট চ্যাম্পিয়ন (২ জন বন্ধু ইনভাইট)",
    description: "আপনার রেফারেল কোড দিয়ে অন্তত ২ জন বন্ধুকে প্ল্যাটফর্মে যুক্ত করুন।",
    reward: 500,
    target: 2,
    unit: "জন",
    iconType: "users",
  },

  // ACHIEVEMENTS
  {
    id: "achieve_first_deposit",
    category: "ACHIEVEMENT",
    title: "প্রথম ডিপোজিটর ব্যাজ (First Ever Deposit)",
    description: "একাউন্টে জীবনের প্রথম সফল ডিপোজিট সম্পন্ন করার বিশেষ উপহার।",
    reward: 100,
    target: 1,
    unit: "টি",
    iconType: "sparkle",
    badge: "লাইফটাইম",
  },
  {
    id: "achieve_invite_5",
    category: "ACHIEVEMENT",
    title: "কমিউনিটি লিডার (৫ জন বন্ধু রেফার)",
    description: "মোট ৫ জন বন্ধুকে ইনভাইট করে রেফারেল নেটওয়ার্ক গড়ে তুলুন।",
    reward: 600,
    target: 5,
    unit: "জন",
    iconType: "users",
    badge: "এক্সক্লুসিভ",
  },
];

export async function GET() {
  try {
    const user = await findCurrentUser();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    if (!user) {
      // Return guest preview of all missions
      const guestMissions = MISSION_DEFINITIONS.map((m) => ({
        ...m,
        current: 0,
        percentage: 0,
        isCompleted: false,
        isClaimed: false,
      }));

      return NextResponse.json({
        authenticated: false,
        summary: {
          totalRewardsEarned: 0,
          todayCompletedCount: 0,
          claimableRewardsCount: 0,
          claimableTotalAmount: 0,
          userBalance: 0,
        },
        missions: guestMissions,
        claimedHistory: [],
      });
    }

    // Authenticated: fetch user's real database stats in parallel
    const [
      wallet,
      todayDeposits,
      weekDeposits,
      allApprovedDeposits,
      bettingRecords,
      userInvitation,
      claimedNotifications,
    ] = await Promise.all([
      db.wallet.findUnique({
        where: { userId: user.id },
        select: { balance: true, turnOver: true },
      }),
      db.deposit.findMany({
        where: {
          userId: user.id,
          status: "APPROVED",
          createdAt: { gte: todayStart },
        },
        select: { amount: true },
      }),
      db.deposit.findMany({
        where: {
          userId: user.id,
          status: "APPROVED",
          createdAt: { gte: weekStart },
        },
        select: { amount: true },
      }),
      db.deposit.count({
        where: {
          userId: user.id,
          status: "APPROVED",
        },
      }),
      db.bettingRecord.findMany({
        where: { userId: user.id },
        select: { totalBet: true, totalWin: true },
      }),
      db.invitation.findUnique({
        where: { userId: user.id },
        include: { _count: { select: { referredUsers: true } } },
      }),
      db.notification.findMany({
        where: {
          userId: user.id,
          title: { startsWith: "Mission Reward:" },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    // Calculate metrics
    const invitationsCount = userInvitation?._count?.referredUsers || 0;
    const todayDepositAmount = todayDeposits.reduce((acc, d) => acc + Number(d.amount || 0), 0);
    const weekDepositAmount = weekDeposits.reduce((acc, d) => acc + Number(d.amount || 0), 0);

    // Turnover from wallet or betting records
    const walletTurnover = Number(wallet?.turnOver || 0);
    const totalBettingTurnover = bettingRecords.reduce((acc, b) => acc + Number(b.totalBet || 0), 0);
    const totalTurnover = Math.max(walletTurnover, totalBettingTurnover);

    // Approximate daily and weekly turnover proportions
    const todayTurnover = Math.min(totalTurnover, todayDepositAmount > 0 ? todayDepositAmount * 1.5 : totalTurnover * 0.3);
    const weekTurnover = Math.min(totalTurnover, weekDepositAmount > 0 ? weekDepositAmount * 2 : totalTurnover * 0.7);

    // Active days (based on deposit and activity dates, default to at least 1 since user is logged in)
    const activeDaysCount = Math.min(5, Math.max(1, todayDeposits.length + 1));

    // Map claimed missions
    const claimedMap = new Map<string, Date>();
    claimedNotifications.forEach((n) => {
      const meta = n.metadata as any;
      if (meta?.missionId) {
        claimedMap.set(meta.missionId, n.createdAt);
      }
    });

    let todayCompletedCount = 0;
    let claimableRewardsCount = 0;
    let claimableTotalAmount = 0;
    let totalRewardsEarned = 0;

    // Calculate total rewards already earned
    claimedNotifications.forEach((n) => {
      const meta = n.metadata as any;
      if (meta?.rewardAmount) {
        totalRewardsEarned += Number(meta.rewardAmount);
      }
    });

    const missionsWithProgress = MISSION_DEFINITIONS.map((mission) => {
      let current = 0;

      switch (mission.id) {
        case "daily_login":
          current = 1;
          break;
        case "daily_deposit_500":
          current = todayDepositAmount;
          break;
        case "daily_turnover_1000":
        case "daily_turnover_3000":
        case "daily_mega_turnover":
          current = todayTurnover;
          break;
        case "weekly_active_days":
          current = activeDaysCount;
          break;
        case "weekly_deposit_5000":
          current = weekDepositAmount;
          break;
        case "weekly_turnover_50000":
          current = weekTurnover;
          break;
        case "weekly_invite_friends":
        case "achieve_invite_5":
          current = invitationsCount;
          break;
        case "achieve_first_deposit":
          current = allApprovedDeposits > 0 ? 1 : 0;
          break;
        default:
          current = 0;
      }

      const percentage = Math.min(100, Math.round((current / mission.target) * 100));
      const isCompleted = current >= mission.target;

      // Check if claimed
      const lastClaimedDate = claimedMap.get(mission.id);
      let isClaimed = false;

      if (lastClaimedDate) {
        if (mission.category === "DAILY") {
          isClaimed = lastClaimedDate >= todayStart;
        } else if (mission.category === "WEEKLY") {
          isClaimed = lastClaimedDate >= weekStart;
        } else {
          isClaimed = true; // Achievement is once per lifetime
        }
      }

      if (mission.category === "DAILY" && isCompleted) {
        todayCompletedCount++;
      }

      if (isCompleted && !isClaimed) {
        claimableRewardsCount++;
        claimableTotalAmount += mission.reward;
      }

      return {
        ...mission,
        current: Math.round(current * 10) / 10,
        percentage,
        isCompleted,
        isClaimed,
        lastClaimedAt: lastClaimedDate?.toISOString() || null,
      };
    });

    const claimedHistory = claimedNotifications.map((n) => {
      const meta = n.metadata as any;
      return {
        id: n.id,
        title: n.title.replace("Mission Reward: ", ""),
        description: n.description,
        rewardAmount: meta?.rewardAmount || 0,
        claimedAt: n.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        balance: Number(wallet?.balance || 0),
      },
      summary: {
        totalRewardsEarned,
        todayCompletedCount,
        claimableRewardsCount,
        claimableTotalAmount,
        userBalance: Number(wallet?.balance || 0),
      },
      missions: missionsWithProgress,
      claimedHistory,
    });
  } catch (error) {
    console.error("[MISSIONS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Claim mission reward
export async function POST(request: NextRequest) {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে প্রথমে লগইন করুন (Please log in first)" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { missionId } = body;

    const mission = MISSION_DEFINITIONS.find((m) => m.id === missionId);
    if (!mission) {
      return NextResponse.json(
        { error: "মিশন পাওয়া যায়নি (Invalid mission)" },
        { status: 404 }
      );
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    // Check if already claimed for period
    const existingClaim = await db.notification.findFirst({
      where: {
        userId: user.id,
        title: `Mission Reward: ${mission.title}`,
        createdAt: {
          gte: mission.category === "DAILY" ? todayStart : mission.category === "WEEKLY" ? weekStart : new Date(0),
        },
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "আপনি এই রিওয়ার্ডটি ইতিমধ্যে ক্লেইম করেছেন!" },
        { status: 400 }
      );
    }

    // Verify completion condition in database
    let isEligible = false;

    if (mission.id === "daily_login") {
      isEligible = true;
    } else if (mission.id === "daily_deposit_500") {
      const todayDeposits = await db.deposit.findMany({
        where: { userId: user.id, status: "APPROVED", createdAt: { gte: todayStart } },
      });
      const sum = todayDeposits.reduce((acc, d) => acc + Number(d.amount || 0), 0);
      isEligible = sum >= 500;
    } else if (mission.id.startsWith("daily_turnover_") || mission.id === "daily_mega_turnover") {
      const [wallet, deposits] = await Promise.all([
        db.wallet.findUnique({ where: { userId: user.id } }),
        db.deposit.findMany({ where: { userId: user.id, status: "APPROVED", createdAt: { gte: todayStart } } }),
      ]);
      const depositSum = deposits.reduce((acc, d) => acc + Number(d.amount || 0), 0);
      const turnover = Math.max(Number(wallet?.turnOver || 0), depositSum > 0 ? depositSum * 1.5 : 0);
      isEligible = turnover >= mission.target;
    } else if (mission.id === "weekly_deposit_5000") {
      const weekDeposits = await db.deposit.findMany({
        where: { userId: user.id, status: "APPROVED", createdAt: { gte: weekStart } },
      });
      const sum = weekDeposits.reduce((acc, d) => acc + Number(d.amount || 0), 0);
      isEligible = sum >= 5000;
    } else if (mission.id === "weekly_invite_friends" || mission.id === "achieve_invite_5") {
      const userInv = await db.invitation.findUnique({
        where: { userId: user.id },
        include: { _count: { select: { referredUsers: true } } },
      });
      const count = userInv?._count?.referredUsers || 0;
      isEligible = count >= mission.target;
    } else if (mission.id === "achieve_first_deposit") {
      const count = await db.deposit.count({ where: { userId: user.id, status: "APPROVED" } });
      isEligible = count > 0;
    } else {
      isEligible = true;
    }

    if (!isEligible) {
      return NextResponse.json(
        { error: "মিশনের শর্ত এখনও সম্পন্ন হয়নি! অনুগ্রহ করে টার্গেট পূরণ করুন।" },
        { status: 400 }
      );
    }

    // Award reward in transaction
    const [updatedWallet] = await db.$transaction([
      db.wallet.update({
        where: { userId: user.id },
        data: {
          balance: { increment: mission.reward },
        },
      }),
      db.notification.create({
        data: {
          userId: user.id,
          title: `Mission Reward: ${mission.title}`,
          description: `অভিনন্দন! ৳ ${mission.reward} মিশন রিওয়ার্ড আপনার একাউন্ট ব্যালেন্সে যোগ হয়েছে।`,
          icon: "BONUS",
          metadata: {
            type: "MISSION_CLAIM",
            missionId: mission.id,
            rewardAmount: mission.reward,
            claimedAt: new Date().toISOString(),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `অভিনন্দন! ৳ ${mission.reward} রিওয়ার্ড সফলভাবে আপনার ওয়ালেটে যোগ হয়েছে!`,
      rewardAmount: mission.reward,
      newBalance: Number(updatedWallet.balance),
    });
  } catch (error) {
    console.error("[MISSIONS_CLAIM_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
