import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getScopedDepositWalletsForUser } from "@/lib/depositWallets";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

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

    const paymentWallets = await db.paymentWallet.findMany();
    let depositWallets;

    if (userId) {
      const scoped = await getScopedDepositWalletsForUser(userId);
      depositWallets = scoped.depositWallets;
    } else {
      depositWallets = await db.depositWallet.findMany({
        where: { subAdminId: null, isActive: true },
      });
    }

    const activeMethods = depositWallets.map((dw) => {
      const pw = paymentWallets.find((p) => p.id === dw.paymentWalletId);
      return {
        id: dw.id,
        name: pw?.walletName || "Payment Method",
        type: pw?.walletType || "EWALLET",
        logo: pw?.walletLogo || "",
        min: Number(dw.minDeposit),
        max: Number(dw.maximumDeposit),
        numbers: dw.walletsNumber,
        instructions: dw.instructions,
        warning: dw.warning || "",
      };
    });

    return NextResponse.json({
      success: true,
      methods: activeMethods,
    });
  } catch (error: any) {
    console.error("Mobile GetPaymentMethods Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
