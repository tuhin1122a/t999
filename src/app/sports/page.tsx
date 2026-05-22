"use client";
import AppHeader from "@/components/AppHeader";
import PrimaryInput from "@/components/form/input";
import { GameCardWithProvider } from "@/components/GameCards";
import SideNavLayout from "@/components/SideNavLayout";
import TabLayout from "@/components/TabLayout";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const SPORTS_PROVIDERS = [
  { brand_id: "83", title: "LuckySport" },
  { brand_id: "141", title: "9wickets" },
];

const Sports = () => {
  const searchParams = useSearchParams();
  const providerId = searchParams.get("providerId");
  const [search, setSearch] = useState("");
  const [providerGames, setProviderGames] = useState<any[]>([]);
  const [providerTitle, setProviderTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sportsGames, setSportsGames] = useState<any[]>([]);
  const [isSportsLoading, setIsSportsLoading] = useState(false);
  const [sportsError, setSportsError] = useState<string | null>(null);

  const filteredGames = useMemo(() => {
    const gamesToFilter = providerId ? providerGames : sportsGames;
    if (!gamesToFilter || gamesToFilter.length === 0) return [];
    if (!search.trim()) return gamesToFilter;
    const query = search.toLowerCase();
    return gamesToFilter.filter((game) =>
      game.name?.toLowerCase().includes(query)
    );
  }, [providerId, providerGames, sportsGames, search]);

  useEffect(() => {
    if (!providerId) {
      setProviderGames([]);
      setProviderTitle(null);
      setError(null);
      return;
    }

    const fetchProviderGames = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/softapi/games?brand_id=${providerId}`);
        const data = await response.json();
        console.log("Sports page provider API response:", { providerId, data });
        if (Array.isArray(data.games)) {
          setProviderGames(data.games);
        } else {
          setProviderGames([]);
        }
        setProviderTitle(data.provider_title || `Provider ${providerId}`);
      } catch (err) {
        console.error("Failed to fetch provider games:", err);
        setError("Unable to load provider games.");
        setProviderGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderGames();
  }, [providerId]);

  useEffect(() => {
    if (providerId) {
      return;
    }

    const fetchSportsGames = async () => {
      setIsSportsLoading(true);
      setSportsError(null);
      try {
        const results = await Promise.all(
          SPORTS_PROVIDERS.map(async (provider) => {
            const response = await fetch(
              `/api/softapi/games?brand_id=${provider.brand_id}&category=sport`
            );
            if (!response.ok) {
              return [];
            }
            const data = await response.json();
            return Array.isArray(data.games) ? data.games : [];
          })
        );

        const allSportsGames = results.flat();
        setSportsGames(allSportsGames);
      } catch (err) {
        console.error("Failed to fetch sports games:", err);
        setSportsError("Unable to load sports games.");
        setSportsGames([]);
      } finally {
        setIsSportsLoading(false);
      }
    };

    fetchSportsGames();
  }, [providerId]);

  return (
    <SideNavLayout>
      <TabLayout>
        <AppHeader title="Sports" />
        <main className="bg-[#003e3e] min-h-screen px-4 py-6">
          {!providerId ? (
            <div className="max-w-6xl mx-auto">

              <div className="mb-4">
                <PrimaryInput
                  placeholder="Search sports games"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              {isSportsLoading ? (
                <div className="text-white">Loading sports games...</div>
              ) : sportsError ? (
                <div className="text-red-400">{sportsError}</div>
              ) : filteredGames.length === 0 ? (
                <div className="text-gray-300">No sports games available right now.</div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-2 provider-list-appear">
                  {filteredGames.map((game, index) => (
                    <GameCardWithProvider
                      key={game.id || index}
                      game={game}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {providerTitle || `Provider ${providerId}`} Games
                </h2>
                <p className="text-sm text-gray-300 mt-2">
                  Showing games fetched from provider ID {providerId}.
                </p>
              </div>

              <div className="mb-4">
                <PrimaryInput
                  placeholder="Search sports games"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              {isLoading ? (
                <div className="text-white">Loading games...</div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : filteredGames.length === 0 ? (
                <div className="text-gray-300">No games found for this provider.</div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4 mt-2 provider-list-appear">
                  {filteredGames.map((game, index) => (
                    <GameCardWithProvider
                      key={game.id || index}
                      game={game}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </TabLayout>
    </SideNavLayout>
  );
};

export default Sports;
