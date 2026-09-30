"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Smartphone, Bell, FileText, UserCheck, BookOpen, ShieldCheck, 
  Clock, Heart, Target, Eye, Award, Globe, Users, Lightbulb, 
  Tv, Calendar, Building, Sparkles, HeartHandshake, ChevronRight,
  Shield, Star, ArrowRight
} from "lucide-react";
import { templeConfig } from "@/data/temple";

export default function AboutPage() {
  // Framer Motion staggered animations
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6 } 
    }
  };

  return (
    <div className="bg-[#FAF7F2] font-poppins overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] lg:min-h-[80vh] flex flex-col justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-[#FAF7F2]">
        
        {/* Background Sacred Geometric Radial & Watermark */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(197,157,95,0.18),transparent)]" />
          <div className="absolute -left-12 top-24 text-[#B47F35]/5 text-[220px] font-serif leading-none">
            🕉️
          </div>
          <div className="absolute -right-12 bottom-12 text-[#B47F35]/5 text-[220px] font-serif leading-none">
            ⚜️
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: HERO CONTENT & LUXURY CARDS */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#B47F35]/10 border border-[#B47F35]/25 text-[#B47F35] text-xs sm:text-sm font-semibold uppercase tracking-widest font-poppins shadow-xs backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#B47F35]" />
                <span>ABOUT OUR MANDIR</span>
                <span className="text-[10px]">⚜️</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-[#2B132C] leading-[1.12] tracking-tight">
                Rooted in Tradition,<br />
                Driven by <span className="font-heading font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-[#B47F35] via-[#C59D5F] to-[#8B5E34] pr-2">Devotion</span>
              </h1>

              {/* Lotus Divider */}
              <div className="flex items-center space-x-2.5 py-0.5">
                <div className="h-[1.5px] bg-gradient-to-r from-transparent via-[#B47F35]/40 to-[#B47F35]/80 w-12" />
                <span className="text-[#B47F35] text-xs">⚜️</span>
                <div className="h-[1.5px] bg-gradient-to-l from-transparent via-[#B47F35]/40 to-[#B47F35]/80 w-24" />
              </div>

              {/* Description */}
              <p className="text-secondary-bronze leading-relaxed font-normal text-base sm:text-lg lg:text-xl max-w-2xl font-poppins">
                {templeConfig.name} is a modern temple management platform dedicated to preserving our spiritual heritage and making temple services accessible to devotees everywhere.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center pt-2">
                <Link
                  href="/membership"
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#B47F35] to-[#8B5E34] hover:brightness-110 text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#B47F35]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center space-x-2 font-poppins cursor-pointer"
                >
                  <span>Join Devotee Community</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/darshan"
                  className="px-7 py-3.5 rounded-xl border border-[#B47F35]/40 bg-white/80 hover:bg-white text-[#2B132C] hover:text-[#B47F35] font-semibold text-sm sm:text-base shadow-xs backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center space-x-2 font-poppins cursor-pointer"
                >
                  <span>View Darshan Timings</span>
                </Link>
              </div>

              {/* Trust Badges 3-Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#B47F35]/15 font-poppins">
                
                {/* Card 1 */}
                <div className="p-4 rounded-2xl bg-white/85 hover:bg-white border border-[#B47F35]/20 hover:border-[#B47F35]/45 transition-all duration-300 shadow-xs hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-[#B47F35]/12 border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] mb-3 group-hover:scale-105 group-hover:bg-[#B47F35] group-hover:text-white transition-all">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2B132C]">Trusted & Secure</h4>
                  <p className="text-xs text-secondary-bronze/80 font-poppins mt-1 leading-relaxed">
                    Bank-level 256-bit security for donations & bookings.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="p-4 rounded-2xl bg-white/85 hover:bg-white border border-[#B47F35]/20 hover:border-[#B47F35]/45 transition-all duration-300 shadow-xs hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-[#B47F35]/12 border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] mb-3 group-hover:scale-105 group-hover:bg-[#B47F35] group-hover:text-white transition-all">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2B132C]">Devotee First</h4>
                  <p className="text-xs text-secondary-bronze/80 font-poppins mt-1 leading-relaxed">
                    Crafted with sincere devotion, seva, and spiritual care.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="p-4 rounded-2xl bg-white/85 hover:bg-white border border-[#B47F35]/20 hover:border-[#B47F35]/45 transition-all duration-300 shadow-xs hover:shadow-md group">
                  <div className="w-10 h-10 rounded-xl bg-[#B47F35]/12 border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] mb-3 group-hover:scale-105 group-hover:bg-[#B47F35] group-hover:text-white transition-all">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2B132C]">24/7 Mandir Access</h4>
                  <p className="text-xs text-secondary-bronze/80 font-poppins mt-1 leading-relaxed">
                    Online pooja booking, live darshan & devotee desk.
                  </p>
                </div>

              </div>

            </motion.div>

            {/* RIGHT COLUMN: ARCHITECTURAL MANDIR SHOWCASE & FLOATING BADGES */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative flex justify-center lg:justify-end mt-4 lg:mt-0"
            >
              {/* Background Golden Halo Glow */}
              <div className="absolute inset-0 max-w-sm mx-auto bg-gradient-to-tr from-[#B47F35]/25 via-[#C59D5F]/20 to-transparent rounded-full filter blur-3xl pointer-events-none" />

              {/* Decorative Gold Mandala Dot Matrix */}
              <div className="absolute -top-5 -right-4 grid grid-cols-4 gap-2 opacity-35 pointer-events-none hidden sm:grid">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#B47F35]" />
                ))}
              </div>

              {/* Main Showcase Card Container */}
              <div className="relative w-full max-w-[390px] xl:max-w-[420px]">
                
                {/* Grand Arched Temple Image */}
                <div className="relative aspect-[4/4.9] rounded-[32px] overflow-hidden border-2 border-[#B47F35]/35 shadow-[0_25px_60px_-15px_rgba(139,94,52,0.28)] bg-white group">
                  <img
                    src="/images/hero-temple.jpg"
                    alt="Shree Swaminarayan Temple Kampala Heritage"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 select-none"
                  />
                  {/* Subtle inner dark plum vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2B132C]/90 via-[#2B132C]/20 to-black/10" />

                  {/* Inner bottom overlay text */}
                  <div className="absolute bottom-6 left-6 right-6 text-white text-left z-10">
                    <span className="text-[11px] uppercase tracking-widest text-[#C59D5F] font-bold">Divine Sanctuary</span>
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-white leading-snug mt-0.5">
                      SKSS Temple, Kampala
                    </h3>
                    <p className="text-xs text-white/80 font-poppins mt-0.5">Shree Swaminarayan Complex, Nsimbiziwoome, Bukoto, Kampala, Uganda</p>
                  </div>
                </div>

                {/* Floating Badge 1: Top Left (Est. & Location) */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.35 }}
                  className="absolute -top-4 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-[#B47F35]/25 flex items-center space-x-3 z-20"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#B47F35]/15 flex items-center justify-center text-[#B47F35] text-lg font-serif">
                    🕉️
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#B47F35]">Sacred Mandir</span>
                    </div>
                    <p className="text-xs font-bold text-[#2B132C]">Kampala Satsang Portal</p>
                  </div>
                </motion.div>

                {/* Floating Badge 2: Bottom Right (Community & Devotee Trust) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.45 }}
                  className="absolute -bottom-5 -right-3 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-[#B47F35]/25 max-w-[210px] text-left z-20"
                >
                  <div className="flex items-center space-x-1 text-[#B47F35] mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#B47F35] stroke-none" />
                    ))}
                    <span className="text-xs font-bold text-[#2B132C] ml-1">5.0</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2B132C] leading-snug">50,000+ Devotees</h4>
                  <p className="text-[11px] text-secondary-bronze/80 mt-0.5 leading-tight">
                    Blessed with sacred Seva, Darshan & Community.
                  </p>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. OUR PURPOSE SECTION */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 font-poppins">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#B47F35] block">
              OUR PURPOSE
            </span>
            <div className="flex items-center justify-center space-x-1.5 py-1">
              <div className="h-[1.5px] bg-[#B47F35]/35 w-8" />
              <span className="text-[#B47F35] text-xs">⚜️</span>
              <div className="h-[1.5px] bg-[#B47F35]/35 w-8" />
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-secondary-bronze font-normal max-w-xl mx-auto font-poppins leading-relaxed">
              Empowering temples and devotees through technology while staying true to our spiritual roots.
            </p>
          </div>

          {/* 4 Columns Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 relative items-stretch pt-4 font-poppins"
          >
            
            {/* Column 1: Mission */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2B132C] uppercase tracking-wide">Our Mission</h3>
              <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-normal font-poppins">
                To simplify temple services and bring devotees closer to divine experiences through technology and devotion.
              </p>
            </motion.div>

            {/* Column 2: Vision */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2 relative md:before:content-[''] md:before:absolute md:before:left-[-16px] md:before:top-4 md:before:bottom-4 md:before:w-[1px] md:before:bg-[#B47F35]/15">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2B132C] uppercase tracking-wide">Our Vision</h3>
              <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-normal font-poppins">
                To become the most trusted digital platform for temples and devotees worldwide, fostering a stronger spiritual community.
              </p>
            </motion.div>

            {/* Column 3: Values */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2 relative md:before:content-[''] md:before:absolute md:before:left-[-16px] md:before:top-4 md:before:bottom-4 md:before:w-[1px] md:before:bg-[#B47F35]/15">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2B132C] uppercase tracking-wide">Our Values</h3>
              <ul className="text-sm sm:text-base text-secondary-bronze space-y-2 font-normal font-poppins">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B47F35]" />
                  <span>Faith & Devotion</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B47F35]" />
                  <span>Transparency</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B47F35]" />
                  <span>Inclusivity</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B47F35]" />
                  <span>Service Excellence</span>
                </li>
              </ul>
            </motion.div>

            {/* Column 4: Commitment */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2 relative md:before:content-[''] md:before:absolute md:before:left-[-16px] md:before:top-4 md:before:bottom-4 md:before:w-[1px] md:before:bg-[#B47F35]/15">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2B132C] uppercase tracking-wide">Our Commitment</h3>
              <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-normal font-poppins">
                We are committed to preserving our traditions while embracing innovation for the betterment of temples and devotees.
              </p>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* 3. METRICS GRID BAR */}
      <section className="bg-[#FAF7F2] py-14 border-y border-[#B47F35]/15 font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
            
            <div className="space-y-1.5">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#B47F35]">50,000+</p>
              <h4 className="text-xs sm:text-sm font-bold text-[#2B132C] uppercase tracking-wide">Happy Devotees</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/75 font-poppins">Trust us across the globe</p>
            </div>

            <div className="space-y-1.5 relative before:content-[''] before:absolute before:left-[-16px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#B47F35]">500+</p>
              <h4 className="text-xs sm:text-sm font-bold text-[#2B132C] uppercase tracking-wide">Temples Connected</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/75 font-poppins">Empowering spiritual spaces</p>
            </div>

            <div className="space-y-1.5 relative before:content-[''] before:absolute before:left-[-16px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#B47F35]">10,000+</p>
              <h4 className="text-xs sm:text-sm font-bold text-[#2B132C] uppercase tracking-wide">Poojas Booked Daily</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/75 font-poppins">Seva made simple</p>
            </div>

            <div className="space-y-1.5 relative before:content-[''] before:absolute before:left-[-16px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#B47F35]">2Cr+</p>
              <h4 className="text-xs sm:text-sm font-bold text-[#2B132C] uppercase tracking-wide">Donations Processed</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/75 font-poppins">With complete transparency</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. OUR STORY TIMELINE */}
      <section className="py-24 bg-white relative font-poppins">
        {/* Soft watermark behind timeline */}
        <div className="absolute right-0 bottom-0 top-0 w-80 opacity-[0.03] pointer-events-none select-none hidden lg:block">
          <img src="/temple_hero_bg.png" className="w-full h-full object-contain object-right filter grayscale" alt="" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Description Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 text-[#B47F35] text-xs sm:text-sm font-bold uppercase tracking-widest font-poppins">
                <span>OUR STORY</span>
                <span>⚜️</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C] leading-snug">
                A Journey of Faith<br />and Innovation
              </h2>

              <div className="flex items-center space-x-2 py-1">
                <div className="h-[1.5px] bg-[#B47F35]/25 w-12" />
                <span className="text-[#B47F35] text-xs">⚜️</span>
                <div className="h-[1.5px] bg-[#B47F35]/25 w-12" />
              </div>

              <p className="text-base sm:text-lg text-secondary-bronze leading-relaxed font-normal font-poppins">
                {templeConfig.name} was born out of a simple belief — devotion should be accessible to all. We combine technology with tradition to help temples manage operations efficiently and devotees connect effortlessly.
              </p>
              <p className="text-base sm:text-lg text-secondary-bronze leading-relaxed font-normal font-poppins">
                From online pooja bookings to live darshan and digital donations, we are reshaping the way spirituality meets modern life.
              </p>

              <div className="pt-4">
                <Link
                  href="/membership"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-sm sm:text-base font-semibold shadow-md transition-colors font-poppins"
                >
                  <span>Learn More About Us</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Timeline Column */}
            <div className="lg:col-span-6 space-y-8 pl-0 lg:pl-10 relative font-poppins">
              {/* Vertical line connector */}
              <div className="absolute left-6 lg:left-16 top-4 bottom-4 w-[2px] bg-[#B47F35]/20 z-0" />
              
              {/* Timeline Item 1 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs sm:text-sm font-bold bg-[#B47F35] text-white px-2.5 py-1 rounded-md uppercase tracking-wider font-poppins">2018</span>
                  <h4 className="text-base sm:text-lg font-bold text-[#2B132C] mt-2">The Beginning</h4>
                  <p className="text-sm sm:text-base text-secondary-bronze/90 font-poppins font-normal">Started with a vision to digitize temple services and make devotion easier.</p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs sm:text-sm font-bold bg-[#B47F35] text-white px-2.5 py-1 rounded-md uppercase tracking-wider font-poppins">2020</span>
                  <h4 className="text-base sm:text-lg font-bold text-[#2B132C] mt-2">Growing Together</h4>
                  <p className="text-sm sm:text-base text-secondary-bronze/90 font-poppins font-normal">Onboarded 100+ temples and built a community of thousands of devotees.</p>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs sm:text-sm font-bold bg-[#B47F35] text-white px-2.5 py-1 rounded-md uppercase tracking-wider font-poppins">2022</span>
                  <h4 className="text-base sm:text-lg font-bold text-[#2B132C] mt-2">Going Digital</h4>
                  <p className="text-sm sm:text-base text-secondary-bronze/90 font-poppins font-normal">Launched mobile app, live darshan, and secure donation platform.</p>
                </div>
              </div>

              {/* Timeline Item 4 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs sm:text-sm font-bold bg-[#B47F35] text-white px-2.5 py-1 rounded-md uppercase tracking-wider font-poppins">2024 & Beyond</span>
                  <h4 className="text-base sm:text-lg font-bold text-[#2B132C] mt-2">Building the Future</h4>
                  <p className="text-sm sm:text-base text-secondary-bronze/90 font-poppins font-normal">Expanding services and creating a global spiritual ecosystem.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. WHAT WE OFFER SECTION */}
      <section className="py-20 bg-[#FAF7F2] relative font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 font-poppins">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#B47F35] block">
              WHAT WE OFFER
            </span>
            <div className="flex items-center justify-center space-x-1.5 py-1">
              <div className="h-[1.5px] bg-[#B47F35]/35 w-8" />
              <span className="text-[#B47F35] text-xs">✦</span>
              <div className="h-[1.5px] bg-[#B47F35]/35 w-8" />
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-secondary-bronze font-normal max-w-xl mx-auto font-poppins leading-relaxed">
              Comprehensive digital solutions for temples and devotees
            </p>
          </div>

          {/* 5 Cards Row Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 font-poppins">
            
            {/* Offer 1 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">Pooja & Seva Booking</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/85 font-poppins mt-2 font-normal">Book personalized poojas & sevas online</p>
            </div>

            {/* Offer 2 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Tv className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">Live Darshan</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/85 font-poppins mt-2 font-normal">Watch live & stay connected to divinity</p>
            </div>

            {/* Offer 3 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">Donations</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/85 font-poppins mt-2 font-normal">Contribute for a greater cause securely</p>
            </div>

            {/* Offer 4 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">Temple Management</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/85 font-poppins mt-2 font-normal">Smart tools for temple administration</p>
            </div>

            {/* Offer 5 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">Devotee Community</h4>
              <p className="text-xs sm:text-sm text-secondary-bronze/85 font-poppins mt-2 font-normal">A divine community that grows together</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. WHAT DEVOTEES SAY */}
      <section className="py-20 bg-white relative font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 font-poppins">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#B47F35] block">
              WHAT DEVOTEES SAY
            </span>
            <div className="flex items-center justify-center space-x-1.5 py-1">
              <div className="h-[1.5px] bg-[#B47F35]/35 w-8" />
              <span className="text-[#B47F35] text-xs">⚜️</span>
              <div className="h-[1.5px] bg-[#B47F35]/35 w-8" />
            </div>
          </div>

          {/* Testimonial Cards stack */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch font-poppins">
            
            {/* Card 1 */}
            <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-3xl p-8 flex flex-col justify-between text-left relative">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-poppins font-normal italic">
                  &ldquo;Mandir has made booking poojas so easy. The experience is smooth and the seva is truly divine.&rdquo;
                </p>
                <div className="flex items-center gap-1 text-[#B47F35]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B47F35] stroke-none" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3.5 mt-6 pt-4 border-t border-[#B47F35]/10">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Priya Sharma"
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#B47F35]/25"
                />
                <div>
                  <h5 className="text-sm sm:text-base font-bold text-[#2B132C]">Priya Sharma</h5>
                  <span className="text-xs sm:text-sm text-[#B47F35] font-semibold">Kampala</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-3xl p-8 flex flex-col justify-between text-left relative">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-poppins font-normal italic">
                  &ldquo;The live darshan feature helps me feel connected to the temple even when I am far away.&rdquo;
                </p>
                <div className="flex items-center gap-1 text-[#B47F35]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B47F35] stroke-none" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3.5 mt-6 pt-4 border-t border-[#B47F35]/10">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Rohit Verma"
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#B47F35]/25"
                />
                <div>
                  <h5 className="text-sm sm:text-base font-bold text-[#2B132C]">Rohit Verma</h5>
                  <span className="text-xs sm:text-sm text-[#B47F35] font-semibold">Delhi</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-3xl p-8 flex flex-col justify-between text-left relative">
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-poppins font-normal italic">
                  &ldquo;A trustworthy platform with transparent donations and great customer support.&rdquo;
                </p>
                <div className="flex items-center gap-1 text-[#B47F35]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B47F35] stroke-none" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3.5 mt-6 pt-4 border-t border-[#B47F35]/10">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Anjali Mehta"
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#B47F35]/25"
                />
                <div>
                  <h5 className="text-sm sm:text-base font-bold text-[#2B132C]">Anjali Mehta</h5>
                  <span className="text-xs sm:text-sm text-[#B47F35] font-semibold">Mumbai</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. CTA BANNER CARD */}
      <section className="py-12 bg-white font-poppins">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2B132C] rounded-[32px] p-10 lg:p-14 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-left shadow-lg">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#B47F35]/10 filter blur-3xl pointer-events-none" />
            
            <div className="space-y-3 z-10 max-w-xl">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold">
                Be a Part of Our Divine Journey
              </h3>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed font-poppins font-normal">
                Join millions of devotees in preserving traditions and supporting temple services.
              </p>
            </div>

            <div className="z-10 shrink-0">
              <Link
                href="/membership"
                className="px-8 py-4 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white font-semibold shadow-md transition-colors text-sm sm:text-base inline-flex items-center space-x-2 font-poppins"
              >
                <span>Join Our Community</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 8. TRUST FOOTER BADGES */}
      <section className="py-12 bg-[#FAF7F2] border-t border-[#B47F35]/15 font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">100% Secure</h4>
                <p className="text-xs sm:text-sm text-secondary-bronze/80 font-poppins mt-0.5 leading-snug">Your data is safe with us</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 relative before:content-[''] before:absolute before:left-[-16px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <div className="w-12 h-12 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">Verified Temples</h4>
                <p className="text-xs sm:text-sm text-secondary-bronze/80 font-poppins mt-0.5 leading-snug">All temples are verified</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 relative before:content-[''] before:absolute before:left-[-16px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <div className="w-12 h-12 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">Instant Receipts</h4>
                <p className="text-xs sm:text-sm text-secondary-bronze/80 font-poppins mt-0.5 leading-snug">For all your transactions</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 relative before:content-[''] before:absolute before:left-[-16px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <div className="w-12 h-12 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">24/7 Devotee Support</h4>
                <p className="text-xs sm:text-sm text-secondary-bronze/80 font-poppins mt-0.5 leading-snug">Always here to help</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
