import { createNotification } from "@/action/notifications";
import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    const user = await findCurrentUser();

    if (!user)
      return Response.json({ error: "Please log in first" }, { status: 401 });

    const reward = await db.invitationRewards.findUnique({ where: { id } });

    if (!reward)
      return Response.json(
        { error: "Reward is not available yet" },
        { status: 404 }
      );

    let userInvitationBonus = await db.invitationBonus.findUnique({
      where: { userId: user.id },
    });

    if (!userInvitationBonus) {
      userInvitationBonus = await db.invitationBonus.create({
        data: {
          userId: user.id,
          totalRegisters: 0,
          totalValidreferral: 0,
        },
      });
    }

    // Check if THIS user already claimed this milestone reward
    const isClaimed = !!(await db.claimedInvitationReward.findFirst({
      where: {
        rewardId: id,
        invitationBonusId: userInvitationBonus.id,
      },
    }));

    if (isClaimed)
      return Response.json(
        { error: "You have already claimed this referral reward!" },
        { status: 400 }
      );

    if (userInvitationBonus.totalValidreferral < reward.targetReferral) {
      return Response.json(
        {
          error: `Please refer ${
            reward.targetReferral - userInvitationBonus.totalValidreferral
          } more active depositing friend(s) to unlock this reward!`,
        },
        { status: 400 }
      );
    }

    const prizeAmount = Number(reward.prize);

    // Credit wallet balance + 1x Turnover requirement in transaction
    await db.$transaction([
      db.wallet.update({
        where: { userId: user.id },
        data: {
          balance: { increment: prizeAmount },
          turnOver: { increment: prizeAmount }, // 1x Turnover requirement
        },
      }),
      db.invitationBonus.update({
        where: { id: userInvitationBonus.id },
        data: {
          claimedRewards: {
            create: {
              reward: {
                connect: {
                  id: reward.id,
                },
              },
            },
          },
        },
      }),
    ]);

    await createNotification({
      title: `Referral Bonus Claimed`,
      description: `৳ ${prizeAmount} referral milestone bonus added to your wallet (1x Turnover: ৳ ${prizeAmount}).`,
      userId: user.id,
      icon: "MONEY",
    }).catch(() => {});

    return Response.json(
      {
        success: true,
        message: `৳ ${prizeAmount} referral milestone bonus credited! (1x Turnover applied)`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("CLAIM INVITATION REWARD: ", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
