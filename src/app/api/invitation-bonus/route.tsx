import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";

export const GET = async () => {
  try {
    const user = await findCurrentUser();

    if (!user)
      return Response.json({ error: "Refresh the page" }, { status: 401 });

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

    // Fetch referred users and check if they have approved deposits
    const userInvitation = await db.invitation.findUnique({
      where: { userId: user.id },
      include: {
        referredUsers: {
          include: {
            deposit: {
              where: { status: "APPROVED" },
              select: { id: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const referredUsersList = userInvitation?.referredUsers.map((refUser) => {
      const isValid = refUser.deposit.length > 0;
      return {
        id: refUser.id,
        phone: refUser.phone,
        createdAt: refUser.createdAt.toISOString(),
        isValid,
      };
    }) || [];

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

    // Update in-memory counts
    userInvitationBonus.totalRegisters = registersCount;
    userInvitationBonus.totalValidreferral = validReferralsCount;

    const rewards = await db.invitationRewards.findMany({ where: {} });

    const userRewards = rewards.map((reward) => {
      const newReward = { ...reward, completedReferral: 0, isClaimed: false };

      newReward.completedReferral =
        userInvitationBonus.totalValidreferral >= reward.targetReferral
          ? reward.targetReferral
          : userInvitationBonus.totalValidreferral;

      newReward.isClaimed = !!userInvitationBonus.claimedRewards.find(
        (clamedReward) => reward.id === clamedReward.rewardId
      );

      return newReward;
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

    const totalIncome = invitationBonus?.claimedRewards.reduce(
      (acc, claimedReward) => {
        return acc + +claimedReward.reward.prize;
      },
      0
    );

    const totalIncomeToday = invitationBonus?.claimedRewards.reduce(
      (acc, claimedReward) => {
        const createdAt = new Date(claimedReward.createdAt);
        const now = new Date();

        const isWithin24Hours =
          now.getTime() - createdAt.getTime() <= 24 * 60 * 60 * 1000;

        if (isWithin24Hours) {
          return acc + +claimedReward.reward.prize;
        }

        return acc;
      },
      0
    );

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
