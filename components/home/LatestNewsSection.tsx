"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useApp } from "@/lib/context";

export function LatestNewsSection() {
  const { news } = useApp();

  return (
    <section className="py-24 bg-bg-warm border-t border-primary-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Mandir Bulletins"
          title="Latest News & Press Releases"
          subtitle="Stay informed about temple events, infrastructural modifications, and social updates."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <GlassCard hoverEffect className="overflow-hidden p-0 flex flex-col h-full" key={item.id}>
              <div className="relative h-48 w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-surface-white/90 backdrop-blur-md rounded-full text-[10px] font-semibold uppercase tracking-wider text-secondary-bronze">
                  {item.category}
                </div>
              </div>
              <div className="p-8 flex flex-col justify-between flex-grow">
                <div>
                  <span className="text-[10px] text-secondary-bronze/55 uppercase font-semibold">
                    Published on: {item.publishedDate}
                  </span>
                  <h3 className="text-lg font-heading font-medium text-dark-surface mt-2 mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary-bronze/85 font-light leading-relaxed font-sans mb-6">
                    {item.excerpt}
                  </p>
                </div>
                <div className="border-t border-primary-gold/15 pt-4">
                  <Link
                    href="/about"
                    className="text-xs font-semibold text-primary-gold hover:text-secondary-bronze transition-colors flex items-center space-x-1"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
