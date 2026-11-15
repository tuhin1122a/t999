import { db } from "./db";

/**
 * Reduces a user's remaining turnover requirement when they place a bet.
 * Also auto-resets remaining turnover to 0 if their wallet balance drops below 1 BDT.
 */
export const reduceTurnOver = async (amount: number, userId: string) => {
  const wallet = await db.wallet.findUnique({
    where: { userId },
    select: { turnOver: true, balance: true },
  });

  if (!wallet) throw new Error("Wallet not found");

  const currentBalance = Number(wallet.balance || 0);
  const currentTurnOver = Number(wallet.turnOver || 0);

  // If user has lost their balance (< 1 BDT), clear any stuck turnover
  const newTurnOver =
    currentBalance < 1 ? 0 : Math.max(0, Number((currentTurnOver - amount).toFixed(2)));

  await db.wallet.update({
    where: { userId },
    data: {
      turnOver: newTurnOver,
    },
  });

  return true;
};

/**
 * Credits a bonus to the user's wallet and enforces a 1x turnover requirement.
 */
export const creditBonusWithOneXTurnover = async (
  userId: string,
  bonusAmount: number
) => {
  if (bonusAmount <= 0) return null;

  return await db.wallet.update({
    where: { userId },
    data: {
      balance: { increment: bonusAmount },
      turnOver: { increment: bonusAmount }, // Strict 1x turnover requirement
    },
  });
};
