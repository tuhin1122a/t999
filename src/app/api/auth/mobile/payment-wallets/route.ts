import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getScopedDepositWalletsForUser } from "@/lib/depositWallets";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string };
        if (decoded?.sub) {
          userId = decoded.sub;
        }
      } catch {
        // Ignore invalid token and fall back to default platform wallets
      }
    }

    let isSigninBonusActive = false;
    if (userId) {
      const [wallet, approvedDepositsCount] = await Promise.all([
        db.wallet.findUnique({ where: { userId } }).catch(() => null),
        db.deposit
          .count({
            where: {
              userId,
              status: "APPROVED",
            },
          })
          .catch(() => 0),
      ]);
      isSigninBonusActive = Boolean(wallet?.signinBonus) || approvedDepositsCount === 0;
    }

    const [paymentWallets, bonus] = await Promise.all([
      db.paymentWallet.findMany(),
      db.bonus.findFirst().catch(() => null),
    ]);

    let depositWallets;
    if (userId) {
      const scoped = await getScopedDepositWalletsForUser(userId);
      depositWallets = scoped.depositWallets;
    } else {
      depositWallets = await db.depositWallet.findMany({
        where: { subAdminId: null, isActive: true },
      });
    }

    const wallets = depositWallets.map((dw) => {
      const pw = paymentWallets.find((p) => p.id === dw.paymentWalletId);
      const minDep = dw?.minDeposit ? parseFloat(dw.minDeposit.toString()) : 100;
      const maxDep = dw?.maximumDeposit ? parseFloat(dw.maximumDeposit.toString()) : 50000;
      const name = pw?.walletName || "Unknown";
      const logo = pw?.walletLogo || "";

      return {
        id: dw.id,
        paymentWalletId: dw.paymentWalletId,
        name,
        label: name,
        type: pw?.walletType || "EWALLET",
        image: logo,
        logo,
        min_deposit: minDep,
        max_deposit: maxDep,
        min: minDep,
        max: maxDep,
        walletsNumber: dw?.walletsNumber || [],
        numbers: dw?.walletsNumber || [],
        instructions: dw?.instructions || "",
        warning: dw?.warning || "",
        isActive: dw?.isActive ?? true,
      };
    });

    const bonusPayload = {
      signinBonus: isSigninBonusActive ? (bonus?.signinBonus || 5) : 0,
      referralBonus: bonus?.referralBonus || 5,
    };

    return NextResponse.json(
      {
        success: true,
        wallets,
        methods: wallets,
        bonus: bonusPayload,
        payload: {
          wallets,
          bonus: bonusPayload,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Mobile GetPaymentMethods Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
