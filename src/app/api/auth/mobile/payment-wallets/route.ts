import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const paymentWallets = await db.paymentWallet.findMany();
    const depositWallets = await db.depositWallet.findMany({
      where: { isActive: true }
    });

    const activeMethods = depositWallets.map(dw => {
      const pw = paymentWallets.find(p => p.id === dw.paymentWalletId);
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
      methods: activeMethods
    });
  } catch (error: any) {
    console.error("Mobile GetPaymentMethods Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
