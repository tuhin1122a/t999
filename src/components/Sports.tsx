/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useRef } from "react";
import GameSelectionHeader from "./GameSelectionHeader";
import { GameCardWithProvider } from "./GameCards";
import { useGames } from "@/lib/store.zustond";
import { Categories } from "@/types/game";
import GameLoader from "./loader/GameLoader";

export const sportsData = [
  {
    providerId: "83",
    image:
      "https://ik.imagekit.io/f4rqxekfu/brands/brand_83_1759747195_Atqb52OM-.png",
    title: "LuckySport",
    redirect: "/sports?providerId=83",
  },
  {
    providerId: "141",
    image:
      "https://ik.imagekit.io/f4rqxekfu/brands/1774284124-9wicketslogo_1__nHSY_O0YU.webp",
    title: "9wickets",
    redirect: "/sports?providerId=141",
  },
];

const Sports = () => {
  const gamesContainer = useRef<HTMLDivElement | null>(null);

  const handleRightButtonClick = () => {
    gamesContainer.current!.scrollLeft += -130;
  };
  const handleLeftButtonClick = () => {
    gamesContainer.current!.scrollLeft += 130;
  };

  const { getGames } = useGames((state) => state);
  const gamesList = getGames(Categories.Sport, undefined, 20);

  return (
    <div
      className="my-4"
      style={{
        width: "100%",
      }}
    >
      <GameSelectionHeader
        title="Sports Games"
        leftAction={handleLeftButtonClick}
        rightAction={handleRightButtonClick}
        seeMoreLink="/sports"
      />
      <div
        className="max-w-full w-full overflow-x-auto scrollbar-none scroll-smooth"
        ref={gamesContainer}
      >
        <div className="hot-games-list">
          {gamesList &&
            gamesList.map((game, i) => (
              <GameCardWithProvider key={i} game={game} />
            ))}

          <GameLoader length={20} loading={!!!gamesList} category="sport" />
        </div>
      </div>
    </div>
  );
};

export default Sports;

export const SportsCard = ({
  image,
  redirect,
}: {
  image: string;
  redirect: string;
}) => {
  return (
    <Link href={redirect} className="block">
      <img src={image} alt="sport provider" className="max-w-full h-auto" />
    </Link>
  );
};
