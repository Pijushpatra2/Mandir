"use client";

import React, { useState, useEffect, useRef } from "react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Send, Users, Tv, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isVIP?: boolean;
}

export default function LiveDarshanPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Ramesh Sharma", text: "Jai Sri Radhe Krishna! Beautiful Shringar today.", time: "11:42 AM", isVIP: true },
    { id: "2", user: "Sunita Iyengar", text: "Hare Krishna. Feels so peaceful to watch from home.", time: "11:43 AM" },
    { id: "3", user: "Vikram Shah", text: "Pranams to all the priests and devotees.", time: "11:43 AM" },
    { id: "4", user: "Meera Nair", text: "Radhe Radhe! Mangala Aarti was divine.", time: "11:44 AM" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate incoming messages from other devotees periodically
  useEffect(() => {
    const mockDevotees = ["Amit Patel", "Anjali Joshi", "Gaurav Goel", "Preeti Desai", "Kiran Nair"];
    const mockPhrases = [
      "Jai Sri Krishna! 🙏",
      "Hare Krishna Hare Rama! Beautiful broadcast.",
      "Pranam! Seeking blessings for my family.",
      "Radhe Radhe! Heartfelt thanks to the management.",
      "Aarti was wonderful. Jai Ho!"
    ];

    const interval = setInterval(() => {
      const randomUser = mockDevotees[Math.floor(Math.random() * mockDevotees.length)];
      const randomText = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newMsg = {
        id: Math.random().toString(),
        user: randomUser,
        text: randomText,
        time: now,
        isVIP: Math.random() > 0.7
      };
      
      setMessages((prev) => [...prev, newMsg]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Math.random().toString(),
      user: "You (Devotee)",
      text: input.trim(),
      time: now,
      isVIP: false
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
  };

  return (
    <div className="py-24 bg-bg-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Live broadcast"
          title="Virtual Darshan & Satsang"
          subtitle="Experience the divine sanctum of Sri Radhe Krishna Mandir in high-definition with live audio chanting."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Live Player Left */}
          <div className="lg:col-span-8">
            <GlassCard className="p-4 h-full flex flex-col justify-between border-primary-gold/20 shadow-xl">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Radhe Krishna Live Stream Broadcast"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-6 flex items-center justify-between px-2 pb-2">
                <div className="flex items-center space-x-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-error-red"></span>
                  </span>
                  <div>
                    <h4 className="font-heading text-xl font-medium text-dark-surface leading-none">
                      Deity Altar Stream
                    </h4>
                    <p className="text-[10px] text-secondary-bronze/70 font-sans mt-1">
                      Broadcasting Live • 1,240 Devotees Viewing
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-primary-gold bg-primary-gold/5 px-3 py-1.5 rounded-lg border border-primary-gold/15">
                  <Tv className="w-3.5 h-3.5" />
                  <span>1080p HD</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Interactive Chat Right */}
          <div className="lg:col-span-4">
            <GlassCard className="p-6 h-[550px] lg:h-full flex flex-col justify-between border-primary-gold/15 shadow-lg bg-white/95">
              
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-primary-gold/10">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary-gold" />
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary-bronze">
                    Devotee Live Chat
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold text-success-green bg-success-green/10 rounded">
                  ONLINE
                </span>
              </div>

              {/* Chat Message Scroll List */}
              <div className="flex-grow overflow-y-auto my-4 space-y-3 pr-2 scrollbar-thin">
                {messages.map((msg) => (
                  <div className="text-xs leading-relaxed" key={msg.id}>
                    <span className="text-[10px] text-secondary-bronze/55 block font-sans">
                      {msg.time}
                    </span>
                    <span
                      className={`font-semibold ${
                        msg.user === "You (Devotee)"
                          ? "text-primary-gold"
                          : msg.isVIP
                          ? "text-accent-purple"
                          : "text-dark-surface"
                      }`}
                    >
                      {msg.user}
                      {msg.isVIP && (
                        <span className="ml-1 text-[8px] font-bold uppercase bg-accent-purple/10 text-accent-purple px-1 rounded">
                          Patron
                        </span>
                      )}
                      :{" "}
                    </span>
                    <span className="text-secondary-bronze font-light font-sans">{msg.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-primary-gold/10">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type Hare Krishna message..."
                  className="flex-grow px-3 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-xl bg-primary-gold hover:bg-secondary-bronze text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </GlassCard>
          </div>

        </div>

      </div>
    </div>
  );
}
