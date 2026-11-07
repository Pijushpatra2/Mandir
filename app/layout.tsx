
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
            503 - Server Failed
          </h1>

          <p style={{ color: "#666", lineHeight: "1.6" }}>
            We're sorry, but our server is currently experiencing technical
            difficulties and is unable to process your request.
            Our technical team is working to restore the service.
            Please try again later.
          </p>

          <p
            style={{
              marginTop: "30px",
              color: "#999",
              fontSize: "14px",
            }}
          >
            Error Code: 503 | Server Temporarily Unavailable
          </p>
        </div>
      </body>
    </html>
  );
}
