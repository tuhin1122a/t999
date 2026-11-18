/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useCurrentUser from "@/hook/useCurrentUser";
import toast from "react-hot-toast";
import {
  FaArrowLeftLong,
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaLock,
  FaMagnifyingGlass,
  FaPaperPlane,
} from "react-icons/fa6";

interface ChatMsg {
  id: string | number;
  text: string;
  sender: "player" | "agent";
  time: string;
}

type CategoryKey = "account" | "payment" | "technical";

const COMMON_MESSAGES: Record<CategoryKey, string[]> = {
  account: [
    "I want to update my account information.",
    "How do I verify my account?",
    "I cannot log in to my account.",
    "I want to change my password.",
  ],
  payment: [
    "My withdrawal has been pending for a long time.",
    "I made a deposit, but it has not been credited yet.",
    "Which payment methods are supported?",
    "I want to update my payment details.",
  ],
  technical: [
    "The game keeps freezing repeatedly.",
    "I am experiencing lag while playing.",
    "The app is not loading properly.",
    "I cannot open some games.",
  ],
};

const FAQS = [
  {
    question: "What is the minimum withdrawal amount?",
    answer:
      "The minimum withdrawal amount is ৳100. Processing time depends on the selected payment method (typically 10-15 minutes).",
  },
  {
    question: "How long does account verification take?",
    answer:
      "Account verification usually takes 24–48 hours after submitting all required documents.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes, we use 256-bit SSL encryption and security protocols to protect your personal and financial data.",
  },
  {
    question: "What should I do if I forget my password?",
    answer:
      "Tap 'Forgot Password?' on the login screen or contact Live Support to reset your password.",
  },
  {
    question: "How do I claim a bonus?",
    answer:
      "Go to the Promotions or Bonus section, choose your preferred offer, and follow the instructions during deposit.",
  },
];

export default function SupportPage() {
  const router = useRouter();
  const user: any = useCurrentUser();
  const isAuthenticated = Boolean(user?.id);
  const playerID = user?.playerId || user?.id || "";

  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryKey>("account");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      text: "Welcome to RK444 Official Support! How can we help you today?",
      sender: "agent",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/chat?_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        const dbMsgs: ChatMsg[] = data.messages.map((m: any) => ({
          id: m.id,
          text: m.content,
          sender: m.senderId === user.id ? "player" : "agent",
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        if (dbMsgs.length > 0) {
          setChatMessages(dbMsgs);
        }
      }
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!isAuthenticated || !message.trim() || sending) return;
    const textToSend = message.trim();
    setMessage("");
    setSending(true);

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: textToSend,
        sender: "player",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToSend }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to send message");
      } else {
        fetchMessages();
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTemplateClick = (msg: string) => {
    if (!isAuthenticated) return;
    setMessage(msg);
    toast.success("Inserted into message box!");
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070e17] text-white pb-24">
      {/* ── Premium Dark Casino Header ── */}
      <header className="bg-[#0a1626] border-b border-[#1b3554] py-3 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#14263d] hover:bg-[#1e395b] active:scale-95 text-[#3888e9] hover:text-white border border-[#234267] transition-all cursor-pointer"
          title="Go Back"
        >
          <FaArrowLeftLong className="text-base" />
        </button>

        <h3 className="text-base font-bold text-white tracking-wide">
          24/7 Live Support
        </h3>

        <div className="w-9" />
      </header>

      <main className="w-full max-w-md mx-auto px-3.5 py-4 space-y-4">
        {/* ── 1. Chat Card (Dark Teal Casino Theme) ── */}
        <section className="bg-[#002632] border border-[#006165] rounded-2xl overflow-hidden shadow-lg">
          {/* Chat Card Header with 3D Support Agent Icon */}
          <div className="p-3.5 border-b border-[#006165] flex items-center justify-between bg-[#001d26]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-11 h-11 rounded-full border-2 border-[#23FFC8] bg-[#0a1626] p-0.5 shrink-0">
                <img
                  src="/support-icon.png"
                  alt="Support Agent"
                  className="w-full h-full rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#001d26]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">
                  Live Support Feed
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#23FFC8] animate-pulse" />
                  <span className="text-[11px] text-[#23FFC8] font-semibold">
                    Support team is online
                  </span>
                </div>
              </div>
            </div>

            <span className="bg-[#23FFC8]/15 border border-[#23FFC8]/35 text-[#23FFC8] text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider uppercase">
              ONLINE
            </span>
          </div>

          {/* Player ID Row (Only when logged in) */}
          {isAuthenticated && (
            <div className="px-3.5 py-2.5 bg-[#00313d] border-b border-[#006165] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Player ID
                </p>
                <p className="text-xs font-mono font-black text-white">
                  {playerID}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(playerID);
                  toast.success("Player ID copied to clipboard!");
                }}
                className="flex items-center gap-1.5 bg-[#002632] hover:bg-[#003e3e] border border-[#006165] text-[#23FFC8] px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <FaCopy size={11} />
                <span>Copy ID</span>
              </button>
            </div>
          )}

          {/* ── Guest Disabled State vs Logged-In Live Chat Feed ── */}
          {!isAuthenticated ? (
            <div className="p-6 text-center space-y-3 bg-[#001f29]">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-[#FFB800]">
                <FaLock size={20} />
              </div>
              <h3 className="text-sm font-black text-white">
                Live Chat Disabled (Login Required)
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Please log in to your account to chat with our 24/7 Support
                Agent. You can still browse the FAQs below.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#23FFC8] to-[#00bebe] text-[#002626] font-black text-xs shadow-md active:scale-95 transition-all"
              >
                Login to Start Live Chat
              </Link>
            </div>
          ) : (
            <>
              {/* Messages Feed */}
              <div className="h-72 overflow-y-auto p-3.5 space-y-3 bg-[#06101c]/60">
                {chatMessages.map((msg, i) => {
                  const isMe = msg.sender === "player";
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex items-end gap-2 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isMe && (
                        <img
                          src="/support-icon.png"
                          alt="Agent"
                          className="w-7 h-7 rounded-full border border-[#23FFC8] object-cover shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? "bg-[#23FFC8] text-[#001114] font-bold rounded-br-xs"
                            : "bg-[#003840] border border-[#006165] text-white font-medium rounded-bl-xs"
                        }`}
                      >
                        <p className="break-words">{msg.text}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isMe ? "text-[#001114]/70" : "text-gray-400"
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-[#001d26] border-t border-[#006165] flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#002632] border border-[#006165] focus:border-[#23FFC8] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!message.trim() || sending}
                  onClick={handleSendMessage}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    message.trim() && !sending
                      ? "bg-[#23FFC8] text-[#001114] cursor-pointer active:scale-95"
                      : "bg-[#003840] text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </>
          )}
        </section>

        {/* ── 2. Quick Message Templates ── */}
        <section className="bg-[#002632] border border-[#006165] rounded-2xl p-4 space-y-3 shadow-lg">
          <div>
            <h3 className="text-sm font-black text-white">
              Quick Message Templates
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Tap any message below to insert it into the chat input
            </p>
          </div>

          <div className="flex gap-2">
            {(["account", "payment", "technical"] as CategoryKey[]).map(
              (tabKey) => {
                const active = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                      active
                        ? "bg-[#23FFC8] text-[#001114] border-[#23FFC8] font-black"
                        : "bg-[#003840] text-gray-300 border-[#006165]"
                    }`}
                  >
                    {tabKey}
                  </button>
                );
              }
            )}
          </div>

          <div className="space-y-2">
            {COMMON_MESSAGES[activeTab].map((msg, idx) => (
              <button
                key={idx}
                type="button"
                disabled={!isAuthenticated}
                onClick={() => handleTemplateClick(msg)}
                className={`w-full flex items-center justify-between p-3 rounded-xl bg-[#00313d] border border-[#006165] text-left transition-all ${
                  isAuthenticated
                    ? "hover:border-[#23FFC8] active:scale-[0.99] cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                <span className="text-xs text-white font-medium pr-2">
                  {msg}
                </span>
                <span className="text-xs font-black text-[#23FFC8] shrink-0">
                  Use ›
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Frequently Asked Questions (FAQ) ── */}
        <section className="bg-[#002632] border border-[#006165] rounded-2xl p-4 space-y-3 shadow-lg">
          <h3 className="text-sm font-black text-white">
            Frequently Asked Questions (FAQ)
          </h3>

          {/* Search Bar */}
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#00313d] border border-[#006165] focus:border-[#23FFC8] rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#00313d] border border-[#006165] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-3 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white pr-2">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <FaChevronUp className="text-[#23FFC8] text-xs shrink-0" />
                    ) : (
                      <FaChevronDown className="text-gray-400 text-xs shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 text-xs text-gray-300 border-t border-[#006165]/60 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
