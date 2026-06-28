"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ color: "#FFD000", marginBottom: "0.5rem" }}>Kritik Hata</h1>
          <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {error.message || "Sayfa yüklenemedi."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ background: "#FFD000", color: "#000", border: "none", padding: "0.5rem 1.5rem", cursor: "pointer", fontWeight: 600 }}
          >
            Yenile
          </button>
        </div>
      </body>
    </html>
  );
}
