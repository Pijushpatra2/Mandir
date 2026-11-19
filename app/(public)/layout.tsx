// import { Navbar } from "@/components/shared/Navbar";
// import { Footer } from "@/components/shared/Footer";

// export default function PublicLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex flex-col min-h-screen font-poppins text-gray-900 public-site-root">
//       <Navbar />
//       <main className="flex-grow">{children}</main>
//       <Footer />
//     </div>
//   );
// }


export default function PublicLayout() {
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
