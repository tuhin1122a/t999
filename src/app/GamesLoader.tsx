"use client";
import { useFetchGamesListMutation } from "@/lib/features/gamesApiSlice";
import { useGames } from "@/lib/store.zustond";
import { GamesList } from "@/types/game";
import { useEffect, useState } from "react";

let softApiGamesFetched = false;

const GamesLoader = () => {
  const [fetchGamesList, { data, isLoading }] = useFetchGamesListMutation();
  const [softApiGames, setSoftApiGames] = useState<unknown[]>([]);
  const [softLoading, setSoftLoading] = useState(true);
  const { setLoading, setGames } = useGames((state) => state);

  useEffect(() => {
    fetchGamesList({ game_type: "all" });
  }, [fetchGamesList]);

  useEffect(() => {
    if (softApiGamesFetched) return;
    softApiGamesFetched = true;

    const getSoftGames = async () => {
      try {
        console.log("Fetching SoftAPI popular games...");
        const popularBrands = [
          "49", "45", "58", "67", "51", "53", "52", "65",
          "46", "48", "83", "85", "94", "95", "118", "126", "141", "142"
        ];

        const results = await Promise.all(
          popularBrands.map(async (brandId) => {
            try {
              const res = await fetch(`/api/softapi/games?brand_id=${brandId}`);
              if (!res.ok) return [];
              const json = await res.json();
              return json.success ? json.games : [];
            } catch (err) {
              console.error(`Failed to fetch SoftAPI brand ${brandId}:`, err);
              return [];
            }
          })
        );

        const merged = results.flat();
        console.log(`Successfully loaded ${merged.length} SoftAPI games`);
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
        const finalGames: GamesList = buildSoftApiCategories(softApiGames) as GamesList;
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
