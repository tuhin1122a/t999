import { findCurrentUser } from "@/data/user";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await findCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // Get available payment systems from database, filtering out DurantoPay
    const paymentWallets = await db.paymentWallet.findMany({
      where: {
        NOT: {
          walletName: {
            equals: "DurantoPay",
            mode: "insensitive",
          },
        },
      },
    });

    let wallets = paymentWallets.map((wallet) => {
      return {
        id: wallet.id,
        name: wallet.walletName,
        image: wallet.walletLogo || (wallet.walletName.toLowerCase().includes("bkash") ? "/wallet/bkash.png" : "/wallet/nagad.png"),
        label: wallet.walletName,
        min_withdrawals: 100, // Default values
        max_withdrawals: 50000, // Default values
        instructions: `Please use your ${wallet.walletName} account to receive the payment`,
        warning: `Make sure to use an account registered under your name`,
        isActive: true,
      };
    });

    if (wallets.length === 0) {
      wallets = [
        {
          id: "bkash-default",
          name: "Bkash",
          image: "/wallet/bkash.png",
          label: "bKash",
          min_withdrawals: 100,
          max_withdrawals: 50000,
          instructions: "Please use your bKash account to receive the payment",
          warning: "Make sure to use an account registered under your name",
          isActive: true,
        },
        {
          id: "nagad-default",
          name: "Nagad",
          image: "/wallet/nagad.png",
          label: "Nagad",
          min_withdrawals: 100,
          max_withdrawals: 50000,
          instructions: "Please use your Nagad account to receive the payment",
          warning: "Make sure to use an account registered under your name",
          isActive: true,
        },
      ];
    }

    return NextResponse.json({
      payload: {
        wallets,
      },
    });
  } catch (error) {
    console.error("Withdraw payment methods error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}