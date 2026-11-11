"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { openTawkChat } from "@/lib/tawk";

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

  const handleClick = () => {
    onTriggered?.();
    const handled = openTawkChat();
    if (!handled) {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
