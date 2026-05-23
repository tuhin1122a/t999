import React from "react";

export const PlaceholderCard = ({ category }: { category?: string }) => {
  let text = "GAME";
  const cat = category?.toLowerCase() || "";
  if (cat.includes("slot")) text = "SLOTS";
  else if (cat.includes("live") || cat.includes("dealer") || cat.includes("casino")) text = "CASINO";
  else if (cat.includes("sport")) text = "SPORTS";
  else if (cat.includes("fish") || cat.includes("shoot")) text = "FISHING";
  else if (cat.includes("arcade")) text = "ARCADE";
  else if (cat.includes("lottery") || cat.includes("keno") || cat.includes("bingo")) text = "LOTTERY";
  else if (cat.includes("poker")) text = "POKER";
  else if (cat.includes("table")) text = "TABLE";
  else if (cat.includes("roulette")) text = "ROULETTE";

  return (
    <svg
      viewBox="0 0 200 130"
      className="w-full h-full rounded-2xl overflow-hidden shadow-md"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Deep purple/violet gradient matching the user's request */}
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A0E67" />
          <stop offset="50%" stopColor="#7B1FA2" />
          <stop offset="100%" stopColor="#310A46" />
        </linearGradient>
        {/* Golden metallic gradient for the text */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="30%" stopColor="#FBC02D" />
          <stop offset="70%" stopColor="#F57F17" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>
        {/* Drop shadow filter for 3D text effect */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
        </filter>
      </defs>
      
      {/* Purple background */}
      <rect width="100%" height="100%" fill="url(#bgGrad)" />
      
      {/* Subtle border */}
      <rect x="5" y="5" width="190" height="120" rx="10" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="1" />
      
      {/* 3D Gold Text */}
      <text
        x="50%"
        y="58%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="url(#goldGrad)"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="30"
        fontWeight="900"
        letterSpacing="2"
        filter="url(#shadow)"
        stroke="#4E2A00"
        strokeWidth="1.2"
      >
        {text}
      </text>
    </svg>
  );
};

export const Loader = ({ category }: { category?: string }) => {
  return (
    <div className="w-full h-40 rounded-2xl overflow-hidden border border-solid border-[#006165] bg-[#002b2b] animate-pulse">
      <PlaceholderCard category={category} />
    </div>
  );
};

const GameLoader = ({
  length,
  loading,
  category,
}: {
  length: number;
  loading: boolean;
  category?: string;
}) => {
  const loader = Array.from({ length: length });

  if (!loading) return null;
  return (
    <>
      {loader.map((_, i) => (
        <Loader key={i} category={category} />
      ))}
    </>
  );
};

export default GameLoader;
