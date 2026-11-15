/* eslint-disable @typescript-eslint/no-explicit-any */
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_SIGNIN_REWARDS = [
  { day: "1", prize: 15, deposit: 0 },
  { day: "2", prize: 25, deposit: 200 },
  { day: "3", prize: 40, deposit: 500 },
  { day: "4", prize: 60, deposit: 1000 },
  { day: "5", prize: 100, deposit: 2000 },
  { day: "6", prize: 200, deposit: 3000 },
  { day: "7", prize: 500, deposit: 5000 },
];

export const GET = async () => {
  try {
    const user: any = await findCurrentUser();

    let rewards: any[] = await db.signinBonusRewards.findMany();

    // Auto-seed 7-day login bonus rewards if table is empty
    if (!rewards || rewards.length === 0) {
      await db.signinBonusRewards.createMany({
        data: DEFAULT_SIGNIN_REWARDS,
      });
      rewards = await db.signinBonusRewards.findMany();
    }

    // Sort rewards numerically by day
    rewards.sort((a: any, b: any) => Number(a.day) - Number(b.day));

    if (!user) {
      return Response.json({
        authenticated: false,
        user: null,
        statictic: {
          totalSigninIncome: 0,
          lastSigninIncome: 0,
        },
        lastClaimed: null,
        nextClaimAvailable: rewards[0] || null,
        rewards: rewards.map((r: any) => ({
          ...r,
          turnoverMultiplier: "1x",
          status: "AVAILABLE",
        })),
      });
    }

    const [claimedSigninRewards, signinNotifications, userApprovedDeposits, wallet] =
      await Promise.all([
        db.claimedSigninReward.findMany({
          where: { userId: user.id },
          include: { reward: true },
          orderBy: { createdAt: "desc" },
        }),
        db.notification.findMany({
          where: {
            userId: user.id,
            title: { startsWith: "Daily Check-in Day " },
          },
          orderBy: { createdAt: "desc" },
        }),
        db.deposit.findMany({
          where: { userId: user.id, status: "APPROVED" },
          select: { id: true, amount: true, createdAt: true },
        }),
        db.wallet.findUnique({
          where: { userId: user.id },
          select: { balance: true, turnOver: true },
        }),
      ]);

    // Build set of claimed reward IDs and days from both ClaimedSigninReward and Notifications
    const claimedRewardIds = new Set<string>();
    const claimedDays = new Set<string>();
    let totalSigninIncome = 0;
    let lastSigninIncome = 0;

    claimedSigninRewards.forEach((c) => {
      if (c.isClamed) {
        claimedRewardIds.add(c.rewardId);
        if (c.reward?.day) claimedDays.add(String(c.reward.day));
      }
    });

    signinNotifications.forEach((n, index) => {
      const meta = (n.metadata || {}) as any;
      if (meta.rewardId) claimedRewardIds.add(String(meta.rewardId));
      const dayMatch = n.title.match(/Day\s+(\d+)/i);
      const dayStr = meta.day ? String(meta.day) : dayMatch ? dayMatch[1] : null;
      if (dayStr) claimedDays.add(dayStr);

      const prizeVal = meta.prize
        ? Number(meta.prize)
        : rewards.find((r) => String(r.day) === dayStr)?.prize || 0;
      totalSigninIncome += prizeVal;
      if (index === 0) {
        lastSigninIncome = prizeVal;
      }
    });

    // Fallback if notifications didn't have historical claims
    if (totalSigninIncome === 0 && claimedSigninRewards.length > 0) {
      totalSigninIncome = claimedSigninRewards.reduce(
        (acc, c) => (c.isClamed ? acc + c.reward.prize : acc),
        0
      );
      lastSigninIncome = claimedSigninRewards.find((c) => c.isClamed)?.reward?.prize || 0;
    }

    const lastSignin = claimedSigninRewards.find((c) => c.isClamed);

    // Compute status for each day:
    // CLAIMED: already claimed
    // CLAIM: eligible to claim right now (free day or has qualifying deposit)
    // AVAILABLE: needs deposit to unlock
    rewards.forEach((reward: any) => {
      reward.turnoverMultiplier = "1x";
      const isAlreadyClaimed =
        claimedRewardIds.has(reward.id) || claimedDays.has(String(reward.day));

      if (isAlreadyClaimed) {
        reward.status = "CLAIMED";
        return;
      }

      const requiredDeposit = Number(reward.deposit || 0);
      const hasQualifyingDeposit =
        requiredDeposit <= 0 ||
        userApprovedDeposits.some((d) => Number(d.amount) >= requiredDeposit);

      if (hasQualifyingDeposit) {
        reward.status = "CLAIM";
      } else {
        reward.status = "AVAILABLE";
      }
    });

    const nextClaimAvailable =
      rewards.find((r: any) => r.status !== "CLAIMED") ||
      rewards[rewards.length - 1] ||
      null;

    return Response.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        playerId: user.playerId,
        balance: wallet?.balance ? Number(wallet.balance) : 0,
        turnOver: wallet?.turnOver ? Number(wallet.turnOver) : 0,
      },
      statictic: {
        totalSigninIncome,
        lastSigninIncome,
      },
      lastClaimed: lastSignin || null,
      nextClaimAvailable,
      rewards,
    });
  } catch (error) {
    console.error("Error in signin-bonus GET API:", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
