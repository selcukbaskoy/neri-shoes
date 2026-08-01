"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

interface StockMatrixProps {
  familyProducts: Product[];
  allStocks: Record<string, Record<number, number>>;
  onSaved: () => Promise<void>;
  notify: (text: string, type?: "info" | "success" | "error") => void;
}

type CellKey = `${string}:${number}`;

export default function StockMatrix({ familyProducts, allStocks, onSaved, notify }: StockMatrixProps) {
  const [inputs, setInputs] = useState<Record<CellKey, string>>({});
  const [active, setActive] = useState<Record<CellKey, boolean>>({});
  const [newSizeValue, setNewSizeValue] = useState("");
  const [saving, setSaving] = useState(false);

  const key = (productId: string, size: number): CellKey => `${productId}:${size}`;

  // allStocks değişince (dış kaynak) editable state'i yeniden kur
  useEffect(() => {
    const nextInputs: Record<CellKey, string> = {};
    const nextActive: Record<CellKey, boolean> = {};
    for (const p of familyProducts) {
      const stock = allStocks[p.id] ?? {};
      for (const [sizeStr, qty] of Object.entries(stock)) {
        const k = key(p.id, Number(sizeStr));
        nextInputs[k] = String(qty);
        nextActive[k] = true;
      }
    }
    setInputs(nextInputs);
    setActive(nextActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyProducts.map((p) => p.id).join(","), allStocks]);

  const sizeSet = new Set<number>();
  for (const p of familyProducts) {
    for (const sizeStr of Object.keys(allStocks[p.id] ?? {})) sizeSet.add(Number(sizeStr));
  }
  for (const k of Object.keys(active)) {
    const [, sizeStr] = k.split(":");
    sizeSet.add(Number(sizeStr));
  }
  const sizes = Array.from(sizeSet).sort((a, b) => a - b);

  function activateCell(productId: string, size: number) {
    const k = key(productId, size);
    setActive((prev) => ({ ...prev, [k]: true }));
    setInputs((prev) => ({ ...prev, [k]: prev[k] ?? "0" }));
  }

  function handleAddSizeRow() {
    const size = parseInt(newSizeValue, 10);
    if (!size || size < 20 || size > 60) {
      notify("Geçerli bir numara girin (20-60).", "error");
      return;
    }
    if (sizes.includes(size)) {
      notify("Bu numara zaten matriste.", "error");
      return;
    }
    // Görünür yeni satır aç — hücreler hâlâ ░░░, admin istediği renklerde aktifleştirir
    setActive((prev) => ({ ...prev, [`__row__:${size}` as CellKey]: true }));
    setNewSizeValue("");
  }

  async function handleSaveAll() {
    setSaving(true);
    try {
      for (const p of familyProducts) {
        const entries = sizes
          .filter((size) => active[key(p.id, size)])
          .map((size) => ({
            size,
            quantity: Math.max(0, parseInt(inputs[key(p.id, size)] || "0", 10) || 0),
          }));
        if (entries.length === 0) continue;
        const res = await fetch("/api/admin/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: p.id, entries }),
        });
        if (!res.ok) {
          notify(`${p.name} stok kaydedilemedi.`, "error");
          setSaving(false);
          return;
        }
      }
      await onSaved();
      notify("Tüm renkler kaydedildi!", "success");
    } catch {
      notify("Bağlantı hatası.", "error");
    }
    setSaving(false);
  }

  return (
    <div className="card p-6">
      <h3 className="mb-1 text-base font-semibold text-foreground">
        {familyProducts[0]?.name} — Renk × Numara Matrisi
      </h3>
      <p className="mb-4 text-xs text-muted">
        Her rengin numara aralığı farklı olabilir. ░░░ = bu renkte bu numara hiç yok, tıklayınca eklenir.
      </p>

      <div className="overflow-x-auto rounded border border-[#222]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[#222] bg-surface text-muted">
              <th className="sticky left-0 z-10 bg-surface p-3 text-left">Numara</th>
              {familyProducts.map((p) => (
                <th key={p.id} className="p-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    {p.colorHex && (
                      <span
                        className="h-4 w-4 rounded-full border border-[#333]"
                        style={{ backgroundColor: p.colorHex }}
                      />
                    )}
                    <span className="whitespace-nowrap text-xs font-normal text-foreground">
                      {p.colorName?.tr ?? p.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size} className="border-b border-[#1a1a1a]">
                <td className="sticky left-0 z-10 bg-[#0f0f0f] p-3 font-medium text-foreground">{size}</td>
                {familyProducts.map((p) => {
                  const k = key(p.id, size);
                  const isActive = active[k];
                  if (!isActive) {
                    return (
                      <td key={p.id} className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => activateCell(p.id, size)}
                          title="Numara Ekle"
                          className="flex h-10 w-full min-w-[44px] items-center justify-center rounded border border-dashed border-[#333] text-[#444] transition-colors hover:border-accent/60 hover:text-accent/70"
                        >
                          ░░░
                        </button>
                      </td>
                    );
                  }
                  const qty = parseInt(inputs[k] || "0", 10) || 0;
                  return (
                    <td key={p.id} className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={inputs[k] ?? "0"}
                        onChange={(e) =>
                          setInputs((prev) => ({ ...prev, [k]: e.target.value }))
                        }
                        className={`min-h-11 w-full min-w-[64px] rounded border px-2 py-1 text-center text-base outline-none sm:text-sm ${
                          qty === 0
                            ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                            : "border-[#2a2a2a] bg-[#111] text-foreground"
                        } focus:border-accent/60`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {sizes.length === 0 && (
              <tr>
                <td colSpan={familyProducts.length + 1} className="p-6 text-center text-muted">
                  Henüz numara yok. Aşağıdan ekleyin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="number"
          min="20"
          max="60"
          placeholder="Yeni numara"
          value={newSizeValue}
          onChange={(e) => setNewSizeValue(e.target.value)}
          className="input-field min-h-11 w-32"
        />
        <button type="button" onClick={handleAddSizeRow} className="btn-secondary min-h-11">
          + Numara Satırı Ekle
        </button>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={handleSaveAll}
        className="btn-primary mt-6 min-h-11 disabled:opacity-40"
      >
        {saving ? "Kaydediliyor..." : "Tümünü Kaydet"}
      </button>
    </div>
  );
}
