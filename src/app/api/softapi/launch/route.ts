import { auth } from "@/auth";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SOFTAPI_TOKEN = process.env.SOFTAPI_TOKEN || "cebcb5eeb92bd5f68e6c8dd772827e11";
const SOFTAPI_SECRET = process.env.SOFTAPI_SECRET || "12345678901234567890123456789012"; // User needs to provide 32-char secret
const SOFTAPI_SERVER_URL = process.env.SOFTAPI_SERVER_URL || "https://igamingapis.live/api/v1";
const SOFTAPI_FALLBACK_URL = process.env.SOFTAPI_FALLBACK_URL || "";

// ==================== Types ====================
type SessionUser = {
  id: string;
  phone: string;
  name: string;
  playerId: string;
  wallet?: {
    balance: number;
    currency: string;
  };
};

function encryptPayloadECB(data: Record<string, unknown>, key: string): string {
    if (key.length !== 32) throw new Error("Key must be 32 bytes long");
    const json = JSON.stringify(data);
    const cipher = crypto.createCipheriv("aes-256-ecb", Buffer.from(key, 'utf8'), null);
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    return encrypted.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const session = (await auth()) as { user?: SessionUser };
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    type LaunchRequestBody = { gameId: string };
    let body: LaunchRequestBody;
    try {
      body = await request.json();
    } catch (jsonError: unknown) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { gameId } = body;
    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    // SoftAPI strictly requires a purely numeric user_id (no letters, spaces or special characters).
    // We use the user's unique phone number. If not available, we extract all digits from their CUID.
    const playerId = session.user.phone || session.user.id.replace(/\D/g, "");
    const balance = session.user.wallet?.balance ?? 0;
    let appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || "https://payment.betbeng.site";
    if (appUrl.includes("localhost")) {
      appUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://payment.betbeng.site";
    }

    const payload = {
        user_id: playerId,
        balance: balance,
        game_uid: gameId,
        token: SOFTAPI_TOKEN,
        timestamp: Date.now(),
        return: `${appUrl}/games`, // Where user returns
        callback: `${appUrl}/api/softapi/callback`, // Game result callback
        currency_code: session.user.wallet?.currency || "BDT",
        language: "en",
    };

    console.log("Launching SoftAPI game with payload:", { ...payload, token: "HIDDEN" });

    let encryptedPayload: string;
    try {
        encryptedPayload = encryptPayloadECB(payload, SOFTAPI_SECRET);
    } catch (e: unknown) {
        console.error("Encryption error:", e);
        return NextResponse.json({ error: "Internal Configuration Error (Encryption failed)" }, { status: 500 });
    }

    const tryUrls = [SOFTAPI_SERVER_URL];
    if (SOFTAPI_FALLBACK_URL && SOFTAPI_FALLBACK_URL !== SOFTAPI_SERVER_URL) {
      tryUrls.push(SOFTAPI_FALLBACK_URL);
    }
    let softData: unknown = null;
    let softStatus = 502;
    let htmlBody: string | null = null;

    for (const baseUrl of tryUrls) {
      const launchEndpoint = `${baseUrl}?payload=${encodeURIComponent(encryptedPayload)}&token=${encodeURIComponent(SOFTAPI_TOKEN)}`;
      console.log("Sending SoftAPI launch request to:", launchEndpoint);

      const res = await fetch(launchEndpoint, {
        method: "GET",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const text = await res.text();
      softStatus = res.status;

      if (!res.ok) {
        console.warn(`SoftAPI launch HTTP ${res.status} from ${baseUrl}`);
        htmlBody = text;
        continue;
      }

      if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) {
        console.warn(`SoftAPI launch response from ${baseUrl} is not JSON; body length=${text.length}`);
        htmlBody = text;
        continue;
      }

      try {
        softData = JSON.parse(text);
      } catch {
        console.warn(`SoftAPI launch JSON parse failed from ${baseUrl}`);
        htmlBody = text;
        continue;
      }

      if (softData?.code !== 0) {
        const remoteMsg = softData?.msg || softData?.message || "SoftAPI launch failed";
        console.warn(`SoftAPI launch responded with code=${softData?.code} from ${baseUrl}: ${remoteMsg}`);
        htmlBody = text;

        if (softData?.code === 9) {
          return NextResponse.json(
            {
              success: false,
              error: `Game under maintenance: ${remoteMsg}`,
              status: 502,
              raw: text,
            },
            { status: 502 }
          );
        }

        if (softStatus === 200) softStatus = 502;
        continue;
      }

      break;
    }

    if (!softData || softData?.code !== 0) {
      const message = typeof softData === "object" && softData !== null && "message" in softData
        ? (softData as { message?: string }).message
        : null;
      return NextResponse.json(
        {
          success: false,
          error: `SoftAPI launch failed${message ? `: ${message}` : ""}`,
          status: 502,
          raw: htmlBody?.slice(0, 1000) ?? softData,
        },
        { status: 502 }
      );
    }

    const launchUrl = softData?.data?.url;
    if (!launchUrl) {
      return NextResponse.json(
        { success: false, error: "SoftAPI did not return a launch URL", raw: softData },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      game_launch_url: launchUrl,
      session_id: Date.now().toString(),
      raw: softData,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Game launch error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
