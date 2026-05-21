// src/app/api/softapi/games/route.ts
// Fetches games for a specific brand from igamingapis.com
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const IGAMING_PRIMARY = "https://igamingapis.com/provider/brands.php";
const IGAMING_FALLBACK = "https://igamingapis.live/provider/brands.php";
const SOFTAPI_CACHE_DIR = path.join(process.cwd(), "data", "softapi-brand-cache");
const SERVED_LOCAL_CACHE_LOGGED = new Set<string>();

async function ensureCacheDir() {
  try {
    await fs.mkdir(SOFTAPI_CACHE_DIR, { recursive: true });
  } catch (err) {
    console.warn("[SoftAPI] Failed to ensure cache directory:", err);
  }
}

async function getCacheFilePath(brandId: string) {
  await ensureCacheDir();
  return path.join(SOFTAPI_CACHE_DIR, `${brandId}.json`);
}

async function readLocalCache(brandId: string) {
  try {
    const cachePath = await getCacheFilePath(brandId);
    const json = await fs.readFile(cachePath, "utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function writeLocalCache(brandId: string, payload: any) {
  try {
    const cachePath = await getCacheFilePath(brandId);
    await fs.writeFile(cachePath, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.warn(`[SoftAPI] Failed to write local cache for brand_id=${brandId}:`, err);
  }
}

// Map igamingapis category → our app category
function mapCategory(cat: string): string {
  const c = cat?.toLowerCase() || "";
  if (c.includes("slot") || c === "flash" || c === "video slot") return "slots";
  if (c.includes("live") || c.includes("casino") || c.includes("baccarat") || c.includes("roulette")) return "live_dealers";
  if (c.includes("fish") || c.includes("shoot")) return "fishing";
  if (c.includes("sport")) return "sport";
  if (c.includes("poker") || c.includes("table") || c.includes("card")) return "live_dealers";
  if (c.includes("lottery") || c.includes("keno") || c.includes("bingo")) return "lottery";
  if (c.includes("mini") || c.includes("crash") || c.includes("instant")) return "slots";
  return "slots";
}

// Map SoftAPI brand_id to our app provider title
function mapBrandToTitle(brandId: string): string {
  const mapping: Record<string, string> = {
    "49": "jili_gaming",
    "45": "pgsoft_slot",
    "58": "evolution",
    "67": "spribe",
    "51": "tada_gaming",
    "53": "pragmatic_live_asia",
    "54": "pragmatic_live_asia",
    "52": "cq9_slot",
    "65": "bgaming",
    "70": "hacksaw",
    "69": "habanero",
    "71": "smartsoft",
  };
  return mapping[brandId] || `softapi_${brandId}`;
}

function parseGames(data: any, brand_id: string, category: string) {
  const rawGames = data.games || data.data || [];
  const providerTitle = mapBrandToTitle(brand_id);
  let games = rawGames.map((g: any) => ({
    id: g.game_code || g.gameID || g.game_id,
    name: g.game_name || g.gameNameEn || g.name,
    img: g.game_img || g.img || g.image,
    device: "mobile,desktop",
    title: providerTitle,
    categories: mapCategory(g.category || g.game_type || ""),
    bm: "0",
    demo: "1",
    rewriterule: "0",
    exitButton: "1",
    brand_id: brand_id,
    raw_category: g.category,
  }));

  if (category && category !== "all") {
    games = games.filter((g: any) => g.categories === category);
  }

  return { games, providerTitle };
}

function isCloudflareChallenge(text: string): boolean {
  return (
    text.includes("Just a moment") ||
    text.includes("cf-ray") ||
    text.includes("_cf_chl_opt") ||
    text.includes("challenge-platform") ||
    text.includes("Enable JavaScript and cookies to continue")
  );
}

async function fetchWithTimeout(url: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand_id = searchParams.get("brand_id");
    const category = searchParams.get("category") || "";

    if (!brand_id) {
      return NextResponse.json(
        { success: false, error: "brand_id is required" },
        { status: 400 }
      );
    }

    const cachedSoftApiPayload = await readLocalCache(brand_id);
    if (cachedSoftApiPayload) {
      if (!SERVED_LOCAL_CACHE_LOGGED.has(brand_id)) {
        console.log(`[SoftAPI] Serving local cache for brand_id=${brand_id}`);
        SERVED_LOCAL_CACHE_LOGGED.add(brand_id);
      }
      if (category && category !== "all") {
        const filteredGames = cachedSoftApiPayload.games.filter(
          (g: any) => g.categories === category
        );
        return NextResponse.json(
          {
            ...cachedSoftApiPayload,
            total_games: filteredGames.length,
            games: filteredGames,
          },
          {
            status: 200,
            headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
          }
        );
      }

      return NextResponse.json(cachedSoftApiPayload, {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
      });
    }

    console.warn(`[SoftAPI] Local cache not found for brand_id=${brand_id}. Returning empty games.`);
    return NextResponse.json({
      success: false,
      brand_id,
      provider_title: mapBrandToTitle(brand_id),
      total_games: 0,
      games: [],
      warning: "Local cache not found for brand_id",
    }, {
      status: 404,
    });

  } catch (error: any) {
    console.error("[SoftAPI] Games Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
