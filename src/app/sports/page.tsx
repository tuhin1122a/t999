"use client";
import AppHeader from "@/components/AppHeader";
import { useEffect, useRef, useState } from "react";

import PrimaryInput from "@/components/form/input";
import { GameCardWithProvider } from "@/components/GameCards";
import GameLoader from "@/components/loader/GameLoader";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import { useGames } from "@/lib/store.zustond";
import { Categories } from "@/types/game";
import FilterProivder from "@/components/FilterProvider";
import Link from "next/link";
import { MdFavorite } from "react-icons/md";
import { ClipLoader } from "react-spinners";

const Sports = () => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState<string>();
  const [provider, setProvider] = useState<string>("all");
  const [limit, setLimit] = useState(30);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const loadedProvidersRef = useRef<Set<string>>(new Set());
  const pendingProvidersRef = useRef<Set<string>>(new Set());

  const { getGames, setProviderGames, setProviderLoading } = useGames((state) => state);
  const gamesList = getGames(Categories.Sport, search, limit, provider);

  const hasIntersectedOnce = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && !hasIntersectedOnce.current) {
          setLimit((limit) => limit + 9);
          hasIntersectedOnce.current = true;
        }

        // Reset the flag when the loader goes out of view
        if (!entry.isIntersecting) {
          hasIntersectedOnce.current = false;
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, []);

  const handleProviderChange = async (providerId: string) => {
    if (providerId === provider) {
      return;
    }

    setIsFilterLoading(true);
    setProvider(providerId);

    if (providerId === "all") {
      setIsFilterLoading(false);
      return;
    }

    if (loadedProvidersRef.current.has(providerId)) {
      setIsFilterLoading(false);
      return;
    }

    if (pendingProvidersRef.current.has(providerId)) {
      setIsFilterLoading(false);
      return;
    }

    const state = useGames.getState();
    if (state.providerGames[providerId] !== undefined) {
      loadedProvidersRef.current.add(providerId);
      setIsFilterLoading(false);
      return;
    }

    pendingProvidersRef.current.add(providerId);

    try {
      setProviderLoading(true);
      console.log(`Fetching provider ${providerId} from local SoftAPI cache`);
      const res = await fetch(`/api/softapi/games?brand_id=${providerId}`);
      if (!res.ok) throw new Error("SoftAPI response not OK");
      const response = await res.json();

      if (response.success && Array.isArray(response.games)) {
        setProviderGames(providerId, response.games);
        loadedProvidersRef.current.add(providerId);
      } else {
        setProviderGames(providerId, []);
      }
    } catch (error) {
      console.error("Error fetching games by provider from SoftAPI:", error);
      setProviderGames(providerId, []);
    } finally {
      pendingProvidersRef.current.delete(providerId);
      setProviderLoading(false);
      setIsFilterLoading(false);
    }
  };

  return (
    <SideNavLayout>
      <TabLayout>
        <div>
          <AppHeader title="Sports" />
          <main className="py-5 px-2 bg-[#003e3e] pb-24 md:pb-5 min-h-screen">
            <FilterProivder onSelect={handleProviderChange} category="sport" />
            <div className="flex items-center gap-2">
              <PrimaryInput
                placeholder="Search Games"
                className="mb-2"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <Link
                href="/favorites"
                title="favorites"
                className="bg-wwwwwwck-44-4comdaintree -mt-2 rounded-[10.4px] overflow-hidden border border-solid border-[#006165] shadow-[0px_2.08px_0px_#002631] p-3"
              >
                <MdFavorite className="w-5 h-5 text-[#23ffc8]" />
              </Link>
            </div>

            {isFilterLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-2">
                <GameLoader length={15} loading={true} />
              </div>
            ) : (
              <>
                <div key={provider} className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-2 provider-list-appear">
                  {gamesList &&
                    gamesList.map((game, i) => (
                      <GameCardWithProvider game={game} index={i} key={game.id || i} />
                    ))}

                  {(!gamesList || (gamesList.length === 0 && useGames((state) => state.isLoading))) && <GameLoader length={15} loading={true} />}
                </div>

                <div
                  ref={loaderRef}
                  className="my-5 flex items-center justify-center"
                >
                  {gamesList && gamesList.length >= limit - 1 && (
                    <ClipLoader color="#FFB800" size={25} />
                  )}
                </div>

                {gamesList && gamesList.length === 0 && !useGames((state) => state.isLoading) && (
                  <span className="block text-center text-lg font-semibold text-[#23FFC8] mt-5">
                    Not Found
                  </span>
                )}
              </>
            )}
          </main>
        </div>
      </TabLayout>
    </SideNavLayout>
  );
};

export default Sports;

