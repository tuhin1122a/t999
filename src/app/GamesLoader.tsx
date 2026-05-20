/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { GameXAGamesResponse } from "@/lib/api/gamexaApi";
import { useFetchGamesListMutation } from "@/lib/features/gamesApiSlice";
import { useGames } from "@/lib/store.zustond";
import { useEffect, useState } from "react";
import { fetchAllGames, convertGameXAToAppFormat } from "@/lib/api/gamexaApi";
import { GamesList, NetEnt } from "@/types/game";
import { AppGameFormat } from "@/lib/api/gamexaApi";

const GamesLoader = () => {
  const [fetchGamesList, { data: data, isLoading, error: apiError }] = useFetchGamesListMutation();
  const [gamexaGames, setGamexaGames] = useState<GameXAGamesResponse | null>(null);
  const [gamexaLoading, setGamexaLoading] = useState(true);
  const [gamexaError, setGamexaError] = useState<Error | null>(null);
  
  const [softApiGames, setSoftApiGames] = useState<any[]>([]);
  const [softLoading, setSoftLoading] = useState(true);

  const { setLoading, setGames } = useGames((state) => state);

  // Fetch games from original API
  useEffect(() => {
    fetchGamesList({ game_type: "all" });
  }, [fetchGamesList]);

  // Fetch games from GameXA API
  useEffect(() => {
    const getGamexaGames = async () => {
      try {
        console.log("Fetching GameXA games...");
        const gamesData = await fetchAllGames();
        console.log(`GameXA games fetched successfully: ${gamesData.games?.length || 0} games`);
        setGamexaGames(gamesData);
        setGamexaError(null);
      } catch (error) {
        console.error("Error fetching GameXA games:", error);
        setGamexaError(error as Error);
      } finally {
        setGamexaLoading(false);
      }
    };

    getGamexaGames();
  }, []);

  // Fetch popular games from SoftAPI
  useEffect(() => {
    const getSoftGames = async () => {
      try {
        console.log("Fetching SoftAPI popular games...");
        const popularBrands = ["49", "45", "58", "67", "51", "53", "52", "65"]; // Jili, PGSoft, Evolution, Spribe, Tada, Pragmatic, CQ9, Bgaming
        
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

  // Combine games from all APIs
  useEffect(() => {
    if (gamexaLoading || softLoading) return;

    try {
      // Formatted GameXA games
      const formattedGamexa = gamexaGames && !gamexaError ? convertGameXAToAppFormat(gamexaGames) : [];
      
      // Combine GameXA and SoftAPI games
      const combinedList = [...softApiGames, ...formattedGamexa];
      console.log(`Total combined games to load into UI: ${combinedList.length}`);

      // Create provider categories
      const providerGames: Record<string, AppGameFormat[]> = {};
      combinedList.forEach(game => {
        const provider = game.title;
        if (!providerGames[provider]) {
          providerGames[provider] = [];
        }
        providerGames[provider].push(game);
      });

      // Group by categories
      const categoryGames: Record<string, AppGameFormat[]> = {};
      combinedList.forEach(game => {
        const category = game.categories;
        if (!categoryGames[category]) {
          categoryGames[category] = [];
        }
        categoryGames[category].push(game);
      });

      const combinedProviderAndCategoryGames = {
        ...providerGames,
        ...categoryGames
      };

      // Set games into the store
      if (data && !isLoading) {
        const finalGames: GamesList = {
          ...data.gamesList,
          ...combinedProviderAndCategoryGames
        } as GamesList;
        setGames(finalGames);
      } else {
        setGames(combinedProviderAndCategoryGames as unknown as GamesList);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error combined loading games:", error);
      setLoading(false);
    }
  }, [data, isLoading, gamexaGames, gamexaLoading, gamexaError, softApiGames, softLoading]);

  return null;
};

export default GamesLoader;
