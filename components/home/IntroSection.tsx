"use client";

import React from "react";
import { templeConfig } from "@/data/temple";
import { Calendar, Heart, Shield, Users } from "lucide-react";

export function IntroSection() {
  return (
    <section className="py-24 bg-surface-white font-jakarta relative overflow-hidden">
      
      {/* Background Decorative Mandalas & Elements */}
      <div className="absolute -left-20 top-20 text-[#B47F35]/5 text-[240px] pointer-events-none select-none font-serif leading-none">
        🕉️
      </div>
      <div className="absolute -right-20 bottom-10 text-[#B47F35]/5 text-[240px] pointer-events-none select-none font-serif leading-none">
        ⚜️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT COLUMN: INTRO TEXT & 4 CORE ITEMS */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="space-y-4">
              {/* Gold uppercase tag */}
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35] block">
                ABOUT MANDIR
              </span>

              {/* Tag Divider Line */}
              <div className="flex items-center space-x-2 my-1">
                <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
                <span className="text-[#B47F35] text-[8px] flex items-center justify-center">⚜️</span>
                <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
              </div>

              {/* Main Title Header */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-wide text-[#2B132C] leading-tight">
                Tradition Rooted,<br />
                <span className="text-[#B47F35]">Technology Driven</span>
              </h2>

              {/* Header Divider Line */}
              <div className="flex items-center space-x-2 pt-2">
                <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
                <span className="text-[#B47F35] text-[8px] flex items-center justify-center">⚜️</span>
                <div className="h-[1.5px] bg-[#B47F35]/30 w-24" />
              </div>
            </div>

            {/* Description Text */}
            <p className="text-secondary-bronze leading-relaxed font-light text-sm max-w-2xl font-sans">
              {templeConfig.name} is a complete digital platform dedicated to temples and devotees. We blend ancient traditions with modern technology to make your spiritual journey seamless, transparent and more meaningful.
            </p>

            {/* Grid of 4 Core Areas with Separator Lines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mt-10 pt-4 relative">
              
              {/* Separators */}
              <div className="h-[1px] bg-[#B47F35]/15 absolute left-0 right-0 top-1/2 -translate-y-1/2 hidden sm:block" />
              <div className="w-[1px] bg-[#B47F35]/15 absolute top-0 bottom-0 left-1/2 -translate-x-1/2 hidden sm:block" />

              {/* Item 1: Mission */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#2B132C] uppercase tracking-wide">Our Mission</h4>
                  <p className="text-[11px] sm:text-xs text-secondary-bronze/80 leading-relaxed font-light">
                    To simplify temple services and bring devotees closer to divine experiences.
                  </p>
                </div>
              </div>

              {/* Item 2: Vision */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#2B132C] uppercase tracking-wide">Our Vision</h4>
                  <p className="text-[11px] sm:text-xs text-secondary-bronze/80 leading-relaxed font-light">
                    To be the most trusted digital partner for every temple and devotee.
                  </p>
                </div>
              </div>

              {/* Item 3: Promise */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#2B132C] uppercase tracking-wide">Our Promise</h4>
                  <p className="text-[11px] sm:text-xs text-secondary-bronze/80 leading-relaxed font-light">
                    Transparency, security and devotion in every service we provide.
                  </p>
                </div>
              </div>

              {/* Item 4: Values */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#2B132C] uppercase tracking-wide">Our Values</h4>
                  <p className="text-[11px] sm:text-xs text-secondary-bronze/80 leading-relaxed font-light">
                    Faith, Integrity, Service and Devotion drive everything we do.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: POINTED DOME ARCHED TEMPLE PICTURE */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            
            {/* Background Decorative Dot Grid */}
            <div className="absolute -top-6 -right-6 lg:-right-8 grid grid-cols-5 gap-1.5 opacity-25">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-[#B47F35]" />
              ))}
            </div>

            {/* Pointed Arch Container */}
            <div className="relative w-full max-w-[320px] aspect-[4/5.5] rounded-t-full z-10">
              
              {/* Arch Image with SVG Clip-Path */}
              <div 
                className="w-full h-full relative overflow-hidden"
                style={{ clipPath: "url(#templeArchClip)" }}
              >
                <img 
                  src="/temple_hero_bg.png" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 select-none" 
                  alt="Swaminarayan Temple Kampala Archway" 
                />
              </div>

              {/* Pointed Arch Outline Gold Overlay */}
              <div className="absolute inset-0 pointer-events-none z-15">
                <svg className="w-full h-full" viewBox="0 0 100 150" preserveAspectRatio="none">
                  <path 
                    d="M 50 1 C 32 11, 1.5 25, 1.5 50 L 1.5 149 L 98.5 149 L 98.5 50 C 98.5 25, 68 11, 50 1 Z" 
                    fill="none" 
                    stroke="#B47F35" 
                    strokeWidth="1.25" 
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>
              </div>

              {/* Floating Lotus Badge at top right */}
              <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-white border border-[#B47F35]/25 shadow-lg flex items-center justify-center z-20">
                <span className="text-[#B47F35] text-lg">⚜️</span>
              </div>

              {/* Floating White Quote Card at bottom right */}
              <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-primary-gold/15 max-w-[190px] text-left z-20">
                <span className="text-[#B47F35] text-lg font-serif leading-none block">“</span>
                <h4 className="text-[11px] font-bold text-dark-surface leading-tight mt-0.5">
                  Connecting Devotees with Divine Grace
                </h4>
                <div className="h-[1px] bg-[#B47F35]/25 my-2 w-8" />
                <p className="text-[9px] text-secondary-bronze/85 font-light leading-normal">
                  Every click, every booking, every donation – a step closer to divinity.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* SVG ClipPath Definition injected into DOM */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="templeArchClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.007 C 0.32 0.075, 0.015 0.168, 0.015 0.335 L 0.015 0.993 L 0.985 0.993 L 0.985 0.335 C 0.985 0.168, 0.68 0.075, 0.5 0.007 Z" />
          </clipPath>
        </defs>
      </svg>

    </section>
  );
}
