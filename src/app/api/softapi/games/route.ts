// src/app/api/softapi/games/route.ts
// Fetches games for a specific brand from igamingapis.com
import { NextRequest, NextResponse } from "next/server";

const IGAMING_PRIMARY = "https://igamingapis.com/provider/brands.php";
const IGAMING_FALLBACK = "https://igamingapis.live/provider/brands.php";

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

async function fetchWithTimeout(url: string, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 }, // cache 1 hour
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

    // Try primary URL
    let lastError: any = null;
    for (const baseUrl of [IGAMING_PRIMARY, IGAMING_FALLBACK]) {
      try {
        const res = await fetchWithTimeout(`${baseUrl}?brand_id=${brand_id}`, 10000);

        if (!res.ok) {
          lastError = new Error(`HTTP ${res.status} from ${baseUrl}`);
          continue;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("json")) {
          lastError = new Error(`Non-JSON from ${baseUrl}: ${contentType}`);
          continue;
        }

        const data = await res.json();
        const { games, providerTitle } = parseGames(data, brand_id, category);

        return NextResponse.json({
          success: true,
          brand_id,
          provider_title: providerTitle,
          total_games: games.length,
          games,
        }, {
          status: 200,
          headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
        });

      } catch (err) {
        lastError = err;
        console.error(`Fetch failed from ${baseUrl} for brand ${brand_id}:`, err);
      }
    }

    // Both URLs failed
    const errMsg = lastError instanceof Error ? lastError.message : String(lastError);
    return NextResponse.json(
      { success: false, error: "Failed to fetch games from all providers", details: errMsg },
      { status: 502 }
    );

  } catch (error: any) {
    console.error("SoftAPI Games Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
