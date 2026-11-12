import { findCurrentUser } from "@/data/user";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getScopedDepositWalletsForUser } from "@/lib/depositWallets";

export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Get user's wallet
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check if sign-in bonus is active for this user
    // It's active if they have 0 approved deposits, or if admin explicitly reactivated it (wallet.signinBonus === true)
    const approvedDepositsCount = await db.deposit.count({
      where: {
        userId: user.id,
        status: "APPROVED",
      },
    });
    const isSigninBonusActive = wallet.signinBonus || approvedDepositsCount === 0;

    // Get payment wallets and scoped deposit wallets
    const [paymentWallets, scoped, bonus] = await Promise.all([
      db.paymentWallet.findMany(),
      getScopedDepositWalletsForUser(user.id),
      db.bonus.findFirst(),
    ]);
    const depositWallets = scoped.depositWallets;

    // Combine scoped deposit wallets with their payment wallet details
    const wallets = depositWallets.map((depositWallet) => {
      const pw = paymentWallets.find((p) => p.id === depositWallet.paymentWalletId);
      return {
        id: depositWallet.id,
        paymentWalletId: depositWallet.paymentWalletId,
        name: pw?.walletName || "Unknown",
        image: pw?.walletLogo || "",
        label: pw?.walletName || "Unknown",
        min_deposit: depositWallet?.minDeposit ? parseFloat(depositWallet.minDeposit.toString()) : 100,
        max_deposit: depositWallet?.maximumDeposit ? parseFloat(depositWallet.maximumDeposit.toString()) : 50000,
        instructions: depositWallet?.instructions || "",
        warning: depositWallet?.warning || "",
        isActive: depositWallet?.isActive ?? true,
        walletsNumber: depositWallet?.walletsNumber || [],
      };
    });

    return NextResponse.json({
      payload: {
        wallets,
        bonus: {
          signinBonus: isSigninBonusActive ? (bonus?.signinBonus || 5) : 0,
          referralBonus: bonus?.referralBonus || 5,
        }
      }
    });
  } catch (error) {
    console.error("Deposit payment wallet error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
