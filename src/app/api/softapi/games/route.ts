// src/app/api/softapi/games/route.ts
// Fetches games for a specific brand from SoftAPI (https://igamingapis.com/provider/brands/?brand_id=...)
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const IGAMING_BRANDS_URLS = [
  "https://igamingapis.com/provider/brands/",
  "https://igamingapis.com/provider/brands.php",
  "https://igamingapis.live/provider/brands/",
  "https://igamingapis.live/provider/brands.php",
];
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

async function writeLocalCache(brandId: string, payload: unknown) {
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
  let games = rawGames.map((g: any) => {
    const gameCode = String(g.game_code || g.gameID || g.game_id || g.id || "");
    const gameName = g.game_name || g.gameNameEn || g.name || "Unknown Game";
    const gameImg = g.game_img || g.img || g.image || "";
    const mappedCat = g.categories || mapCategory(g.category || g.game_type || "");

    return {
      id: gameCode,
      game_code: gameCode,
      name: gameName,
      game_name: gameName,
      img: gameImg,
      game_img: gameImg,
      device: "mobile,desktop",
      title: providerTitle,
      categories: mappedCat,
      category: g.category || mappedCat,
      bm: "0",
      demo: "1",
      rewriterule: "0",
      exitButton: "1",
      brand_id: String(brand_id),
      raw_category: g.category || mappedCat,
    };
  });

  if (category && category !== "all") {
    games = games.filter((g: any) => g.categories === category);
  }

  return { games, providerTitle };
}

async function fetchWithTimeout(url: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
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
    const brand_id = searchParams.get("brand_id") || searchParams.get("provider");
    const category = searchParams.get("category") || "";
    const refresh = searchParams.get("refresh") === "1";

    if (!brand_id) {
      return NextResponse.json(
        { status: false, success: false, error: "brand_id is required" },
        { status: 400 }
      );
    }

    if (!refresh) {
      const cachedSoftApiPayload = await readLocalCache(brand_id);
      if (cachedSoftApiPayload && Array.isArray(cachedSoftApiPayload.games) && cachedSoftApiPayload.games.length > 0) {
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
              status: true,
              success: true,
              total_games: filteredGames.length,
              games: filteredGames,
            },
            {
              status: 200,
              headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
            }
          );
        }

        return NextResponse.json(
          {
            ...cachedSoftApiPayload,
            status: true,
            success: true,
          },
          {
            status: 200,
            headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
          }
        );
      }
    }

    // Live fetch from SoftAPI catalog endpoint: https://igamingapis.com/provider/brands/?brand_id=131
    for (const baseUrl of IGAMING_BRANDS_URLS) {
      try {
        const url = `${baseUrl}?brand_id=${encodeURIComponent(brand_id)}`;
        const res = await fetchWithTimeout(url, 10000);
        if (!res.ok) continue;

        const text = await res.text();
        if (!text.trim().startsWith("{")) continue;

        const data = JSON.parse(text);
        if (data?.status && Array.isArray(data.games)) {
          const { games: allBrandGames, providerTitle } = parseGames(data, brand_id, "");
          const payloadToCache = {
            status: true,
            success: true,
            brand_id,
            provider_title: providerTitle,
            total_games: allBrandGames.length,
            games: allBrandGames,
          };

          await writeLocalCache(brand_id, payloadToCache);

          const finalGames =
            category && category !== "all"
              ? allBrandGames.filter((g: any) => g.categories === category)
              : allBrandGames;

          return NextResponse.json(
            {
              ...payloadToCache,
              total_games: finalGames.length,
              games: finalGames,
            },
            {
              status: 200,
              headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
            }
          );
        }
      } catch (err) {
        console.warn(`[SoftAPI] Failed fetching brand_id=${brand_id} from ${baseUrl}:`, err);
      }
    }

    console.warn(`[SoftAPI] Could not load games for brand_id=${brand_id}. Returning empty games.`);
    return NextResponse.json(
      {
        status: false,
        success: false,
        brand_id,
        provider_title: mapBrandToTitle(brand_id),
        total_games: 0,
        games: [],
        warning: "Games not found for brand_id",
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("[SoftAPI] Games Error:", error);
    return NextResponse.json(
      { status: false, success: false, error: error.message || "Unexpected error", games: [] },
      { status: 500 }
    );
  }
}
