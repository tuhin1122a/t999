/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Check if user already claimed this reward
    const existingClaim = await db.claimedSigninReward.findFirst({
      where: {
        userId: user.id,
        rewardId: reward.id,
        isClamed: true,
      },
    });

    if (existingClaim) {
      return Response.json(
        { error: `You have already claimed Day ${reward.day} reward!` },
        { status: 400 }
      );
    }

    // Find qualifying approved deposit for this user (amount >= reward.deposit)
    const qualifyingDeposit = await db.deposit.findFirst({
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

    // Update wallet balance and record claimed reward in transaction
    await db.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: user.id },
        data: {
          balance: { increment: reward.prize },
        },
      });

      // ClaimedSigninReward has unique constraint on userId in schema, so upsert
      await tx.claimedSigninReward.upsert({
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
      });
    });

    await createNotification({
      title: `Daily Check-in Day ${reward.day}`,
      description: `৳ ${reward.prize} daily streak bonus added to your wallet!`,
      userId: user.id,
      icon: "MONEY",
    }).catch(() => {});

    return Response.json({
      success: true,
      message: `Day ${reward.day} bonus of ৳ ${reward.prize} successfully credited!`,
    });
  } catch (error) {
    console.error("Error claiming signin reward:", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
