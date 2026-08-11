// import type { Metadata } from "next";
// import { Cormorant_Garamond, Inter, Plus_Jakarta_Sans } from "next/font/google";
// import { AppProvider } from "@/lib/context";
// import { QueryProvider } from "@/lib/QueryProvider";
// import "./globals.css";

// const cormorantGaramond = Cormorant_Garamond({
//   variable: "--font-cormorant",
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   style: ["normal", "italic"],
// });

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
// });

// const plusJakartaSans = Plus_Jakarta_Sans({
//   variable: "--font-jakarta",
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
// });

// export const metadata: Metadata = {
//   title: "Shree Kutch Satsang Swaminarayan Temple, Kampala - Enterprise ERP",
//   description:
//     "Experience Divine Grace. Book Pooja services, Donate online, Become a Member, and Watch Live Darshan.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className="scroll-smooth">
//       <body
//         className={`${cormorantGaramond.variable} ${inter.variable} ${plusJakartaSans.variable} antialiased bg-[#FAF7F2] text-[#111111]`}
//       >
//         {/* QueryProvider must wrap AppProvider so all contexts can use useQuery */}
//         <QueryProvider>
//           <AppProvider>{children}</AppProvider>
//         </QueryProvider>
//       </body>
//     </html>
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
