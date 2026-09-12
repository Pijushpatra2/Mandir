"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Flame,
  Sun,
  Moon,
  Heart,
  Radio,
  Calendar,
  FileText,
  Utensils,
  ArrowRight
} from "lucide-react";
import { templeConfig } from "@/data/temple";

export function HeroSection() {
  const darshanSchedule = [
    {
      name: "Mangala Aarti",
      time: "6:00 AM",
      icon: Flame,
    },
    {
      name: "Raj Bhog Aarti",
      time: "12:30 PM",
      icon: Sun,
    },
    {
      name: "Sandhya Aarti",
      time: "6:30 PM",
      icon: Moon,
    },
  ];

  const quickServices = [
    {
      label: "Book Pooja",
      href: "/services",
      icon: Flame,
    },
    {
      label: "Donate",
      href: "/donations",
      icon: Heart,
    },
    {
      label: "Live Darshan",
      href: "/live-darshan",
      icon: Radio,
    },
    {
      label: "Events",
      href: "/events",
      icon: Calendar,
    },
    {
      label: "E-Receipt",
      href: "/user-dashboard/donations",
      icon: FileText,
    },
    {
      label: "Prasad Seva",
      href: "/shop",
      icon: Utensils,
    },
  ];

  return (
    <section className="relative min-h-[100vh] lg:min-h-[94vh] flex flex-col justify-between pt-24 sm:pt-28 font-jakarta overflow-hidden bg-[#FAF7F2]">
      
      {/* 1. Background Temple Image with Smooth Left Fade */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden pointer-events-none select-none">
        <div className="absolute right-0 top-0 w-full lg:w-[62%] xl:w-[58%] h-full">
          <img
            src="/images/hero-temple.jpg"
            className="w-full h-full object-cover object-center lg:object-right select-none"
            alt="Shree Swaminarayan Temple Kampala Heritage"
          />
          {/* Smooth Left Gradient Blend on Desktop */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/30 to-transparent hidden lg:block" />
          {/* Gentle Top Fade on Mobile to keep text readable while showing temple */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/60 to-[#FAF7F2]/20 lg:hidden" />
        </div>
      </div>

      {/* 2. Main Hero Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex items-center z-10 my-auto py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full">
          
          {/* LEFT COLUMN: HEADLINE, SUBTITLE & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[66px] font-heading font-bold text-[#2B132C] leading-[1.12] tracking-tight">
                Your Devotion,<br />
                Our <span className="font-heading font-normal italic text-[#C59D5F] inline-block">Responsibility</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-base sm:text-lg md:text-xl text-secondary-bronze/90 leading-relaxed max-w-xl font-poppins font-normal"
            >
              Experience divine blessings, book services, join events, and stay connected with your temple, anytime, anywhere.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-wrap gap-4 items-center pt-2"
            >
              {/* Primary Solid Button */}
              <Link
                href="/services"
                className="px-8 sm:px-9 py-4 rounded-full bg-[#B47F35] hover:bg-[#976426] text-white font-medium text-sm sm:text-base md:text-lg shadow-lg shadow-[#B47F35]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center cursor-pointer"
              >
                Book a Service
              </Link>

              {/* Secondary Outline Button */}
              <Link
                href="/darshan"
                className="px-8 sm:px-9 py-4 rounded-full border-2 border-[#B47F35] text-[#2B132C] bg-white/40 hover:bg-white hover:text-[#B47F35] font-medium text-sm sm:text-base md:text-lg shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center cursor-pointer"
              >
                Explore More
              </Link>
            </motion.div>

            {/* Devotee Social Proof Avatars */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex items-center space-x-3.5 pt-3"
            >
              <div className="flex -space-x-2.5">
                <img
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Devotee"
                />
                <img
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Devotee"
                />
                <img
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Devotee"
                />
                <img
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                  alt="Devotee"
                />
              </div>
              <p className="text-sm sm:text-base md:text-lg text-secondary-bronze/90 font-medium font-poppins">
                Joined by <span className="font-bold text-[#2B132C]">25K+</span> Devotees
              </p>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: FLOATING UPCOMING DARSHAN CARD */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/80 w-full max-w-[360px] space-y-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#2B132C] tracking-tight">
                Upcoming Darshan
              </h3>

              <div className="space-y-4">
                {darshanSchedule.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 group">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FAF3E8] border border-[#B47F35]/20 flex items-center justify-center text-[#B47F35] shrink-0 transition-transform group-hover:scale-105">
                        <Icon className="w-5 h-5 text-[#B47F35]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm sm:text-base font-bold text-[#2B132C] leading-tight font-poppins">
                          {item.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 font-poppins">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <Link
                  href="/darshan"
                  className="inline-flex items-center gap-1.5 text-[#B47F35] hover:text-[#8B5E34] text-sm sm:text-base font-semibold transition-colors group cursor-pointer font-poppins"
                >
                  <span>View Full Schedule</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM FLOATING QUICK NAVIGATION DOCK (NO ALL SERVICES BUTTON) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pb-8 mt-6 sm:mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_15px_35px_rgba(0,0,0,0.06)] rounded-3xl sm:rounded-full p-4 sm:p-6 px-4 sm:px-10"
        >
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-8 items-center justify-items-center">
            {quickServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link
                  key={index}
                  href={service.href}
                  className="flex flex-col items-center group space-y-2 text-center cursor-pointer w-full"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:h-12 2xl:w-12 rounded-full bg-[#FAF3E8] border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] shadow-xs group-hover:bg-[#B47F35] group-hover:text-white transition-all duration-300 group-hover:scale-105 shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 2xl:w-5 2xl:h-5 transition-colors" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-normal text-[#2B132C] group-hover:text-[#B47F35] transition-colors leading-tight font-poppins">
                    {service.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

    </section>
  );
}
