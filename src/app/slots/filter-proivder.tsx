/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";

type ProviderItem = {
  brand_id: string;
  brand_title: string;
  logo: string;
};

const FilterProivder = ({
  onSelect,
}: {
  onSelect: (providerId: string) => void;
}) => {
  const [selectedProvider, setProvider] = useState<string>("all");
  const [providers, setProviders] = useState<ProviderItem[]>([]);

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
        setProviders(data.providers || []);
      } catch (error) {
        console.error("Error loading SoftAPI providers:", error);
      }
    }

    loadProviders();
  }, []);

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
