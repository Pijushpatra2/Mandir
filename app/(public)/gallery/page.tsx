"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "@/lib/context";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { useCmsPage } from "@/lib/cms";
import { DEFAULT_GALLERY_CONTENT, INITIAL_GALLERY_ITEMS } from "@/data/cmsDefaults";

export default function GalleryPage() {
  const { content: cms } = useCmsPage("gallery", DEFAULT_GALLERY_CONTENT);
  const [filter, setFilter] = useState<string>("All");
  const [galleryItems, setGalleryItems] = useState<any[]>(INITIAL_GALLERY_ITEMS);

  // Background fetch of published gallery items from CMS API
  useEffect(() => {
    let isMounted = true;
    async function fetchGallery() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/cms/gallery`, { timeout: 4000 });
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0 && isMounted) {
          // Normalize imageUrl / image_url and date / captured_date
          const formatted = res.data.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            imageUrl: item.image_url || item.imageUrl,
            date: item.captured_date ? item.captured_date.split("T")[0] : item.date || ""
          }));
          setGalleryItems(formatted);
        }
      } catch (_) {
        // Retain static initial items if offline
      }
    }
    fetchGallery();
    return () => { isMounted = false; };
  }, []);

  const categories = cms.categories?.categories || ["All", "Deities", "Festivals", "Temple Complex", "Social Events"];

  const filteredItems = galleryItems.filter((item) => {
    if (filter === "All") return true;
    return item.category === filter;
  });

  return (
    <div className="py-24 bg-bg-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge={cms.header?.badge || "Snapshots"}
          title={cms.header?.title || "Temple Media Gallery"}
          subtitle={cms.header?.subtitle || "A collection of divine shringars, vibrant festivals, community services, and architectural beauty."}
        />

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 text-sm sm:text-base font-semibold rounded-xl border transition-all cursor-pointer font-poppins ${
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
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider text-secondary-bronze font-poppins">
                  {item.category}
                </div>
              </div>
              <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-heading text-lg sm:text-xl font-medium text-dark-surface leading-tight mb-2 group-hover:text-primary-gold transition-colors">
                    {item.title}
                  </h4>
                </div>
                {item.date && (
                  <p className="text-xs sm:text-sm text-secondary-bronze/70 uppercase font-medium mt-4 font-poppins">
                    Captured: {item.date}
                  </p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

      </div>
    </div>
  );
}
