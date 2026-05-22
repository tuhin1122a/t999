"use client";
import AppHeader from "@/components/AppHeader";
import { useState } from "react";

import PrimaryInput from "@/components/form/input";
import { GameCardWithProvider } from "@/components/GameCards";
import GameLoader from "@/components/loader/GameLoader";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import { useGames } from "@/lib/store.zustond";

const HotGamesPage = () => {
  const [search, setSearch] = useState("");
  const { getCustomeCategoriesGames } = useGames((state) => state);
  const gamesList = getCustomeCategoriesGames("hot", search)?.slice(0, 30) ?? null;
  return (
    <SideNavLayout>
      <TabLayout>
        <AppHeader title="Hot Games" />
        <main className="py-5 px-2 bg-[#003e3e] min-h-screen">
          <div className="flex items-center">
            <PrimaryInput
              placeholder="Search Games"
              className="mb-2"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4">
            {gamesList &&
              gamesList.map((game, i) => (
                <GameCardWithProvider game={game} key={i} />
              ))}

            <GameLoader length={30} loading={!!!gamesList} />
          </div>
          {gamesList && gamesList.length == 0 && (
            <p className="block text-center w-full uppercase text-lg font-semibold text-[#23FFC8]">
              Not Found
            </p>
          )}
        </main>
      </TabLayout>
    </SideNavLayout>
  );
};

export default HotGamesPage;
