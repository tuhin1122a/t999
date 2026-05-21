"use client";
import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";

import CategoryTabs from "@/components/CategoryTabs";
import PrimaryInput from "@/components/form/input";
import { GameCardWithProvider } from "@/components/GameCards";
import GameLoader from "@/components/loader/GameLoader";
import SideNavLayout from "@/components/SideNavLayout";
import { useGames } from "@/lib/store.zustond";
import { Categories } from "@/types/game";

const Games = () => {
  const [search, setSearch] = useState("");
  const { getGames, isLoading } = useGames((state) => state);
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const categoryToUse = activeCategory || (Categories.VideoPoker as unknown as string);
    let games = getGames(categoryToUse, search, 200);

    // If category is "all" or not set, fallback to slots if empty
    if (!activeCategory || activeCategory === "all") {
      if (!games || games.length === 0) {
        games = getGames(Categories.Slots as unknown as string, search, 200);
      }
    }

    setGamesList(games || []);
  }, [getGames, search]);

  useEffect(() => {
    // when activeCategory changes, refetch games
    if (activeCategory !== undefined) {
      const categoryToUse = activeCategory === "all" ? Categories.Slots as unknown as string : activeCategory;
      const games = getGames(categoryToUse, search, 200);
      setGamesList(games || []);
    }
  }, [activeCategory, getGames, search]);

  return (
    <SideNavLayout>
      <div>
        <AppHeader title="Games" />
        <main className="py-5 px-2 bg-[#003e3e] min-h-screen">
          <div className="flex items-center">
            <PrimaryInput
              value={search}
              type="search"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Games"
              className="mb-2"
            />
          </div>
          <CategoryTabs onChange={(c) => setActiveCategory(c)} initial={"all"} />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4">
            {gamesList &&
              gamesList.map((game,i) => (
                <GameCardWithProvider game={game} key={i} />
              ))}

            <GameLoader length={20} loading={isLoading || !gamesList} />
          </div>
          {gamesList && gamesList.length === 0 && (
            <span className="block text-center text-lg font-semibold text-[#23FFC8]">
              Not Found
            </span>
          )}
        </main>
      </div>
    </SideNavLayout>
  );
};

export default Games;
