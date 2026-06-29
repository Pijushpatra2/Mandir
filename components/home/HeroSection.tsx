"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Heart, Radio, Bell, Gift, ShoppingBag, Sparkles, HeartHandshake, Tv } from "lucide-react";
import { templeConfig } from "@/data/temple";

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] lg:min-h-[92vh] flex flex-col justify-between pt-28 font-jakarta overflow-hidden">
      
      {/* 1. Absolute Background Image with Precise Shifting & Fades */}
      <div className="absolute inset-0 -z-20 w-full h-full bg-[#FAF7F2]">
        <div className="absolute right-0 top-0 w-full lg:w-[62%] h-full">
          <img 
            src="/temple_hero_bg.png" 
            className="w-full h-full object-cover object-[72%_center] lg:object-[68%_center] xl:object-[65%_center] select-none" 
            alt="Shree Swaminarayan Temple Kampala Sunset Background" 
          />
          {/* Smooth Gradient Fades for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 lg:via-[#FAF7F2]/65 to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/90 to-black/15 lg:hidden" />
        </div>
      </div>

      {/* 2. Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex items-center mb-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full mt-6 lg:mt-0">
          
          {/* LEFT COLUMN: BRANDING & CALLS-TO-ACTION */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-left">
            
            {/* Title / Heading with Gold Gradient & Underline Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-[1.15] text-[#2B132C]">
                Your Devotion,<br />
                Our <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#B47F35] via-[#C59D5F] to-[#8B5E34] font-heading font-normal italic pr-2">
                  Responsibility
                  <span className="absolute bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#B47F35]/50 to-transparent rounded-full" />
                </span>
              </h1>

              {/* Decorative Gold Divider Line */}
              <div className="flex items-center space-x-3 w-40 py-2">
                <div className="h-[2px] bg-[#B47F35]/40 flex-grow" />
                <span className="text-[#B47F35] text-[9px] transform rotate-45 border border-[#B47F35]/60 p-0.5 flex items-center justify-center">✦</span>
                <div className="h-[2px] bg-[#B47F35]/40 w-10" />
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-xs sm:text-sm text-secondary-bronze leading-relaxed max-w-lg font-light font-sans"
            >
              {templeConfig.name} is a complete temple management platform that connects devotees with divine experiences through technology and tradition.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap gap-4 items-center"
            >
              {/* Pooja / Seva solid button */}
              <Link
                href="/services"
                className="px-6 py-3.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white font-semibold shadow-md transition-all text-xs flex items-center space-x-2 border border-transparent cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Pooja / Seva</span>
              </Link>

              {/* Donate Now outline button */}
              <Link
                href="/donations"
                className="px-6 py-3.5 rounded-xl border border-[#B47F35]/50 bg-white/70 hover:bg-white text-[#B47F35] font-semibold transition-all text-xs flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-transparent" />
                <span>Donate Now</span>
              </Link>
            </motion.div>

            {/* Devotee circular avatar counter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center space-x-3 pt-3 border-t border-[#B47F35]/10 max-w-sm"
            >
              {/* Avatars Stack */}
              <div className="flex -space-x-2">
                <img 
                  className="w-7 h-7 rounded-full border border-white object-cover" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
                  alt="Devotee" 
                />
                <img 
                  className="w-7 h-7 rounded-full border border-white object-cover" 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" 
                  alt="Devotee" 
                />
                <img 
                  className="w-7 h-7 rounded-full border border-white object-cover" 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" 
                  alt="Devotee" 
                />
                <img 
                  className="w-7 h-7 rounded-full border border-white object-cover" 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" 
                  alt="Devotee" 
                />
              </div>
              <p className="text-[10px] text-secondary-bronze/85 font-medium font-sans">
                Join <span className="font-bold text-dark-surface">50,000+ devotees</span> across <span className="font-bold text-dark-surface">500+ temples</span>
              </p>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: FLOATING MENU ACTIONS CARD */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-[28px] p-6 lg:p-7 shadow-2xl border border-white/50 w-full max-w-[320px] space-y-4"
            >
              {/* Row 1: Live Darshan */}
              <Link 
                href="/live-darshan" 
                className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-white/50 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] group-hover:bg-[#B47F35] group-hover:text-white transition-colors shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-dark-surface tracking-wide">Live Darshan</h4>
                  <p className="text-[9px] text-[#B47F35] font-bold uppercase tracking-wider mt-0.5">Watch Live</p>
                </div>
              </Link>

              {/* Divider */}
              <div className="h-[1px] bg-[#B47F35]/10 mx-2" />

              {/* Row 2: Aarti Timings */}
              <Link 
                href="/darshan" 
                className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-white/50 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] group-hover:bg-[#B47F35] group-hover:text-white transition-colors shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-dark-surface tracking-wide">Aarti Timings</h4>
                  <p className="text-[9px] text-[#B47F35] font-bold uppercase tracking-wider mt-0.5">View Today&apos;s Schedule</p>
                </div>
              </Link>

              {/* Divider */}
              <div className="h-[1px] bg-[#B47F35]/10 mx-2" />

              {/* Row 3: Today's Prasad */}
              <Link 
                href="/shop" 
                className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-white/50 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] group-hover:bg-[#B47F35] group-hover:text-white transition-colors shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-dark-surface tracking-wide">Today&apos;s Prasad</h4>
                  <p className="text-[9px] text-[#B47F35] font-bold uppercase tracking-wider mt-0.5">Order Now</p>
                </div>
              </Link>
            </motion.div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM BANNER: QUICK SERVICES LINKS (FLOAT & GLASSMORPHISM) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pb-8 mt-12">
        <div className="bg-white/45 backdrop-blur-md border border-white/35 rounded-3xl lg:rounded-[36px] shadow-2xl p-6 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 items-stretch">
            
            {/* Quick link 1: Pooja */}
            <Link href="/services" className="flex flex-col items-center group space-y-2 text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] bg-white/60 backdrop-blur-sm group-hover:bg-[#B47F35] group-hover:text-white transition-all shadow-md shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-dark-surface leading-tight">Pooja & Seva</p>
                <p className="text-[9px] text-secondary-bronze/60 mt-0.5">Booking</p>
              </div>
            </Link>

            {/* Quick link 2: Donations */}
            <Link href="/donations" className="flex flex-col items-center group space-y-2 text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] bg-white/60 backdrop-blur-sm group-hover:bg-[#B47F35] group-hover:text-white transition-all shadow-md shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-dark-surface leading-tight">Online</p>
                <p className="text-[9px] text-secondary-bronze/60 mt-0.5">Donations</p>
              </div>
            </Link>

            {/* Quick link 3: Live Darshan */}
            <Link href="/live-darshan" className="flex flex-col items-center group space-y-2 text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] bg-white/60 backdrop-blur-sm group-hover:bg-[#B47F35] group-hover:text-white transition-all shadow-md shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-dark-surface leading-tight">Live Darshan &</p>
                <p className="text-[9px] text-secondary-bronze/60 mt-0.5">Aarti</p>
              </div>
            </Link>

            {/* Quick link 4: Prasad */}
            <Link href="/shop" className="flex flex-col items-center group space-y-2 text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] bg-white/60 backdrop-blur-sm group-hover:bg-[#B47F35] group-hover:text-white transition-all shadow-md shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-dark-surface leading-tight">Prasad</p>
                <p className="text-[9px] text-secondary-bronze/60 mt-0.5">Delivery</p>
              </div>
            </Link>

            {/* Quick link 5: Shopping */}
            <Link href="/shop" className="flex flex-col items-center group space-y-2 text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] bg-white/60 backdrop-blur-sm group-hover:bg-[#B47F35] group-hover:text-white transition-all shadow-md shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-dark-surface leading-tight">Temple Store</p>
                <p className="text-[9px] text-secondary-bronze/60 mt-0.5">Shopping</p>
              </div>
            </Link>

            {/* Quick link 6: Events */}
            <Link href="/events" className="flex flex-col items-center group space-y-2 text-center cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] bg-white/60 backdrop-blur-sm group-hover:bg-[#B47F35] group-hover:text-white transition-all shadow-md shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-dark-surface leading-tight">Event & Festival</p>
                <p className="text-[9px] text-secondary-bronze/60 mt-0.5">Updates</p>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
