"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";

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
];

const TrustedProviders = () => {
  return (
    <section className="my-8 px-1">
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MdVerified className="text-[#3888e9] text-xl" />
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wider uppercase">
              OFFICIAL GAME PROVIDERS
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">
              World-Class Certified Fair Gaming Partners
            </span>
          </div>
        </div>
        <Link
          href="/slots"
          className="flex items-center gap-1 text-xs font-bold text-[#3888e9] hover:text-white transition-colors"
        >
          <span>All Brands</span>
          <FiArrowRight size={13} />
        </Link>
      </div>

      {/* ── Providers Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {providers.map((p, i) => (
          <Link
            key={i}
            href={`/slots?providerId=${p.brandId}`}
            className="group relative flex items-center justify-center h-16 px-4 bg-[#0a1626]/90 hover:bg-[#112338] border border-[#18304e] hover:border-[#3888e9]/50 rounded-xl transition-all duration-200 active:scale-95 shadow-sm overflow-hidden"
            title={`Play ${p.name} Games`}
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3888e9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative w-full h-8 flex items-center justify-center">
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-8 max-w-[100px] w-auto h-auto object-contain filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-105"
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
