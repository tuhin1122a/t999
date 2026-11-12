/* eslint-disable @next/next/no-img-element */
import React from "react";

export const PlaceholderCard = ({ category }: { category?: string }) => {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a1626] via-[#0f243d] to-[#070e17] flex flex-col items-center justify-center p-2 border border-[#1b3554]/60 shadow-inner group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-yellow-500/5 blur-xl pointer-events-none" />

      {/* RK444 Crown Logo Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center drop-shadow-[0_4px_10px_rgba(251,191,36,0.3)] transition-transform duration-300 group-hover:scale-105">
        <img
          src="/game-loading.jpg"
          alt="RK444 Loading"
          className="w-full h-full object-contain rounded-full"
        />
      </div>

      {/* Loading Pulse Bar */}
      <div className="mt-2.5 w-16 h-1 bg-[#1b3554] rounded-full overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-500 animate-[pulse_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};

export const Loader = ({ category }: { category?: string }) => {
  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden border border-[#1b3554] bg-[#0a1626] shadow-md animate-pulse">
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
