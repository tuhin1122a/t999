"use client";

import dynamic from "next/dynamic";

const HeroSlider = dynamic(() => import("./HeroSlider"), { ssr: false });

const HeroSliderWrapper = ({ sliderImages }: { sliderImages?: string[] }) => {
  return <HeroSlider sliderImages={sliderImages} />;
};

export default HeroSliderWrapper;