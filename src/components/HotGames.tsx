"use client";
import React, { useEffect, useRef, useState } from "react";
import { GameCardWithProvider } from "./GameCards";
import GameSelectionHeader from "./GameSelectionHeader";
import GameLoader from "./loader/GameLoader";
import { NetEnt } from "@/types/game";

interface HotGamesProps {
  initialGames?: NetEnt[];
}

const HotGames = ({ initialGames }: HotGamesProps) => {
  const gamesContainer = useRef<HTMLDivElement | null>(null);
  const [games, setGames] = useState<NetEnt[]>(initialGames || []);
  const [loading, setLoading] = useState(!initialGames);

  useEffect(() => {
    let active = true;
    async function syncHotGames() {
      try {
        const res = await fetch("/api/games/hot", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.success && Array.isArray(data.games)) {
          setGames(data.games);
        }
      } catch (err) {
        console.error("Failed to fetch hot games:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    syncHotGames();
    return () => {
      active = false;
    };
  }, []);

  const handleRightButtonClick = () => {
    if (gamesContainer.current) {
      gamesContainer.current.scrollLeft += -130;
    }
  };
  const handleLeftButtonClick = () => {
    if (gamesContainer.current) {
      gamesContainer.current.scrollLeft += 130;
    }
  };

  if (!loading && games.length === 0) {
    return null;
  }

  return (
    <div
      className="my-4"
      style={{
        width: "100%",
      }}
    >
      <GameSelectionHeader
        title="Hot Games"
        leftAction={handleLeftButtonClick}
        rightAction={handleRightButtonClick}
        seeMoreLink="/hot"
      />
      <div
        className="max-w-full w-full overflow-x-auto scrollbar-none scroll-smooth"
        ref={gamesContainer}
      >
        <div className="hot-games-list">
          {games.map((g, i) => (
            <GameCardWithProvider game={g} index={i} key={g.id || i} />
          ))}

          {loading && games.length === 0 && <GameLoader length={10} loading={true} />}
        </div>
      </div>
    </div>
  );
};

export default HotGames;
