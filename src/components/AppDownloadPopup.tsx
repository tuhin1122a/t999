"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaAndroid, FaDownload, FaGift, FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const STORAGE_KEY = "rk444_app_download_popup_seen";

export default function AppDownloadPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(
    "https://rk444.site/download/rk444.apk"
  );

  useEffect(() => {
    // Don't interrupt active game play screen
    if (pathname?.startsWith("/play")) return;

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // ignore storage errors
    }

    fetch("/api/app-version")
      .then((r) => r.json())
      .then((d) => {
        if (d?.downloadUrl) setDownloadUrl(d.downloadUrl);
      })
      .catch(() => {});

    const timer = setTimeout(() => {
      setVisible(true);
    }, 900);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-emerald-400/35 bg-gradient-to-b from-[#0d2238] via-[#091829] to-[#06101c] shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-cyan-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gray-300 transition hover:bg-white/20 hover:text-white cursor-pointer"
        >
          <FaTimes className="h-3.5 w-3.5" />
        </button>

        <div className="px-6 pb-6 pt-7 text-center">
          {/* App Badge Icon */}
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 shadow-[0_10px_30px_rgba(16,185,129,0.45)]">
            <FaAndroid className="h-11 w-11 text-white drop-shadow" />
            <span className="absolute -right-2 -top-2 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 text-[10px] font-black text-black shadow">
              <HiSparkles className="h-3 w-3" /> ৳50
            </span>
          </div>

          {/* Bonus Pill */}
          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-3.5 py-1 text-xs font-extrabold text-amber-300">
            <FaGift className="h-3.5 w-3.5 text-amber-400" />
            FIRST APP LOGIN BONUS · ৳50 FREE
          </div>

          {/* Title */}
          <h3 className="text-xl font-black tracking-tight text-white">
            Download RK444 Official App
          </h3>

          {/* Bengali + English Message */}
          <p className="mt-2.5 text-sm font-bold leading-relaxed text-emerald-300">
            অ্যাপ ডাউনলোড করে প্রথমবার লগইন করলেই পাবেন{" "}
            <span className="text-amber-300 underline decoration-amber-400/60">
              ৳৫০ টাকা ফ্রি বোনাস!
            </span>
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-300">
            Fastest gameplay, instant bKash/Nagad deposit &amp; withdrawal, and
            exclusive app-only rewards.
          </p>

          {/* CTA Download Button */}
          <a
            href={downloadUrl}
            download="RK444.apk"
            onClick={handleClose}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 px-5 py-3.5 text-sm font-black uppercase tracking-wider text-black shadow-[0_10px_25px_rgba(16,185,129,0.4)] transition hover:brightness-110 active:scale-[0.98]"
          >
            <FaDownload className="h-4 w-4" />
            Download App &amp; Claim ৳50
          </a>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleClose}
            className="mt-3 w-full py-1.5 text-xs font-semibold text-gray-400 transition hover:text-white cursor-pointer"
          >
            পরে ডাউনলোড করব (Continue on Web)
          </button>
        </div>
      </div>
    </div>
  );
}
