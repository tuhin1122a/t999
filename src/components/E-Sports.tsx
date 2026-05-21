"use client";
import { useRef } from "react";

import { useGames } from "@/lib/store.zustond";
import { Categories } from "@/types/game";
import { GameCardWithProvider } from "./GameCards";
import GameSelectionHeader from "./GameSelectionHeader";
import GameLoader from "./loader/GameLoader";

const ESports = () => {
  const { getGames } = useGames((state) => state);
  const gamesList = getGames(Categories.Sport);
  const gamesContainer = useRef<HTMLDivElement | null>(null);

  const handleRightButtonClick = () => {
    gamesContainer.current!.scrollLeft += -130;
  };
  const handleLeftButtonClick = () => {
    gamesContainer.current!.scrollLeft += 130;
  };

  return (
    <div
      className="my-4"
      style={{
        width: "100%",
      }}
    >
      <GameSelectionHeader
        title="E-Sports"
        leftAction={handleLeftButtonClick}
        rightAction={handleRightButtonClick}
        seeMoreLink="#"
      />
      <div
        className="max-w-full w-full overflow-x-auto scrollbar-none scroll-smooth"
        ref={gamesContainer}
      >
        <div className="hot-games-list">
          {gamesList &&
            gamesList.map((game, i) => (
              <GameCardWithProvider game={game} key={i} />
            ))}
        </div>
      </div>
      {!gamesList && <GameLoader length={20} loading={true} />}
      {gamesList && gamesList.length === 0 && (
        <span className="block text-center text-lg font-semibold text-[#23FFC8]">
          Not Found
        </span>
      )}
    </div>
  );
};

export default ESports;
