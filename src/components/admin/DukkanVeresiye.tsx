"use client";

import { useEffect, useState } from "react";

interface CreditCustomer {
  id: number;
  name: string;
  phone: string | null;
  credit_limit: number;
  is_blocked: boolean;
  balance: number;
  nearestDue: string | null;
  overdue: boolean;
}

const inputClass =
  "w-full rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60";

function dueColor(c: CreditCustomer) {
  if (!c.nearestDue) return "text-muted";
  if (c.overdue) return "text-red-500";
  const days = (new Date(c.nearestDue).getTime() - Date.now()) / 86400000;
  if (days <= 7) return "text-yellow-500";
  return "text-foreground";
}

export default function DukkanVeresiye() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<CreditCustomer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [modalCustomer, setModalCustomer] = useState<CreditCustomer | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"nakit" | "pos">("nakit");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function load() {
    setLoaded(false);
    try {
      const res = await fetch(`/api/admin/dukkan/veresiye?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setCustomers(data.customers ?? []);
    } catch {
      setCustomers([]);
    }
    setLoaded(true);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function openModal(c: CreditCustomer) {
    setModalCustomer(c);
    setAmount("");
    setPaymentMethod("nakit");
    setNote("");
    setMessage(null);
  }

  async function handleCollect() {
    if (!modalCustomer) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setMessage({ text: "Geçerli tutar girin.", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/dukkan/veresiye/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: modalCustomer.id, amount: amt, paymentMethod, note: note.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: `Hata: ${data.error}`, type: "error" });
        setSubmitting(false);
        return;
      }
      setMessage({ text: "Tahsilat kaydedildi.", type: "success" });
      setModalCustomer(null);
      load();
    } catch {
      setMessage({ text: "Bağlantı hatası.", type: "error" });
    }
    setSubmitting(false);
  }

  return (
    <div>
      <input
        className={`${inputClass} mb-4 max-w-sm`}
        placeholder="Müşteri ara (ad veya telefon)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!loaded ? (
        <p className="text-sm text-muted">Yükleniyor...</p>
      ) : customers.length === 0 ? (
        <p className="rounded border border-[#222] bg-[#0f0f0f] p-4 text-center text-sm text-muted">Açık veresiye yok.</p>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded border border-[#222] bg-[#0f0f0f] p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {c.name} {c.is_blocked ? <span className="ml-1 text-xs text-red-500">(bloklu)</span> : null}
                </p>
                <p className="text-xs text-muted">
                  {c.phone ?? "—"}
                  {c.nearestDue ? (
                    <span className={`ml-2 ${dueColor(c)}`}>
                      Vade: {c.nearestDue} {c.overdue ? "(gecikmiş)" : ""}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-accent">{c.balance.toLocaleString("tr-TR")} TL</span>
                <button
                  type="button"
                  onClick={() => openModal(c)}
                  className="rounded border border-accent/40 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent hover:text-black"
                >
                  Tahsilat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="card w-full max-w-sm p-5">
            <h3 className="mb-1 text-sm font-semibold text-foreground">{modalCustomer.name}</h3>
            <p className="mb-4 text-xs text-muted">
              Açık bakiye: <span className="text-accent">{modalCustomer.balance.toLocaleString("tr-TR")} TL</span>
            </p>

            <div className="mb-3">
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Tahsilat Tutarı (TL)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Ödeme Tipi</label>
              <div className="flex gap-2">
                {(["nakit", "pos"] as const).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`flex-1 rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      paymentMethod === pm ? "border-accent bg-accent/10 text-accent" : "border-[#2a2a2a] text-muted hover:border-accent/40"
                    }`}
                  >
                    {pm === "nakit" ? "Nakit" : "POS"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Not</label>
              <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="İsteğe bağlı" />
            </div>

            {message && (
              <p
                className={`mb-3 rounded px-3 py-2 text-xs ${
                  message.type === "success"
                    ? "border border-green-500/30 bg-green-500/10 text-green-400"
                    : "border border-red-500/30 bg-red-500/10 text-red-400"
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalCustomer(null)}
                className="flex-1 rounded border border-[#2a2a2a] px-3 py-2 text-xs uppercase tracking-wide text-muted hover:border-accent/40"
              >
                İptal
              </button>
              <button type="button" onClick={handleCollect} disabled={submitting} className="btn-primary flex-1 disabled:opacity-40">
                {submitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
