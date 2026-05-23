"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import useCurrentUser from "@/hook/useCurrentUser";
import toast from "react-hot-toast";
import AppHeader from "@/components/AppHeader";
import SideNavLayout from "@/components/SideNavLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatMsg {
  id: string | number;
  text: string;
  sender: "player" | "agent";
  time: string;
}

const Chat: React.FC = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const playerID = user?.playerId || "Guest User";
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      text: "Hello! How can I assist you today with your gaming experience?",
      sender: "agent",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from DB API
  const fetchMessages = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (data.success && data.messages) {
        const dbMsgs = data.messages.map((m: any) => ({
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
      console.error("Error fetching messages:", err);
    }
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (user) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const commonMessages = {
    account: [
      "I need to update my account details.",
      "How do I verify my account?",
      "I can't access my account.",
      "I want to change my password.",
    ],
    payment: [
      "My withdrawal is pending for too long.",
      "I haven't received my deposit yet.",
      "What payment methods do you accept?",
      "I need to update my payment information.",
    ],
    technical: [
      "The game keeps freezing on my screen.",
      "I'm experiencing lag during gameplay.",
      "The website is not loading properly.",
      "I can't access certain games on my device.",
    ],
  };

  const faqs = [
    {
      question: "What is the minimum withdrawal amount?",
      answer:
        "The minimum withdrawal amount is $20 (or equivalent in BDT). Please note that withdrawal processing times may vary depending on your payment method.",
    },
    {
      question: "How long does verification take?",
      answer:
        "Account verification typically takes 24-48 hours after all required documents have been submitted. During peak times, this process may take slightly longer.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Yes, we use industry-standard encryption and security protocols to protect your personal and financial information. Your data is never shared with unauthorized third parties.",
    },
    {
      question: "What should I do if I forgot my password?",
      answer:
        "Click on the 'Forgot Password' link on the login page. You'll receive instructions to reset your password. If you don't receive it, please check your spam folder.",
    },
    {
      question: "How do I claim a bonus?",
      answer:
        "To claim a bonus, navigate to the Promotions section, select the bonus you want to claim, and follow the instructions. Some bonuses may require a bonus code during deposit.",
    },
    {
      question: "What are the wagering requirements?",
      answer:
        "Wagering requirements vary by promotion. Generally, bonuses must be wagered 30-40 times before withdrawal. Please check the specific terms for each promotion.",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage(text);
    toast.success("Copied to input box!");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;
    const textToSend = message.trim();
    setMessage(""); // clear input box immediately for snappy feel

    // Append locally immediately
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: textToSend,
        sender: "player",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: textToSend }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to send message");
      } else {
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  return (
    <SideNavLayout>
      <div className="flex flex-col min-h-screen bg-[#001d1f] text-emerald-50">
        <AppHeader title="Chat Support" />
        
        <main className="flex-1 py-5 px-3 md:px-6 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Live Chat */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-[#002f32]/90 border border-emerald-500/10 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#003c40] to-[#005257] p-4 flex justify-between items-center border-b border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00282b] border border-emerald-500/20 flex items-center justify-center">
                      <i className="fas fa-headset text-[#23FFC8] text-lg"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-wide">Live Support Feed</h2>
                      <p className="text-xs text-emerald-400/80">Support team is online</p>
                    </div>
                  </div>
                  <Badge className="bg-[#23FFC8]/10 text-[#23FFC8] border border-[#23FFC8]/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full">
                    Online
                  </Badge>
                </div>

                {/* Player ID Section */}
                <div className="bg-[#00282b]/80 p-3 border-b border-emerald-500/10 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-emerald-400/60 block text-xs">Player ID</span>
                    <span className="font-mono text-emerald-100 font-semibold">{playerID}</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip open={isCopied}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(playerID)}
                          className="border-emerald-500/20 text-[#23FFC8] bg-transparent hover:bg-[#23FFC8]/10 hover:text-[#23FFC8] text-xs h-8 px-3 rounded-md"
                        >
                          <i className="fas fa-copy mr-1.5"></i>
                          {isCopied ? "Copied" : "Copy ID"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-emerald-950 text-[#23FFC8] border-emerald-500/30">
                        <p>Copied to clipboard!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Alert Notification */}
                {!user && (
                  <Alert className="m-4 bg-amber-950/20 border-amber-500/20 text-amber-200">
                    <i className="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
                    <AlertTitle className="font-bold">Authentication Required</AlertTitle>
                    <AlertDescription className="text-xs">
                      Please log in to your account to send live messages to the support desk. You can still browse FAQs below.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Chat Feed */}
                <ScrollArea className="h-[380px] p-4 bg-[#001719]/40 border-b border-emerald-500/10">
                  <div className="space-y-4 pr-2">
                    {chatMessages.map((msg, i) => {
                      const isMe = msg.sender === "player";
                      return (
                        <div
                          key={msg.id || i}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-3 shadow-md transition-all ${
                              isMe
                                ? "bg-gradient-to-br from-[#005f63] to-[#004b4e] text-white rounded-tr-none border border-emerald-500/10"
                                : "bg-[#0b2427] text-emerald-50 rounded-tl-none border border-emerald-500/10"
                            }`}
                          >
                            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            <span
                              className={`text-[9px] block mt-1.5 text-right ${
                                isMe ? "text-emerald-300" : "text-emerald-400/60"
                              }`}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#0b2427] border border-emerald-500/10 rounded-xl rounded-tl-none p-3 shadow-md">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-[#23FFC8] rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-[#23FFC8] rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-[#23FFC8] rounded-full animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Bar */}
                <div className="p-4 bg-[#002224] flex gap-2">
                  <Input
                    placeholder={user ? "Type your query here..." : "Please login to write a message..."}
                    value={message}
                    disabled={!user}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    className="flex-1 bg-[#001719] border-emerald-500/20 text-white placeholder-emerald-500/40 focus-visible:ring-1 focus-visible:ring-[#23FFC8] focus-visible:border-[#23FFC8] rounded-lg"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!user || !message.trim()}
                    className="bg-[#23FFC8] hover:bg-[#1ee0b0] text-[#001f21] font-bold rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] px-4"
                  >
                    Send <i className="fas fa-paper-plane ml-1.5 text-xs"></i>
                  </Button>
                </div>
              </Card>

              {/* Common Messages Tabs */}
              <Card className="bg-[#002f32]/90 border border-emerald-500/10 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden p-4">
                <div className="mb-4">
                  <h3 className="text-md font-bold text-white">Common Templates</h3>
                  <p className="text-xs text-emerald-400/60">Click any message to insert it directly into the input box</p>
                </div>
                
                <Tabs defaultValue="account" className="w-full">
                  <TabsList className="grid grid-cols-3 bg-[#001719] p-1 rounded-lg border border-emerald-500/10 mb-4">
                    <TabsTrigger
                      value="account"
                      className="text-xs py-1.5 text-emerald-400 data-[state=active]:bg-[#23FFC8] data-[state=active]:text-[#001f21] font-bold rounded-md"
                    >
                      Account
                    </TabsTrigger>
                    <TabsTrigger
                      value="payment"
                      className="text-xs py-1.5 text-emerald-400 data-[state=active]:bg-[#23FFC8] data-[state=active]:text-[#001f21] font-bold rounded-md"
                    >
                      Payment
                    </TabsTrigger>
                    <TabsTrigger
                      value="technical"
                      className="text-xs py-1.5 text-emerald-400 data-[state=active]:bg-[#23FFC8] data-[state=active]:text-[#001f21] font-bold rounded-md"
                    >
                      Technical
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(commonMessages).map(([category, messages]) => (
                    <TabsContent key={category} value={category} className="space-y-2 mt-0 outline-none">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          onClick={() => user && copyMessage(msg)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/5 bg-[#001e20]/60 hover:bg-[#00383b] transition-all cursor-pointer group ${
                            !user ? "opacity-50 pointer-events-none" : ""
                          }`}
                        >
                          <p className="text-xs text-emerald-100/90 pr-2">{msg}</p>
                          <span className="text-[#23FFC8] opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                            Use <i className="fas fa-chevron-right ml-1"></i>
                          </span>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </Card>
            </div>

            {/* Right Column - FAQ */}
            <div className="space-y-4">
              <Card className="bg-[#002f32]/90 border border-emerald-500/10 shadow-xl backdrop-blur-sm rounded-xl overflow-hidden p-4">
                <div className="mb-4">
                  <h3 className="text-md font-bold text-white">Frequently Asked Questions</h3>
                  <p className="text-xs text-emerald-400/60">Find quick self-help guides instantly</p>
                  
                  <div className="mt-3 relative">
                    <Input
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-[#001719] border-emerald-500/10 text-xs text-white placeholder-emerald-500/40 rounded-lg h-9"
                    />
                    <i className="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-emerald-500/40 text-xs"></i>
                  </div>
                </div>

                <ScrollArea className="h-[430px] pr-2">
                  <Accordion type="single" collapsible className="space-y-2 w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-emerald-500/10 rounded-lg bg-[#001e20]/40 overflow-hidden"
                      >
                        <AccordionTrigger className="px-3 py-2.5 text-xs font-semibold text-emerald-100 text-left hover:no-underline hover:bg-[#002b2e]/60 transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 pt-1 bg-[#001517]/40 text-emerald-300/80 text-xs leading-relaxed border-t border-emerald-500/5">
                          <p>{faq.answer}</p>
                          {user && (
                            <div className="flex justify-end mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyMessage(faq.answer)}
                                className="border-emerald-500/20 text-[#23FFC8] bg-transparent hover:bg-[#23FFC8]/10 hover:text-[#23FFC8] text-[10px] h-7 px-2.5 rounded"
                              >
                                <i className="fas fa-copy mr-1 text-[9px]"></i> Copy answer
                              </Button>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {filteredFaqs.length === 0 && (
                      <div className="py-8 text-center text-emerald-400/40 text-xs">
                        <i className="fas fa-search-minus text-2xl mb-2 block"></i>
                        No matching FAQs found.
                      </div>
                    )}
                  </Accordion>
                </ScrollArea>
              </Card>

              {/* Direct Support Notice */}
              <Card className="bg-gradient-to-br from-[#002326] to-[#00383b] border border-emerald-500/10 rounded-xl p-4 text-center">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Need complex help?</h4>
                <p className="text-[11px] text-emerald-300/70 mb-3">If you are facing deposits or verification issues, our agents are ready to assist you.</p>
                <Badge className="bg-[#23FFC8] text-[#001d1f] font-extrabold px-3 py-1 text-xs">
                  Average Response Time: 5 Mins
                </Badge>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SideNavLayout>
  );
};

export default Chat;
