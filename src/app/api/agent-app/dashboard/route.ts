import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAgentRequest } from "@/lib/agentAutoDeposit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const agent = await verifyAgentRequest(req);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      todayAutoApprovedAgg,
      pendingDeposits,
      pendingWithdraws,
      recentSms,
      paymentWallets,
    ] = await Promise.all([
      db.incomingSms.aggregate({
        where: {
          status: "MATCHED",
          processedAt: { gte: startOfDay },
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
      db.deposit.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          wallet: { select: { paymentWalletId: true, trxType: true } },
        },
      }),
      db.withdraw.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          card: {
            select: {
              walletNumber: true,
              cardNumber: true,
              paymentWalletid: true,
            },
          },
        },
      }),
      db.incomingSms.findMany({
        orderBy: { receivedAt: "desc" },
        take: 50,
      }),
      db.paymentWallet.findMany({
        select: { id: true, walletName: true },
      }),
    ]);

    const walletNameById = new Map(
      paymentWallets.map((w) => [w.id, w.walletName])
    );

    const formattedDeposits = pendingDeposits.map((d) => ({
      id: d.id,
      amount: Number(d.amount),
      trxId: d.trxID || "",
      senderNumber: d.senderNumber || "",
      receiverNumber: d.walletNumber || "",
      trackingNumber: d.trackingNumber,
      method: walletNameById.get(d.wallet?.paymentWalletId || "") || "E-Wallet",
      userName: d.user?.name || "Player",
      userPhone: d.user?.phone || "",
      createdAt: d.createdAt.toISOString(),
    }));

    const formattedWithdraws = pendingWithdraws.map((w) => ({
      id: w.id,
      amount: Number(w.amount),
      method: walletNameById.get(w.card?.paymentWalletid || "") || "E-Wallet",
      receiverNumber: w.card?.walletNumber || w.card?.cardNumber || "",
      userName: w.user?.name || "Player",
      userPhone: w.user?.phone || "",
      createdAt: w.createdAt.toISOString(),
    }));

    const formattedSms = recentSms.map((s) => ({
      id: s.id,
      provider: s.provider,
      senderAddress: s.senderAddress,
      senderNumber: s.senderNumber || "",
      trxId: s.trxId,
      amount: Number(s.amount),
      status: s.status,
      note: s.note || "",
      receivedAt: s.receivedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      serverTime: new Date().toISOString(),
      stats: {
        todayAutoApprovedCount: todayAutoApprovedAgg._count.id || 0,
        todayAutoApprovedAmount: Number(todayAutoApprovedAgg._sum.amount || 0),
        pendingDepositsCount: formattedDeposits.length,
        pendingWithdrawsCount: formattedWithdraws.length,
        unmatchedSmsCount: formattedSms.filter((s) => s.status === "UNMATCHED").length,
      },
      pendingDeposits: formattedDeposits,
      pendingWithdraws: formattedWithdraws,
      recentSms: formattedSms,
    });
  } catch (err: any) {
    console.error("[agent-app/dashboard] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
