import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_INVITATION_REWARDS = [
  {
    rewardImg:
      "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607129/mbuzz88/kdi4ajsyggxdjl8xvyy5.png",
    prize: 100,
    targetReferral: 1,
  },
  {
    rewardImg:
      "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607134/mbuzz88/ittgozvoezof3cqbprik.png",
    prize: 300,
    targetReferral: 3,
  },
  {
    rewardImg:
      "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607130/mbuzz88/dx7stvyko3gvwvrwgxwx.png",
    prize: 700,
    targetReferral: 7,
  },
  {
    rewardImg:
      "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607131/mbuzz88/mqo9muoc3pevb6kff8jb.png",
    prize: 1500,
    targetReferral: 15,
  },
  {
    rewardImg:
      "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607130/mbuzz88/xrqqj8zdn7dtdwcsn4wd.png",
    prize: 3500,
    targetReferral: 30,
  },
  {
    rewardImg:
      "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1746607130/mbuzz88/tf8sa8jbruzzckjljcjg.png",
    prize: 6500,
    targetReferral: 50,
  },
];

export const GET = async () => {
  try {
    const user = await findCurrentUser();

    let rewards = await db.invitationRewards.findMany().catch(() => []);

    // Auto-seed referral milestone rewards if table is empty
    if (!rewards || rewards.length === 0) {
      await db.invitationRewards
        .createMany({
          data: DEFAULT_INVITATION_REWARDS,
        })
        .catch(() => {});
      rewards = await db.invitationRewards.findMany().catch(() => []);
    }

    // Sort ascending by targetReferral
    rewards.sort((a, b) => a.targetReferral - b.targetReferral);

    if (!user) {
      return Response.json(
        {
          authenticated: false,
          rewards: rewards.map((r) => ({
            ...r,
            turnoverMultiplier: "1x",
            completedReferral: 0,
            isClaimed: false,
          })),
          statistic: {
            registersCount: 0,
            todayIncome: 0,
            validReferral: 0,
            totalIncome: 0,
          },
          referredUsers: [],
        },
        { status: 200 }
      );
    }

    let userInvitationBonus = await db.invitationBonus.findUnique({
      where: { userId: user.id },
      include: { claimedRewards: true },
    });

    if (!userInvitationBonus) {
      userInvitationBonus = await db.invitationBonus.create({
        data: {
          userId: user.id,
          totalRegisters: 0,
          totalValidreferral: 0,
        },
        include: { claimedRewards: true },
      });
    }

    // Fetch referred users from both Invitation and AffiliateReferral
    const [userInvitation, affiliateProfile] = await Promise.all([
      db.invitation.findUnique({
        where: { userId: user.id },
        include: {
          referredUsers: {
            include: {
              deposit: {
                where: { status: "APPROVED" },
                select: { id: true, amount: true },
              },
              durantoPayDeposits: {
                where: { status: "COMPLETED" },
                select: { id: true, amount: true },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
      db.affiliate.findUnique({
        where: { userId: user.id },
        include: {
          referrals: {
            include: {
              referredUser: {
                include: {
                  deposit: {
                    where: { status: "APPROVED" },
                    select: { id: true, amount: true },
                  },
                  durantoPayDeposits: {
                    where: { status: "COMPLETED" },
                    select: { id: true, amount: true },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Merge referred users uniquely by user ID
    const referredMap = new Map<
      string,
      { id: string; phone: string; createdAt: string; isValid: boolean }
    >();

    userInvitation?.referredUsers.forEach((refUser) => {
      const hasApprovedDeposit =
        refUser.deposit.length > 0 || refUser.durantoPayDeposits.length > 0;
      referredMap.set(refUser.id, {
        id: refUser.id,
        phone: refUser.phone,
        createdAt: refUser.createdAt.toISOString(),
        isValid: hasApprovedDeposit,
      });
    });

    affiliateProfile?.referrals.forEach((affRef) => {
      const refUser = affRef.referredUser;
      if (refUser && !referredMap.has(refUser.id)) {
        const hasApprovedDeposit =
          refUser.deposit.length > 0 || refUser.durantoPayDeposits.length > 0;
        referredMap.set(refUser.id, {
          id: refUser.id,
          phone: refUser.phone,
          createdAt: refUser.createdAt.toISOString(),
          isValid: hasApprovedDeposit,
        });
      }
    });

    const referredUsersList = Array.from(referredMap.values());
    const registersCount = referredUsersList.length;
    const validReferralsCount = referredUsersList.filter((u) => u.isValid).length;

    // Sync counts with userInvitationBonus in DB
    await db.invitationBonus.update({
      where: { id: userInvitationBonus.id },
      data: {
        totalRegisters: registersCount,
        totalValidreferral: validReferralsCount,
      },
    });

    userInvitationBonus.totalRegisters = registersCount;
    userInvitationBonus.totalValidreferral = validReferralsCount;

    const userRewards = rewards.map((reward) => {
      const completedReferral =
        userInvitationBonus.totalValidreferral >= reward.targetReferral
          ? reward.targetReferral
          : userInvitationBonus.totalValidreferral;

      const isClaimed = !!userInvitationBonus.claimedRewards.find(
        (claimedReward) => reward.id === claimedReward.rewardId
      );

      return {
        ...reward,
        turnoverMultiplier: "1x",
        completedReferral,
        isClaimed,
      };
    });

    const invitationBonus = await db.invitationBonus.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        claimedRewards: {
          include: {
            reward: true,
          },
        },
      },
    });

    const totalIncome =
      invitationBonus?.claimedRewards.reduce((acc, claimedReward) => {
        return acc + Number(claimedReward.reward.prize || 0);
      }, 0) || 0;

    const totalIncomeToday =
      invitationBonus?.claimedRewards.reduce((acc, claimedReward) => {
        const createdAt = new Date(claimedReward.createdAt);
        const now = new Date();
        const isWithin24Hours =
          now.getTime() - createdAt.getTime() <= 24 * 60 * 60 * 1000;

        if (isWithin24Hours) {
          return acc + Number(claimedReward.reward.prize || 0);
        }
        return acc;
      }, 0) || 0;

    const statistic = {
      registersCount: userInvitationBonus.totalRegisters,
      todayIncome: totalIncomeToday,
      validReferral: userInvitationBonus.totalValidreferral,
      totalIncome,
    };

    return Response.json(
      {
        rewards: userRewards,
        statistic,
        referredUsers: referredUsersList,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Invitation Bonus = ", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
