"use client";

import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { IntroSection } from "@/components/home/IntroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TimingsSection } from "@/components/home/TimingsSection";
import { FestivalsSection } from "@/components/home/FestivalsSection";
import { DonationsSection } from "@/components/home/DonationsSection";
import { LiveDarshanSection } from "@/components/home/LiveDarshanSection";
import { MembershipBenefitsSection } from "@/components/home/MembershipBenefitsSection";
import { HallShowcaseSection } from "@/components/home/HallShowcaseSection";
import { GallerySection } from "@/components/home/GallerySection";
import { MobileAppSection } from "@/components/home/MobileAppSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { LatestNewsSection } from "@/components/home/LatestNewsSection";

export default function Homepage() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <IntroSection />
      <ServicesSection />
      <TimingsSection />
      <FestivalsSection />
      {/* <DonationsSection /> */}
      <LiveDarshanSection />
      {/* <MembershipBenefitsSection /> */}
      <HallShowcaseSection />
      <GallerySection />
      <MobileAppSection />
      <TestimonialsSection />
      <LatestNewsSection />
    </div>
  );
}
