"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Product } from "@/lib/types";

export default function FavoritesPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/giris");
      return;
    }
    loadFavorites();
  }, [isAuthenticated, router]);

  async function loadFavorites() {
    setLoading(true);
    try {
      const token = (await getSupabaseBrowserClient().auth.getSession()).data.session?.access_token;
      if (!token) return;
      const res = await fetch("/api/favorites/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(productId: string) {
    const token = (await getSupabaseBrowserClient().auth.getSession()).data.session?.access_token;
    if (!token) return;
    await fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId }),
    });
    setFavorites((prev) => prev.filter((f) => f.id !== productId));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/hesap" className="rounded border border-[#333] px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent">
            ← {t("backToAccount")}
          </Link>
          <h1 className="font-serif text-2xl text-foreground">Favorilerim</h1>
        </div>

        {favorites.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">Henüz favori ürününüz yok.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((product) => (
              <div key={product.id} className="group relative rounded-lg border border-[#222] bg-[#0f0f0f] p-3">
                <Link href={`/urunler/${product.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-foreground">{product.name}</p>
                  {product.price != null && <p className="text-sm text-accent">{product.price.toLocaleString("tr-TR")} TL</p>}
                </Link>
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 bg-[#0f0f0f]/80 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
