"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useApp } from "@/lib/context";
import { useCmsPage } from "@/lib/cms";
import { DEFAULT_HOME_CONTENT } from "@/data/cmsDefaults";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function LatestNewsSection() {
  const { news } = useApp();
  const { content: cms } = useCmsPage("home", DEFAULT_HOME_CONTENT);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Dynamic articles from CMS with fallback to app context news
  const articles = (cms.latest_news?.articles && cms.latest_news.articles.length > 0)
    ? cms.latest_news.articles
    : (news && news.length > 0 ? news : (DEFAULT_HOME_CONTENT.latest_news.articles || []));

  return (
    <section className="py-24 bg-bg-warm border-t border-primary-gold/15 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[#B47F35] text-xs">⚜️</span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#B47F35] font-poppins">
                {cms.latest_news?.badge || "Mandir Bulletins"}
              </span>
              <span className="text-[#B47F35] text-xs">⚜️</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C]">
              {cms.latest_news?.title || "Latest News & Press Releases"}
            </h2>
            <p className="text-sm sm:text-base text-secondary-bronze font-normal font-poppins mt-2 max-w-2xl">
              {cms.latest_news?.subtitle || "Stay informed about temple events, infrastructural modifications, and social updates."}
            </p>
          </div>

          {/* Swiper Left / Right Navigation Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              ref={prevRef}
              type="button"
              aria-label="Previous News"
              className="w-11 h-11 rounded-full border border-[#B47F35]/30 bg-white hover:bg-[#FAF7F2] text-[#2B132C] hover:text-[#B47F35] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next News"
              className="w-11 h-11 rounded-full border border-[#B47F35]/30 bg-white hover:bg-[#FAF7F2] text-[#2B132C] hover:text-[#B47F35] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Swiper Carousel with Auto-Scroll & Responsive Grid */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={28}
            slidesPerView={1}
            loop={articles.length > 2}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper: any) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              640: {
                slidesPerView: 1.5,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 28,
              },
            }}
            className="pb-12 !overflow-visible"
          >
            {articles.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <GlassCard
                  hoverEffect
                  className="overflow-hidden p-0 flex flex-col h-full font-poppins bg-white border-primary-gold/15 rounded-3xl shadow-xs hover:shadow-md transition-all text-left"
                >
                  <div className="relative h-48 sm:h-52 w-full bg-stone-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35]">
                        <Calendar className="w-10 h-10 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-surface-white/95 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-secondary-bronze font-poppins shadow-xs border border-white/60">
                      {item.category || "Bulletin"}
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-xs text-secondary-bronze/70 uppercase font-semibold font-poppins flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#B47F35]" />
                        <span>Published on: {item.publishedDate}</span>
                      </span>
                      <h3 className="text-lg sm:text-xl font-heading font-medium text-dark-surface mt-2.5 mb-2.5 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-bronze/85 font-normal leading-relaxed font-poppins mb-6 line-clamp-3">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="border-t border-primary-gold/15 pt-4 mt-auto">
                      <Link
                        href="/about"
                        className="text-xs sm:text-sm font-semibold text-primary-gold hover:text-secondary-bronze transition-colors flex items-center space-x-1.5 font-poppins"
                      >
                        <span>Read Full Article</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
