"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame, Building, Heart, UserCheck, Tv, CalendarDays, ShoppingBag, Smartphone, ShieldCheck, Headphones, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";

export function ServicesSection() {
  const services = [
    {
      title: "Pooja Booking",
      desc: "Book personalized or family poojas with resident priests.",
      icon: Flame,
      href: "/services",
      colorClass: "text-orange-600",
      bgClass: "bg-orange-500/10 border-orange-500/20",
      exploreColor: "text-orange-600 hover:text-orange-700"
    },
    {
      title: "Hall Booking",
      desc: "Reserve Shree Swaminarayan Hall for weddings and holy functions.",
      icon: Building,
      href: "/hall-booking",
      colorClass: "text-purple-600",
      bgClass: "bg-purple-500/10 border-purple-500/20",
      exploreColor: "text-purple-600 hover:text-purple-700"
    },
    {
      title: "Donation Portal",
      desc: "Contribute to Annadan, Temple Expansion, or general funds.",
      icon: Heart,
      href: "/donations",
      colorClass: "text-pink-600",
      bgClass: "bg-pink-500/10 border-pink-500/20",
      exploreColor: "text-pink-600 hover:text-pink-700"
    },
    {
      title: "Membership Program",
      desc: "Join our community with digital QR cards & family profiles.",
      icon: UserCheck,
      href: "/membership",
      colorClass: "text-[#B47F35]",
      bgClass: "bg-[#B47F35]/10 border-[#B47F35]/20",
      exploreColor: "text-[#B47F35] hover:text-[#8B5E34]"
    },
    {
      title: "Live Darshan",
      desc: "Watch live stream broadcast from the main shrine.",
      icon: Tv,
      href: "/live-darshan",
      colorClass: "text-blue-600",
      bgClass: "bg-blue-500/10 border-blue-500/20",
      exploreColor: "text-blue-600 hover:text-blue-700"
    },
    {
      title: "Temple Events",
      desc: "Stay updated with upcoming festivals and spiritual discourse schedules.",
      icon: CalendarDays,
      href: "/events",
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
      exploreColor: "text-emerald-600 hover:text-emerald-700"
    },
    {
      title: "Devotional Store",
      desc: "Browse and buy puja kits, idols, books, and prasadam.",
      icon: ShoppingBag,
      href: "/shop",
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-500/10 border-indigo-500/20",
      exploreColor: "text-indigo-600 hover:text-indigo-700"
    },
    {
      title: "Mobile App",
      desc: "Get notifications and quick access on our mobile app.",
      icon: Smartphone,
      href: "/contact",
      colorClass: "text-sky-600",
      bgClass: "bg-sky-500/10 border-sky-500/20",
      exploreColor: "text-sky-600 hover:text-sky-700"
    }
  ];

  return (
    <section className="py-24 bg-bg-warm relative overflow-hidden font-jakarta">
      
      {/* Grayscale Temple Background silhouettes on left and right */}
      <div className="absolute left-0 bottom-0 top-0 w-64 opacity-[0.03] pointer-events-none select-none hidden lg:block">
        <img src="/temple_hero_bg.png" className="w-full h-full object-contain object-left filter grayscale" alt="" />
      </div>
      <div className="absolute right-0 bottom-0 top-0 w-64 opacity-[0.03] pointer-events-none select-none hidden lg:block">
        <img src="/temple_hero_bg.png" className="w-full h-full object-contain object-right filter grayscale" alt="" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35]">
              OUR SERVICES
            </span>
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C]">
            SaaS-Grade <span className="text-[#B47F35] font-normal italic">Quick Services</span>
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
            <span className="text-[#B47F35] text-[7px]">✦</span>
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
          </div>

          <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-light font-sans max-w-xl mx-auto">
            Manage your spiritual, social, and devotional requests with a modern, premium interface.
          </p>
        </div>

        {/* 8 Cards Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((item, index) => {
            const Icon = item.icon;
            return (
              <GlassCard 
                key={index} 
                hoverEffect
                className="p-8 border-primary-gold/10 rounded-[32px] bg-white flex flex-col justify-between items-center text-center group shadow-sm hover:shadow-md"
                delay={index * 0.05}
              >
                {/* Icon Backdrop Circle with sparkle overlays */}
                <div className="relative mb-6">
                  <div className={`w-14 h-14 rounded-full border ${item.bgClass} flex items-center justify-center ${item.colorClass} shadow-inner transition-all group-hover:scale-105 duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {/* Subtle Sparkle Dots */}
                  <span className={`absolute -top-1 -right-1 text-[8px] ${item.colorClass} opacity-60 animate-pulse`}>✦</span>
                  <span className={`absolute -bottom-1 -left-1 text-[6px] ${item.colorClass} opacity-40`}>✦</span>
                </div>

                {/* Content */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-bold text-[#2B132C] tracking-wide">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-secondary-bronze/75 font-sans leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>

                {/* Explore Link CTA */}
                <Link 
                  href={item.href}
                  className={`inline-flex items-center space-x-1 text-[11px] font-bold tracking-wider uppercase transition-all ${item.exploreColor} cursor-pointer`}
                >
                  <span>Explore Service</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </GlassCard>
            );
          })}
        </div>

        {/* Bottom Feature trust Banner */}
        <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            
            {/* Feature 1 */}
            <div className="flex items-center space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">Secure & Trusted</h4>
                <p className="text-[10px] text-secondary-bronze/80 font-light mt-0.5 leading-tight font-sans">
                  Bank-level security for all transactions and data.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">24/7 Support</h4>
                <p className="text-[10px] text-secondary-bronze/80 font-light mt-0.5 leading-tight font-sans">
                  We&apos;re here to help you every step of the way.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">Instant Access</h4>
                <p className="text-[10px] text-secondary-bronze/80 font-light mt-0.5 leading-tight font-sans">
                  Quick approvals and real-time updates on requests.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 shadow-sm border border-[#B47F35]/15">
                {/* SVG Lotus Icon */}
                <svg className="w-5 h-5 text-[#B47F35]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22C12 22 20 18 20 12C20 9 18 8 16 8C14 8 13 10 12 11C11 10 10 8 8 8C6 8 4 9 4 12C4 18 12 22 12 22Z" />
                  <path d="M12 22C12 22 16 17 16 12C16 7 12 4 12 4C12 4 8 7 8 12C8 17 12 22 12 22Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B132C]">Devotee First</h4>
                <p className="text-[10px] text-secondary-bronze/80 font-light mt-0.5 leading-tight font-sans">
                  Everything we build is with devotees in mind.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
