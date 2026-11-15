/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const user: any = await findCurrentUser();

    if (!user) {
      return Response.json({ error: "Please log in first" }, { status: 401 });
    }

    const reward = await db.signinBonusRewards.findUnique({
      where: { id },
    });

    if (!reward) {
      return Response.json({ error: "Reward not found" }, { status: 404 });
    }

    // 1. Check if user already claimed this specific day's reward
    const [existingClaim, existingNotification] = await Promise.all([
      db.claimedSigninReward.findFirst({
        where: {
          userId: user.id,
          rewardId: reward.id,
          isClamed: true,
        },
      }),
      db.notification.findFirst({
        where: {
          userId: user.id,
          title: `Daily Check-in Day ${reward.day}`,
        },
      }),
    ]);

    if (existingClaim || existingNotification) {
      return Response.json(
        { error: `You have already claimed Day ${reward.day} reward!` },
        { status: 400 }
      );
    }

    // 2. Check qualifying approved deposit if requiredDeposit > 0
    const requiredDeposit = Number(reward.deposit || 0);
    let qualifyingDeposit: any = null;

    if (requiredDeposit > 0) {
      qualifyingDeposit = await db.deposit.findFirst({
        where: {
          userId: user.id,
          status: "APPROVED",
          amount: { gte: reward.deposit },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!qualifyingDeposit) {
        return Response.json(
          {
            error: `Minimum deposit of ৳ ${reward.deposit} required to claim Day ${reward.day} bonus. Please make a deposit first!`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Credit wallet balance + 1x Turnover requirement & record claim in atomic transaction
    const prizeAmount = Number(reward.prize);

    await db.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: user.id },
        data: {
          balance: { increment: prizeAmount },
          turnOver: { increment: prizeAmount }, // 1x Turnover requirement
        },
      });

      // Record in notification log (supports all 7 days without unique constraint collision)
      await tx.notification.create({
        data: {
          userId: user.id,
          title: `Daily Check-in Day ${reward.day}`,
          description: `৳ ${prizeAmount} daily login bonus added to your wallet (1x Turnover: ৳ ${prizeAmount}).`,
          icon: "BONUS",
          metadata: {
            type: "SIGNIN_CLAIM",
            rewardId: reward.id,
            day: String(reward.day),
            prize: prizeAmount,
            turnoverAdded: prizeAmount,
            claimedAt: new Date().toISOString(),
          },
        },
      });

      // Best-effort sync with legacy ClaimedSigninReward table if qualifyingDeposit is available and unused
      if (qualifyingDeposit) {
        const depositUsed = await tx.claimedSigninReward.findUnique({
          where: { depositId: qualifyingDeposit.id },
        });
        if (!depositUsed) {
          await tx.claimedSigninReward
            .upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                rewardId: reward.id,
                depositId: qualifyingDeposit.id,
                isClamed: true,
              },
              update: {
                rewardId: reward.id,
                depositId: qualifyingDeposit.id,
                isClamed: true,
              },
            })
            .catch(() => {});
        }
      }
    });

    return Response.json({
      success: true,
      message: `Day ${reward.day} bonus of ৳ ${prizeAmount} credited! (1x Turnover applied)`,
    });
  } catch (error) {
    console.error("Error claiming signin reward:", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
