"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

export function GallerySection() {
  const items = [
    { title: "Sri Radhe Krishna Darshan", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80", span: "md:col-span-2 md:row-span-2" },
    { title: "Janmashtami Abhishek", img: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=600&q=80", span: "" },
    { title: "Shivratri Deepotsav", img: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=600&q=80", span: "" },
    { title: "Vedic Gurukul Camp", img: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80", span: "md:col-span-2" },
    { title: "Temple Dome Architecture", img: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=600&q=80", span: "" },
    { title: "Prasadam Seva", img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80", span: "" }
  ];

  return (
    <section className="py-24 bg-surface-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Sacred Moments"
          title="Temple Media Gallery"
          subtitle="Glimpses of daily rituals, beautiful festivals, and community welfare events."
        />

        {/* Masonry image layouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "relative rounded-3xl overflow-hidden shadow-lg border border-primary-gold/15 group aspect-square",
                item.span
              )}
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-sm font-heading font-medium tracking-wide">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-primary-gold hover:text-secondary-bronze transition-colors"
          >
            <span>Explore Entire Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
