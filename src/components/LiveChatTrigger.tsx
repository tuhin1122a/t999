"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface LiveChatTriggerProps {
  children: React.ReactNode;
  className?: string;
  fallbackHref?: string;
  title?: string;
  ariaLabel?: string;
  onTriggered?: () => void;
}

export default function LiveChatTrigger({
  children,
  className = "",
  fallbackHref = "/support",
  title,
  ariaLabel,
  onTriggered,
}: LiveChatTriggerProps) {
  const router = useRouter();
  const { status, data: session } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  const handleClick = () => {
    if (!isAuthenticated) {
      return;
    }
    onTriggered?.();
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      disabled={!isAuthenticated}
      onClick={handleClick}
      className={`${className} ${!isAuthenticated ? "opacity-40 cursor-not-allowed" : ""}`}
      title={!isAuthenticated ? "Please log in to use Live Support" : title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
