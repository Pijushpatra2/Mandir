import "./globals.css";

export default function RootLayout() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
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
            Our website is temporarily unavailable due to scheduled
            maintenance. Please try again later.
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
