"use client";

// import React from "react";
// import { HeroSection } from "@/components/home/HeroSection";
// import { IntroSection } from "@/components/home/IntroSection";
// import { ServicesSection } from "@/components/home/ServicesSection";
// import { TimingsSection } from "@/components/home/TimingsSection";
// import { FestivalsSection } from "@/components/home/FestivalsSection";
// import { DonationsSection } from "@/components/home/DonationsSection";
// import { LiveDarshanSection } from "@/components/home/LiveDarshanSection";
// import { MembershipBenefitsSection } from "@/components/home/MembershipBenefitsSection";
// import { HallShowcaseSection } from "@/components/home/HallShowcaseSection";
// import { GallerySection } from "@/components/home/GallerySection";
// import { MobileAppSection } from "@/components/home/MobileAppSection";
// import { TestimonialsSection } from "@/components/home/TestimonialsSection";
// import { LatestNewsSection } from "@/components/home/LatestNewsSection";

// export default function Homepage() {
//   return (
//     <div className="overflow-hidden">
//       <HeroSection />
//       <IntroSection />
//       <ServicesSection />
//       <TimingsSection />
//       <FestivalsSection />
//       {/* <DonationsSection /> */}
//       <LiveDarshanSection />
//       {/* <MembershipBenefitsSection /> */}
//       <HallShowcaseSection />
//       <GallerySection />
//       <MobileAppSection />
//       <TestimonialsSection />
//       <LatestNewsSection />
//     </div>
//   );
// }

import "./globals.css";

export default function RootLayout() {
  if (typeof window !== "undefined") {
    console.error(
      "503 - Service Temporarily Unavailable: An unknown error has occurred while processing the request."
    );
  }

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
          background: "#f5f5f5",
          color: "#333",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "600px",
            padding: "20px",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
            503 - Service Temporarily Unavailable
          </h1>

          <p style={{ color: "#666" }}>
            An unknown error has occurred while processing your request.
            Please try again later.
          </p>

          <p
            style={{
              marginTop: "30px",
              color: "#999",
              fontSize: "14px",
            }}
          >
            Error Code: 503 | Service Unavailable
          </p>
        </div>
      </body>
    </html>
  );
}
