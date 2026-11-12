import { db } from "@/lib/db";

/**
 * Resolves active DepositWallets visible to a specific player.
 * Rule:
 * - If the player is under a Sub-Admin AND that Sub-Admin has at least one active
 *   custom wallet with a configured phone/account number, return ONLY that Sub-Admin's wallets.
 * - Otherwise (direct player OR Sub-Admin has not set custom numbers yet),
 *   fall back to default platform wallets (subAdminId: null).
 */
export async function getScopedDepositWalletsForUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, subAdminId: true },
  });

  if (user?.subAdminId) {
    const subAdminWallets = await db.depositWallet.findMany({
      where: {
        subAdminId: user.subAdminId,
        isActive: true,
      },
    });

    const configuredSubAdminWallets = subAdminWallets.filter(
      (w) =>
        Array.isArray(w.walletsNumber) &&
        w.walletsNumber.some((num) => String(num).trim().length > 0)
    );

    if (configuredSubAdminWallets.length > 0) {
      return {
        user,
        depositWallets: configuredSubAdminWallets,
        isSubAdminCustom: true,
      };
    }
  }

  const defaultWallets = await db.depositWallet.findMany({
    where: {
      subAdminId: null,
      isActive: true,
    },
  });

  return {
    user,
    depositWallets: defaultWallets,
    isSubAdminCustom: false,
  };
}

