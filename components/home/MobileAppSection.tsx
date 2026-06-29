"use client";

import React from "react";
import { Smartphone, Bell, FileText, UserCheck, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export function MobileAppSection() {
  // Framer Motion Animation Variants
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

  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6 } 
    }
  };

  const featureVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5 } 
    }
  };

  return (
    <section className="py-20 bg-[#FAF7F2] font-jakarta relative overflow-hidden">
      
      {/* Background Soft Mandal/OM Glow */}
      <div className="absolute -left-36 top-1/4 text-[#B47F35]/5 text-[300px] pointer-events-none select-none font-serif leading-none">
        🕉️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Banner Card (Removed shadow-2xl for clean flat styling) */}
        <div className="bg-gradient-to-r from-[#FAF6F0] via-[#FAF1E4] to-[#F1E0C9] rounded-[40px] border border-[#B47F35]/20 p-6 sm:p-12 lg:p-16 relative overflow-hidden">
          
          {/* Subtle gold glow behind phone */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#B47F35]/5 filter blur-3xl pointer-events-none" />

          {/* Bottom Wave Divider with Lotus */}
          <div className="absolute bottom-0 inset-x-0 h-4 pointer-events-none select-none flex flex-col items-center">
            <svg className="w-full h-full text-[#B47F35]/10" viewBox="0 0 100 10" preserveAspectRatio="none" fill="currentColor">
              <path d="M 0 10 Q 50 2 100 10 Z" />
            </svg>
            <span className="text-[#B47F35] text-[10px] -mt-5 z-20">⚜️</span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10"
          >
            
            {/* LEFT COLUMN: TEXT CONTENT & DOWNLOAD BADGES */}
            <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-left text-dark-surface">
              
              {/* Gold Pill Badge */}
              <motion.div 
                variants={fadeUpVariants}
                className="inline-flex items-center space-x-2 border border-[#B47F35]/35 bg-[#B47F35]/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#B47F35] select-none"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mandir Mobile App</span>
              </motion.div>

              {/* Title / Heading */}
              <motion.div variants={fadeUpVariants} className="space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C] leading-tight">
                  Carry Temple Grace <br />
                  <span className="text-[#B47F35] font-normal italic pr-1">Everywhere</span> in Your Pocket
                </h2>

                {/* Lotus Divider */}
                <div className="flex items-center space-x-2 py-1">
                  <div className="h-[1px] bg-[#B47F35]/25 w-12" />
                  <span className="text-[#B47F35] text-[9px]">⚜️</span>
                  <div className="h-[1px] bg-[#B47F35]/25 w-12" />
                </div>
              </motion.div>

              {/* Description */}
              <motion.p 
                variants={fadeUpVariants}
                className="text-secondary-bronze leading-relaxed font-light text-xs sm:text-sm max-w-xl font-sans"
              >
                Available for iOS and Android. Receive daily shlokas, custom push notifications for Aarti timings, download donation receipts, and access member details instantly on the go.
              </motion.p>

              {/* 4 Feature Columns Grid */}
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[#B47F35]/10 relative"
              >
                
                {/* Feature 1 */}
                <motion.div variants={featureVariants} className="space-y-2 text-left">
                  <div className="w-9 h-9 rounded-full border border-[#B47F35]/30 flex items-center justify-center text-[#B47F35] bg-[#FAF7F2] shadow-sm">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Aarti Alerts</h4>
                  <p className="text-[9px] text-secondary-bronze/85 font-sans font-light leading-snug">
                    Get notified for all Aarti timings
                  </p>
                </motion.div>

                {/* Feature 2 */}
                <motion.div variants={featureVariants} className="space-y-2 text-left relative sm:before:content-[''] sm:before:absolute sm:before:left-[-12px] sm:before:top-1 sm:before:bottom-1 sm:before:w-[1px] sm:before:bg-[#B47F35]/15">
                  <div className="w-9 h-9 rounded-full border border-[#B47F35]/30 flex items-center justify-center text-[#B47F35] bg-[#FAF7F2] shadow-sm">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Digital Receipts</h4>
                  <p className="text-[9px] text-secondary-bronze/85 font-sans font-light leading-snug">
                    Download donation receipts anytime
                  </p>
                </motion.div>

                {/* Feature 3 */}
                <motion.div variants={featureVariants} className="space-y-2 text-left relative sm:before:content-[''] sm:before:absolute sm:before:left-[-12px] sm:before:top-1 sm:before:bottom-1 sm:before:w-[1px] sm:before:bg-[#B47F35]/15">
                  <div className="w-9 h-9 rounded-full border border-[#B47F35]/30 flex items-center justify-center text-[#B47F35] bg-[#FAF7F2] shadow-sm">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Member Access</h4>
                  <p className="text-[9px] text-secondary-bronze/85 font-sans font-light leading-snug">
                    Access member details instantly
                  </p>
                </motion.div>

                {/* Feature 4 */}
                <motion.div variants={featureVariants} className="space-y-2 text-left relative sm:before:content-[''] sm:before:absolute sm:before:left-[-12px] sm:before:top-1 sm:before:bottom-1 sm:before:w-[1px] sm:before:bg-[#B47F35]/15">
                  <div className="w-9 h-9 rounded-full border border-[#B47F35]/30 flex items-center justify-center text-[#B47F35] bg-[#FAF7F2] shadow-sm">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-[#2B132C] uppercase tracking-wide">Daily Shlokas</h4>
                  <p className="text-[9px] text-secondary-bronze/85 font-sans font-light leading-snug">
                    Start your day with divine wisdom
                  </p>
                </motion.div>

              </motion.div>

              {/* Action Buttons & QR Code Row */}
              <motion.div 
                variants={fadeUpVariants}
                className="flex flex-wrap items-center gap-4 pt-6 border-t border-[#B47F35]/10 mt-6"
              >
                
                {/* Google Play */}
                <a 
                  href="#" 
                  className="flex items-center space-x-2.5 px-5 py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white transition-colors cursor-pointer shadow-sm select-none"
                >
                  <Smartphone className="w-4 h-4 text-white" />
                  <div className="text-left">
                    <p className="text-[8px] text-white/60 font-light uppercase tracking-wider leading-none">
                      GET IT ON
                    </p>
                    <p className="text-xs font-bold font-sans mt-0.5">Google Play</p>
                  </div>
                </a>

                {/* App Store */}
                <a 
                  href="#" 
                  className="flex items-center space-x-2.5 px-5 py-2.5 rounded-xl bg-[#2B132C] hover:bg-black text-white transition-colors cursor-pointer shadow-sm select-none"
                >
                  <Smartphone className="w-4 h-4 text-white" />
                  <div className="text-left">
                    <p className="text-[8px] text-white/60 font-light uppercase tracking-wider leading-none">
                      Download on the
                    </p>
                    <p className="text-xs font-bold font-sans mt-0.5">App Store</p>
                  </div>
                </a>

                {/* QR Code and Label */}
                <div className="flex items-center space-x-2 bg-white/40 border border-[#B47F35]/15 p-1.5 rounded-xl">
                  {/* Mini Vector QR code */}
                  <svg className="w-9 h-9 text-[#2B132C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3h4v4H3zm14 0h4v4h-4zm0 14h4v4h-4zM3 17h4v4H3zM10 3h4v4h-4zm0 14h4v4h-4zM3 10h4v4H3zm14 0h4v4h-4zm-7 0h4v4h-4z" />
                  </svg>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-secondary-bronze/75 leading-tight select-none font-sans">
                    Scan to<br />Download App
                  </p>
                </div>

              </motion.div>

            </div>

            {/* RIGHT COLUMN: BLENDED REALISTIC IPHONE MOCKUP */}
            <div className="lg:col-span-5 flex justify-center items-center relative min-h-[300px] lg:min-h-[360px]">
              <motion.img 
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src="/mobile_app_phone.png" 
                alt="Mandir iPhone Mockup on Pedestal with Marigolds" 
                className="w-full max-w-[240px] sm:max-w-[290px] lg:max-w-[330px] object-contain select-none z-10 mix-blend-multiply" 
              />
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
