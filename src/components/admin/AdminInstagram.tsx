"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface InstagramDraft {
  id: string;
  ig_media_id: string;
  permalink: string | null;
  caption: string | null;
  media_type: string;
  image_urls: string[];
  ig_timestamp: string | null;
}

interface AdminInstagramProps {
  onOpenAsProduct: (images: string[], caption: string) => void;
}

export default function AdminInstagram({ onOpenAsProduct }: AdminInstagramProps) {
  const [drafts, setDrafts] = useState<InstagramDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDrafts();
  }, []);

  async function loadDrafts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instagram");
      const data = await res.json();
      setDrafts(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setError("");
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/instagram", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Senkronizasyon başarısız");
      await loadDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setSyncing(false);
    }
  }

  async function handleReject(id: string) {
    if (!window.confirm("Bu gönderiyi reddetmek istediğinize emin misiniz?")) return;
    try {
      await fetch("/api/admin/instagram", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // ignore
    }
  }

  async function handleOpenAsProduct(id: string) {
    setError("");
    setImportingId(id);
    try {
      const res = await fetch("/api/admin/instagram/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aktarım başarısız");
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      onOpenAsProduct(data.images || [], data.caption || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted">{drafts.length} bekleyen gönderi</span>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="min-h-11 rounded border border-accent/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-accent transition-colors hover:border-accent hover:bg-accent/10 disabled:opacity-60"
        >
          {syncing ? "Senkronize ediliyor..." : "Instagram'dan Çek"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : drafts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Bekleyen gönderi yok. &quot;Instagram&apos;dan Çek&quot; ile yeni gönderileri kontrol edin.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="rounded-lg border border-[#222] bg-surface p-3">
              <div className="flex gap-2 overflow-x-auto">
                {draft.image_urls.slice(0, 4).map((url, i) => (
                  <Image
                    key={i}
                    src={url}
                    alt="Instagram gönderisi"
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 shrink-0 rounded object-cover"
                  />
                ))}
              </div>
              {draft.caption && (
                <p className="mt-2 line-clamp-3 text-xs text-muted">{draft.caption}</p>
              )}
              {draft.permalink && (
                <a
                  href={draft.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[10px] text-accent underline"
                >
                  Instagram&apos;da gör
                </a>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleOpenAsProduct(draft.id)}
                  disabled={importingId === draft.id}
                  className="min-h-11 flex-1 rounded border border-accent px-3 text-xs text-accent transition-colors hover:bg-accent hover:text-black disabled:opacity-60"
                >
                  {importingId === draft.id ? "Aktarılıyor..." : "Ürün Olarak Aç"}
                </button>
                <button
                  onClick={() => handleReject(draft.id)}
                  className="min-h-11 rounded border border-red-500 px-3 text-xs text-red-500 transition-colors hover:bg-red-500 hover:text-black"
                >
                  Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
