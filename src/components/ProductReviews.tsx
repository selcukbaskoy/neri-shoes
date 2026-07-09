// src/components/ProductReviews.tsx
// Ürün sayfası yorum bölümü: ortalama puan, yorum listesi, yorum formu

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  media_urls: string[] | null;
  created_at: string;
  verified: boolean;
  customer_name?: string | null;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const t = useTranslations("reviews");
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      // sessizce başarısız
    } finally {
      setLoading(false);
    }
  }

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const verifiedCount = reviews.filter((r) => r.verified).length;

  return (
    <div className="mt-16 border-t border-[#222] pt-12">
      <h2 className="mb-8 font-serif text-2xl text-foreground">
        {t("reviewsTitle")} <span className="text-accent">({reviews.length})</span>
      </h2>

      {/* Ortalama + Dağılım */}
      <div className="mb-10 grid gap-8 sm:grid-cols-[200px_1fr]">
        <div className="text-center sm:text-left">
          <div className="text-5xl font-bold text-accent">{avgRating.toFixed(1)}</div>
          <div className="mt-2 flex justify-center sm:justify-start">
            <StarRating rating={Math.round(avgRating)} size={20} />
          </div>
          <p className="mt-1 text-xs text-muted">{t("basedOn", { count: reviews.length })}</p>
          {verifiedCount > 0 && (
            <p className="mt-2 text-xs text-accent/80">
              ✓ {verifiedCount} {t("verifiedPurchases")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {ratingDistribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3">
              <span className="w-3 text-xs text-muted">{d.star}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#222]">
                <div
                  className="h-full rounded-full bg-accent/70 transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs text-muted">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Yorum Formu */}
      {isAuthenticated && (
        <div className="mb-10">
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded border border-accent/40 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            {showForm ? t("cancel") : t("writeReview")}
          </button>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 overflow-hidden rounded-lg border border-[#222] bg-[#0f0f0f] p-6"
            >
              <ReviewForm productId={productId} productName={productName} onSubmitted={() => { setShowForm(false); loadReviews(); }} />
            </motion.div>
          )}
        </div>
      )}

      {/* Yorum Listesi */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{t("noReviews")}</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-[#222] bg-[#0f0f0f] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StarRating rating={review.rating} size={16} />
                  {review.verified && (
                    <span className="rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                      ✓ {t("verified")}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  {review.created_at ? new Date(review.created_at).toLocaleDateString("tr-TR") : ""}
                </span>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">{review.comment}</p>
              )}
              {review.media_urls && review.media_urls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.media_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block h-20 w-20 overflow-hidden rounded border border-[#333] transition-opacity hover:opacity-80">
                      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
