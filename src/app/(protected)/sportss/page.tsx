"use client";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import GameOpeningLoader from "@/components/loader/GameOpeningLoader";

import { useOpenGameMutation } from "@/lib/features/gamesApiSlice";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import TabNav from "@/components/TabNav";

const Sportss = () => {
  const [openGame, { isLoading }] = useOpenGameMutation();
  const [isIframeLoading, setIsLoading] = useState(true);
  const [iframe, setIframe] = useState("");

  const [error, setError] = useState(false);

  useEffect(() => {
    openGame({ gameId: "3000" })
      .unwrap()
      .then((res) => {
        if (res) {
          const url = res.content.game.url;
          const iframeMode = res.content.game.iframe;
          if (iframeMode == "0") {
            location.href = url;
          } else {
            setIframe(url);
          }
        }
      })
      .catch((error) => {
        setError(true);
      });
  }, [openGame]);

  return (
    <div className="w-full h-screen flex flex-col justify-between bg-black">
      {(isLoading || isIframeLoading) && <GameOpeningLoader />}
      {!isLoading && !error && iframe && (
        <div className="w-full h-[calc(100vh-102px)] md:h-screen">
          <iframe
            src={iframe}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0 rounded-b-lg"
            allowFullScreen
          />
        </div>
      )}
      {!isLoading && error && (
        <div className="w-full h-[calc(100vh-102px)] md:h-screen flex justify-center items-center bg-[#006165]">
          <div className="w-[280px] md:w-[320px] lg:w-[350px] bg-white overflow-hidden rounded-xl">
            <div className="h-[70%] w-full bg-red-500 px-8 py-2">
              <h3 className="text-2xl font-semibold text-white">Error</h3>

              <p className="text-sm font-normal text-white tracking-wide">
                Sports is not available
              </p>
            </div>

            <div className="flex justify-end items-end pb-4 pr-4">
              <Link href="/" className="mt-4">
                <SecondaryButton>Go Home</SecondaryButton>
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Render mobile bottom navigation bar */}
      <TabNav />
    </div>
  );
};

export default Sportss;
