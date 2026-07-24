"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  credit_limit: number;
  is_blocked: boolean;
  created_at: string;
}

interface PurchaseItem {
  product_name: string;
  size: number | null;
  quantity: number;
  price: number;
}

interface Purchase {
  id: number;
  date: string;
  payment_type: string;
  total: number;
  items: PurchaseItem[];
}

interface PurchaseSummary {
  total_purchases: number;
  total_spent: number;
  last_purchase_date: string | null;
  favorite_size: number | null;
}

const inputClass =
  "min-h-11 w-full rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-base text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60 sm:text-sm";

const PHONE_RE = /^0?5\d{9}$/;

const PAYMENT_LABEL: Record<string, string> = { nakit: "Nakit", pos: "POS", veresiye: "Veresiye" };

export default function DukkanMusteri({
  selectedCustomer,
  onCustomerSelect,
  onCustomerClear,
}: {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onCustomerClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseSummary | null>(null);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState(false);

  async function loadPurchases(customerId: number) {
    setPurchasesLoading(true);
    setPurchasesError(false);
    try {
      const res = await fetch(`/api/admin/dukkan/customers/${customerId}/purchases`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPurchases(data.purchases ?? []);
      setPurchaseSummary(data.summary ?? null);
    } catch {
      setPurchases(null);
      setPurchaseSummary(null);
      setPurchasesError(true);
    }
    setPurchasesLoading(false);
  }

  useEffect(() => {
    if (selectedCustomer) {
      loadPurchases(selectedCustomer.id);
    } else {
      setPurchases(null);
      setPurchaseSummary(null);
      setPurchasesError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer?.id]);

  async function load(q: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dukkan/customers?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setCustomers(data.customers ?? []);
    } catch {
      setCustomers([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    const trimmed = query.trim();
    setSearched(trimmed.length >= 2);
    if (trimmed.length > 0 && trimmed.length < 2) {
      setLoading(false);
      return;
    }
    const t = setTimeout(() => load(trimmed), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function openNewCustomerForm() {
    const trimmed = query.trim();
    if (PHONE_RE.test(trimmed)) {
      setFormPhone(trimmed);
      setFormName("");
    } else {
      setFormName(trimmed);
      setFormPhone("");
    }
    setFormError(null);
    setSuccessMsg(null);
    setFormOpen(true);
  }

  async function handleSave() {
    setFormError(null);
    const trimmedName = formName.trim();
    if (trimmedName.length < 2) {
      setFormError("Ad en az 2 karakter olmalı.");
      return;
    }
    if (formPhone.trim() && !PHONE_RE.test(formPhone.trim())) {
      setFormError("Telefon formatı geçersiz (05xx xxx xx xx).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/dukkan/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, phone: formPhone.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.error === "phone_already_exists"
            ? "Bu telefon numarası zaten kayıtlı."
            : data.error === "invalid_phone_format"
              ? "Telefon formatı geçersiz."
              : `Hata: ${data.error}`;
        setFormError(msg);
        setSaving(false);
        return;
      }
      setFormOpen(false);
      setFormName("");
      setFormPhone("");
      setSuccessMsg(`${data.customer.name} eklendi.`);
      setQuery("");
      onCustomerSelect(data.customer);
    } catch {
      setFormError("Bağlantı hatası.");
    }
    setSaving(false);
  }

  return (
    <div className="mt-10 border-t border-[#222] pt-6">
      <h2 className="mb-3 text-xs uppercase tracking-[0.1em] text-muted">Müşteri</h2>

      {selectedCustomer ? (
        <div className="rounded border border-accent/40 bg-accent/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.1em] text-accent">Seçili Müşteri</span>
            <button
              type="button"
              onClick={onCustomerClear}
              className="flex min-h-11 items-center px-2 text-xs text-muted hover:text-red-400"
            >
              ✕ Kaldır
            </button>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1">
            <p className="text-sm font-semibold text-foreground">
              {selectedCustomer.name} {selectedCustomer.is_blocked ? <span className="ml-1 text-xs text-red-500">(bloklu)</span> : null}
            </p>
            <p className="text-xs text-muted">{selectedCustomer.phone ?? "—"}</p>
          </div>

          {purchasesLoading ? (
            <p className="text-sm text-muted">Geçmiş yükleniyor...</p>
          ) : purchasesError ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-red-400">Geçmiş yüklenemedi.</p>
              <button
                type="button"
                onClick={() => loadPurchases(selectedCustomer.id)}
                className="flex min-h-11 items-center text-xs text-accent hover:underline"
              >
                Yeniden dene
              </button>
            </div>
          ) : (
            <>
              {purchaseSummary && (
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted sm:grid-cols-4">
                  <span>Toplam: <span className="text-foreground">{purchaseSummary.total_spent.toLocaleString("tr-TR")} TL</span></span>
                  <span>Alışveriş: <span className="text-foreground">{purchaseSummary.total_purchases}</span></span>
                  <span>Son: <span className="text-foreground">{purchaseSummary.last_purchase_date ? new Date(purchaseSummary.last_purchase_date).toLocaleDateString("tr-TR") : "—"}</span></span>
                  <span>Sık beden: <span className="text-foreground">{purchaseSummary.favorite_size ?? "—"}</span></span>
                </div>
              )}

              {purchases && purchases.length > 0 ? (
                <div className="max-h-56 space-y-2 overflow-y-auto border-t border-[#222] pt-3">
                  {purchases.map((p) => (
                    <div key={p.id} className="text-xs">
                      <p className="text-muted">
                        {new Date(p.date).toLocaleDateString("tr-TR")} · {PAYMENT_LABEL[p.payment_type] ?? p.payment_type} ·{" "}
                        <span className="text-foreground">{p.total.toLocaleString("tr-TR")} TL</span>
                      </p>
                      {p.items.map((item, i) => (
                        <p key={i} className="pl-3 text-muted">
                          └ {item.product_name} {item.size != null ? `/ ${item.size}` : ""} / {item.quantity} adet
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="border-t border-[#222] pt-3 text-xs text-muted">Alışveriş geçmişi yok.</p>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <input
              className={`${inputClass} sm:max-w-xs`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuccessMsg(null);
              }}
              placeholder="Ara (ad, soyad veya telefon)..."
            />
            <button
              type="button"
              onClick={openNewCustomerForm}
              className="min-h-11 rounded border border-accent/40 px-3 py-2 text-xs uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-black"
            >
              + Yeni Müşteri Kaydı Aç
            </button>
          </div>

          {successMsg && (
            <p className="mt-3 rounded border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
              {successMsg}
            </p>
          )}

          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-muted">Yükleniyor...</p>
            ) : customers.length === 0 ? (
              searched ? (
                <div className="rounded border border-[#222] bg-[#0f0f0f] p-4 text-center">
                  <p className="mb-3 text-sm text-muted">Bu bilgilerle kayıtlı müşteri bulunamadı.</p>
                  <button
                    type="button"
                    onClick={openNewCustomerForm}
                    className="min-h-11 rounded border border-accent/40 px-3 py-2 text-xs uppercase tracking-wide text-accent transition-colors hover:bg-accent hover:text-black"
                  >
                    + Yeni Müşteri Kaydı Oluştur
                  </button>
                </div>
              ) : (
                <p className="rounded border border-[#222] bg-[#0f0f0f] p-4 text-center text-sm text-muted">Kayıtlı müşteri yok.</p>
              )
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted">{searched ? "Arama sonuçları" : "Son eklenen müşteriler"}</p>
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onCustomerSelect(c)}
                    className="flex min-h-11 w-full items-center justify-between rounded border border-[#222] bg-[#0f0f0f] p-3 text-left transition-colors hover:border-accent/40"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {c.name} {c.is_blocked ? <span className="ml-1 text-xs text-red-500">(bloklu)</span> : null}
                      </p>
                      <p className="text-xs text-muted">{c.phone ?? "—"}</p>
                    </div>
                    {c.credit_limit > 0 && (
                      <span className="text-xs text-muted">Limit: {c.credit_limit.toLocaleString("tr-TR")} TL</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="card w-full max-w-sm p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Yeni Müşteri Kaydı</h3>

            <div className="mb-3">
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Ad Soyad *</label>
              <input
                className={inputClass}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Telefon</label>
              <input
                className={inputClass}
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="05xx xxx xx xx"
              />
            </div>

            {formError && (
              <p className="mb-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="min-h-11 flex-1 rounded border border-[#2a2a2a] px-3 py-2 text-xs uppercase tracking-wide text-muted hover:border-accent/40"
              >
                İptal
              </button>
              <button type="button" onClick={handleSave} disabled={saving} className="btn-primary min-h-11 flex-1 disabled:opacity-40">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
