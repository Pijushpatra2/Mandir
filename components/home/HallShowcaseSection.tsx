"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Sparkles, Wind, ChefHat, Calculator, HelpCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const GALLERY_PHOTOS = {
  hall: {
    title: "Grand Banquet Hall",
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
    desc: "1200+ capacity auditorium with elevated royal stage and lighting."
  },
  dining: {
    title: "Devotional Dining Area",
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    desc: "Separate spacious dining hall equipped for pure vegetarian catering."
  }
};

export function HallShowcaseSection() {
  const [activeTab, setActiveTab] = useState<"hall" | "dining">("hall");
  
  // Calculator States
  const [eventType, setEventType] = useState<"marriage" | "satsang" | "cultural">("marriage");
  const [duration, setDuration] = useState<"half" | "full">("full");

  // Price estimate logic
  const getEstimatedPrice = () => {
    let base = 0;
    if (eventType === "marriage") base = 1200;
    else if (eventType === "satsang") base = 400;
    else if (eventType === "cultural") base = 750;

    if (duration === "half") {
      base = Math.round(base * 0.65);
    }
    
    const cleaningFee = 100;
    const safetyDeposit = Math.round(base * 0.2);
    const total = base + cleaningFee + safetyDeposit;

    return { base, cleaningFee, safetyDeposit, total };
  };

  const priceBreakdown = getEstimatedPrice();

  return (
    <section className="py-24 bg-bg-warm font-jakarta relative overflow-hidden">
      
      {/* Background soft watermarks */}
      <div className="absolute top-10 left-10 text-[#B47F35]/5 text-9xl pointer-events-none select-none">🕉️</div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35]">
              INFRASTRUCTURES & AMENITIES
            </span>
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C]">
            Shree Swaminarayan <span className="text-[#B47F35] font-normal italic">Hall</span>
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
            <span className="text-[#B47F35] text-[7px]">✦</span>
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
          </div>

          <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-light font-sans max-w-xl mx-auto">
            Sponsor weddings, thread ceremonies, and devotional seminars in our air-conditioned hall capable of hosting 1200+ guests.
          </p>
        </div>

        {/* Layout Grid: Left Gallery Tabs, Right Details & Planner Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch max-w-6xl mx-auto">
          
          {/* LEFT: INTERACTIVE IMAGE SLIDER & AMENITIES */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-xl border border-[#B47F35]/15 bg-white p-2">
              <div className="relative w-full h-full rounded-[26px] overflow-hidden">
                <img 
                  src={GALLERY_PHOTOS[activeTab].url} 
                  alt={GALLERY_PHOTOS[activeTab].title} 
                  className="w-full h-full object-cover select-none transition-all duration-700 hover:scale-105"
                />
                
                {/* Photo Description Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 text-left text-white">
                  <h4 className="text-xs font-bold tracking-wide text-primary-gold uppercase">
                    {GALLERY_PHOTOS[activeTab].title}
                  </h4>
                  <p className="text-[10px] text-white/80 font-light mt-1 leading-snug">
                    {GALLERY_PHOTOS[activeTab].desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Tabs Toggle */}
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("hall")}
                className={`w-full py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "hall" 
                    ? "border-[#B47F35] bg-[#B47F35]/10 text-[#B47F35]" 
                    : "border-primary-gold/15 bg-white text-secondary-bronze hover:bg-bg-warm/50"
                }`}
              >
                Banquet Hall View
              </button>
              <button
                onClick={() => setActiveTab("dining")}
                className={`w-full py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "dining" 
                    ? "border-[#B47F35] bg-[#B47F35]/10 text-[#B47F35]" 
                    : "border-primary-gold/15 bg-white text-secondary-bronze hover:bg-bg-warm/50"
                }`}
              >
                Dining Hall View
              </button>
            </div>

            {/* Core Specs badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-primary-gold/15 bg-white p-3 rounded-2xl text-center flex flex-col items-center">
                <Users className="w-5 h-5 text-[#B47F35] mb-1.5" />
                <p className="text-xs font-bold text-dark-surface leading-none">1200+</p>
                <p className="text-[8px] uppercase tracking-wider text-secondary-bronze/60 mt-1">Capacity</p>
              </div>
              <div className="border border-primary-gold/15 bg-white p-3 rounded-2xl text-center flex flex-col items-center">
                <Wind className="w-5 h-5 text-[#B47F35] mb-1.5" />
                <p className="text-xs font-bold text-dark-surface leading-none">Central AC</p>
                <p className="text-[8px] uppercase tracking-wider text-secondary-bronze/60 mt-1">Air Flow</p>
              </div>
              <div className="border border-primary-gold/15 bg-white p-3 rounded-2xl text-center flex flex-col items-center">
                <ChefHat className="w-5 h-5 text-[#B47F35] mb-1.5" />
                <p className="text-xs font-bold text-dark-surface leading-none">Pure Veg</p>
                <p className="text-[8px] uppercase tracking-wider text-secondary-bronze/60 mt-1">Catering</p>
              </div>
            </div>

          </div>

          {/* RIGHT: INTERACTIVE PLANNER & BOOKING ESTIMATOR */}
          <div className="lg:col-span-6">
            <GlassCard 
              hoverEffect={false} 
              className="bg-white border-primary-gold/15 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between h-full space-y-6 text-left"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#B47F35]">
                  <Calculator className="w-5 h-5" />
                  <h3 className="font-heading text-base font-bold text-[#2B132C] tracking-wide">
                    Live Booking Planner
                  </h3>
                </div>
                <p className="text-xs text-secondary-bronze leading-relaxed font-light">
                  Select your ceremony specifications below to get a real-time reservation rate estimate.
                </p>

                {/* Estimate Options Form */}
                <div className="space-y-4 pt-2">
                  {/* Event Type Select */}
                  <div>
                    <label className="text-[10px] font-bold text-[#B47F35] uppercase tracking-wider block mb-2">
                      Event Ceremony Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setEventType("marriage")}
                        className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                          eventType === "marriage" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Wedding
                      </button>
                      <button
                        onClick={() => setEventType("cultural")}
                        className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                          eventType === "cultural" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Cultural
                      </button>
                      <button
                        onClick={() => setEventType("satsang")}
                        className={`py-2 px-1 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                          eventType === "satsang" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Satsang
                      </button>
                    </div>
                  </div>

                  {/* Slot Duration Select */}
                  <div>
                    <label className="text-[10px] font-bold text-[#B47F35] uppercase tracking-wider block mb-2">
                      Reservation Slot Duration
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDuration("full")}
                        className={`py-2 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                          duration === "full" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Full Day (8 AM - 11 PM)
                      </button>
                      <button
                        onClick={() => setDuration("half")}
                        className={`py-2 rounded-lg border text-[10px] font-bold transition-all text-center cursor-pointer ${
                          duration === "half" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Half Day (6 Hours slot)
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Estimate Calculations display */}
              <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-secondary-bronze/85">
                  <span>Base Booking Rate:</span>
                  <span className="font-bold text-dark-surface">${priceBreakdown.base}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary-bronze/85">
                  <span>Sanitization & Cleaning:</span>
                  <span className="font-bold text-dark-surface">${priceBreakdown.cleaningFee}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary-bronze/85">
                  <span>Refundable Safety Deposit:</span>
                  <span className="font-bold text-dark-surface">${priceBreakdown.safetyDeposit}</span>
                </div>
                <div className="h-[1.5px] bg-[#B47F35]/15 my-2" />
                <div className="flex justify-between text-sm text-[#2B132C] font-bold">
                  <span>Total Estimated Quote:</span>
                  <span className="text-[#B47F35] font-heading font-bold">${priceBreakdown.total}</span>
                </div>
              </div>

              {/* Actions row */}
              <div>
                <Link
                  href={`/hall-booking?type=${eventType}&duration=${duration}`}
                  className="w-full py-3 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Proceed to Reservation Portal</span>
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
