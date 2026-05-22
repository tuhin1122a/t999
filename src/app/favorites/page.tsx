"use client";

import AppHeader from "@/components/AppHeader";
import { GameCardWithProvider } from "@/components/GameCards";
import GameLoader from "@/components/loader/GameLoader";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import { LocalArrayStorage } from "@/lib/favorites";
import { useGames } from "@/lib/store.zustond";

const storage = LocalArrayStorage<string>();

const Roulette = () => {
  const { getFavoriesGames } = useGames((state) => state);

  const gamesId = storage.getAll("favorites-games") || [];
  const gamesList = getFavoriesGames(gamesId) || [];

  const hasGames = gamesList.length > 0;

  return (
    <SideNavLayout>
      <TabLayout>
        <AppHeader title="Roulette" />

        {/* 🔥 FORCE FIX WRAPPER */}
        <div className="block w-full">

          <main className="py-5 px-2 bg-[#003e3e] min-h-[100dvh] pb-[140px]">

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4">

              {hasGames ? (
                gamesList.map((game, i) => (
                  <GameCardWithProvider
                    game={game}
                    key={game.id || i}
                    index={i}
                  />
                ))
              ) : (
                <GameLoader length={20} loading={true} />
              )}

            </div>

            {!hasGames && (
              <span className="block text-center text-lg font-semibold text-[#23FFC8] mt-5">
                Not Found
              </span>
            )}

          </main>

        </div>

      </TabLayout>
    </SideNavLayout>
  );
};

export default Roulette;