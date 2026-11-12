"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const AGENT_STORAGE_KEY = "subadmin_agent_code";

export function setStoredAgentCode(code: string) {
  const clean = code.trim().toUpperCase();
  if (!clean) return;
  try {
    localStorage.setItem(AGENT_STORAGE_KEY, clean);
  } catch {
    // ignore storage errors
  }
  try {
    document.cookie = `${AGENT_STORAGE_KEY}=${encodeURIComponent(
      clean
    )}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {
    // ignore cookie errors
  }
}

export function getStoredAgentCode(): string {
  try {
    const ls = localStorage.getItem(AGENT_STORAGE_KEY);
    if (ls && ls.trim()) return ls.trim().toUpperCase();
  } catch {
    // ignore
  }
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${AGENT_STORAGE_KEY}=`));
    if (match) {
      return decodeURIComponent(match.split("=")[1] || "").trim().toUpperCase();
    }
  } catch {
    // ignore
  }
  return "";
}

export function clearStoredAgentCode() {
  try {
    localStorage.removeItem(AGENT_STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    document.cookie = `${AGENT_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export default function AgentTracker() {
  const searchParams = useSearchParams();
  const agentParam = searchParams.get("agent");

  useEffect(() => {
    if (agentParam && agentParam.trim()) {
      setStoredAgentCode(agentParam);
    }
  }, [agentParam]);

  return null;
}

