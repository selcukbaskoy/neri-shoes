"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import StarRating from "@/components/StarRating";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  media_urls: string[] | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product_id: string;
  product_name: string;
  customer_name: string | null;
  admin_note: string | null;
  order_id: string | null;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<Record<string, string>>({});

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      // sessizce başarısız
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, admin_note: note[id] || null }),
      });
      if (res.ok) loadReviews();
    } catch {
      // ignore
    }
  }

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      approved: "bg-green-500/10 border-green-500/30 text-green-400",
      rejected: "bg-red-500/10 border-red-500/30 text-red-400",
    };
    return map[status] || "bg-[#222] border-[#333] text-muted";
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-[#333] text-muted hover:border-accent/50 hover:text-foreground"
            }`}
          >
            {f === "all" ? "Tümü" : f === "pending" ? "Bekliyor" : f === "approved" ? "Onaylı" : "Reddedilmiş"}
            {" "}
            <span className="ml-1 text-[10px] opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Yorum bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-[#222] bg-[#0f0f0f] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {review.product_name}
                    </span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadge(review.status)}`}>
                      {review.status}
                    </span>
                    {review.order_id && (
                      <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={review.rating} size={14} />
                    <span className="text-xs text-muted">{review.customer_name || "Anonim"}</span>
                    <span className="text-xs text-muted/60">
                      {new Date(review.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                {review.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      className="rounded border border-green-500/40 px-3 py-1.5 text-xs font-semibold text-green-400 transition-colors hover:bg-green-500/10"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => updateStatus(review.id, "rejected")}
                      className="rounded border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Reddet
                    </button>
                  </div>
                )}
              </div>

              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">{review.comment}</p>
              )}

              {review.media_urls && review.media_urls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.media_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block h-16 w-16 overflow-hidden rounded border border-[#333] transition-opacity hover:opacity-80">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}

              {/* Admin note */}
              <div className="mt-4">
                <input
                  type="text"
                  value={note[review.id] ?? review.admin_note ?? ""}
                  onChange={(e) => setNote((prev) => ({ ...prev, [review.id]: e.target.value }))}
                  placeholder="Admin notu..."
                  className="w-full rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-xs text-foreground placeholder-muted/40 outline-none focus:border-accent/60"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
