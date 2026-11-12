import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";

const SOFTAPI_TOKEN =
  process.env.SOFTAPI_TOKEN || "cebcb5eeb92bd5f68e6c8dd772827e11";
const SOFTAPI_BASE_URL = (
  process.env.SOFTAPI_SERVER_URL || "https://world-casino-api.com/api/v1"
).replace(/\/+$/, "");

const PROVIDERS_CACHE_FILE = path.join(
  process.cwd(),
  "data",
  "softapi-providers-cache.json"
);

const CACHE_TTL_MS = 10 * 60 * 1000;

interface T999CatalogCache {
  liveProviders: { fetchedAt: number; data: LiveSoftProvider[] } | null;
  liveBrandGames: Map<string, { fetchedAt: number; data: Record<string, unknown>[] }>;
}

const globalForCatalog = globalThis as unknown as {
  __t999GameCatalogCache?: T999CatalogCache;
};

if (!globalForCatalog.__t999GameCatalogCache) {
  globalForCatalog.__t999GameCatalogCache = {
    liveProviders: null,
    liveBrandGames: new Map(),
  };
}

const catalogCache = globalForCatalog.__t999GameCatalogCache;

export interface LiveSoftProvider {
  brand_id: number;
  name: string;
  logo?: string;
  game_count?: number;
  currency_supported?: boolean;
}

export interface MergedPublicProvider {
  brand_id: string;
  brand_title: string;
  logo: string;
  category: string;
  categories: string[];
  sortOrder: number;
  game_count: number;
  currency_supported: boolean;
}

const LIVE_BRANDS = new Set([
  "55", "56", "58", "59", "60", "78", "88", "89", "114", "117", "121", "130", "132", "135",
]);
const SPORT_BRANDS = new Set([
  "46", "48", "83", "85", "94", "95", "118", "126", "141", "142",
]);
const FISHING_HYBRID_BRANDS = new Set([
  "49", "50", "51", "52", "84", "91", "99", "133",
]);
const ARCADE_BRANDS = new Set([
  "57", "100", "101", "104", "107", "111", "113", "139",
]);
const HYBRID_SLOTS_LIVE_BRANDS = new Set(["53", "54"]);

export function inferProviderCategories(
  brandId: string,
  name: string
): { category: string; categories: string[] } {
  const id = String(brandId).trim();
  const lower = (name || "").toLowerCase();

  if (
    SPORT_BRANDS.has(id) ||
    lower.includes("sport") ||
    lower.includes("wicket") ||
    lower.includes("bti") ||
    lower.includes("saba")
  ) {
    return { category: "sport", categories: ["sport"] };
  }
  if (
    LIVE_BRANDS.has(id) ||
    lower.includes("live") ||
    lower.includes("evolution") ||
    lower.includes("ezugi") ||
    lower.includes("dreamgaming") ||
    lower.includes("yeebet") ||
    lower.includes("sexy") ||
    lower.includes("wm casino")
  ) {
    return { category: "live_dealers", categories: ["live_dealers"] };
  }
  if (HYBRID_SLOTS_LIVE_BRANDS.has(id)) {
    return { category: "slots", categories: ["slots", "live_dealers"] };
  }
  if (
    lower.includes("lotto") ||
    lower.includes("lottery") ||
    lower.includes("bingo") ||
    lower.includes("matka") ||
    lower.includes("keno")
  ) {
    return { category: "lottery", categories: ["lottery"] };
  }
  if (FISHING_HYBRID_BRANDS.has(id)) {
    return { category: "slots", categories: ["slots", "fishing"] };
  }
  if (
    ARCADE_BRANDS.has(id) ||
    lower.includes("spribe") ||
    lower.includes("smartsoft") ||
    lower.includes("turbo") ||
    lower.includes("inout") ||
    lower.includes("galaxsys")
  ) {
    return { category: "arcade", categories: ["arcade", "slots"] };
  }

  return { category: "slots", categories: ["slots"] };
}

async function readLocalProvidersCache(): Promise<
  Array<{ brand_id: string; brand_title: string; logo?: string }>
> {
  try {
    const raw = await fs.readFile(PROVIDERS_CACHE_FILE, "utf8");
    const json = JSON.parse(raw);
    return Array.isArray(json?.games) ? json.games : [];
  } catch {
    return [];
  }
}

export async function fetchLiveSoftProviders(
  forceRefresh = false
): Promise<LiveSoftProvider[]> {
  const now = Date.now();
  if (
    !forceRefresh &&
    catalogCache.liveProviders &&
    now - catalogCache.liveProviders.fetchedAt < CACHE_TTL_MS
  ) {
    return catalogCache.liveProviders.data;
  }

  try {
    const res = await fetch(
      `${SOFTAPI_BASE_URL}/providers?token=${encodeURIComponent(SOFTAPI_TOKEN)}`,
      {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      }
    );
    if (!res.ok) return catalogCache.liveProviders?.data || [];
    const json = await res.json();
    if (Number(json?.code) === 0 && Array.isArray(json?.data?.providers)) {
      catalogCache.liveProviders = {
        fetchedAt: now,
        data: json.data.providers,
      };
      return json.data.providers;
    }
  } catch (err) {
    console.warn("[t999 catalog] Live provider fetch failed:", err);
  }
  return catalogCache.liveProviders?.data || [];
}

function resolveBestProviderLogo(
  dbLogo?: string | null,
  liveLogo?: string | null,
  cacheLogo?: string | null
): string {
  if (dbLogo && dbLogo.trim() && !dbLogo.includes("ik.imagekit.io")) {
    return dbLogo.trim();
  }
  if (liveLogo && liveLogo.trim()) {
    return liveLogo.trim();
  }
  if (cacheLogo && cacheLogo.trim()) {
    return cacheLogo.trim();
  }
  return dbLogo?.trim() || "";
}

export async function getActiveMergedProviders(
  forceRefresh = false
): Promise<MergedPublicProvider[]> {
  const [dbSettings, liveProviders, localProviders] = await Promise.all([
    db.gameProviderSetting
      .findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      })
      .catch(() => []),
    fetchLiveSoftProviders(forceRefresh),
    readLocalProvidersCache(),
  ]);

  const liveByBrand = new Map(
    liveProviders.map((lp) => [String(lp.brand_id), lp])
  );
  const localByBrand = new Map(
    localProviders.map((cp) => [String(cp.brand_id), cp])
  );

  // Case 1: Admin has configured GameProviderSetting rows in DB
  if (dbSettings.length > 0) {
    const seen = new Set<string>();
    const activeList: MergedPublicProvider[] = [];

    for (const row of dbSettings) {
      seen.add(row.brandId);
      if (!row.isActive) continue;

      const live = liveByBrand.get(row.brandId);
      const local = localByBrand.get(row.brandId);
      const inferred = inferProviderCategories(row.brandId, row.name);
      const categories =
        row.categories && row.categories.length > 0
          ? row.categories
          : [row.category || inferred.category];

      activeList.push({
        brand_id: row.brandId,
        brand_title: row.customName?.trim() || row.name,
        logo: resolveBestProviderLogo(row.logo, live?.logo, local?.logo),
        category: row.category || inferred.category,
        categories,
        sortOrder: row.sortOrder,
        game_count: live?.game_count ?? row.gameCount ?? 0,
        currency_supported:
          live?.currency_supported !== undefined
            ? Boolean(live.currency_supported)
            : row.currencySupported,
      });
    }

    // Append any newly added SoftAPI provider not yet saved to DB as active
    for (const lp of liveProviders) {
      const bId = String(lp.brand_id);
      if (seen.has(bId)) continue;
      seen.add(bId);
      const inferred = inferProviderCategories(bId, lp.name || "");
      activeList.push({
        brand_id: bId,
        brand_title: lp.name || `Provider ${bId}`,
        logo: lp.logo || localByBrand.get(bId)?.logo || "",
        category: inferred.category,
        categories: inferred.categories,
        sortOrder: Number(lp.brand_id) || 999,
        game_count: Number(lp.game_count || 0),
        currency_supported: Boolean(lp.currency_supported ?? true),
      });
    }

    return activeList.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // Case 2: No DB settings yet -> serve live providers enriched cleanly (fallback to local JSON)
  const sourceList =
    liveProviders.length > 0
      ? liveProviders.map((lp, idx) => {
          const bId = String(lp.brand_id);
          const inferred = inferProviderCategories(bId, lp.name || "");
          return {
            brand_id: bId,
            brand_title: lp.name || `Provider ${bId}`,
            logo: lp.logo || localByBrand.get(bId)?.logo || "",
            category: inferred.category,
            categories: inferred.categories,
            sortOrder: Number(lp.brand_id) || idx,
            game_count: Number(lp.game_count || 0),
            currency_supported: Boolean(lp.currency_supported ?? true),
          };
        })
      : localProviders.map((cp, idx) => {
          const bId = String(cp.brand_id);
          const inferred = inferProviderCategories(bId, cp.brand_title || "");
          return {
            brand_id: bId,
            brand_title: cp.brand_title,
            logo: cp.logo || "",
            category: inferred.category,
            categories: inferred.categories,
            sortOrder: Number(bId) || idx,
            game_count: 0,
            currency_supported: true,
          };
        });

  return sourceList.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBrandProviderSetting(brandId: string) {
  try {
    return await db.gameProviderSetting.findUnique({
      where: { brandId: String(brandId) },
    });
  } catch {
    return null;
  }
}

export async function fetchLiveSoftGamesForBrand(
  brandId: string,
  forceRefresh = false
): Promise<Record<string, unknown>[]> {
  const bId = String(brandId).trim();
  const now = Date.now();
  const cached = catalogCache.liveBrandGames.get(bId);
  if (!forceRefresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const query = new URLSearchParams({
      token: SOFTAPI_TOKEN,
      brand_id: bId,
      limit: "500",
      offset: "0",
    });
    const res = await fetch(`${SOFTAPI_BASE_URL}/games?${query.toString()}`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return cached?.data || [];
    const json = await res.json();
    if (Number(json?.code) === 0 && Array.isArray(json?.data?.games)) {
      catalogCache.liveBrandGames.set(bId, {
        fetchedAt: now,
        data: json.data.games,
      });
      return json.data.games;
    }
  } catch (err) {
    console.warn(`[t999 catalog] Live games fetch failed for brand=${bId}:`, err);
  }
  return cached?.data || [];
}

export async function getCuratedHotGames() {
  const [hotRows, disabledProviders] = await Promise.all([
    db.hotGame
      .findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      })
      .catch(() => []),
    db.gameProviderSetting
      .findMany({
        where: { isActive: false },
        select: { brandId: true },
      })
      .catch(() => []),
  ]);

  const disabledSet = new Set(disabledProviders.map((d) => d.brandId));

  return hotRows
    .filter((row) => !row.brandId || !disabledSet.has(row.brandId))
    .map((row) => {
      const fallbackImg = `https://igamingapis.com/img/${row.gameUid}.png`;
      const imgUrl = row.img && row.img.trim() ? row.img.trim() : fallbackImg;
      return {
        id: row.gameUid,
        game_code: row.gameUid,
        name: row.name,
        game_name: row.name,
        img: imgUrl,
        game_img: imgUrl,
        device: "mobile,desktop",
        title: `softapi_${row.brandId}`,
        provider_name: row.providerName || "",
        categories: row.category || "slots",
        bm: "0",
        demo: "1",
        rewriterule: "0",
        exitButton: "1",
        brand_id: row.brandId,
      };
    });
}

