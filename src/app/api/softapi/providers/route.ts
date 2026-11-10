// src/app/api/softapi/providers/route.ts
// Fetches all game providers (brands) from SoftAPI (https://igamingapis.com/provider/)
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const PROVIDERS_URL = "https://igamingapis.com/provider/";
const SOFTAPI_PROVIDERS_CACHE_FILE = path.join(
  process.cwd(),
  "data",
  "softapi-providers-cache.json"
);

async function readProvidersCache() {
  try {
    const json = await fs.readFile(SOFTAPI_PROVIDERS_CACHE_FILE, "utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function writeProvidersCache(payload: unknown) {
  try {
    await fs.mkdir(path.dirname(SOFTAPI_PROVIDERS_CACHE_FILE), { recursive: true });
    await fs.writeFile(
      SOFTAPI_PROVIDERS_CACHE_FILE,
      JSON.stringify(payload, null, 2),
      "utf8"
    );
  } catch (err) {
    console.warn("[SoftAPI] Failed to write providers cache:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const refresh = new URL(req.url).searchParams.get("refresh") === "1";

    if (!refresh) {
      const cached = await readProvidersCache();
      if (cached && Array.isArray(cached.games) && cached.games.length > 0) {
        return NextResponse.json(
          {
            status: true,
            success: true,
            total: cached.total_games || cached.total || cached.games.length,
            total_games: cached.total_games || cached.games.length,
            providers: cached.games,
            games: cached.games,
          },
          { status: 200 }
        );
      }
    }

    // Fetch live from SoftAPI catalog endpoint
    const res = await fetch(PROVIDERS_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.status && Array.isArray(data.games)) {
        await writeProvidersCache(data);
        return NextResponse.json(
          {
            status: true,
            success: true,
            total: data.total_games || data.games.length,
            total_games: data.total_games || data.games.length,
            providers: data.games,
            games: data.games,
          },
          { status: 200 }
        );
      }
    }

    // Fallback to cache if live request failed
    const fallbackCached = await readProvidersCache();
    if (fallbackCached && Array.isArray(fallbackCached.games)) {
      return NextResponse.json(
        {
          status: true,
          success: true,
          total: fallbackCached.total_games || fallbackCached.games.length,
          total_games: fallbackCached.total_games || fallbackCached.games.length,
          providers: fallbackCached.games,
          games: fallbackCached.games,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { status: false, success: false, error: "Provider list failed", providers: [], games: [] },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("[SoftAPI] Providers Error:", error);
    return NextResponse.json(
      { status: false, success: false, error: error.message || "Unexpected error", providers: [], games: [] },
      { status: 500 }
    );
  }
}
