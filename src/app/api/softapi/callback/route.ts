// src/app/api/softapi/callback/route.ts
// SoftAPI Callback Webhook Receiver (accepts both plain JSON and AES-256-ECB encrypted payload)
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SOFTAPI_SECRET = "0d6e277db0020770476bb22a8a075ca5";

// In-memory LRU cache to prevent duplicate processing of same serial_number / settle ID
const processedSerials = new Set<string>();
const MAX_SERIAL_CACHE_SIZE = 10000;

function rememberSerial(serial: string) {
  if (!serial) return;
  if (processedSerials.size >= MAX_SERIAL_CACHE_SIZE) {
    const firstItem = processedSerials.values().next().value;
    if (firstItem) processedSerials.delete(firstItem);
  }
  processedSerials.add(serial);
}

function decryptPayloadECB(payloadBase64: string, key32: string) {
  if (!key32 || Buffer.byteLength(key32, "utf8") !== 32) {
    throw new Error("SOFTAPI_SECRET must be 32 bytes long");
  }
  const encrypted = Buffer.from(payloadBase64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-ecb", Buffer.from(key32, "utf8"), null);
  decipher.setAutoPadding(true); // PKCS7 unpadding
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  return JSON.parse(decrypted);
}

export async function POST(request: NextRequest) {
  try {
    console.log("========== SOFTAPI CALLBACK START ==========");

    const rawBody = await request.text();
    console.log("RAW BODY:", rawBody);

    let parsedIncoming: any = null;
    try {
      parsedIncoming = JSON.parse(rawBody);
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return NextResponse.json(
        { code: 1, msg: "invalid json", credit_amount: -1, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Encrypted wire format: { "payload": "<base64>", "timestamp": 123 }
    let event: any = parsedIncoming;
    if (
      parsedIncoming &&
      typeof parsedIncoming.payload === "string" &&
      parsedIncoming.payload !== ""
    ) {
      const secret = process.env.SOFTAPI_SECRET || DEFAULT_SOFTAPI_SECRET;
      try {
        event = decryptPayloadECB(parsedIncoming.payload, secret);
        console.log("Decrypted SoftAPI callback event:", JSON.stringify(event, null, 2));
      } catch (err: any) {
        console.error("Failed to decrypt payload:", err?.message || err);
        return NextResponse.json(
          { code: 1, msg: "decrypt failed", credit_amount: -1, error: "Invalid encrypted payload" },
          { status: 400 }
        );
      }
    }

    const game_uid = String(event.game_uid ?? event.game_id ?? "");
    const game_round = String(event.game_round ?? "");
    const member_account = String(event.member_account ?? event.user_id ?? "");
    const bet_amount = parseFloat(String(event.bet_amount ?? "0")) || 0;
    const win_amount = parseFloat(String(event.win_amount ?? "0")) || 0;
    const serial_number = String(event.serial_number || event.game_round || "");

    // Extract credit_amount (SoftAPI official source of truth for in-game balance after round)
    const credit_amount_raw = event.credit_amount;
    const credit_amount =
      credit_amount_raw !== undefined &&
      credit_amount_raw !== null &&
      credit_amount_raw !== "" &&
      !isNaN(Number(credit_amount_raw))
        ? Number(Number(credit_amount_raw).toFixed(2))
        : null;

    if (!member_account) {
      return NextResponse.json(
        { code: 1, msg: "invalid member_account", credit_amount: -1, error: "Invalid user account" },
        { status: 400 }
      );
    }

    // Deduplication: If this serial_number was already processed, respond 200 OK immediately
    if (serial_number && processedSerials.has(serial_number)) {
      console.log(`[SoftAPI Callback] Skipping duplicate round (already processed): ${serial_number}`);
      return NextResponse.json(
        {
          code: 0,
          msg: "OK",
          credit_amount: credit_amount !== null ? credit_amount : 0,
          timestamp: Math.round(Date.now()),
        },
        { status: 200 }
      );
    }

    // Match user by phone variations, id, or playerId
    const normalized = (s: string) => (s || "").toString().replace(/[^0-9+]/g, "");
    const raw = normalized(member_account);
    const digitsOnly = raw.replace(/\D/g, "");
    const withoutLeadingZeros = digitsOnly.replace(/^0+/, "");
    const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    const phoneCandidates = Array.from(
      new Set(
        [
          raw,
          digitsOnly,
          withoutLeadingZeros,
          withoutLeadingZeros ? `0${withoutLeadingZeros}` : raw,
          withoutLeadingZeros ? `88${withoutLeadingZeros}` : raw,
          withoutLeadingZeros ? `880${withoutLeadingZeros}` : raw,
          withoutLeadingZeros ? `+88${withoutLeadingZeros}` : raw,
          withoutLeadingZeros ? `+880${withoutLeadingZeros}` : raw,
        ].filter(Boolean)
      )
    );

    const orConditions: any[] = [
      ...phoneCandidates.map((p) => ({ phone: p })),
      { id: member_account },
      { playerId: member_account },
      { gameXAPlayerId: member_account },
    ];

    if (last10Digits && last10Digits.length >= 8) {
      orConditions.push({ phone: { endsWith: last10Digits } });
    }

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { wallet: true, bettingRecord: true },
    });

    if (!user || !user.wallet) {
      console.error("[SoftAPI Callback] User not found for member_account:", member_account);
      return NextResponse.json(
        { code: 1, msg: "user not found", credit_amount: -1, error: "User not found" },
        { status: 404 }
      );
    }

    const current_balance = Number(user.wallet.balance);
    const current_turnover = Number(user.wallet.turnOver || 0);

    // SoftAPI Docs Rule #8: Update YOUR books from credit_amount; do not invent balances
    const new_balance =
      credit_amount !== null && credit_amount >= 0
        ? credit_amount
        : Math.max(0, Number((current_balance - bet_amount + win_amount).toFixed(2)));

    const new_turnover =
      bet_amount > 0 ? Math.max(0, Number((current_turnover - bet_amount).toFixed(2))) : current_turnover;

    console.log("[SoftAPI Callback] Settling round:", {
      game_uid,
      game_round,
      member_account,
      serial_number,
      current_balance,
      bet_amount,
      win_amount,
      credit_amount,
      new_balance,
    });

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          balance: new_balance,
          turnOver: new_turnover,
        },
      });

      await tx.bettingRecord.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalBet: bet_amount,
          totalWin: win_amount,
        },
        update: {
          totalBet: { increment: bet_amount },
          totalWin: { increment: win_amount },
        },
      });
    });

    if (serial_number) {
      rememberSerial(serial_number);
    }

    console.log("[SoftAPI Callback] Balance & betting record updated successfully. New balance:", new_balance);

    return NextResponse.json(
      {
        code: 0,
        msg: "OK",
        credit_amount: new_balance,
        timestamp: Math.round(Date.now()),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("SOFTAPI CALLBACK ERROR:", error);
    return NextResponse.json(
      {
        code: 1,
        msg: error.message || "Unexpected error",
        credit_amount: -1,
        error: error.message || "Unexpected error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    code: 0,
    msg: "OK",
    success: true,
    message: "SoftAPI Callback endpoint active",
    timestamp: new Date().toISOString(),
  });
}
