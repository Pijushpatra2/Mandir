import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/lib/context";
import { QueryProvider } from "@/lib/QueryProvider";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shree Kutch Satsang Swaminarayan Temple, Kampala - Enterprise ERP",
  description:
    "Experience Divine Grace. Book Pooja services, Donate online, Become a Member, and Watch Live Darshan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${cormorantGaramond.variable} ${inter.variable} ${plusJakartaSans.variable} antialiased bg-[#FAF7F2] text-[#111111]`}
      >
        {/* QueryProvider must wrap AppProvider so all contexts can use useQuery */}
        <QueryProvider>
          <AppProvider>{children}</AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
