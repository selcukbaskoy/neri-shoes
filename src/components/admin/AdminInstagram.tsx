"use client";

import { useState } from "react";

interface AdminInstagramProps {
  onOpenAsProduct: (images: string[], caption: string) => void;
}

export default function AdminInstagram({ onOpenAsProduct }: AdminInstagramProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFetch() {
    setError("");
    if (!url.trim()) {
      setError("Instagram gönderi linki girin");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instagram/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Çekilemedi");
      setUrl("");
      onOpenAsProduct(data.images || [], data.caption || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "min-h-11 w-full rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-base text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60 sm:text-sm";

  return (
    <div className="max-w-xl">
      <p className="mb-4 text-sm text-muted">
        Instagram gönderi linkini yapıştırın, görsel ve açıklama otomatik çekilip
        Ürün Ekle formu önceden doldurulmuş olarak açılır. Fiyat, beden, stok gibi
        bilgileri siz tamamlayıp kaydedersiniz.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) handleFetch();
          }}
          placeholder="https://www.instagram.com/p/..."
          className={inputClass}
          disabled={loading}
        />
        <button
          onClick={handleFetch}
          disabled={loading}
          className="min-h-11 shrink-0 rounded border border-accent/40 px-5 text-xs font-semibold uppercase tracking-[0.1em] text-accent transition-colors hover:border-accent hover:bg-accent/10 disabled:opacity-60"
        >
          {loading ? "Çekiliyor..." : "Görseli Çek"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
