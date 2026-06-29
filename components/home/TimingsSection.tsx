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
            <span className="text-xs font-bold uppercase tracking-widest text-primary-gold">
              Daily Worship Schedules
            </span>
            <h2 className="text-4xl font-heading font-medium tracking-wide text-dark-surface">
              Sacred Darshan Timings
            </h2>
            <p className="text-sm font-light text-secondary-bronze leading-relaxed">
              Join us for daily prayers and experience spiritual rejuvenation. Timings are scheduled around the traditional daily routines of deity worship.
            </p>
            <div className="pt-4">
              <Link
                href="/darshan"
                className="inline-flex items-center space-x-2 text-sm font-semibold text-primary-gold hover:text-secondary-bronze transition-colors"
              >
                <span>Detailed Aarti Schedules</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Timings panels */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {timings.map((time, idx) => (
              <GlassCard hoverEffect className="p-8" key={idx}>
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold mb-6">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-xl font-medium text-dark-surface mb-2">
                  {time.session}
                </h4>
                <p className="text-lg font-bold text-primary-gold mb-4">{time.time}</p>
                <p className="text-xs font-light text-secondary-bronze/75 leading-relaxed font-sans">
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
