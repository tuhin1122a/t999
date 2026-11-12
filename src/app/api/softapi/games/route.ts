// src/app/api/softapi/games/route.ts
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import {
  fetchLiveSoftGamesForBrand,
  getBrandProviderSetting,
} from "@/lib/gameCatalog";

export const dynamic = "force-dynamic";

const IGAMING_BRANDS_URLS = [
  "https://igamingapis.com/provider/brands/",
  "https://igamingapis.com/provider/brands.php",
  "https://igamingapis.live/provider/brands/",
  "https://igamingapis.live/provider/brands.php",
];
const SOFTAPI_CACHE_DIR = path.join(
  process.cwd(),
  "data",
  "softapi-brand-cache"
);

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
    console.warn(
      `[SoftAPI] Failed to write local cache for brand_id=${brandId}:`,
      err
    );
  }
}

function mapCategory(rawCat: string, adminCategory?: string | null): string {
  const c = (rawCat || "").toLowerCase().trim();
  if (
    c.includes("live") ||
    c.includes("casino") ||
    c.includes("baccarat") ||
    c.includes("roulette")
  ) {
    return "live_dealers";
  }
  if (c.includes("fish") || c.includes("shoot")) return "fishing";
  if (c.includes("sport")) return "sport";
  if (c.includes("poker") || c.includes("table") || c.includes("card")) {
    return adminCategory === "card" ? "card" : "live_dealers";
  }
  if (c.includes("lottery") || c.includes("keno") || c.includes("bingo")) {
    return "lottery";
  }
  if (c === "arcade") return "arcade";
  if (
    (c === "" || c === "flash" || c === "mini" || c === "crash" || c === "instant") &&
    adminCategory &&
    ["arcade", "lottery", "sport", "live_dealers", "fishing"].includes(adminCategory)
  ) {
    return adminCategory;
  }
  if (c.includes("slot") || c === "flash" || c === "video slot") return "slots";
  if (adminCategory) return adminCategory;
  return "slots";
}

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

function normalizeGames(
  rawGames: Record<string, unknown>[],
  brand_id: string,
  adminCategory?: string | null
) {
  const providerTitle = mapBrandToTitle(brand_id);
  const games = rawGames.map((g) => {
    const gameCode = String(
      g.game_uid || g.game_code || g.gameID || g.game_id || g.id || ""
    );
    const gameName = String(
      g.game_name || g.gameNameEn || g.name || "Unknown Game"
    );
    const gameImg = String(
      g.game_img ||
        g.img ||
        g.logo ||
        g.image ||
        (gameCode ? `https://igamingapis.com/img/${gameCode}.png` : "")
    );
    const rawCat = String(g.raw_category || g.category || g.game_type || "");
    const existingCats = typeof g.categories === "string" ? g.categories : "";
    const mappedCat = g.raw_category
      ? mapCategory(String(g.raw_category), adminCategory)
      : existingCats && !["flash", "mini"].includes(existingCats)
      ? existingCats
      : mapCategory(rawCat, adminCategory);

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
      category: rawCat || mappedCat,
      bm: "0",
      demo: "1",
      rewriterule: "0",
      exitButton: "1",
      brand_id: String(brand_id),
      raw_category: rawCat || mappedCat,
    };
  });

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
      },
      cache: "no-store",
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
    const brand_id =
      searchParams.get("brand_id") || searchParams.get("provider");
    const category = searchParams.get("category") || "";
    const refresh = searchParams.get("refresh") === "1";

    if (!brand_id) {
      return NextResponse.json(
        { status: false, success: false, error: "brand_id is required" },
        { status: 400 }
      );
    }

    // Check Admin's GameProviderSetting active flag first
    const providerSetting = await getBrandProviderSetting(brand_id);
    if (providerSetting && providerSetting.isActive === false) {
      return NextResponse.json(
        {
          status: true,
          success: true,
          disabled: true,
          brand_id,
          provider_title: mapBrandToTitle(brand_id),
          total_games: 0,
          games: [],
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const adminCategory = providerSetting?.category || null;

    if (!refresh) {
      const cachedSoftApiPayload = await readLocalCache(brand_id);
      if (
        cachedSoftApiPayload &&
        Array.isArray(cachedSoftApiPayload.games) &&
        cachedSoftApiPayload.games.length > 0
      ) {
        const { games: normalized } = normalizeGames(
          cachedSoftApiPayload.games,
          brand_id,
          adminCategory
        );
        const finalGames =
          category && category !== "all"
            ? normalized.filter((g) => g.categories === category)
            : normalized;

        return NextResponse.json(
          {
            ...cachedSoftApiPayload,
            status: true,
            success: true,
            total_games: finalGames.length,
            games: finalGames,
          },
          {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          }
        );
      }
    }

    // Try live SoftAPI v1 (/api/v1/games) first so new providers always work
    const liveSoftGames = await fetchLiveSoftGamesForBrand(brand_id, refresh);
    if (liveSoftGames.length > 0) {
      const { games: allBrandGames, providerTitle } = normalizeGames(
        liveSoftGames,
        brand_id,
        adminCategory
      );
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
          ? allBrandGames.filter((g) => g.categories === category)
          : allBrandGames;

      return NextResponse.json(
        {
          ...payloadToCache,
          total_games: finalGames.length,
          games: finalGames,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Legacy fallback: https://igamingapis.com/provider/brands/?brand_id=...
    for (const baseUrl of IGAMING_BRANDS_URLS) {
      try {
        const url = `${baseUrl}?brand_id=${encodeURIComponent(brand_id)}`;
        const res = await fetchWithTimeout(url, 10000);
        if (!res.ok) continue;

        const text = await res.text();
        if (!text.trim().startsWith("{")) continue;

        const data = JSON.parse(text);
        const rawList = data?.games || data?.data;
        if (data?.status && Array.isArray(rawList)) {
          const { games: allBrandGames, providerTitle } = normalizeGames(
            rawList,
            brand_id,
            adminCategory
          );
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
              ? allBrandGames.filter((g) => g.categories === category)
              : allBrandGames;

          return NextResponse.json(
            {
              ...payloadToCache,
              total_games: finalGames.length,
              games: finalGames,
            },
            {
              status: 200,
              headers: { "Cache-Control": "no-store" },
            }
          );
        }
      } catch (err) {
        console.warn(
          `[SoftAPI] Failed fetching brand_id=${brand_id} from ${baseUrl}:`,
          err
        );
      }
    }

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("[SoftAPI] Games Error:", error);
    return NextResponse.json(
      {
        status: false,
        success: false,
        error: message,
        games: [],
      },
      { status: 500 }
    );
  }
}
