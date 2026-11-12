"use client";
import { useFetchGamesListMutation } from "@/lib/features/gamesApiSlice";
import { useGames } from "@/lib/store.zustond";
import { GamesList } from "@/types/game";
import { useEffect, useRef, useState } from "react";

interface ActiveProviderMeta {
  brand_id: string;
  category?: string;
  categories?: string[];
}

function selectBalancedProviders(providers: ActiveProviderMeta[]): string[] {
  if (!providers || providers.length === 0) {
    return [
      "49", "45", "58", "67", "51", "53", "52", "65",
      "46", "48", "83", "85", "94", "95", "118", "126", "141", "142",
    ];
  }

  const chosen = new Set<string>();
  const quotas: Record<string, number> = {
    slots: 8,
    live_dealers: 6,
    sport: 6,
    fishing: 4,
    arcade: 3,
    lottery: 3,
  };

  for (const [cat, quota] of Object.entries(quotas)) {
    let added = 0;
    for (const p of providers) {
      if (added >= quota) break;
      const bId = String(p.brand_id);
      if (chosen.has(bId)) continue;
      const cats = Array.isArray(p.categories) ? p.categories : [p.category || ""];
      if (p.category === cat || cats.includes(cat)) {
        chosen.add(bId);
        added++;
      }
    }
  }

  for (const p of providers) {
    if (chosen.size >= 28) break;
    chosen.add(String(p.brand_id));
  }

  return Array.from(chosen);
}

const GamesLoader = () => {
  const [fetchGamesList, { data, isLoading }] = useFetchGamesListMutation();
  const [softApiGames, setSoftApiGames] = useState<unknown[]>([]);
  const [softLoading, setSoftLoading] = useState(true);
  const { setLoading, setGames } = useGames((state) => state);
  const startedRef = useRef(false);

  useEffect(() => {
    fetchGamesList({ game_type: "all" });
  }, [fetchGamesList]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const getSoftGames = async () => {
      try {
        let activeProviders: ActiveProviderMeta[] = [];
        try {
          const provRes = await fetch("/api/softapi/providers", {
            cache: "no-store",
          });
          if (provRes.ok) {
            const provJson = await provRes.json();
            activeProviders = provJson?.providers || provJson?.games || [];
          }
        } catch (err) {
          console.warn("Failed to load dynamic providers list:", err);
        }

        const brandsToLoad = selectBalancedProviders(activeProviders);

        const results = await Promise.all(
          brandsToLoad.map(async (brandId) => {
            try {
              const res = await fetch(
                `/api/softapi/games?brand_id=${encodeURIComponent(brandId)}`,
                { cache: "no-store" }
              );
              if (!res.ok) return [];
              const json = await res.json();
              return json.success && Array.isArray(json.games) ? json.games : [];
            } catch (err) {
              console.error(`Failed to fetch SoftAPI brand ${brandId}:`, err);
              return [];
            }
          })
        );

        const merged = results.flat();
        setSoftApiGames(merged);
      } catch (error) {
        console.error("Error fetching SoftAPI games:", error);
      } finally {
        setSoftLoading(false);
      }
    };

    getSoftGames();
  }, []);

  useEffect(() => {
    if (softLoading) return;

    try {
      const buildSoftApiCategories = (games: unknown[]) => {
        return games.reduce((acc: Record<string, unknown[]>, game) => {
          const gameObj = game as { categories?: string };
          const category = (gameObj?.categories || "slots").toString();
          if (!acc[category]) acc[category] = [];
          acc[category].push(game);
          return acc;
        }, {} as Record<string, unknown[]>);
      };

      if (data && !isLoading) {
        const softApiCategories = buildSoftApiCategories(softApiGames);
        const finalGames: GamesList = {
          ...data.gamesList,
          ...softApiCategories,
        } as GamesList;
        setGames(finalGames);
      } else if (softApiGames.length > 0) {
        const finalGames: GamesList = buildSoftApiCategories(
          softApiGames
        ) as GamesList;
        setGames(finalGames);
      } else {
        setGames({} as GamesList);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error setting games into state:", error);
      setLoading(false);
    }
  }, [data, isLoading, softApiGames, softLoading, setGames, setLoading]);

  return null;
};

export default GamesLoader;
