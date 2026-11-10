// src/app/api/softapi/launch/route.ts
// SoftAPI Game Launch Endpoint — AES-256-ECB (PKCS7 padding, Base64 output)
import { auth } from "@/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const SOFTAPI_TOKEN = process.env.SOFTAPI_TOKEN || "cebcb5eeb92bd5f68e6c8dd772827e11";
const SOFTAPI_SECRET = process.env.SOFTAPI_SECRET || "0d6e277db0020770476bb22a8a075ca5";
const SOFTAPI_SERVER_URL = process.env.SOFTAPI_SERVER_URL || "https://igamingapis.live/api/v1";
const SOFTAPI_FALLBACK_URL = process.env.SOFTAPI_FALLBACK_URL || "https://igamingapis.com/api/v1";
const JWT_SECRET = process.env.AUTH_SECRET || "rk444_secret_key_t999_app";

function encryptPayloadECB(data: Record<string, unknown>, key32: string): string {
  if (Buffer.byteLength(key32, "utf8") !== 32) {
    throw new Error("AES key (SOFTAPI_SECRET) must be 32 bytes long");
  }
  const plaintext = JSON.stringify(data);
  const cipher = crypto.createCipheriv("aes-256-ecb", Buffer.from(key32, "utf8"), null);
  cipher.setAutoPadding(true); // PKCS7 padding
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
}

function toNumericUserId(phone?: string | null, fallbackId?: string | null): number | string {
  const digits = (phone || fallbackId || "").replace(/\D/g, "");
  if (digits) {
    const asNumber = Number(digits);
    if (Number.isSafeInteger(asNumber) && asNumber > 0) {
      return asNumber;
    }
    return digits;
  }
  return 1001;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate via NextAuth session or Mobile Bearer JWT
    let userId: string | null = null;
    let sessionPhone: string | null = null;

    const session = (await auth()) as { user?: { id?: string; phone?: string } } | null;
    if (session?.user?.id) {
      userId = session.user.id;
      sessionPhone = session.user.phone || null;
    } else {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; phone?: string };
          if (decoded?.sub) {
            userId = decoded.sub;
            sessionPhone = decoded.phone || null;
          }
        } catch {
          // Invalid bearer token
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { gameId?: string; game_uid?: string; gameCode?: string; language?: string; currency_code?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    let rawGameUid = String(body.game_uid || body.gameId || body.gameCode || "").trim();
    if (!rawGameUid) {
      return NextResponse.json({ error: "Game ID (game_uid) is required" }, { status: 400 });
    }

    if (rawGameUid.includes(":::")) {
      rawGameUid = rawGameUid.split(":::")[1] || rawGameUid;
    }

    // Fetch fresh user & wallet balance from DB
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    const phoneStr = dbUser?.phone || sessionPhone || "";
    const playerUserId = toNumericUserId(phoneStr, userId);
    const balance = Number(Number(dbUser?.wallet?.balance ?? 0).toFixed(2));
    const currencyCode = body.currency_code || dbUser?.wallet?.currency || "BDT";

    let appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_SERVER_URL ||
      "https://payment.betbeng.site";
    if (appUrl.includes("localhost")) {
      appUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://payment.betbeng.site";
    }
    appUrl = appUrl.replace(/\/+$/, "");

    const envReturnUrl = process.env.SOFTAPI_RETURN_URL;
    const envCallbackUrl = process.env.SOFTAPI_CALLBACK_URL;

    const returnUrl =
      envReturnUrl && !envReturnUrl.includes("YOUR_NGROK_URL")
        ? envReturnUrl
        : `${appUrl}/games`;
    const callbackUrl =
      envCallbackUrl && !envCallbackUrl.includes("YOUR_NGROK_URL")
        ? envCallbackUrl
        : `${appUrl}/api/softapi/callback`;

    // Build plaintext payload per SoftAPI docs
    const payload = {
      user_id: playerUserId,
      balance: balance,
      game_uid: rawGameUid,
      token: SOFTAPI_TOKEN,
      timestamp: Date.now(),
      return: returnUrl,
      callback: callbackUrl,
      language: body.language || "en",
      currency_code: currencyCode,
    };

    console.log("[SoftAPI] Launching game with payload:", {
      ...payload,
      token: "HIDDEN",
    });

    let encryptedPayload: string;
    try {
      encryptedPayload = encryptPayloadECB(payload, SOFTAPI_SECRET);
    } catch (e: unknown) {
      console.error("[SoftAPI] Encryption error:", e);
      return NextResponse.json(
        { error: "Internal Configuration Error (Encryption failed)" },
        { status: 500 }
      );
    }

    const requestBody = JSON.stringify({
      token: SOFTAPI_TOKEN,
      payload: encryptedPayload,
    });

    const tryUrls = Array.from(
      new Set([SOFTAPI_SERVER_URL, SOFTAPI_FALLBACK_URL].filter(Boolean))
    );

    let softData: any = null;
    let softStatus = 502;
    let rawResponseText: string | null = null;

    for (const baseUrl of tryUrls) {
      // 1) Preferred: POST with JSON body { token, payload }
      try {
        console.log("[SoftAPI] Sending POST launch request to:", baseUrl);
        const postRes = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          body: requestBody,
        });

        const postText = await postRes.text();
        softStatus = postRes.status;
        rawResponseText = postText;

        if (postText.trim().startsWith("{")) {
          softData = JSON.parse(postText);
          if (softData?.code === 0 && softData?.data?.url) {
            break;
          }
        }
      } catch (postErr) {
        console.warn(`[SoftAPI] POST launch error on ${baseUrl}:`, postErr);
      }

      // 2) Fallback: GET with query parameters token and payload
      try {
        const getUrl = `${baseUrl}?token=${encodeURIComponent(SOFTAPI_TOKEN)}&payload=${encodeURIComponent(encryptedPayload)}`;
        console.log("[SoftAPI] Sending GET launch request to:", baseUrl);
        const getRes = await fetch(getUrl, {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        const getText = await getRes.text();
        softStatus = getRes.status;
        rawResponseText = getText;

        if (getText.trim().startsWith("{")) {
          softData = JSON.parse(getText);
          if (softData?.code === 0 && softData?.data?.url) {
            break;
          }
        }
      } catch (getErr) {
        console.warn(`[SoftAPI] GET launch error on ${baseUrl}:`, getErr);
      }

      if (softData && softData.code !== 0) {
        const remoteMsg = softData.msg || softData.message || "SoftAPI launch failed";
        console.warn(`[SoftAPI] Launch responded with code=${softData.code} from ${baseUrl}: ${remoteMsg}`);
        if (softData.code === 9) {
          return NextResponse.json(
            {
              success: false,
              code: softData.code,
              error: `Game under maintenance: ${remoteMsg}`,
              msg: remoteMsg,
              raw: softData,
            },
            { status: 502 }
          );
        }
      }
    }

    if (!softData || softData.code !== 0) {
      const remoteMsg =
        softData?.msg ||
        softData?.message ||
        "SoftAPI launch failed";
      return NextResponse.json(
        {
          success: false,
          code: softData?.code ?? 1,
          msg: remoteMsg,
          error: `SoftAPI launch failed: ${remoteMsg}`,
          status: 502,
          raw: softData ?? rawResponseText?.slice(0, 1000),
        },
        { status: 502 }
      );
    }

    const launchUrl = softData?.data?.url;
    if (!launchUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "SoftAPI did not return a launch URL",
          raw: softData,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        code: 0,
        msg: "OK",
        success: true,
        game_launch_url: launchUrl,
        data: { url: launchUrl },
        session_id: Date.now().toString(),
        raw: softData,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[SoftAPI] Game launch error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
    });
    const ipData = await ipRes.json();
    return NextResponse.json({
      success: true,
      outbound_ip: ipData.ip,
      note: "Whitelist this outbound_ip in your SoftAPI dashboard",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to detect outbound IP" },
      { status: 500 }
    );
  }
}

