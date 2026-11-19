import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  verifyAgentRequest,
  tryAutoApproveDepositBySms,
} from "@/lib/agentAutoDeposit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const agent = await verifyAgentRequest(req);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const provider = String(body?.provider || "").trim();
    const senderAddress = String(body?.senderAddress || provider).trim();
    const senderNumber = body?.senderNumber
      ? String(body.senderNumber).trim()
      : null;
    const trxId = String(body?.trxId || "").trim().toUpperCase();
    const amount = Number(body?.amount);
    const rawBody = String(body?.rawBody || "").trim();

    if (!provider || !trxId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid provider, trxId, and positive amount are required",
        },
        { status: 400 }
      );
    }

    // Store SMS with unique trxId lock (duplicate SMS cannot double-credit)
    let smsRecord;
    try {
      smsRecord = await db.incomingSms.create({
        data: {
          provider,
          senderAddress,
          senderNumber,
          trxId,
          amount: new Prisma.Decimal(amount.toFixed(2)),
          rawBody: rawBody.slice(0, 1000),
          status: "UNMATCHED",
        },
      });
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        const existing = await db.incomingSms.findUnique({
          where: { trxId },
        });
        return NextResponse.json({
          success: true,
          duplicate: true,
          status: existing?.status || "DUPLICATE",
          message: "Duplicate TrxID already recorded",
        });
      }
      throw err;
    }

    // Attempt immediate atomic auto-match & auto-approve (without bonus)
    const matchResult = await tryAutoApproveDepositBySms(
      smsRecord.id,
      trxId,
      amount
    );

    return NextResponse.json({
      success: true,
      smsId: smsRecord.id,
      matched: matchResult.matched,
      status: matchResult.status,
      depositId: matchResult.depositId || null,
      amount: matchResult.amount ?? amount,
      message: matchResult.note,
    });
  } catch (err: any) {
    console.error("[agent-app/sms] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process SMS" },
      { status: 500 }
    );
  }
}
