"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function TimingsSection() {
  const timings = [
    { session: "Morning Darshan", time: "5:30 AM - 11:00 AM", desc: "Perfect for morning rituals and meditative prayers." },
    { session: "Evening Darshan", time: "4:00 PM - 8:30 PM", desc: "Join the congregational chanting and twilight discourse." }
  ];

  return (
    <section className="py-24 bg-surface-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text description */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary-gold font-poppins">
              Daily Worship Schedules
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium tracking-wide text-dark-surface">
              Sacred Darshan Timings
            </h2>
            <p className="text-base sm:text-lg lg:text-xl font-normal text-secondary-bronze leading-relaxed font-poppins">
              Join us for daily prayers and experience spiritual rejuvenation. Timings are scheduled around the traditional daily routines of deity worship.
            </p>
            <div className="pt-4">
              <Link
                href="/darshan"
                className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-primary-gold hover:text-secondary-bronze transition-colors font-poppins"
              >
                <span>Detailed Aarti Schedules</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>

          {/* Timings panels */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {timings.map((time, idx) => (
              <GlassCard hoverEffect className="p-8" key={idx}>
                <div className="w-12 h-12 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-xl sm:text-2xl font-medium text-dark-surface mb-2">
                  {time.session}
                </h4>
                <p className="text-xl sm:text-2xl font-bold text-primary-gold mb-4 font-poppins">{time.time}</p>
                <p className="text-sm sm:text-base font-normal text-secondary-bronze/85 leading-relaxed font-poppins">
                  {time.desc}
                </p>
              </GlassCard>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
