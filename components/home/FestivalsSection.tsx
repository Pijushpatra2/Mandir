"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Sparkles, CheckCircle2, UserCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";

export function FestivalsSection() {
  const { events } = useApp();

  // Filter upcoming festivals
  const upcomingFestivals = events.filter(
    (e) => e.category === "Festival" && e.status === "Upcoming"
  );

  // Janmashtami as Featured (using our generated banner)
  const featuredFestival = upcomingFestivals.find((e) => e.id === "evt-1") || upcomingFestivals[0];
  
  // Other secondary festivals
  const secondaryFestivals = upcomingFestivals.filter((e) => e.id !== featuredFestival?.id).slice(0, 2);

  return (
    <section className="py-24 bg-bg-warm font-jakarta relative overflow-hidden">
      
      {/* Background Soft Gradients */}
      <div className="absolute top-1/4 -left-32 w-[350px] h-[350px] rounded-full bg-primary-gold/5 filter blur-3xl -z-10" />
      <div className="absolute bottom-1/4 -right-32 w-[350px] h-[350px] rounded-full bg-secondary-bronze/5 filter blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35]">
              DIVINE CELEBRATIONS
            </span>
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C]">
            Upcoming Celebrations <span className="text-[#B47F35] font-normal italic">& Festivals</span>
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
            <span className="text-[#B47F35] text-[7px]">✦</span>
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
          </div>

          <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-light font-sans max-w-xl mx-auto">
            Participate in spectacular seasonal gatherings, holy rites, cultural pageantry, and community feasts with SKSS Kampala.
          </p>
        </div>

        {/* Grid: Left Column (Featured Banner), Right Column (Secondary Stack) */}
        {featuredFestival && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* LEFT SIDE: FEATURED FESTIVAL (8 Columns wide on desktop) */}
            <div className="lg:col-span-8 flex flex-col">
              <GlassCard 
                hoverEffect={false} 
                className="overflow-hidden p-0 flex flex-col md:flex-row h-full rounded-[32px] bg-white border-primary-gold/15 shadow-md flex-grow"
              >
                {/* Banner Image Side (with generated image) */}
                <div className="relative w-full md:w-1/2 min-h-[250px] md:min-h-full overflow-hidden shrink-0 group">
                  <img 
                    src="/festival_bg.png" 
                    alt={featuredFestival.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none" 
                  />
                  {/* Floating Date Badge */}
                  <div className="absolute top-5 left-5 px-3.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#B47F35] border border-[#B47F35]/25 shadow-md flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredFestival.date}</span>
                  </div>
                </div>

                {/* Info Details Side */}
                <div className="p-8 md:p-10 flex flex-col justify-between flex-grow text-left">
                  <div className="space-y-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#B47F35] bg-[#B47F35]/10 px-2.5 py-1 rounded-md border border-[#B47F35]/15">
                      Featured Festival
                    </span>
                    
                    <h3 className="text-2xl font-heading font-bold text-[#2B132C] leading-snug">
                      {featuredFestival.title}
                    </h3>
                    
                    <p className="text-xs text-secondary-bronze/85 leading-relaxed font-light">
                      {featuredFestival.description}
                    </p>

                    {/* Ritual Highlights list */}
                    <div className="space-y-2 pt-2 border-t border-primary-gold/10">
                      <p className="text-[10px] font-bold text-[#B47F35] uppercase tracking-wider">
                        Ritual Highlights:
                      </p>
                      <ul className="grid grid-cols-1 gap-2 text-xs font-medium text-dark-surface/85">
                        <li className="flex items-center space-x-2 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B47F35] shrink-0" />
                          <span>Maha Abhishek Seva (10:00 PM)</span>
                        </li>
                        <li className="flex items-center space-x-2 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B47F35] shrink-0" />
                          <span>Midnight Janma Aarti (12:00 AM)</span>
                        </li>
                        <li className="flex items-center space-x-2 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B47F35] shrink-0" />
                          <span>Grand Prasadam Feast to all Devotees</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-primary-gold/10 mt-6">
                    <Link
                      href="/events"
                      className="px-5 py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold shadow-md transition-colors flex items-center space-x-1"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Register Free Pass</span>
                    </Link>
                    <Link
                      href="/services"
                      className="px-5 py-2.5 rounded-xl border border-[#B47F35]/40 text-[#B47F35] hover:bg-bg-warm/30 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sponsor Pooja Seva</span>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* RIGHT SIDE: SECONDARY FESTIVALS STACK (4 Columns wide on desktop) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {secondaryFestivals.map((fest, idx) => (
                <GlassCard 
                  hoverEffect 
                  key={fest.id}
                  className="bg-white border-primary-gold/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between flex-grow"
                >
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#B47F35] bg-[#B47F35]/10 px-2 py-0.5 rounded border border-[#B47F35]/15">
                        Upcoming
                      </span>
                      <span className="text-[10px] text-secondary-bronze/75 font-semibold flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-[#B47F35]" />
                        {fest.date}
                      </span>
                    </div>

                    <h4 className="text-base font-heading font-bold text-[#2B132C] leading-snug">
                      {fest.title}
                    </h4>
                    
                    <p className="text-[11px] text-secondary-bronze/85 font-light leading-relaxed font-sans line-clamp-3">
                      {fest.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary-gold/10 mt-4 text-[10px]">
                    <span className="font-medium text-secondary-bronze/60">
                      Time: {fest.time}
                    </span>
                    <Link
                      href="/events"
                      className="font-bold text-[#B47F35] hover:text-[#8B5E34] transition-colors flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
