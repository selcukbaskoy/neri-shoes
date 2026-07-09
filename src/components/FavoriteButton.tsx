"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function FavoriteButton({ productId }: { productId: string }) {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    checkFavorite();
  }, [isAuthenticated, productId]);

  async function checkFavorite() {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    try {
      const res = await fetch(`/api/favorites?productId=${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsFav(data.isFavorite);
    } catch {
      // ignore
    }
  }

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return;
    try {
      const method = isFav ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) setIsFav(!isFav);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        isFav
          ? "border-red-500/40 bg-red-500/10 text-red-400"
          : "border-[#333] text-muted hover:border-red-500/40 hover:text-red-400"
      }`}
      aria-label={isFav ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <svg viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
