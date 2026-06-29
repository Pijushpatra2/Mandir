"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Smartphone, Bell, FileText, UserCheck, BookOpen, ShieldCheck, 
  Clock, Heart, Target, Eye, Award, Globe, Users, Lightbulb, 
  Tv, Calendar, Building, Sparkles, HeartHandshake, ChevronRight,
  Shield
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
    <div className="bg-[#FAF7F2] font-jakarta overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[70vh] lg:min-h-[65vh] flex flex-col justify-center pt-32 pb-16 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 -z-20 w-full h-full bg-[#FAF7F2]">
          <div className="absolute right-0 top-0 w-full lg:w-[58%] h-full">
            <img 
              src="/temple_hero_bg.png" 
              className="w-full h-full object-cover object-[70%_center] lg:object-[68%_center]" 
              alt="Swaminarayan Temple Background" 
            />
            {/* Blends */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 lg:via-[#FAF7F2]/65 to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent lg:hidden" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 text-[#B47F35] text-[10px] font-bold uppercase tracking-widest">
                <span>ABOUT US</span>
                <span>⚜️</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-[#2B132C] leading-tight">
                Rooted in Tradition,<br />
                Driven by <span className="text-[#B47F35] font-normal italic pr-2">Devotion</span>
              </h1>

              {/* Lotus Divider */}
              <div className="flex items-center space-x-2">
                <div className="h-[1.5px] bg-[#B47F35]/30 w-10" />
                <span className="text-[#B47F35] text-[8px]">⚜️</span>
                <div className="h-[1.5px] bg-[#B47F35]/30 w-10" />
              </div>

              {/* Description */}
              <p className="text-secondary-bronze leading-relaxed font-light text-xs sm:text-sm max-w-xl font-sans">
                {templeConfig.name} is a modern temple management platform dedicated to preserving our spiritual heritage and making temple services accessible to devotees everywhere.
              </p>

              {/* Trust badges row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#B47F35]/10 max-w-xl">
                <div className="flex flex-col items-start text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#B47F35]/15 flex items-center justify-center text-[#B47F35] shrink-0 border border-[#B47F35]/15">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#2B132C]">Trusted & Secure</h4>
                    <p className="text-[9px] text-secondary-bronze/70 font-sans mt-0.5 leading-tight">Bank-level security for transactions.</p>
                  </div>
                </div>

                <div className="flex flex-col items-start text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#B47F35]/15 flex items-center justify-center text-[#B47F35] shrink-0 border border-[#B47F35]/15">
                    <Heart className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#2B132C]">Devotee First</h4>
                    <p className="text-[9px] text-secondary-bronze/70 font-sans mt-0.5 leading-tight">Built with devotion and care.</p>
                  </div>
                </div>

                <div className="flex flex-col items-start text-left space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#B47F35]/15 flex items-center justify-center text-[#B47F35] shrink-0 border border-[#B47F35]/15">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#2B132C]">24/7 Support</h4>
                    <p className="text-[9px] text-secondary-bronze/70 font-sans mt-0.5 leading-tight">We are here to help you always.</p>
                  </div>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. OUR PURPOSE SECTION */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35] block">
              OUR PURPOSE
            </span>
            <div className="flex items-center justify-center space-x-1 py-1">
              <div className="h-[1.5px] bg-[#B47F35]/35 w-6" />
              <span className="text-[#B47F35] text-[8px]">⚜️</span>
              <div className="h-[1.5px] bg-[#B47F35]/35 w-6" />
            </div>
            <p className="text-xs sm:text-sm text-secondary-bronze font-light max-w-xl mx-auto font-sans leading-relaxed">
              Empowering temples and devotees through technology while staying true to our spiritual roots.
            </p>
          </div>

          {/* 4 Columns Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 relative items-stretch pt-4"
          >
            
            {/* Column 1: Mission */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B132C] uppercase tracking-wide">Our Mission</h3>
              <p className="text-xs text-secondary-bronze leading-relaxed font-light font-sans">
                To simplify temple services and bring devotees closer to divine experiences through technology and devotion.
              </p>
            </motion.div>

            {/* Column 2: Vision */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2 relative md:before:content-[''] md:before:absolute md:before:left-[-16px] md:before:top-4 md:before:bottom-4 md:before:w-[1px] md:before:bg-[#B47F35]/15">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B132C] uppercase tracking-wide">Our Vision</h3>
              <p className="text-xs text-secondary-bronze leading-relaxed font-light font-sans">
                To become the most trusted digital platform for temples and devotees worldwide, fostering a stronger spiritual community.
              </p>
            </motion.div>

            {/* Column 3: Values */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2 relative md:before:content-[''] md:before:absolute md:before:left-[-16px] md:before:top-4 md:before:bottom-4 md:before:w-[1px] md:before:bg-[#B47F35]/15">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B132C] uppercase tracking-wide">Our Values</h3>
              <ul className="text-xs text-secondary-bronze space-y-1.5 font-light font-sans">
                <li className="flex items-center space-x-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#B47F35]" />
                  <span>Faith & Devotion</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#B47F35]" />
                  <span>Transparency</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#B47F35]" />
                  <span>Inclusivity</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#B47F35]" />
                  <span>Service Excellence</span>
                </li>
              </ul>
            </motion.div>

            {/* Column 4: Commitment */}
            <motion.div variants={itemVariants} className="space-y-4 text-left p-2 relative md:before:content-[''] md:before:absolute md:before:left-[-16px] md:before:top-4 md:before:bottom-4 md:before:w-[1px] md:before:bg-[#B47F35]/15">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] border border-[#B47F35]/15 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B132C] uppercase tracking-wide">Our Commitment</h3>
              <p className="text-xs text-secondary-bronze leading-relaxed font-light font-sans">
                We are committed to preserving our traditions while embracing innovation for the betterment of temples and devotees.
              </p>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* 3. METRICS GRID BAR */}
      <section className="bg-[#FAF7F2] py-12 border-y border-[#B47F35]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
            
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-heading font-bold text-[#B47F35]">50,000+</p>
              <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Happy Devotees</h4>
              <p className="text-[9px] text-secondary-bronze/70 font-sans">Trust us across the globe</p>
            </div>

            <div className="space-y-1 relative before:content-[''] before:absolute before:left-[-16px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <p className="text-3xl sm:text-4xl font-heading font-bold text-[#B47F35]">500+</p>
              <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Temples Connected</h4>
              <p className="text-[9px] text-secondary-bronze/70 font-sans">Empowering spiritual spaces</p>
            </div>

            <div className="space-y-1 relative before:content-[''] before:absolute before:left-[-16px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <p className="text-3xl sm:text-4xl font-heading font-bold text-[#B47F35]">10,000+</p>
              <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Poojas Booked Daily</h4>
              <p className="text-[9px] text-secondary-bronze/70 font-sans">Seva made simple</p>
            </div>

            <div className="space-y-1 relative before:content-[''] before:absolute before:left-[-16px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <p className="text-3xl sm:text-4xl font-heading font-bold text-[#B47F35]">2Cr+</p>
              <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Donations Processed</h4>
              <p className="text-[9px] text-secondary-bronze/70 font-sans">With complete transparency</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. OUR STORY TIMELINE */}
      <section className="py-24 bg-white relative">
        {/* Soft watermark behind timeline */}
        <div className="absolute right-0 bottom-0 top-0 w-80 opacity-[0.03] pointer-events-none select-none hidden lg:block">
          <img src="/temple_hero_bg.png" className="w-full h-full object-contain object-right filter grayscale" alt="" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Description Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 text-[#B47F35] text-[10px] font-bold uppercase tracking-widest">
                <span>OUR STORY</span>
                <span>⚜️</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-[#2B132C] leading-snug">
                A Journey of Faith<br />and Innovation
              </h2>

              <div className="flex items-center space-x-2 py-1">
                <div className="h-[1.5px] bg-[#B47F35]/25 w-10" />
                <span className="text-[#B47F35] text-[9px]">⚜️</span>
                <div className="h-[1.5px] bg-[#B47F35]/25 w-10" />
              </div>

              <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-light font-sans">
                {templeConfig.name} was born out of a simple belief — devotion should be accessible to all. We combine technology with tradition to help temples manage operations efficiently and devotees connect effortlessly.
              </p>
              <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-light font-sans">
                From online pooja bookings to live darshan and digital donations, we are reshaping the way spirituality meets modern life.
              </p>

              <div className="pt-4">
                <Link
                  href="/membership"
                  className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <span>Learn More About Us</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Timeline Column */}
            <div className="lg:col-span-6 space-y-6 pl-0 lg:pl-10 relative">
              {/* Vertical line connector */}
              <div className="absolute left-6 lg:left-16 top-4 bottom-4 w-[2px] bg-[#B47F35]/20 z-0" />
              
              {/* Timeline Item 1 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-1.5">
                  <span className="text-[9px] font-bold bg-[#B47F35] text-white px-2 py-0.5 rounded uppercase tracking-wider">2018</span>
                  <h4 className="text-xs font-bold text-[#2B132C] mt-1.5">The Beginning</h4>
                  <p className="text-[11px] text-secondary-bronze/85 font-sans font-light">Started with a vision to digitize temple services and make devotion easier.</p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-1.5">
                  <span className="text-[9px] font-bold bg-[#B47F35] text-white px-2 py-0.5 rounded uppercase tracking-wider">2020</span>
                  <h4 className="text-xs font-bold text-[#2B132C] mt-1.5">Growing Together</h4>
                  <p className="text-[11px] text-secondary-bronze/85 font-sans font-light">Onboarded 100+ temples and built a community of thousands of devotees.</p>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-1.5">
                  <span className="text-[9px] font-bold bg-[#B47F35] text-white px-2 py-0.5 rounded uppercase tracking-wider">2022</span>
                  <h4 className="text-xs font-bold text-[#2B132C] mt-1.5">Going Digital</h4>
                  <p className="text-[11px] text-secondary-bronze/85 font-sans font-light">Launched mobile app, live darshan, and secure donation platform.</p>
                </div>
              </div>

              {/* Timeline Item 4 */}
              <div className="flex items-start space-x-4 relative z-10 text-left">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border-2 border-[#B47F35] flex items-center justify-center text-[#B47F35] shrink-0 shadow-md lg:ml-10">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-1.5">
                  <span className="text-[9px] font-bold bg-[#B47F35] text-white px-2 py-0.5 rounded uppercase tracking-wider">2024 & Beyond</span>
                  <h4 className="text-xs font-bold text-[#2B132C] mt-1.5">Building the Future</h4>
                  <p className="text-[11px] text-secondary-bronze/85 font-sans font-light">Expanding services and creating a global spiritual ecosystem.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. WHAT WE OFFER SECTION */}
      <section className="py-20 bg-[#FAF7F2] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35] block">
              WHAT WE OFFER
            </span>
            <div className="flex items-center justify-center space-x-1.5 py-1">
              <div className="h-[1.5px] bg-[#B47F35]/35 w-6" />
              <span className="text-[#B47F35] text-[8px]">✦</span>
              <div className="h-[1.5px] bg-[#B47F35]/35 w-6" />
            </div>
            <p className="text-xs sm:text-sm text-secondary-bronze font-light max-w-xl mx-auto font-sans leading-relaxed">
              Comprehensive digital solutions for temples and devotees
            </p>
          </div>

          {/* 5 Cards Row Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Offer 1 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#2B132C]">Pooja & Seva Booking</h4>
              <p className="text-[9px] text-secondary-bronze/75 font-sans mt-2 font-light">Book personalized poojas & sevas online</p>
            </div>

            {/* Offer 2 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#2B132C]">Live Darshan</h4>
              <p className="text-[9px] text-secondary-bronze/75 font-sans mt-2 font-light">Watch live & stay connected to divinity</p>
            </div>

            {/* Offer 3 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#2B132C]">Donations</h4>
              <p className="text-[9px] text-secondary-bronze/75 font-sans mt-2 font-light">Contribute for a greater cause securely</p>
            </div>

            {/* Offer 4 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#2B132C]">Temple Management</h4>
              <p className="text-[9px] text-secondary-bronze/75 font-sans mt-2 font-light">Smart tools for temple administration</p>
            </div>

            {/* Offer 5 */}
            <div className="bg-white border border-[#B47F35]/15 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] mb-4 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-[#2B132C]">Devotee Community</h4>
              <p className="text-[9px] text-secondary-bronze/75 font-sans mt-2 font-light">A divine community that grows together</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. WHAT DEVOTEES SAY */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35] block">
              WHAT DEVOTEES SAY
            </span>
            <div className="flex items-center justify-center space-x-1.5 py-1">
              <div className="h-[1.5px] bg-[#B47F35]/35 w-6" />
              <span className="text-[#B47F35] text-[8px]">⚜️</span>
              <div className="h-[1.5px] bg-[#B47F35]/35 w-6" />
            </div>
          </div>

          {/* Testimonial Cards stack */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Card 1 */}
            <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-3xl p-6 flex flex-col justify-between text-left relative">
              <div className="space-y-4">
                <p className="text-xs text-secondary-bronze leading-relaxed font-sans font-light italic">
                  &ldquo;Mandir has made booking poojas so easy. The experience is smooth and the seva is truly divine.&rdquo;
                </p>
                <div className="flex items-center gap-0.5 text-[#B47F35]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#B47F35] stroke-none" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-[#B47F35]/10">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Priya Sharma"
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#B47F35]/25"
                />
                <div>
                  <h5 className="text-xs font-bold text-[#2B132C]">Priya Sharma</h5>
                  <span className="text-[9px] text-[#B47F35] font-semibold">Kampala</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-3xl p-6 flex flex-col justify-between text-left relative">
              <div className="space-y-4">
                <p className="text-xs text-secondary-bronze leading-relaxed font-sans font-light italic">
                  &ldquo;The live darshan feature helps me feel connected to the temple even when I am far away.&rdquo;
                </p>
                <div className="flex items-center gap-0.5 text-[#B47F35]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#B47F35] stroke-none" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-[#B47F35]/10">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Rohit Verma"
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#B47F35]/25"
                />
                <div>
                  <h5 className="text-xs font-bold text-[#2B132C]">Rohit Verma</h5>
                  <span className="text-[9px] text-[#B47F35] font-semibold">Delhi</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-3xl p-6 flex flex-col justify-between text-left relative">
              <div className="space-y-4">
                <p className="text-xs text-secondary-bronze leading-relaxed font-sans font-light italic">
                  &ldquo;A trustworthy platform with transparent donations and great customer support.&rdquo;
                </p>
                <div className="flex items-center gap-0.5 text-[#B47F35]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#B47F35] stroke-none" />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-[#B47F35]/10">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="Anjali Mehta"
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#B47F35]/25"
                />
                <div>
                  <h5 className="text-xs font-bold text-[#2B132C]">Anjali Mehta</h5>
                  <span className="text-[9px] text-[#B47F35] font-semibold">Mumbai</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. CTA BANNER CARD */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2B132C] rounded-[32px] p-10 lg:p-14 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-left shadow-lg">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#B47F35]/10 filter blur-3xl pointer-events-none" />
            
            <div className="space-y-3 z-10 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-heading font-bold">
                Be a Part of Our Divine Journey
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans font-light">
                Join millions of devotees in preserving traditions and supporting temple services.
              </p>
            </div>

            <div className="z-10 shrink-0">
              <Link
                href="/membership"
                className="px-6 py-3.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white font-semibold shadow-md transition-colors text-xs inline-flex items-center space-x-1.5"
              >
                <span>Join Our Community</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 8. TRUST FOOTER BADGES */}
      <section className="py-12 bg-[#FAF7F2] border-t border-[#B47F35]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">100% Secure</h4>
                <p className="text-[9px] text-secondary-bronze/70 font-sans mt-0.5 leading-tight">Your data is safe with us</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 relative before:content-[''] before:absolute before:left-[-16px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">Verified Temples</h4>
                <p className="text-[9px] text-secondary-bronze/70 font-sans mt-0.5 leading-tight">All temples are verified</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 relative before:content-[''] before:absolute before:left-[-16px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">Instant Receipts</h4>
                <p className="text-[9px] text-secondary-bronze/70 font-sans mt-0.5 leading-tight">For all your transactions</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 relative before:content-[''] before:absolute before:left-[-16px] before:top-1 before:bottom-1 before:w-[1px] before:bg-[#B47F35]/15 before:hidden md:before:block">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">24/7 Devotee Support</h4>
                <p className="text-[9px] text-secondary-bronze/70 font-sans mt-0.5 leading-tight">Always here to help</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

// Simple Helper icon import
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      stroke="none" 
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}
