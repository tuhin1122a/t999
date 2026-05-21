import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {

    console.log("========== SOFTAPI CALLBACK START ==========");

    // Raw body text
    const rawBody = await request.text();

    console.log("RAW BODY:");
    console.log(rawBody);

    // Try to parse incoming body. SoftAPI may send an encrypted `payload` field.
    let parsedIncoming: any = null;
    try {
      parsedIncoming = JSON.parse(rawBody);
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return NextResponse.json({ credit_amount: -1, error: "Invalid JSON body" }, { status: 400 });
    }

    console.log("PARSED INCOMING:");
    console.log(JSON.stringify(parsedIncoming, null, 2));

    // Headers
    console.log("HEADERS:");
    console.log(Object.fromEntries(request.headers.entries()));

    console.log("============================================");

    // Helper to decrypt AES-256-ECB base64 payload
    function decryptPayloadECB(payloadBase64: string, key: string) {
      if (!key || key.length !== 32) throw new Error("SOFTAPI_SECRET must be 32 characters long");
      const encrypted = Buffer.from(payloadBase64, "base64");
      const decipher = crypto.createDecipheriv("aes-256-ecb", Buffer.from(key, "utf8"), null);
      decipher.setAutoPadding(true);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
      return JSON.parse(decrypted);
    }

    // Determine actual payload object (decrypted if necessary)
    let data: any = null;
    if (parsedIncoming && typeof parsedIncoming.payload === "string") {
      const secret = process.env.SOFTAPI_SECRET || "";
      try {
        data = decryptPayloadECB(parsedIncoming.payload, secret);
        console.log("Decrypted payload:", JSON.stringify(data, null, 2));
      } catch (err: any) {
        console.error("Failed to decrypt payload:", err?.message || err);
        return NextResponse.json({ credit_amount: -1, error: "Invalid encrypted payload" }, { status: 400 });
      }
    } else {
      data = parsedIncoming;
    }

    const game_uid = data.game_uid || "";
    const game_round = data.game_round || "";
    const member_account = data.member_account || "";
    const bet_amount = parseFloat(data.bet_amount || "0");
    const win_amount = parseFloat(data.win_amount || "0");

    if (!member_account) {
      return NextResponse.json(
        { credit_amount: -1, error: "Invalid user account" },
        { status: 400 }
      );
    }

    // Try multiple phone formats to match stored user phone (leading zero, country code, etc.)
    const normalized = (s: string) => (s || "").toString().replace(/[^0-9+]/g, "");
    const raw = normalized(member_account);
    const withoutLeadingZeros = raw.replace(/^0+/, "");
    const phoneCandidates = Array.from(new Set([
      raw,
      withoutLeadingZeros,
      withoutLeadingZeros ? `0${withoutLeadingZeros}` : raw,
      withoutLeadingZeros ? `88${withoutLeadingZeros}` : raw,
      withoutLeadingZeros ? `+88${withoutLeadingZeros}` : raw,
    ].filter(Boolean)));

    console.log("Phone candidates to match user:", phoneCandidates);

    const orConditions: any[] = [
      ...phoneCandidates.map((p) => ({ phone: p })),
      { id: member_account },
      { playerId: member_account },
    ];

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      include: { wallet: true, bettingRecord: true },
    });

    if (!user || !user.wallet) {
      console.error("User not found:", member_account);

      return NextResponse.json(
        { credit_amount: -1, error: "User not found" },
        { status: 404 }
      );
    }

    const current_balance = Number(user.wallet.balance);

    console.log("CURRENT BALANCE:", current_balance);
    console.log("BET AMOUNT:", bet_amount);
    console.log("WIN AMOUNT:", win_amount);

    const new_balance =
      current_balance - bet_amount + win_amount;

    console.log("NEW BALANCE:", new_balance);

    await prisma.$transaction(async (tx) => {

      console.log("Updating wallet...");

      await tx.wallet.update({
        where: {
          id: user.wallet.id
        },
        data: {
          balance: new_balance
        }
      });

      if (user.bettingRecord) {

        console.log("Updating betting record...");

        await tx.bettingRecord.update({
          where: {
            id: user.bettingRecord.id
          },
          data: {
            totalBet:
              Number(user.bettingRecord.totalBet) + bet_amount,

            totalWin:
              Number(user.bettingRecord.totalWin) + win_amount
          }
        });
      }
    });

    console.log("BALANCE UPDATED SUCCESSFULLY");

    return NextResponse.json({
      credit_amount: new_balance,
      timestamp: Math.round(Date.now())
    });

  } catch (error: any) {

    console.error("SOFTAPI CALLBACK ERROR:");
    console.error(error);

    return NextResponse.json(
      {
        credit_amount: -1,
        error: error.message || "Unexpected error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log("🎯 CALLBACK GET REQUEST RECEIVED at:", new Date().toISOString());
  console.log("GET endpoint is active and working");
  return NextResponse.json({
    success: true,
    message: "Callback endpoint active",
    timestamp: new Date().toISOString()
  });
}