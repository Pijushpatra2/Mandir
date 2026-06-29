"use client";

import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { mockTestimonials } from "@/data/testimonials";

export function TestimonialsSection() {
  // Dynamically refine text branding
  const testimonials = mockTestimonials.map(t => ({
    ...t,
    text: t.text
      .replace(/Sri Radhe Krishna Mandir/g, "Shree Swaminarayan Temple")
      .replace(/Radhe Krishna Hall/g, "Shree Swaminarayan Hall")
  }));

  // Framer Motion Animation Variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7 } 
    }
  };

  return (
    <section className="py-24 bg-[#FAF7F2] font-jakarta relative overflow-hidden">
      
      {/* Background soft design elements */}
      <div className="absolute -right-36 top-1/4 text-[#B47F35]/5 text-[240px] pointer-events-none select-none font-serif leading-none">
        ⚜️
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B47F35]">
              DEVOTEE VOICES
            </span>
            <span className="text-[#B47F35] text-[8px]">⚜️</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#2B132C]">
            What Devotees <span className="text-[#B47F35] font-normal italic">Say</span>
          </h2>

          <div className="flex items-center justify-center space-x-1.5 py-1">
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
            <span className="text-[#B47F35] text-[7px]">✦</span>
            <div className="h-[1.5px] bg-[#B47F35]/30 w-6" />
          </div>

          <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-light font-sans max-w-xl mx-auto">
            Read experiences from our global family regarding their interaction with our temple services.
          </p>
        </div>

        {/* 3 Column Grid Testimonials */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch"
        >
          {testimonials.map((test) => (
            <motion.div
              key={test.id}
              variants={cardVariants}
              className="bg-white border border-[#B47F35]/15 rounded-[32px] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group relative overflow-hidden text-left"
              whileHover={{ y: -6 }}
            >
              
              {/* Quotes Watermark Icon */}
              <span className="absolute top-4 right-6 text-6xl text-[#B47F35]/10 font-serif pointer-events-none select-none">
                “
              </span>

              <div className="space-y-4">
                {/* 5-Star Ratings */}
                <div className="flex items-center gap-1 text-[#B47F35]">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B47F35] stroke-none" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-light font-sans italic pr-2">
                  &ldquo;{test.text}&rdquo;
                </p>
              </div>

              {/* Devotee Info row */}
              <div className="flex items-center space-x-3.5 pt-6 border-t border-[#B47F35]/10 mt-8">
                <img
                  src={test.avatarUrl}
                  alt={test.name}
                  className="w-11 h-11 rounded-full border border-[#B47F35]/25 object-cover shadow-sm shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#2B132C]">{test.name}</h4>
                  <span className="text-[9px] font-bold text-[#B47F35] uppercase tracking-widest block mt-0.5">
                    {test.role}
                  </span>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
