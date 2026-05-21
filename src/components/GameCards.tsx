/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="react" />
/// <reference types="react-dom" />
"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */

import useGetCurrentUser from "@/hook/useCurrentUser";
import { LocalArrayStorage } from "@/lib/favorites";
import { NetEnt } from "@/types/game";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LiaHeartSolid } from "react-icons/lia";

const storage = LocalArrayStorage<string>();

interface GameCardWithProviderProps {
  game: NetEnt;
  index?: number;
}

export const GameCardWithProvider = ({ game, index }: GameCardWithProviderProps) => {
  const [imageLoaded, setImageLoad] = useState(false);
  const [isFav, setFav] = useState(false);
  const { img, name, id } = game;
  const user: any = useGetCurrentUser();

  const [imageSrc, setImageSrc] = useState<string>("/games/provider/default-game.png");

  const handleImageLoad = () => {
    setImageLoad(true);
  };

  useEffect(() => {
    if (!img || img === "NULL" || img.trim() === "") {
      setImageSrc("/games/provider/default-game.png");
      return;
    }

    setImageSrc(img);
  }, [img]);

  const handleAddToFav = (gameId: string) => {
    setFav(!isFav);
    storage.push("favorites-games", gameId);
  };

  useEffect(() => {
    setFav(storage.exists("favorites-games", id));
  }, [storage, id]);

  return (
    <div
      className="relative card-enter"
      style={{ animationDelay: index ? `${index * 70}ms` : "0ms" }}
    >
      <Link
        href={`/play?gameId=${id}`}
        className="relative game-main overflow-hidden"
      >
        <div
          className={`relative overflow-hidden rounded-2xl transition-opacity duration-500 ease-out ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="shiny-card w-full">
            <img
              alt={name || "Game image"}
              src={imageSrc}
              className="w-full h-40 object-cover rounded-2xl"
              onLoad={handleImageLoad}
              onError={() => setImageSrc("/games/provider/default-game.png")}
            />
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10 ">
        <button
          onClick={() => handleAddToFav(id)}
          className="w-[18px] h-[18px] rounded-full bg-white/10 flex justify-center items-center "
        >
          <span
            className={`w-[15px] h-[15px] ${
              isFav ? "text-pink-500" : "text-white"
            }`}
          >
            <LiaHeartSolid className="w-full h-full" />
          </span>
        </button>
      </div>
    </div>
  );
};
