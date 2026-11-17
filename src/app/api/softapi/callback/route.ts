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

    // ============================================================================
    // SECURITY GUARD: Require AES-256-ECB encrypted payload OR valid secret header
    // Prevents external attackers from sending unencrypted plain JSON to inflate balances
    // ============================================================================
    const secret = process.env.SOFTAPI_SECRET || DEFAULT_SOFTAPI_SECRET;
    let event: any = null;

    if (
      parsedIncoming &&
      typeof parsedIncoming.payload === "string" &&
      parsedIncoming.payload.trim() !== ""
    ) {
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
    } else {
      // Allow plain JSON ONLY if authenticated via internal x-softapi-secret header or secret field
      const headerSecret = request.headers.get("x-softapi-secret") || parsedIncoming?.secret;
      if (headerSecret !== secret) {
        console.warn("[SoftAPI Security] Blocked unencrypted callback without valid secret.");
        return NextResponse.json(
          { code: 1, msg: "unauthorized plain payload", credit_amount: -1, error: "Encrypted payload required" },
          { status: 403 }
        );
      }
      event = parsedIncoming;
    }

    const game_uid = String(event.game_uid ?? event.game_id ?? "");
    const game_name_raw = String(event.game_name ?? "").trim();
    const game_round = String(event.game_round ?? "");
    const member_account = String(event.member_account ?? event.user_id ?? "");
    const bet_amount = parseFloat(String(event.bet_amount ?? "0")) || 0;
    const win_amount = parseFloat(String(event.win_amount ?? "0")) || 0;
    const serial_number = String(event.serial_number || event.game_round || "");
    const free_spin_bonus = event.free_spin_bonus ? String(event.free_spin_bonus) : null;

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

    if (serial_number) {
      const existingBet = await prisma.betHistory
        .findUnique({ where: { serialNumber: serial_number } })
        .catch(() => null);
      if (existingBet) {
        rememberSerial(serial_number);
        return NextResponse.json(
          {
            code: 0,
            msg: "OK",
            credit_amount: Number(existingBet.creditAmount),
            timestamp: Math.round(Date.now()),
          },
          { status: 200 }
        );
      }
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

    // 1x Turnover Deduction + Zero-Balance Auto-Reset:
    // If balance drops below 1 BDT, clear remaining turnover so future deposits aren't burdened.
    const deducted_turnover =
      bet_amount > 0 ? Math.max(0, Number((current_turnover - bet_amount).toFixed(2))) : current_turnover;
    const new_turnover = new_balance < 1 ? 0 : deducted_turnover;

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

    // Resolve game name & provider if not supplied in callback payload
    let resolvedGameName = game_name_raw;
    let resolvedProvider: string | null = null;
    let resolvedBrandId: string | null = null;
    let resolvedCategory: string | null = null;

    if (game_uid) {
      const [pgSetting, hotSetting] = await Promise.all([
        prisma.providerGameSetting
          .findUnique({ where: { gameUid: game_uid } })
          .catch(() => null),
        prisma.hotGame
          .findUnique({ where: { gameUid: game_uid } })
          .catch(() => null),
      ]);
      if (!resolvedGameName) {
        resolvedGameName =
          pgSetting?.customName ||
          pgSetting?.name ||
          hotSetting?.name ||
          `Game #${game_uid}`;
      }
      resolvedBrandId = pgSetting?.brandId || hotSetting?.brandId || null;
      resolvedProvider = hotSetting?.providerName || null;
      resolvedCategory = pgSetting?.category || hotSetting?.category || "slots";
    }
    if (!resolvedGameName) {
      resolvedGameName = game_uid ? `Game #${game_uid}` : "Casino Game";
    }

    const roundStatus =
      win_amount > bet_amount
        ? "WIN"
        : win_amount === bet_amount && bet_amount > 0
        ? "REFUND"
        : "LOSS";

    const uniqueSerial =
      serial_number || `${user.id}_${game_uid || "game"}_${Date.now()}`;

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

      await tx.betHistory.upsert({
        where: { serialNumber: uniqueSerial },
        create: {
          serialNumber: uniqueSerial,
          userId: user.id,
          memberAccount: member_account,
          gameUid: game_uid || "unknown",
          gameName: resolvedGameName,
          provider: resolvedProvider,
          brandId: resolvedBrandId,
          category: resolvedCategory,
          gameRound: game_round || null,
          betAmount: bet_amount,
          winAmount: win_amount,
          creditAmount: new_balance,
          status: roundStatus,
          freeSpinBonus: free_spin_bonus,
        },
        update: {
          betAmount: bet_amount,
          winAmount: win_amount,
          creditAmount: new_balance,
          status: roundStatus,
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
