// src/app/api/softapi/games/route.ts
// Fetches games for a specific brand from igamingapis.com
import { NextRequest, NextResponse } from "next/server";

const IGAMING_BASE = "https://igamingapis.com/provider";

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

    const res = await fetch(
      `${IGAMING_BASE}/brands.php?brand_id=${brand_id}`,
      { next: { revalidate: 3600 } } // 1 hour cache
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch games from provider" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawGames = data.games || [];

    const providerTitle = mapBrandToTitle(brand_id);

    // Convert to our app format
    let games = rawGames.map((g: any) => ({
      id: g.game_code || g.gameID,
      name: g.game_name || g.gameNameEn,
      img: g.game_img || g.img,
      device: "mobile,desktop",
      title: providerTitle,
      categories: mapCategory(g.category),
      bm: "0",
      demo: "1",
      rewriterule: "0",
      exitButton: "1",
      brand_id: brand_id,
      raw_category: g.category,
    }));

    // Filter by category if provided
    if (category && category !== "all") {
      games = games.filter((g: any) => g.categories === category);
    }

    return NextResponse.json(
      {
        success: true,
        brand_id,
        provider_title: providerTitle,
        total_games: games.length,
        games,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("SoftAPI Games Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
