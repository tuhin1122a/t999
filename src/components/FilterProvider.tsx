/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { useGames } from "@/lib/store.zustond";

type ProviderItem = {
  brand_id: string;
  brand_title: string;
  logo: string;
};

const CATEGORY_BRANDS: Record<string, string[]> = {
  slots: [
    "45", "49", "50", "51", "52", "53", "54", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71",
    "72", "73", "74", "75", "76", "77", "80", "81", "82", "84", "86", "90", "91", "92", "93", "96", "97", "98",
    "99", "102", "103", "105", "106", "108", "109", "112", "119", "120", "123", "124", "125", "128", "129", "131",
    "133", "134", "136", "137", "138", "140"
  ],
  live_dealers: [
    "53", "54", "55", "56", "58", "59", "60", "78", "88", "89", "114", "117", "121", "130", "132", "135"
  ],
  sport: [
    "46", "48", "83", "85", "94", "95", "118", "126", "141", "142"
  ],
  fishing: [
    "49", "50", "51", "52", "84", "91", "99", "133"
  ],
  arcade: [
    "57", "100", "101", "104", "107", "111", "113", "139"
  ]
};

const FilterProivder = ({
  onSelect,
  category,
}: {
  onSelect: (providerId: string) => void;
  category?: string;
}) => {
  const [selectedProvider, setProvider] = useState<string>("all");
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const isLoading = useGames((state) => state.isLoading);

  const selectorStyle = {
    active: {
      background:
        "linear-gradient(180deg, var(--color-yellow-50, #FFE600) 0%, var(--color-orange-50, #FFB800) 100%)",
      boxShadow:
        "0px 1.3760000467300415px 0px 2.375999927520752px #FFF2A6 inset",
      overflow: "hidden",
      borderRadius: 11.01,
      outline:
        "1px var(--color-yellow-83-50%, rgba(255, 242, 166, 0.50)) solid",
      outlineOffset: "-1px",
      justifyContent: "center",
      alignItems: "center",
      display: "inline-flex",
    },
    inActive: {
      background:
        "linear-gradient(180deg, var(--color-cyan-27, #0F727C) 0%, var(--color-cyan-17, #004E56) 100%)",
      boxShadow: "0px 1.3760000467300415px 0px #005540",
      borderRadius: 11.01,
      outline: "1px var(--color-cyan-57-10%, rgba(35, 255, 200, 0.10)) solid",
      outlineOffset: "-1px",
      justifyContent: "center",
      alignItems: "center",
      display: "inline-flex",
    },
  };

  useEffect(() => {
    onSelect(selectedProvider);
  }, [selectedProvider, onSelect]);

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await fetch("/api/softapi/providers");
        if (!res.ok) throw new Error("Failed to load provider list");
        const data = await res.json();
        
        let fetchedProviders: ProviderItem[] = data.providers || [];
        if (category && CATEGORY_BRANDS[category]) {
          const allowedBrands = CATEGORY_BRANDS[category];
          fetchedProviders = fetchedProviders.filter((p) => allowedBrands.includes(p.brand_id));
        }
        
        // Only filter out empty providers once loading is complete
        if (!isLoading && category) {
          const gamesState = useGames.getState();
          const allGames = gamesState.games ? Object.values(gamesState.games).flat() : [];
          
          fetchedProviders = fetchedProviders.filter((p) => {
            const hasGamesInMain = allGames.some(
              (game: any) => game && game.brand_id === p.brand_id && game.categories === category
            );
            const hasGamesInProvider = gamesState.providerGames[p.brand_id]?.some(
              (game: any) => game && game.categories === category
            );
            return hasGamesInMain || hasGamesInProvider;
          });
        }
        
        setProviders(fetchedProviders);
      } catch (error) {
        console.error("Error loading SoftAPI providers:", error);
      }
    }

    loadProviders();
  }, [category, isLoading]);

  return (
    <div>
      <div className="w-full bg-wwwwwwck-44-4comdaintree mb-3 rounded-[10.4px] px-5 py-2 overflow-hidden border border-solid border-[#006165] shadow-[0px_2.08px_0px_#002631]">
        <Swiper slidesPerView={"auto"} spaceBetween={10} className="mySwiper">
          <SwiperSlide className="max-w-max">
            <div
              className="h-[45px] px-4 py-3 transition-all duration-150 ease-out active:scale-95 hover:-translate-y-0.5 provider-option"
              onClick={() => setProvider("all")}
              style={
                selectedProvider === "all"
                  ? selectorStyle.active
                  : selectorStyle.inActive
              }
            >
              <span
                className={`block px-3 text-lg font-bold ${
                  selectedProvider === "all" ? "text-black" : "text-white"
                }`}
              >
                All
              </span>
            </div>
          </SwiperSlide>

          {providers.map((provider) => (
            <SwiperSlide key={provider.brand_id} className="max-w-max">
              <div
                className="h-[45px] px-4 py-3 flex items-center justify-center transition-all duration-150 ease-out active:scale-95 hover:-translate-y-0.5 provider-option"
                onClick={() => setProvider(provider.brand_id)}
                style={
                  provider.brand_id === selectedProvider
                    ? selectorStyle.active
                    : selectorStyle.inActive
                }
              >
                <img
                  src={provider.logo}
                  alt={provider.brand_title}
                  className="max-w-[85px] max-h-[30px] object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default FilterProivder;
