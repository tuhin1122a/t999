import { findCurrentUser } from "@/data/user";
import { db } from "@/lib/db";
import { getScopedDepositWalletsForUser } from "@/lib/depositWallets";
import { getPaymentMethodImage, getPaymentMethodLabel } from "@/lib/utils/paymentMethodUtils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Get payment wallets and scoped active deposit wallets (sub-admin custom or default fallback)
    const [dbPaymentWallets, scoped] = await Promise.all([
      db.paymentWallet.findMany(),
      getScopedDepositWalletsForUser(user.id),
    ]);
    const dbDepositWallets = scoped.depositWallets;

    // Map deposit wallets to UI payment method objects
    const wallets = dbDepositWallets.map((dw) => {
      const matchingPw = dbPaymentWallets.find(
        (pw) => pw.id === dw.paymentWalletId
      );
      const name = matchingPw?.walletName || "Unknown";

      return {
        id: dw.id,
        paymentWalletId: dw.paymentWalletId,
        name: name,
        image: matchingPw?.walletLogo || getPaymentMethodImage(name),
        label: matchingPw?.walletName || getPaymentMethodLabel(name),
        min_deposit: parseFloat(dw.minDeposit.toString()),
        max_deposit: parseFloat(dw.maximumDeposit.toString()),
        instructions: dw.instructions,
        warning: dw.warning,
        isActive: dw.isActive,
        walletsNumber: dw.walletsNumber,
      };
    });

    // Get bonus settings from database with error handling
    let bonus = {
      signinBonus: 5,
      referralBonus: 5,
    };
    
    try {
      const bonusSettings = await db.bonus.findFirst();
      if (bonusSettings) {
        bonus = {
          signinBonus: bonusSettings?.signinBonus || 5,
          referralBonus: bonusSettings?.referralBonus || 5,
        };
      }
    } catch (dbError) {
      console.error("Error fetching bonus settings:", dbError);
      // Use default values if database query fails
    }

    return NextResponse.json({
      payload: {
        wallets,
        bonus,
      }
    });
  } catch (error) {
    console.error("Deposit payment methods error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}