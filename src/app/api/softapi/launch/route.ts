import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

const SOFTAPI_TOKEN = process.env.SOFTAPI_TOKEN || "cebcb5eeb92bd5f68e6c8dd772827e11";
const SOFTAPI_SECRET = process.env.SOFTAPI_SECRET || "12345678901234567890123456789012"; // User needs to provide 32-char secret
const SOFTAPI_SERVER_URL = process.env.SOFTAPI_SERVER_URL || "https://igamingapis.live/api/v1";

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

function encryptPayloadECB(data: any, key: string): string {
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

    let body: { gameId: string; demo?: "0" | "1" };
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { gameId, demo = "0" } = body;
    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    // SoftAPI strictly requires a purely numeric user_id (no letters, spaces or special characters).
    // We use the user's unique phone number. If not available, we extract all digits from their CUID.
    const playerId = session.user.phone || session.user.id.replace(/\D/g, "");
    const balance = session.user.wallet?.balance ?? 0;
    let appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (appUrl.includes("localhost")) {
      // SoftAPI strictly rejects 'localhost' inside return/callback URLs.
      // We fallback to the valid public server URL (https://payment.betbeng.site) for successful launch.
      appUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://payment.betbeng.site";
    }

    const payload = {
        user_id: playerId,
        balance: balance,
        game_uid: gameId,
        token: SOFTAPI_TOKEN,
        timestamp: Date.now(),
        return: `${appUrl}/games`, // Where user returns
        callback: `${appUrl}/api/softapi/callback` // Game result callback
    };

    console.log("Launching SoftAPI game with payload:", { ...payload, token: "HIDDEN" });

    let encryptedPayload: string;
    try {
        encryptedPayload = encryptPayloadECB(payload, SOFTAPI_SECRET);
    } catch (e: any) {
        console.error("Encryption error:", e);
        return NextResponse.json({ error: "Internal Configuration Error (Encryption failed)" }, { status: 500 });
    }

    const url = `${SOFTAPI_SERVER_URL}?payload=${encodeURIComponent(encryptedPayload)}&token=${encodeURIComponent(SOFTAPI_TOKEN)}`;
    
    const res = await fetch(url, {
        method: "GET",
    });

    const text = await res.text();
    console.log("SoftAPI Launch Raw Response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON from SoftAPI", raw: text }, { status: 502 });
    }

    if (data.code === 0 && data.data?.url) {
        // Map SoftAPI response to our app format
        return NextResponse.json({
            success: true,
            game_launch_url: data.data.url,
            session_id: Date.now().toString() // SoftAPI might not provide a session ID here, using mock
        }, { status: 200 });
    } else {
        return NextResponse.json({ 
            success: false, 
            error: data.msg || "Failed to launch game",
            originalResponse: data 
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Game launch error:", error);
    return NextResponse.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
