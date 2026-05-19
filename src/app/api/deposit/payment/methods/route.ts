import { findCurrentUser } from "@/data/user";
import { NextResponse } from "next/server";
import { getAvailablePaymentSystems } from "@/lib/api/durantoPayApi";
import { db } from "@/lib/db";
import { getPaymentMethodImage, getPaymentMethodLabel } from "@/lib/utils/paymentMethodUtils";

export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Get available payment systems from DurantoPay
    const paymentSystemsResponse = await getAvailablePaymentSystems();
    
    console.log("Payment systems response:", paymentSystemsResponse);
    
    if (!paymentSystemsResponse.status) {
      console.error("Failed to fetch payment methods from Durantopay API");
      return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
    }

    // Get payment wallets and deposit wallets from database
    const [dbPaymentWallets, dbDepositWallets] = await Promise.all([
      db.paymentWallet.findMany(),
      db.depositWallet.findMany(),
    ]);

    // Transform the response to match the existing format
    // The DurantoPay API returns an array of payment method names
    const paymentMethods = paymentSystemsResponse.data || [];
    const wallets = paymentMethods.map((method: string) => {
      // Find matching payment wallet in database by name (case-insensitive)
      const matchingPw = dbPaymentWallets.find(
        (pw) => pw.walletName.toLowerCase() === method.toLowerCase()
      );
      
      const matchingDw = matchingPw 
        ? dbDepositWallets.find((dw) => dw.paymentWalletId === matchingPw.id) 
        : null;

      return {
        id: matchingPw?.id || method,
        name: method,
        image: matchingPw?.walletLogo || getPaymentMethodImage(method),
        label: getPaymentMethodLabel(method),
        min_deposit: matchingDw?.minDeposit ? parseFloat(matchingDw.minDeposit.toString()) : 100,
        max_deposit: matchingDw?.maximumDeposit ? parseFloat(matchingDw.maximumDeposit.toString()) : 50000,
        instructions: matchingDw?.instructions || `Please use your ${method} account to make the payment`,
        warning: matchingDw?.warning || `Make sure to use an account registered under your name`,
        isActive: matchingDw?.isActive ?? true,
        walletsNumber: matchingDw?.walletsNumber || [],
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