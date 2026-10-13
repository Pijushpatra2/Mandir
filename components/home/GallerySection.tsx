"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowRight, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";
import { useCmsPage } from "@/lib/cms";
import { DEFAULT_HOME_CONTENT, INITIAL_GALLERY_ITEMS } from "@/data/cmsDefaults";

interface GalleryPhoto {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  date?: string;
}

export function GallerySection() {
  const { content: cms } = useCmsPage("home", DEFAULT_HOME_CONTENT);
  const [galleryItems, setGalleryItems] = useState<GalleryPhoto[]>(
    INITIAL_GALLERY_ITEMS.slice(0, 4).map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      date: item.date
    }))
  );

  // Fetch live published gallery items from CMS backend
  useEffect(() => {
    let isMounted = true;
    async function fetchGallery() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/cms/gallery`, { timeout: 4000 });
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0 && isMounted) {
          const normalized: GalleryPhoto[] = res.data.data.slice(0, 4).map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category || "Deities",
            imageUrl: item.image_url || item.imageUrl,
            date: item.captured_date ? String(item.captured_date).split("T")[0] : item.date || ""
          }));
          setGalleryItems(normalized);
        }
      } catch (_) {
        // Silently retain static baseline items if API is unreachable
      }
    }
    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure exactly 4 items are used for the Bento Grid
  const bentoItems = galleryItems.slice(0, 4);

  // Bento layout configuration per index
  const getBentoClasses = (idx: number) => {
    switch (idx) {
      case 0:
        // Featured hero card: Spans 6 columns & 2 rows on desktop; full width on tablet/mobile
        return "lg:col-span-6 lg:row-span-2 md:col-span-2 min-h-[340px] sm:min-h-[420px] lg:min-h-[520px]";
      case 1:
        // Wide landscape card: Spans 6 columns on desktop row 1
        return "lg:col-span-6 md:col-span-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[246px]";
      case 2:
        // Square/compact card: Spans 3 columns on desktop row 2
        return "lg:col-span-3 md:col-span-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[246px]";
      case 3:
      default:
        // Companion card: Spans 3 columns on desktop row 2; full width on tablet
        return "lg:col-span-3 md:col-span-2 min-h-[220px] sm:min-h-[260px] lg:min-h-[246px]";
    }
  };

  return (
    <section className="py-24 bg-surface-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={cms.gallery_highlight?.badge || "Sacred Moments"}
          title={cms.gallery_highlight?.title || "Temple Media Gallery"}
          subtitle={cms.gallery_highlight?.subtitle || "Glimpses of daily rituals, beautiful festivals, and community welfare events."}
        />

        {/* 4-Item Responsive Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 mt-12">
          {bentoItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className={cn(
                "group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-primary-gold/20 transition-all duration-500 bg-stone-100 flex flex-col justify-end",
                getBentoClasses(idx)
              )}
            >
              {/* Background Photo */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                loading="lazy"
              />

              {/* Top Category Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-white border border-white/20 shadow-sm font-poppins">
                  <Sparkles className="w-3 h-3 text-primary-gold" />
                  <span>{item.category}</span>
                </span>
              </div>

              {/* Bottom Gradient Scrim & Captions */}
              <div className="relative z-10 p-5 sm:p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-16 transition-opacity duration-300">
                <h4 className="text-white font-heading font-bold text-base sm:text-lg lg:text-xl leading-snug drop-shadow-sm group-hover:text-primary-gold transition-colors">
                  {item.title}
                </h4>
                {item.date && (
                  <p className="text-[11px] sm:text-xs text-white/70 mt-1 font-medium font-poppins">
                    Captured on {item.date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold text-primary-gold hover:text-secondary-bronze px-6 py-3 rounded-2xl border border-primary-gold/30 hover:border-primary-gold bg-primary-gold/5 hover:bg-primary-gold/10 transition-all font-poppins shadow-xs cursor-pointer"
          >
            <span>Explore Entire Temple Gallery</span>
            <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
