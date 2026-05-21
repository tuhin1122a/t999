"use client";
import { useGames } from "@/lib/store.zustond";
import { useEffect, useMemo, useState } from "react";

const prettyName = (cat: string) => {
  const map: Record<string, string> = {
    slots: "Slots",
    live_dealers: "Live Casino",
    video_poker: "Video Poker",
    fishing: "Fish",
    sport: "Sports",
    roulette: "Roulette",
    arcade: "Arcade",
    card: "Card",
    lottery: "Lottery",
    fast_games: "Fast Games",
  };
  return map[cat] || cat.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const CategoryTabs = ({
  onChange,
  initial,
}: {
  onChange?: (category: string) => void;
  initial?: string;
}) => {
  // Select `games` directly to avoid creating a new object each render
  const games = useGames((s) => s.games);
  const [selected, setSelected] = useState<string>(initial || "all");

  const categories = useMemo(() => {
    if (!games) return [] as string[];
    return Object.keys(games).filter((k) => (games as any)[k] && (games as any)[k].length > 0);
  }, [games]);

  useEffect(() => {
    if (initial) setSelected(initial);
  }, [initial]);

  useEffect(() => {
    onChange?.(selected);
  }, [selected, onChange]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full mb-3">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelected("all")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${selected === "all" ? "bg-[#FFB800] text-black" : "bg-[#004E56] text-white"}`}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${selected === c ? "bg-[#FFB800] text-black" : "bg-[#004E56] text-white"}`}
          >
            {prettyName(c)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
