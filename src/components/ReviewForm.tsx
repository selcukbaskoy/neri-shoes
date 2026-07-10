// src/components/ReviewForm.tsx
// Girişli kullanıcı için yorum yazma formu (rating, yorum, fotoğraf upload)

"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import StarRating from "./StarRating";

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmitted: () => void;
}

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ReviewForm({ productId, productName, onSubmitted }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        setError(t("fileTooLarge"));
        return false;
      }
      if (!["image/jpeg", "image/png", "image/webp", "video/mp4"].includes(f.type)) {
        setError(t("invalidFileType"));
        return false;
      }
      return true;
    });

    const total = images.length + valid.length;
    if (total > MAX_IMAGES) {
      setError(t("maxImages", { max: MAX_IMAGES }));
      return;
    }

    setImages((prev) => [...prev, ...valid]);
    setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
    setError("");
  }, [images.length, t]);

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadImages(): Promise<string[]> {
    if (images.length === 0) return [];
    const urls: string[] = [];
    for (const file of images) {
      const path = `${user?.id}/${Date.now()}-${file.name}`;
      const client = getSupabaseBrowserClient();
      const { data, error } = await client.storage.from("review_images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw new Error(error.message);
      const { data: publicUrl } = client.storage.from("review_images").getPublicUrl(data.path);
      urls.push(publicUrl.publicUrl);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating === 0) {
      setError(t("ratingRequired"));
      return;
    }
    if (!comment.trim()) {
      setError(t("commentRequired"));
      return;
    }
    setLoading(true);
    try {
      const mediaUrls = await uploadImages();
      const token = (await getSupabaseBrowserClient().auth.getSession()).data.session?.access_token;
      if (!token) throw new Error(t("notAuthenticated"));

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, rating, comment, mediaUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("submitError"));
      setSuccess(true);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-green-500/30 bg-green-500/5 p-6 text-center"
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 mx-auto">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-green-400">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-green-400">{t("submitSuccess")}</p>
        <p className="mt-1 text-xs text-muted">{t("submitSuccessDesc")}</p>
      </motion.div>
    );
  }

  const inputClass =
    "w-full rounded border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-muted">{t("yourRating")}</label>
        <StarRating rating={rating} size={28} interactive onChange={setRating} />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("yourReview")}</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("reviewPlaceholder", { productName })}
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-muted">{t("addPhotos")}</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded border border-[#333] px-4 py-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          {t("uploadPhotos")} ({images.length}/{MAX_IMAGES})
        </button>

        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {previews.map((src, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded border border-[#333]">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-accent px-5 py-3 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-accent/90 disabled:opacity-60"
      >
        {loading ? t("submitting") : t("submitReview")}
      </button>
    </form>
  );
}
