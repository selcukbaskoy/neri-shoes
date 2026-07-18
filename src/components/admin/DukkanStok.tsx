"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

const SIZES = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

export default function DukkanStok({ products }: { products: Product[] }) {
  const [stocks, setStocks] = useState<Record<string, Record<number, number>>>({});
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/stock")
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.stocks ?? {});
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = products
    .filter((p) => p.is_active !== false)
    .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <div>
      <input
        className="mb-4 w-full max-w-sm rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-foreground placeholder-muted/40 outline-none focus:border-accent/60"
        placeholder="Model ara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!loaded ? (
        <p className="text-sm text-muted">Yükleniyor...</p>
      ) : (
        <div className="overflow-x-auto rounded border border-[#222]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[#222] text-left text-xs uppercase tracking-wide text-muted">
                <th className="sticky left-0 bg-[#0f0f0f] p-3">Model</th>
                {SIZES.map((size) => (
                  <th key={size} className="p-3 text-center">
                    {size}
                  </th>
                ))}
                <th className="p-3 text-center">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const row = stocks[product.id] ?? {};
                const total = SIZES.reduce((sum, s) => sum + (row[s] ?? 0), 0);
                return (
                  <tr key={product.id} className="border-b border-[#1a1a1a]">
                    <td className="sticky left-0 bg-[#0f0f0f] p-3 font-medium text-foreground">{product.name}</td>
                    {SIZES.map((size) => {
                      const qty = row[size] ?? 0;
                      return (
                        <td
                          key={size}
                          className={`p-3 text-center ${qty === 0 ? "text-muted/40" : qty <= 2 ? "text-yellow-500" : "text-foreground"}`}
                        >
                          {qty}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-semibold text-accent">{total}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={SIZES.length + 2} className="p-6 text-center text-muted">
                    Ürün bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        Stok tek havuz — online sipariş ve mağaza satışı aynı anda burada görünür. Stok düzenlemek için{" "}
        <a href="/admin" className="text-accent hover:underline">
          Admin Panel
        </a>
        .
      </p>
    </div>
  );
}
