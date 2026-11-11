/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
];

function isHiddenRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDDEN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function TawkToWidget({
  enabled,
  widgetUrl,
  showFloatingBubble = true,
}: TawkToWidgetProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const pathnameRef = useRef<string | null>(pathname);
  const showBubbleRef = useRef<boolean>(showFloatingBubble);
  const enabledRef = useRef<boolean>(enabled);
  const sessionRef = useRef<any>(session);
  const lastAttrFingerprintRef = useRef<string>("");

  pathnameRef.current = pathname;
  showBubbleRef.current = showFloatingBubble;
  enabledRef.current = enabled;
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
          phone,
          playerid: playerId,
        },
        () => {
          // Ignore non-fatal attribute callback responses
        }
      );
    } catch {
      // ignore if widget not yet ready
    }
  };

  // Load Tawk.to script once when enabled
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.__TAWK_ENABLED__ = enabled;
    window.__TAWK_DIRECT_URL__ = directChatUrl;

    if (!enabled) {
      window.__TAWK_LOADING__ = false;
      window.__TAWK_PENDING_OPEN__ = false;
      try {
        window.Tawk_API?.minimize?.();
        window.Tawk_API?.hideWidget?.();
      } catch {
        // ignore
      }
      return;
    }

    const existingScript = document.getElementById(
      "tawk-to-embed-script"
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.src === validUrl) {
        return;
      }
      // Widget URL updated in Admin Dashboard
      existingScript.remove();
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.__TAWK_LOADING__ = true;

    window.Tawk_API.customStyle = {
      visibility: {
        desktop: {
          position: "br",
          xOffset: 20,
          yOffset: 22,
        },
        mobile: {
          position: "br",
          xOffset: 12,
          yOffset: 78,
        },
      },
      zIndex: 1002,
    };

    window.Tawk_API.onLoad = () => {
      window.__TAWK_LOADED__ = true;
      window.__TAWK_LOADING__ = false;

      syncUserAttributes();

      if (window.__TAWK_PENDING_OPEN__) {
        window.__TAWK_PENDING_OPEN__ = false;
        try {
          window.Tawk_API?.showWidget?.();
          window.Tawk_API?.maximize?.();
        } catch {
          // ignore
        }
        return;
      }

      if (
        !enabledRef.current ||
        !showBubbleRef.current ||
        isHiddenRoute(pathnameRef.current)
      ) {
        try {
          window.Tawk_API?.hideWidget?.();
        } catch {
          // ignore
        }
      } else {
        try {
          window.Tawk_API?.showWidget?.();
        } catch {
          // ignore
        }
      }
    };

    window.Tawk_API.onChatMinimized = () => {
      if (!showBubbleRef.current || isHiddenRoute(pathnameRef.current)) {
        try {
          window.Tawk_API?.hideWidget?.();
        } catch {
          // ignore
        }
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
  }, [enabled, validUrl, directChatUrl]);

  // Toggle widget visibility on route transitions & bubble config changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.__TAWK_LOADED__) return;
    try {
      if (!enabled || !showFloatingBubble || isHiddenRoute(pathname)) {
        if (isHiddenRoute(pathname)) {
          window.Tawk_API?.minimize?.();
        }
        window.Tawk_API?.hideWidget?.();
      } else {
        window.Tawk_API?.showWidget?.();
      }
    } catch {
      // ignore
    }
  }, [pathname, enabled, showFloatingBubble]);

  // Identify player whenever session changes after Tawk.to loads
  useEffect(() => {
    syncUserAttributes();
  }, [session]);

  return null;
}
