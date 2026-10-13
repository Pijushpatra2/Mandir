"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Radio, Tv } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useCmsPage, formatYoutubeEmbedUrl } from "@/lib/cms";
import { DEFAULT_HOME_CONTENT } from "@/data/cmsDefaults";

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
  const { content: cms } = useCmsPage("home", DEFAULT_HOME_CONTENT);
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

  const rawUrl = cms.live_darshan?.liveStreamUrl;
  const embedUrl = formatYoutubeEmbedUrl(rawUrl);
  const isLive = cms.live_darshan?.isLive ?? true;

  return (
    <section className="py-24 bg-[#1F0E1F] text-white relative overflow-hidden font-poppins">
      
      {/* Background decoration details */}
      <div className="absolute top-10 left-10 text-white/5 text-9xl pointer-events-none select-none">✨</div>
      <div className="absolute bottom-10 right-10 text-white/5 text-9xl pointer-events-none select-none">✨</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Dynamic from CMS) */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-primary-gold text-xs">⚜️</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary-gold font-poppins">
              {cms.live_darshan?.badge || "SACRED BROADCAST"}
            </span>
            <span className="text-primary-gold text-xs">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white">
            {cms.live_darshan?.title || "Virtual Shrine & Live Darshan"}
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-primary-gold/30 w-8" />
            <span className="text-primary-gold text-xs">✦</span>
            <div className="h-[1.5px] bg-primary-gold/30 w-8" />
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed font-normal font-poppins max-w-xl mx-auto">
            {cms.live_darshan?.subtitle || "Connect online and feel the divine energy. Watch live broadcasts from the main shrine at Kampala."}
          </p>
        </div>

        {/* Layout Grid: Left Video Player (Full Width Rectangular), Right Chants Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* LEFT: FULL-WIDTH RECTANGULAR PLAYER CONTAINER */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            {embedUrl ? (
              <div className="relative w-full aspect-video rounded-3xl border border-primary-gold/25 overflow-hidden shadow-2xl bg-black group">
                {isLive && (
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-600/90 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>LIVE DARSHAN</span>
                  </div>
                )}
                {/* Embed video broadcast player */}
                <iframe
                  className="w-full h-full object-cover select-none"
                  src={`${embedUrl}?autoplay=1&mute=1&rel=0`}
                  title={cms.live_darshan?.streamTitle || "Swaminarayan Live Stream Broadcast"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-3xl border border-primary-gold/25 overflow-hidden shadow-2xl bg-gradient-to-br from-[#2D162B] via-[#1F0E1F] to-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary-gold/10 border border-primary-gold/30 flex items-center justify-center text-primary-gold mb-4 shadow-inner">
                  <Tv className="w-8 h-8 text-[#C59D5F] animate-pulse" />
                </div>
                <h4 className="text-xl sm:text-2xl font-heading font-bold text-white mb-2">
                  {cms.live_darshan?.streamTitle || "Daily Sacred Darshan"}
                </h4>
                <p className="text-xs sm:text-sm text-white/70 max-w-md mb-4">
                  {cms.live_darshan?.scheduleNote || "Streaming daily morning Mangala Aarti (6:00 AM) and evening Sandhya Aarti (6:45 PM EAT)."}
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                  <span>⚡ Broadcast stream offline — check back during scheduled Aarti timings</span>
                </div>
              </div>
            )}

            {/* Broadcast Details Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-white/80 px-1">
              <span className="font-semibold text-white flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isLive ? "text-red-400 animate-pulse" : "text-amber-400"}`} />
                {cms.live_darshan?.streamTitle || "Daily Sacred Darshan Live Stream"}
              </span>
              {cms.live_darshan?.scheduleNote && (
                <span className="text-primary-gold/90 font-medium">
                  ⏰ {cms.live_darshan.scheduleNote}
                </span>
              )}
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
                  <Radio className="w-5 h-5 animate-pulse" />
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-wide">
                    Live Temple Feed
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal font-poppins">
                  Join other devotees from around the world in experiencing daily prayers, aartis, and spiritual events online.
                </p>
              </div>

              {/* Devotee Chants Marquee Box */}
              <div className="space-y-3 border-t border-white/10 pt-4 text-left">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-gold font-poppins">
                  Devotee Chants
                </h4>
                
                {/* Scrolling Box Container */}
                <div className="h-[140px] overflow-hidden relative bg-black/30 rounded-2xl border border-white/5 p-4 space-y-3">
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#1F0E1F]/30 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#1F0E1F]/30 to-transparent pointer-events-none" />
                  
                  {chatFeed.slice(0, 3).map((item, idx) => (
                    <div className="text-xs sm:text-sm font-poppins flex items-start space-x-2 animate-fadeIn" key={idx}>
                      <span className="font-bold text-[#C59D5F] shrink-0">{item.name}:</span>
                      <span className="text-white/90 font-normal">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portal redirect links */}
              <div>
                <Link
                  href="/live-darshan"
                  className="w-full py-3.5 rounded-xl bg-primary-gold hover:bg-secondary-bronze text-white text-sm sm:text-base font-bold shadow flex items-center justify-center space-x-2 transition-colors cursor-pointer font-poppins"
                >
                  <span>Go to Full Shrine Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </GlassCard>
          </div>

        </div>
      </div>
    </section>
  );
}
