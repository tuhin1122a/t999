"use client";
import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

interface ProviderItem {
  brandId: string;
  name: string;
  logo: string;
}

const fallbackProviders: ProviderItem[] = [
  {
    brandId: "53",
    name: "Pragmatic Play",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/brand_53_1759738767_0RTFI0ruM.png",
  },
  {
    brandId: "45",
    name: "PG Soft",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/pgsoft__eSCGuSud.png",
  },
  {
    brandId: "49",
    name: "JILI",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/jili_zCoKdKI0w.png",
  },
  {
    brandId: "57",
    name: "Spribe",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/spribe_PT57NjKD1.png",
  },
  {
    brandId: "58",
    name: "Evolution Live",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/brand_58_1759739497_u136bxtGP.png",
  },
  {
    brandId: "50",
    name: "JDB",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/jdb_bfN7Li8aT.svg",
  },
  {
    brandId: "51",
    name: "TADA Gaming",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/tadagaming_VODQcWMhZ.png",
  },
  {
    brandId: "52",
    name: "CQ9",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/cq9_GMWnfJS6j.png",
  },
  {
    brandId: "61",
    name: "FaChai Gaming",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/fachaigaming_XDlsvQLjm.png",
  },
  {
    brandId: "68",
    name: "NetEnt",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/netent_PcottkcL9.png",
  },
  {
    brandId: "74",
    name: "Red Tiger",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/redtiger_GckNg_i4e.png",
  },
  {
    brandId: "73",
    name: "Play'n GO",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/playngo_M64H004gH.png",
  },
  {
    brandId: "91",
    name: "Habanero",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/habanero_TzgioUNJE.svg",
  },
  {
    brandId: "67",
    name: "NoLimit City",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/nolimit-city_dGZqMlHEI.png",
  },
  {
    brandId: "70",
    name: "Relax Gaming",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/relaxgaming_-Yg8pOo7k.png",
  },
  {
    brandId: "90",
    name: "Microgaming",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/microgaming_mm5ILoG4V.png",
  },
  {
    brandId: "72",
    name: "Playtech",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/playtech_kh3OoJoCZ.svg",
  },
  {
    brandId: "62",
    name: "Big Time Gaming",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/bigtimegaming_R1n1_ixJN.jpg",
  },
  {
    brandId: "78",
    name: "Ezugi",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/ezugi_YOoNA87AJ.png",
  },
  {
    brandId: "46",
    name: "SABA Sports",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/sabasports-ibc_jLnyoDVBx.jpg",
  },
  {
    brandId: "48",
    name: "United Gaming",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/unitedgaming_mNkr4Q5Lu.png",
  },
  {
    brandId: "64",
    name: "GameArt",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/gameart_NBb8dzy_S.png",
  },
  {
    brandId: "65",
    name: "BGaming",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/bgaming_pdaAU3WLj.png",
  },
  {
    brandId: "60",
    name: "YeeBet",
    logo: "https://ik.imagekit.io/f4rqxekfu/brands/yeebet_Qkd_HP7B1.png",
  },
];

const TrustedProviders = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [providerList, setProviderList] = useState<ProviderItem[]>(fallbackProviders);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/softapi/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        const list = Array.isArray(data.providers)
          ? data.providers
          : Array.isArray(data.games)
          ? data.games
          : [];
        if (list.length > 0) {
          const mapped: ProviderItem[] = list
            .filter((p: { brand_id?: string | number; logo?: string }) => p.brand_id && p.logo)
            .map((p: { brand_id: string | number; brand_title?: string; name?: string; logo: string }) => ({
              brandId: String(p.brand_id),
              name: p.brand_title || p.name || "Provider",
              logo: p.logo,
            }));
          if (mapped.length > 0) {
            setProviderList(mapped);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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

      {/* ── Providers 2-Row Horizontal Scroll Grid (All Providers Scrollable) ── */}
      <div
        ref={scrollRef}
        className="grid grid-rows-2 grid-flow-col auto-cols-[135px] xs:auto-cols-[145px] sm:auto-cols-[160px] gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {providerList.map((p, i) => (
          <Link
            key={`${p.brandId}-${i}`}
            href={`/slots?providerId=${p.brandId}`}
            className="group relative flex items-center justify-center w-full h-[52px] sm:h-[58px] px-2.5 bg-[#0a1626] hover:bg-[#112338] border border-[#162e4a] hover:border-[#3888e9]/60 rounded-lg transition-all duration-200 active:scale-95 shadow-sm overflow-hidden"
            title={`Play ${p.name} Games`}
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3888e9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative w-full h-8 flex items-center justify-center">
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-7 sm:max-h-8 max-w-[110px] sm:max-w-[125px] w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/games/provider/default-game.png";
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrustedProviders;
