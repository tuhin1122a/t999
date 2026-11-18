/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";
import { DEFAULT_TAWK_WIDGET_URL, getTawkDirectChatUrl } from "@/lib/tawk";

export default function SupportPage() {
  const router = useRouter();
  const [chatUrl, setChatUrl] = useState<string>(
    getTawkDirectChatUrl(DEFAULT_TAWK_WIDGET_URL)
  );
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__TAWK_DIRECT_URL__) {
      setChatUrl(window.__TAWK_DIRECT_URL__);
    }
  }, []);

  return (
    <div className="h-screen w-full bg-[#070e17] flex flex-col text-white overflow-hidden">
      {/* Header with 3D Support Agent Icon */}
      <header className="bg-[#0a1626] border-b border-[#1b3554] py-2.5 px-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer"
            title="Go Back"
          >
            <FaArrowLeftLong className="text-base" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-full border-2 border-[#3888e9] bg-[#0f243c] p-0.5">
              <img
                src="/support-icon.png"
                alt="24/7 Support"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a1626]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide leading-tight">
                24/7 Live Chat Support
              </h3>
              <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Official RK444 Support Agent Online
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Tawk.to Live Chat */}
      <div className="relative flex-1 w-full bg-[#070e17]">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070e17] z-10 gap-3">
            <div className="relative w-20 h-20 rounded-full border-2 border-[#3888e9] p-1 bg-[#0a1626] shadow-[0_0_25px_rgba(56,136,233,0.35)]">
              <img
                src="/support-icon.png"
                alt="Support Agent"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <p className="text-sm font-black text-white uppercase tracking-wider">
              Connecting to Live Support...
            </p>
            <div className="w-40 h-1 rounded-full bg-[#132840] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-[#3888e9] via-[#23FFC8] to-[#3888e9] animate-pulse" />
            </div>
          </div>
        )}

        <iframe
          src={chatUrl}
          title="RK444 24/7 Live Support"
          className="w-full h-full border-0"
          allow="microphone; camera; fullscreen"
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
    </div>
  );
}
