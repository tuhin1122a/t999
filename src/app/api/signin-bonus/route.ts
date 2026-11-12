/* eslint-disable @typescript-eslint/no-explicit-any */
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const user: any = await findCurrentUser();

    const rewards: any = await db.signinBonusRewards.findMany();
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
        rewards: rewards.map((r: any) => ({ ...r, status: "AVAILABLE" })),
      });
    }

    const [claimedSigninRewards, userApprovedDeposits, wallet] = await Promise.all([
      db.claimedSigninReward.findMany({
        where: { userId: user.id },
        include: { reward: true },
        orderBy: { createdAt: "desc" },
      }),
      db.deposit.findMany({
        where: { userId: user.id, status: "APPROVED" },
        select: { id: true, amount: true, createdAt: true },
      }),
      db.wallet.findUnique({
        where: { userId: user.id },
        select: { balance: true },
      }),
    ]);

    const totalSigninIncome = claimedSigninRewards.reduce(
      (acc, c) => (c.isClamed ? acc + c.reward.prize : acc),
      0
    );

    const lastSignin = claimedSigninRewards.find((c) => c.isClamed);

    // Compute status for each day:
    // CLAIMED: already claimed
    // CLAIM: eligible to claim right now (has qualifying deposit)
    // AVAILABLE: needs deposit to unlock
    rewards.forEach((reward: any) => {
      const alreadyClaimed = claimedSigninRewards.find(
        (c) => c.rewardId === reward.id && c.isClamed
      );

      if (alreadyClaimed) {
        reward.status = "CLAIMED";
        return;
      }

      const hasQualifyingDeposit = userApprovedDeposits.some(
        (d) => Number(d.amount) >= Number(reward.deposit)
      );

      if (hasQualifyingDeposit) {
        reward.status = "CLAIM";
      } else {
        reward.status = "AVAILABLE";
      }
    });

    const nextClaimAvailable =
      rewards.find((r: any) => r.status !== "CLAIMED") || rewards[rewards.length - 1] || null;

    return Response.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        playerId: user.playerId,
        balance: wallet?.balance ? Number(wallet.balance) : 0,
      },
      statictic: {
        totalSigninIncome,
        lastSigninIncome: lastSignin?.reward?.prize || 0,
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
