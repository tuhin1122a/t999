/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DEFAULT_TAWK_WIDGET_URL,
  getTawkDirectChatUrl,
  normalizeTawkWidgetUrl,
} from "@/lib/tawk";

interface TawkToWidgetProps {
  enabled: boolean;
  widgetUrl: string;
  showFloatingBubble?: boolean;
}

const HIDDEN_ROUTE_PREFIXES = [
  "/play",
  "/login",
  "/register",
  "/forget-password",
  "/support",
  "/chat",
];

function isHiddenRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function TawkToWidget({
  enabled = true,
  widgetUrl,
  showFloatingBubble = true,
}: TawkToWidgetProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const [isChatMaximized, setIsChatMaximized] = useState(false);

  const pathnameRef = useRef<string | null>(pathname);
  const sessionRef = useRef<any>(session);
  const lastAttrFingerprintRef = useRef<string>("");

  pathnameRef.current = pathname;
  sessionRef.current = session;

  const normalized = normalizeTawkWidgetUrl(
    widgetUrl || DEFAULT_TAWK_WIDGET_URL
  );
  const validUrl = normalized.valid ? normalized.url : DEFAULT_TAWK_WIDGET_URL;
  const directChatUrl = getTawkDirectChatUrl(validUrl);

  const syncUserAttributes = () => {
    if (typeof window === "undefined" || !window.__TAWK_LOADED__) return;
    const user = sessionRef.current?.user;
    if (!user) {
      lastAttrFingerprintRef.current = "";
      return;
    }

    const playerId = String(
      user.gameXAPlayerId || user.playerId || user.id || ""
    );
    const phone = String(user.phone || "");
    const displayName = user.name
      ? `${user.name}${playerId ? ` (${playerId})` : ""}`
      : `Player ${playerId}`;
    const email =
      typeof user.email === "string" && user.email.includes("@")
        ? user.email
        : `${phone || playerId}@rk444.site`;

    const fingerprint = `${user.id}:${displayName}:${phone}:${playerId}`;
    if (lastAttrFingerprintRef.current === fingerprint) return;
    lastAttrFingerprintRef.current = fingerprint;

    try {
      window.Tawk_API?.setAttributes?.(
        {
          name: displayName,
          email,
        },
        () => {}
      );
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const origConsoleError = window.console.error;
    if (!(window as any).__TAWK_CONSOLE_PATCHED__) {
      (window as any).__TAWK_CONSOLE_PATCHED__ = true;
      window.console.error = (...args: any[]) => {
        const firstArg = typeof args[0] === "string" ? args[0] : "";
        if (firstArg.includes("[Tawk/Logger]")) {
          return;
        }
        origConsoleError.apply(window.console, args);
      };
    }

    // Disable chat completely when user is not logged in
    if (!enabled || !isAuthenticated) {
      window.__TAWK_ENABLED__ = false;
      window.__TAWK_LOADING__ = false;
      window.__TAWK_PENDING_OPEN__ = false;
      try {
        window.Tawk_API?.minimize?.();
        window.Tawk_API?.hideWidget?.();
        setIsChatMaximized(false);
      } catch {
        // ignore
      }
      return;
    }

    window.__TAWK_ENABLED__ = true;
    window.__TAWK_DIRECT_URL__ = directChatUrl;

    const existingScript = document.getElementById(
      "tawk-to-embed-script"
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.src === validUrl) {
        return;
      }
      existingScript.remove();
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.__TAWK_LOADING__ = true;

    window.Tawk_API.onLoad = () => {
      window.__TAWK_LOADED__ = true;
      window.__TAWK_LOADING__ = false;
      syncUserAttributes();
      try {
        window.Tawk_API?.hideWidget?.();
      } catch {
        // ignore
      }
    };

    window.Tawk_API.onChatMaximized = () => {
      setIsChatMaximized(true);
    };

    window.Tawk_API.onChatMinimized = () => {
      setIsChatMaximized(false);
      try {
        window.Tawk_API?.hideWidget?.();
      } catch {
        // ignore
      }
    };

    const script = document.createElement("script");
    script.id = "tawk-to-embed-script";
    script.async = true;
    script.src = validUrl;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    script.onerror = () => {
      window.__TAWK_LOADING__ = false;
      window.__TAWK_PENDING_OPEN__ = false;
    };

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }, [enabled, isAuthenticated, validUrl, directChatUrl]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.__TAWK_LOADED__) return;
    if (!isAuthenticated || isHiddenRoute(pathname)) {
      try {
        window.Tawk_API?.minimize?.();
        window.Tawk_API?.hideWidget?.();
        setIsChatMaximized(false);
      } catch {
        // ignore
      }
    }
  }, [pathname, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      syncUserAttributes();
    }
  }, [session, isAuthenticated]);

  // Completely disabled/hidden when user is NOT logged in
  if (
    !enabled ||
    !isAuthenticated ||
    !showFloatingBubble ||
    isHiddenRoute(pathname) ||
    isChatMaximized
  ) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/support")}
      title="24/7 Live Chat Support"
      aria-label="24/7 Live Chat Support"
      className="fixed bottom-[76px] right-3.5 md:bottom-6 md:right-6 z-[1001] group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#0f243c] to-[#07111e] border-2 border-[#3888e9] shadow-[0_8px_28px_rgba(56,136,233,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none"
    >
      {/* Subtle outer pulse ring */}
      <span className="absolute inset-0 rounded-full border-2 border-[#3888e9]/40 animate-ping pointer-events-none" />

      {/* 3D Support Agent Avatar */}
      <img
        src="/support-icon.png"
        alt="24/7 Support"
        className="w-12 h-12 rounded-full object-cover"
      />

      {/* Online Green Indicator Dot */}
      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#070e17] shadow-[0_0_8px_#34d399]" />
    </button>
  );
}
