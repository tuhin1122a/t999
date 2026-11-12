"use client";
import AppHeader from "@/components/AppHeader";
import { useEffect, useMemo, useState } from "react";

import PrimaryInput from "@/components/form/input";
import { GameCardWithProvider } from "@/components/GameCards";
import GameLoader from "@/components/loader/GameLoader";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import { NetEnt } from "@/types/game";

const HotGamesPage = () => {
  const [search, setSearch] = useState("");
  const [hotGames, setHotGames] = useState<NetEnt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadHotGames() {
      try {
        setLoading(true);
        const res = await fetch("/api/games/hot", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.success && Array.isArray(data.games)) {
          setHotGames(data.games);
        }
      } catch (err) {
        console.error("Failed to load hot games:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHotGames();
    return () => {
      active = false;
    };
  }, []);

  const gamesList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hotGames;
    return hotGames.filter((g) => {
      const extra = g as NetEnt & { provider_name?: string };
      return (
        (extra.name || "").toLowerCase().includes(q) ||
        String(extra.id || "").toLowerCase().includes(q) ||
        String(extra.provider_name || "").toLowerCase().includes(q)
      );
    });
  }, [hotGames, search]);

  return (
    <SideNavLayout>
      <TabLayout>
        <AppHeader title="Hot Games" />
        <main className="py-5 px-2 bg-[#003e3e] min-h-screen">
          <div className="flex items-center">
            <PrimaryInput
              placeholder="Search Hot Games"
              className="mb-2"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4">
            {!loading &&
              gamesList.map((game, i) => (
                <GameCardWithProvider game={game} index={i} key={game.id || i} />
              ))}

            <GameLoader length={15} loading={loading} />
          </div>
          {!loading && gamesList.length === 0 && (
            <p className="block text-center w-full uppercase text-lg font-semibold text-[#23FFC8] mt-6">
              Not Found
            </p>
          )}
        </main>
      </TabLayout>
    </SideNavLayout>
  );
};

export default HotGamesPage;
