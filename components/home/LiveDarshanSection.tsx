"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const CHANTS = [
  { name: "Prashant (Kampala)", text: "Jai Shree Swaminarayan! 🙏" },
  { name: "Meera (Entebbe)", text: "Beautiful Shringar darshan today." },
  { name: "Vijay (Jinja)", text: "Harikrishna Maharaj ki jai! 🌸" },
  { name: "Dinesh (Nairobi)", text: "Salutations from Kenya." },
  { name: "Sita (London)", text: "Shanti Shanti Shanti." },
  { name: "Aarav (Kampala)", text: "Divine Aarti audio is so peaceful." },
  { name: "Pooja (Mumbai)", text: "Jai Ghanshyam Maharaj!" }
];

export function LiveDarshanSection() {
  // Devotee Chants marquee ticker
  const [chatFeed, setChatFeed] = useState(CHANTS);

  // Periodic scrolling chat feed simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setChatFeed(prev => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-[#1F0E1F] text-white relative overflow-hidden font-jakarta">
      
      {/* Background decoration details */}
      <div className="absolute top-10 left-10 text-white/5 text-9xl pointer-events-none select-none">✨</div>
      <div className="absolute bottom-10 right-10 text-white/5 text-9xl pointer-events-none select-none">✨</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-primary-gold text-[8px]">⚜️</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-gold">
              SACRED BROADCAST
            </span>
            <span className="text-primary-gold text-[8px]">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white">
            Virtual Shrine <span className="text-primary-gold font-normal italic">& Live Darshan</span>
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-primary-gold/30 w-6" />
            <span className="text-primary-gold text-[7px]">✦</span>
            <div className="h-[1.5px] bg-primary-gold/30 w-6" />
          </div>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light font-sans max-w-xl mx-auto">
            Connect online and feel the divine energy. Watch live broadcasts from the main shrine at Kampala.
          </p>
        </div>

        {/* Layout Grid: Left Video Player (Full Width Rectangular), Right Chants Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* LEFT: FULL-WIDTH RECTANGULAR PLAYER CONTAINER */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="relative w-full aspect-video rounded-3xl border border-primary-gold/25 overflow-hidden shadow-2xl bg-black">
              {/* Embed video broadcast player (Standard Full Rectangular View) */}
              <iframe
                className="w-full h-full object-cover select-none"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                title="Swaminarayan Live Stream Broadcast"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* RIGHT: DEVOTEE CHANTS & FULL STREAM CTAS */}
          <div className="lg:col-span-4 h-full flex flex-col justify-between">
            <GlassCard 
              hoverEffect={false} 
              className="bg-white/5 backdrop-blur-md border-white/10 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between h-full space-y-6"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-2 text-primary-gold">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <h3 className="font-heading text-base font-bold text-white tracking-wide">
                    Live Temple Feed
                  </h3>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-light font-sans">
                  Join other devotees from around the world in experiencing daily prayers, aartis, and spiritual events online.
                </p>
              </div>

              {/* Devotee Chants Marquee Box */}
              <div className="space-y-3 border-t border-white/10 pt-4 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                  Devotee Chants
                </h4>
                
                {/* Scrolling Box Container */}
                <div className="h-[120px] overflow-hidden relative bg-black/25 rounded-2xl border border-white/5 p-3.5 space-y-2">
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#1F0E1F]/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#1F0E1F]/20 to-transparent pointer-events-none" />
                  
                  {chatFeed.slice(0, 3).map((item, idx) => (
                    <div className="text-[10px] font-sans flex items-start space-x-1.5 animate-fadeIn" key={idx}>
                      <span className="font-bold text-[#C59D5F] shrink-0">{item.name}:</span>
                      <span className="text-white/80 font-light">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portal redirect links */}
              <div>
                <Link
                  href="/live-darshan"
                  className="w-full py-3 rounded-xl bg-primary-gold hover:bg-secondary-bronze text-white text-[11px] font-bold shadow flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>Go to Full Shrine Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </GlassCard>
          </div>

        </div>
      </div>
    </section>
  );
}
