"use client";

import React, { useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useCmsPage } from "@/lib/cms";
import { DEFAULT_HOME_CONTENT } from "@/data/cmsDefaults";

export function TestimonialsSection() {
  const { content: cms } = useCmsPage("home", DEFAULT_HOME_CONTENT);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const testimonials = (cms.testimonials?.items && cms.testimonials.items.length > 0)
    ? cms.testimonials.items
    : (DEFAULT_HOME_CONTENT.testimonials.items || []);

  return (
    <section className="py-24 bg-[#FAF7F2] font-poppins relative overflow-hidden">
      {/* Background soft design elements */}
      <div className="absolute -right-36 top-1/4 text-[#B47F35]/5 text-[240px] pointer-events-none select-none font-serif leading-none">
        ⚜️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[#B47F35] text-xs">⚜️</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#B47F35] font-poppins">
              {cms.testimonials?.badge || "DEVOTEE VOICES"}
            </span>
            <span className="text-[#B47F35] text-xs">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C]">
            {cms.testimonials?.title || (
              <>
                What Devotees <span className="text-[#B47F35] font-normal italic">Say</span>
              </>
            )}
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
            <span className="text-[#B47F35] text-xs">✦</span>
            <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-secondary-bronze leading-relaxed font-normal font-poppins max-w-xl mx-auto">
            {cms.testimonials?.subtitle || "Read experiences from our global family regarding their interaction with our temple services."}
          </p>
        </div>

        {/* Swiper Carousel with Left/Right Buttons & Auto-scroll */}
        <div className="relative max-w-6xl mx-auto px-2 sm:px-4">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={testimonials.length > 2}
            autoplay={{
              delay: 3500,
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
            className="pb-14 pt-2 !overflow-visible"
          >
            {testimonials.map((test, index) => (
              <SwiperSlide key={test.id || index} className="h-auto">
                <div className="bg-white border border-[#B47F35]/20 rounded-[32px] p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group relative overflow-hidden text-left font-poppins h-full select-none">
                  {/* Decorative Quote Icon Watermark */}
                  <Quote className="absolute top-5 right-6 w-12 h-12 text-[#B47F35]/10 stroke-none fill-current pointer-events-none select-none" />

                  <div className="space-y-4">
                    {/* Star Ratings */}
                    <div className="flex items-center gap-1 text-[#B47F35]">
                      {[...Array(test.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#B47F35] stroke-none" />
                      ))}
                    </div>

                    {/* Review Quote */}
                    <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-normal font-poppins italic pr-2">
                      &ldquo;{test.quote}&rdquo;
                    </p>
                  </div>

                  {/* Devotee Profile Footer */}
                  <div className="flex items-center space-x-3.5 pt-6 border-t border-[#B47F35]/15 mt-6">
                    {test.avatar ? (
                      <img
                        src={test.avatar}
                        alt={test.name}
                        className="w-12 h-12 rounded-full border-2 border-[#B47F35]/25 object-cover shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-[#B47F35]/25 bg-[#B47F35]/10 text-[#B47F35] font-bold text-base flex items-center justify-center shrink-0">
                        {test.name ? test.name.charAt(0) : "D"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="text-sm sm:text-base font-bold text-[#2B132C] font-poppins truncate">
                        {test.name}
                      </h4>
                      <span className="text-xs font-semibold text-[#B47F35] uppercase tracking-wider block mt-0.5 font-poppins truncate">
                        {test.location || "Devotee"}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Left / Right Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              ref={prevRef}
              type="button"
              aria-label="Previous Testimonial"
              className="w-11 h-11 rounded-full border border-[#B47F35]/30 bg-white hover:bg-[#FAF7F2] text-[#2B132C] hover:text-[#B47F35] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next Testimonial"
              className="w-11 h-11 rounded-full border border-[#B47F35]/30 bg-white hover:bg-[#FAF7F2] text-[#2B132C] hover:text-[#B47F35] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
