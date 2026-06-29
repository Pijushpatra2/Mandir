"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";

export default function GalleryPage() {
  const { news } = useApp(); // Can draw from common state, but let's query mockGalleryItems directly
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", "Deities", "Festivals", "Temple Complex", "Social Events"];

  const galleryItems = [
    { id: "gal-1", title: "Sri Radhe Krishna Shringar Darshan", category: "Deities", imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", date: "2026-06-21" },
    { id: "gal-2", title: "Janmashtami Midnight Abhishek", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=800&q=80", date: "2025-08-25" },
    { id: "gal-3", title: "Main Temple Dome & Architecture", category: "Temple Complex", imageUrl: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=800&q=80", date: "2026-05-10" },
    { id: "gal-4", title: "Vasant Utsav Holi Celebrations", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80", date: "2026-03-25" },
    { id: "gal-5", title: "Spiritual Discourse Hall in Evening", category: "Temple Complex", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", date: "2026-04-18" },
    { id: "gal-6", title: "Devotees Serving in Nitya Annadan Kitchen", category: "Social Events", imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80", date: "2026-06-01" },
    { id: "gal-7", title: "Maha Shivratri Deepotsav", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80", date: "2026-03-08" },
    { id: "gal-8", title: "Children's Spiritual Camp Prize Distribution", category: "Social Events", imageUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80", date: "2026-06-15" }
  ];

  const filteredItems = galleryItems.filter((item) => {
    if (filter === "All") return true;
    return item.category === filter;
  });

  return (
    <div className="py-24 bg-bg-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Snapshots"
          title="Temple Media Gallery"
          subtitle="A collection of divine shringars, vibrant festivals, community services, and architectural beauty."
        />

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filter === cat
                  ? "bg-primary-gold text-white border-primary-gold shadow-sm"
                  : "border-primary-gold/20 text-secondary-bronze bg-white hover:bg-primary-gold/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry-Style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <GlassCard hoverEffect className="overflow-hidden p-0 flex flex-col group h-full" key={item.id}>
              <div className="relative h-60 w-full overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-bold uppercase tracking-wider text-secondary-bronze">
                  {item.category}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-heading text-lg font-medium text-dark-surface leading-tight mb-2 group-hover:text-primary-gold transition-colors">
                    {item.title}
                  </h4>
                </div>
                <p className="text-[10px] text-secondary-bronze/55 uppercase font-semibold mt-4">
                  Captured: {item.date}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

      </div>
    </div>
  );
}
