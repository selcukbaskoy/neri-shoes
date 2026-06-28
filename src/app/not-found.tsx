import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="tr">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "clamp(5rem, 20vw, 10rem)",
              fontWeight: 700,
              lineHeight: 1,
              color: "#FFD000",
              margin: 0,
            }}
          >
            404
          </p>
          <div
            style={{
              margin: "1.5rem auto",
              height: "1px",
              width: "160px",
              background: "linear-gradient(90deg, transparent, #FFD000, transparent)",
            }}
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Sayfa Bulunamadı
          </h1>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "2.5rem" }}>
            Aradığınız sayfa taşınmış veya artık mevcut değil.
          </p>
          <Link
            href="/tr"
            style={{
              display: "inline-block",
              border: "2px solid #FFD000",
              color: "#FFD000",
              padding: "0.75rem 1.5rem",
              fontSize: "0.8rem",
              fontFamily: "sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </body>
    </html>
  );
}
