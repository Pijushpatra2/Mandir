"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function MembershipBenefitsSection() {
  return (
    <section className="py-24 bg-surface-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Content left */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-gold">
                Devotee Family Circle
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-medium tracking-wide text-dark-surface leading-tight">
                Membership Program
              </h2>
              <p className="text-secondary-bronze leading-relaxed font-light font-sans">
                Become a life or annual patron to support temple operational funds. Members receive priority access to major festival seating, digital ID cards, and access to spiritual materials.
              </p>
            </div>

            {/* Benefits list */}
            <div className="space-y-4">
              {[
                { title: "Digital Membership & QR Card", desc: "Instantly generated digital card with unique QR code for easy checking at events." },
                { title: "Unified Family Profiles", desc: "Link family details to book joint poojas and festivals seamlessly." },
                { title: "Priority Event Registration", desc: "Get priority bookings for high-demand festival slots and guest priest sevas." },
                { title: "Special Annual Prasad Deliveries", desc: "Annual blessing packages containing prasadam and floral dry-mementos delivered home." }
              ].map((benefit, idx) => (
                <div className="flex items-start space-x-4" key={idx}>
                  <div className="w-6 h-6 rounded-lg bg-primary-gold/10 flex items-center justify-center text-primary-gold shrink-0 mt-1">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-surface text-sm">{benefit.title}</h4>
                    <p className="text-xs text-secondary-bronze/70 leading-relaxed mt-0.5 font-light font-sans">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/membership"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-lg hover:brightness-105 transition-all text-sm inline-flex items-center space-x-2"
              >
                <span>Apply for Membership</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual card preview right */}
          <div className="lg:col-span-6 flex justify-center">
            <GlassCard hoverEffect className="w-full max-w-[400px] p-8 border-primary-gold/30 bg-gradient-to-br from-bg-warm to-white shadow-xl relative overflow-hidden">
              {/* Gold watermark */}
              <div className="absolute top-10 right-10 text-8xl text-primary-gold/5 pointer-events-none font-bold">
                🕉️
              </div>

              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="font-heading text-lg font-medium text-dark-surface leading-none">
                    Patron Member
                  </h3>
                  <p className="text-[10px] text-secondary-bronze/70 font-sans mt-1">
                    Sri Radhe Krishna Mandir
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[9px] font-bold uppercase border border-primary-gold/30 rounded-lg text-primary-gold bg-primary-gold/5">
                  LIFETIME
                </span>
              </div>

              {/* QR Code Graphic */}
              <div className="flex justify-center mb-8">
                <div className="p-3 border border-primary-gold/20 bg-white rounded-2xl shadow-inner">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOCK-MEMBER-CARD"
                    alt="Membership QR Code"
                    className="w-36 h-36"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-primary-gold/15 pt-6">
                <div>
                  <p className="text-[10px] text-secondary-bronze/50 uppercase tracking-wider mb-0.5">
                    Name
                  </p>
                  <p className="font-semibold text-dark-surface">Harish Mehta</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-secondary-bronze/50 uppercase tracking-wider mb-0.5">
                    Member ID
                  </p>
                  <p className="font-mono text-dark-surface font-semibold">MEM-2026-0002</p>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      </div>
    </section>
  );
}
