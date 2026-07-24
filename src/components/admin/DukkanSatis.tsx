"use client";

import { useState, useEffect } from "react";

interface StockRow {
  size: number;
  quantity: number;
}
interface ProductResult {
  id: string;
  name: string;
  image: string;
  price: number;
  sku: string | null;
  stock: StockRow[];
}
interface CartItem {
  productId: string;
  name: string;
  size: number;
  quantity: number;
  unitPrice: number;
  maxQty: number;
}
interface CustomerResult {
  id: number;
  name: string;
  phone: string | null;
  credit_limit: number;
  is_blocked: boolean;
}

const inputClass =
  "min-h-11 w-full rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-base text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60 sm:text-sm";

export default function DukkanSatis({
  selectedCustomer,
  onSaleComplete,
}: {
  selectedCustomer: CustomerResult | null;
  onSaleComplete: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos" | "veresiye">("nakit");
  const [discountAmount, setDiscountAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/dukkan/products?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function addToCart(product: ProductResult, size: number) {
    const stockRow = product.stock.find((s) => s.size === size);
    if (!stockRow || stockRow.quantity <= 0) return;
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === product.id && i.size === size);
      if (idx >= 0) {
        const existing = prev[idx];
        if (existing.quantity >= existing.maxQty) return prev;
        return prev.map((i, j) => (j === idx ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, size, quantity: 1, unitPrice: product.price, maxQty: stockRow.quantity },
      ];
    });
    setQuery("");
    setResults([]);
  }

  function updateQty(index: number, qty: number) {
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, Math.min(qty, item.maxQty)) } : item))
    );
  }

  function removeItem(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const total = Math.max(0, subtotal - (parseFloat(discountAmount) || 0));

  async function handleSubmit() {
    if (cart.length === 0) return;
    if (paymentMethod === "veresiye" && !selectedCustomer) {
      setMessage({ text: "Veresiye için müşteri seçin.", type: "error" });
      return;
    }
    if (paymentMethod === "veresiye" && selectedCustomer?.is_blocked) {
      setMessage({ text: "Bu müşteri bloklu — veresiye satış yapılamaz.", type: "error" });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/dukkan/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer?.id ?? null,
          paymentMethod,
          items: cart.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity, unitPrice: i.unitPrice })),
          discountAmount: parseFloat(discountAmount) || 0,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const text = String(data.error ?? "").includes("insufficient stock") ? "Stok yetersiz." : `Hata: ${data.error}`;
        setMessage({ text, type: "error" });
        setSubmitting(false);
        return;
      }
      setLastSaleId(data.saleId);
      setMessage({
        text: selectedCustomer
          ? `Satış kaydedildi (#${data.saleId}) — ${selectedCustomer.name}'a bağlandı.`
          : `Satış kaydedildi (#${data.saleId}).`,
        type: "success",
      });
      setCart([]);
      setDiscountAmount("");
      setNote("");
      onSaleComplete();
    } catch {
      setMessage({ text: "Bağlantı hatası.", type: "error" });
    }
    setSubmitting(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Barkod veya İsim</label>
        <input
          className={inputClass}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Barkod okut veya ürün ara..."
          autoFocus
        />

        {results.length > 0 && (
          <div className="mt-3 space-y-2">
            {results.map((product) => (
              <div key={product.id} className="rounded border border-[#222] bg-[#0f0f0f] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{product.name}</span>
                  <span className="text-xs text-accent">{product.price.toLocaleString("tr-TR")} TL</span>
                </div>
                {product.stock.length === 0 ? (
                  <p className="text-xs text-muted">Stok yok.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {product.stock.map((s) => (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => addToCart(product, s.size)}
                        disabled={s.quantity <= 0}
                        className="min-h-11 rounded border border-accent/40 px-4 text-sm text-accent transition-colors hover:bg-accent hover:text-black disabled:opacity-30"
                      >
                        {s.size} ({s.quantity})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-2 text-xs uppercase tracking-[0.1em] text-muted">Sepet</h3>
          {cart.length === 0 ? (
            <p className="rounded border border-[#222] bg-[#0f0f0f] p-4 text-center text-sm text-muted">Sepet boş.</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item, i) => (
                <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 rounded border border-[#222] bg-[#0f0f0f] p-3">
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted">Beden {item.size}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={item.maxQty}
                    value={item.quantity}
                    onChange={(e) => updateQty(i, parseInt(e.target.value, 10) || 1)}
                    className="min-h-11 w-16 rounded border border-[#2a2a2a] bg-[#111] px-2 text-center text-base text-foreground sm:text-sm"
                  />
                  <span className="w-20 text-right text-sm text-accent">
                    {(item.quantity * item.unitPrice).toLocaleString("tr-TR")} TL
                  </span>
                  <button type="button" onClick={() => removeItem(i)} className="flex min-h-11 items-center px-2 text-xs text-red-500 hover:text-red-400">
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 rounded border border-[#222] bg-[#0f0f0f] px-3 py-2 text-sm">
          🧾 Satış →{" "}
          {selectedCustomer ? (
            <span className="text-accent">
              {selectedCustomer.name} {selectedCustomer.phone ? `(${selectedCustomer.phone})` : ""}
            </span>
          ) : (
            <span className="text-muted">Anonim müşteri</span>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Ödeme Tipi</label>
          <div className="flex gap-2">
            {(["nakit", "pos", "veresiye"] as const).map((pm) => (
              <button
                key={pm}
                type="button"
                onClick={() => setPaymentMethod(pm)}
                className={`min-h-11 flex-1 rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  paymentMethod === pm
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-[#2a2a2a] text-muted hover:border-accent/40"
                }`}
              >
                {pm === "nakit" ? "Nakit" : pm === "pos" ? "POS" : "Veresiye"}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === "veresiye" && !selectedCustomer && (
          <p className="mb-4 rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
            Veresiye için aşağıdaki Müşteri bölümünden müşteri seçin.
          </p>
        )}
        {paymentMethod === "veresiye" && selectedCustomer?.is_blocked && (
          <p className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            Bu müşteri bloklu — veresiye satış yapılamaz.
          </p>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">İndirim (TL)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Not</label>
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="İsteğe bağlı" />
        </div>

        <div className="mb-4 flex items-center justify-between border-t border-[#222] pt-4">
          <span className="text-sm text-muted">Toplam</span>
          <span className="text-xl font-bold text-accent">{total.toLocaleString("tr-TR")} TL</span>
        </div>

        {message && (
          <p className={`mb-3 rounded px-3 py-2 text-xs ${message.type === "success" ? "border border-green-500/30 bg-green-500/10 text-green-400" : "border border-red-500/30 bg-red-500/10 text-red-400"}`}>
            {message.text}
            {message.type === "success" && lastSaleId && (
              <span className="ml-1 text-muted">(satış no: {lastSaleId})</span>
            )}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            submitting ||
            cart.length === 0 ||
            (paymentMethod === "veresiye" && (!selectedCustomer || selectedCustomer.is_blocked))
          }
          className="btn-primary min-h-12 w-full text-base disabled:opacity-40"
        >
          {submitting ? "Kaydediliyor..." : "Satışı Tamamla"}
        </button>
      </div>
    </div>
  );
}
