"use client";

import { useState } from "react";

export default function StockAlertForm({ productId, size }: { productId: string; size: number | null }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, email }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <p className="text-xs text-green-400">Stok geldiğinde bildirim alacaksınız.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresiniz"
        required
        className="w-40 rounded border border-[#333] bg-[#111] px-3 py-2 text-xs text-foreground placeholder-muted/40 outline-none focus:border-accent/60"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded border border-accent/40 px-3 py-2 text-xs text-accent transition-colors hover:border-accent hover:bg-accent/10 disabled:opacity-50"
      >
        {loading ? "..." : "Gelince Haber Ver"}
      </button>
    </form>
  );
}
