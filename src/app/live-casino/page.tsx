"use client";
import AppHeader from "@/components/AppHeader";
import { useState } from "react";

import PrimaryInput from "@/components/form/input";
import { GameCardWithProvider } from "@/components/GameCards";
import GameLoader from "@/components/loader/GameLoader";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import { useGames } from "@/lib/store.zustond";
import { Categories } from "@/types/game";

const LiveCasionPage = () => {
  const [search, setSearch] = useState("");
  const { getGames } = useGames((state) => state);
  const gamesList = getGames(Categories.LiveDealers, search);
  return (
    <SideNavLayout>
      <TabLayout>
        <AppHeader title="Live Casino" />
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
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4">
            {gamesList &&
              gamesList.map((game, i) => (
                <GameCardWithProvider game={game} key={i} />
              ))}

            <GameLoader length={20} loading={!!!gamesList} />
          </div>
          {gamesList && gamesList.length == 0 && (
            <span className="block text-center text-lg font-semibold text-[#23FFC8]">
              Not Found
            </span>
          )}
        </main>
      </TabLayout>
    </SideNavLayout>
  );
};

export default LiveCasionPage;
