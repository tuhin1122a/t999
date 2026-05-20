// src/app/api/softapi/providers/route.ts
// Fetches all game providers (brands) from igamingapis.com
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import path from "path";

const IGAMING_BASE = "https://igamingapis.com/provider";
const SOFTAPI_PROVIDERS_CACHE_FILE = path.join(process.cwd(), "data", "softapi-providers-cache.json");

async function readProvidersCache() {
  try {
    const json = await fs.readFile(SOFTAPI_PROVIDERS_CACHE_FILE, "utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function writeProvidersCache(payload: any) {
  try {
    await fs.mkdir(path.dirname(SOFTAPI_PROVIDERS_CACHE_FILE), { recursive: true });
    await fs.writeFile(SOFTAPI_PROVIDERS_CACHE_FILE, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.warn("[SoftAPI] Failed to write providers cache:", err);
  }
}

export async function GET() {
  try {
    const cached = await readProvidersCache();
    if (cached) {
      console.log("[SoftAPI] Serving local providers cache");
      return NextResponse.json(
        {
          success: true,
          total: cached.total_games || cached.total || (cached.games?.length ?? 0),
          providers: cached.games || [],
        },
        { status: 200 }
      );
    }

    console.warn("[SoftAPI] Local providers cache not found. Returning empty providers.");
    return NextResponse.json(
      { success: false, error: "Local providers cache not found", providers: [] },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("SoftAPI Providers Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
