"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

const providers = [
  { name: "Pragmatic Play", logo: "/games/provider/PP-WHITE.png", brandId: "12" },
  { name: "Evolution", logo: "/games/provider/EVO-WHITE.png", brandId: "59" },
  { name: "JILI", logo: "/games/provider/JL.png", brandId: "99" },
  { name: "PG Soft", logo: "/games/provider/PG-WHITE.png", brandId: "53" },
  { name: "Spribe Aviator", logo: "/games/provider/spribe-WHITE.png", brandId: "91" },
  { name: "NetEnt", logo: "/games/provider/NE-WHITE.png", brandId: "51" },
  { name: "Play'n GO", logo: "/games/provider/PLAYNGO-WHITE.png", brandId: "77" },
  { name: "Habanero", logo: "/games/provider/HABANERO.png", brandId: "64" },
  { name: "JDB", logo: "/games/provider/JDB-WHITE.png", brandId: "49" },
  { name: "Red Tiger", logo: "/games/provider/RT-WHITE.png", brandId: "52" },
  { name: "Microgaming", logo: "/games/provider/MG-WHITE.png", brandId: "8" },
  { name: "EGT Amusnet", logo: "/games/provider/EGT-WHITE.png", brandId: "14" },
  { name: "Booming Games", logo: "/games/provider/BOOMING.png", brandId: "71" },
  { name: "Quickspin", logo: "/games/provider/QUICSPIN.png", brandId: "72" },
  { name: "RubyPlay", logo: "/games/provider/RUBYPLAY.png", brandId: "81" },
  { name: "Golden Race", logo: "/games/provider/GOLDENRACE.png", brandId: "83" },
];

const TrustedProviders = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollDistance = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: -scrollDistance, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollDistance = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
    }
  };

  return (
    <section className="my-6 px-1">
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MdVerified className="text-[#3888e9] text-lg sm:text-xl flex-shrink-0" />
          <div className="flex flex-col">
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase">
              GAME PROVIDERS
            </h3>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium hidden xs:inline">
              World-Class Fair Gaming Partners
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Scroll Navigation Chevrons */}
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Previous providers"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-[#0a1626] border border-[#18304e] text-gray-300 hover:text-white hover:border-[#3888e9] active:scale-95 transition-all"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Next providers"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-[#0a1626] border border-[#18304e] text-gray-300 hover:text-white hover:border-[#3888e9] active:scale-95 transition-all"
          >
            <FiChevronRight size={16} />
          </button>

          {/* All Brands Link */}
          <Link
            href="/slots"
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#3888e9] hover:text-white ml-1 transition-colors"
          >
            <span>All</span>
            <FiArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── Providers Horizontal Scroll Strip (4 cards on mobile screen) ── */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none scroll-smooth pb-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {providers.map((p, i) => (
          <Link
            key={i}
            href={`/slots?providerId=${p.brandId}`}
            className="group relative flex-shrink-0 flex items-center justify-center w-[calc(25%-6px)] min-w-[74px] sm:w-[120px] md:w-[135px] h-13 sm:h-16 px-1.5 sm:px-3 bg-[#0a1626]/90 hover:bg-[#112338] border border-[#18304e] hover:border-[#3888e9]/60 rounded-xl transition-all duration-200 active:scale-95 shadow-sm overflow-hidden"
            title={`Play ${p.name} Games`}
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3888e9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative w-full h-7 sm:h-8 flex items-center justify-center">
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-6 sm:max-h-8 max-w-[62px] sm:max-w-[95px] w-auto h-auto object-contain filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrustedProviders;

