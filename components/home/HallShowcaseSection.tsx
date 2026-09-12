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
    <section className="py-24 bg-bg-warm font-poppins relative overflow-hidden">
      
      {/* Background soft watermarks */}
      <div className="absolute top-10 left-10 text-[#B47F35]/5 text-9xl pointer-events-none select-none">🕉️</div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[#B47F35] text-xs">⚜️</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#B47F35] font-poppins">
              INFRASTRUCTURES & AMENITIES
            </span>
            <span className="text-[#B47F35] text-xs">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C]">
            Shree Swaminarayan <span className="text-[#B47F35] font-normal italic">Hall</span>
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
            <span className="text-[#B47F35] text-xs">✦</span>
            <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-secondary-bronze leading-relaxed font-normal font-poppins max-w-xl mx-auto">
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 text-left text-white font-poppins">
                  <h4 className="text-sm sm:text-base font-bold tracking-wide text-primary-gold uppercase">
                    {GALLERY_PHOTOS[activeTab].title}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/90 font-normal mt-1 leading-snug">
                    {GALLERY_PHOTOS[activeTab].desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Tabs Toggle */}
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("hall")}
                className={`w-full py-3.5 rounded-xl border text-sm sm:text-base font-bold transition-all cursor-pointer font-poppins ${
                  activeTab === "hall" 
                    ? "border-[#B47F35] bg-[#B47F35]/10 text-[#B47F35]" 
                    : "border-primary-gold/15 bg-white text-secondary-bronze hover:bg-bg-warm/50"
                }`}
              >
                Banquet Hall View
              </button>
              <button
                onClick={() => setActiveTab("dining")}
                className={`w-full py-3.5 rounded-xl border text-sm sm:text-base font-bold transition-all cursor-pointer font-poppins ${
                  activeTab === "dining" 
                    ? "border-[#B47F35] bg-[#B47F35]/10 text-[#B47F35]" 
                    : "border-primary-gold/15 bg-white text-secondary-bronze hover:bg-bg-warm/50"
                }`}
              >
                Dining Hall View
              </button>
            </div>

            {/* Core Specs badges */}
            <div className="grid grid-cols-3 gap-4 font-poppins">
              <div className="border border-primary-gold/15 bg-white p-4 rounded-2xl text-center flex flex-col items-center">
                <Users className="w-6 h-6 text-[#B47F35] mb-2" />
                <p className="text-sm sm:text-base font-bold text-dark-surface leading-none font-poppins">1200+</p>
                <p className="text-xs sm:text-sm uppercase tracking-wider text-secondary-bronze/70 mt-1.5 font-medium font-poppins">Capacity</p>
              </div>
              <div className="border border-primary-gold/15 bg-white p-4 rounded-2xl text-center flex flex-col items-center">
                <Wind className="w-6 h-6 text-[#B47F35] mb-2" />
                <p className="text-sm sm:text-base font-bold text-dark-surface leading-none font-poppins">Central AC</p>
                <p className="text-xs sm:text-sm uppercase tracking-wider text-secondary-bronze/70 mt-1.5 font-medium font-poppins">Air Flow</p>
              </div>
              <div className="border border-primary-gold/15 bg-white p-4 rounded-2xl text-center flex flex-col items-center">
                <ChefHat className="w-6 h-6 text-[#B47F35] mb-2" />
                <p className="text-sm sm:text-base font-bold text-dark-surface leading-none font-poppins">Pure Veg</p>
                <p className="text-xs sm:text-sm uppercase tracking-wider text-secondary-bronze/70 mt-1.5 font-medium font-poppins">Catering</p>
              </div>
            </div>

          </div>

          {/* RIGHT: INTERACTIVE PLANNER & BOOKING ESTIMATOR */}
          <div className="lg:col-span-6">
            <GlassCard 
              hoverEffect={false} 
              className="bg-white border-primary-gold/15 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between h-full space-y-6 text-left font-poppins"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-[#B47F35]">
                  <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#2B132C] tracking-wide">
                    Live Booking Planner
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-normal">
                  Select your ceremony specifications below to get a real-time reservation rate estimate.
                </p>

                {/* Estimate Options Form */}
                <div className="space-y-4 pt-2">
                  {/* Event Type Select */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block mb-2 font-poppins">
                      Event Ceremony Type
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <button
                        onClick={() => setEventType("marriage")}
                        className={`py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer font-poppins ${
                          eventType === "marriage" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Wedding
                      </button>
                      <button
                        onClick={() => setEventType("cultural")}
                        className={`py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer font-poppins ${
                          eventType === "cultural" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Cultural
                      </button>
                      <button
                        onClick={() => setEventType("satsang")}
                        className={`py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer font-poppins ${
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
                    <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block mb-2 font-poppins">
                      Reservation Slot Duration
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setDuration("full")}
                        className={`py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer font-poppins ${
                          duration === "full" 
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze/80"
                        }`}
                      >
                        Full Day (8 AM - 11 PM)
                      </button>
                      <button
                        onClick={() => setDuration("half")}
                        className={`py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer font-poppins ${
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
              <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-5 space-y-2.5 font-poppins">
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/90">
                  <span>Base Booking Rate:</span>
                  <span className="font-bold text-dark-surface">${priceBreakdown.base}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/90">
                  <span>Sanitization & Cleaning:</span>
                  <span className="font-bold text-dark-surface">${priceBreakdown.cleaningFee}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/90">
                  <span>Refundable Safety Deposit:</span>
                  <span className="font-bold text-dark-surface">${priceBreakdown.safetyDeposit}</span>
                </div>
                <div className="h-[1.5px] bg-[#B47F35]/15 my-2.5" />
                <div className="flex justify-between text-base sm:text-lg text-[#2B132C] font-bold">
                  <span>Total Estimated Quote:</span>
                  <span className="text-[#B47F35] font-heading font-bold text-lg sm:text-xl">${priceBreakdown.total}</span>
                </div>
              </div>

              {/* Actions row */}
              <div>
                <Link
                  href={`/booking?type=hall&eventType=${eventType}&duration=${duration}`}
                  className="w-full py-3.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-sm sm:text-base font-semibold shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer font-poppins"
                >
                  <span>Proceed to Reservation Portal</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>

            </GlassCard>
          </div>

        </div>
      </div>
    </section>
  );
}
