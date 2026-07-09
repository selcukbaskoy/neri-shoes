"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

const EMPTY_COUPON = {
  code: "",
  description: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "",
  min_order_amount: "",
  valid_from: "",
  valid_until: "",
  max_uses: "",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  function startNew() {
    setForm(EMPTY_COUPON);
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function startEdit(c: Coupon) {
    setForm({
      code: c.code,
      description: c.description || "",
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order_amount: c.min_order_amount ? String(c.min_order_amount) : "",
      valid_from: c.valid_from ? c.valid_from.slice(0, 10) : "",
      valid_until: c.valid_until ? c.valid_until.slice(0, 10) : "",
      max_uses: c.max_uses != null ? String(c.max_uses) : "",
    });
    setEditingId(c.id);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        ...form,
        discount_value: Number(form.discount_value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : 0,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
      };
      const res = await fetch("/api/admin/coupons", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...body } : body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
      setShowForm(false);
      loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      loadCoupons();
    } catch {
      // ignore
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      loadCoupons();
    } catch {
      // ignore
    }
  }

  const inputClass =
    "w-full rounded border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted">{coupons.length} kupon</span>
        <button
          onClick={startNew}
          className="rounded border border-accent/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-accent transition-colors hover:border-accent hover:bg-accent/10"
        >
          Yeni Kupon
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-6 overflow-hidden rounded-lg border border-[#222] bg-[#0f0f0f] p-5"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-accent">
              {editingId ? "Kuponu Düzenle" : "Yeni Kupon"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Kod</label>
                <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="INDIRIM20" required />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Açıklama</label>
                <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Örn: Yılbaşı indirimi" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Tip</label>
                <select className={inputClass} value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })}>
                  <option value="percent">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (TL)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Değer</label>
                <input className={inputClass} type="number" min="0" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Min. Sipariş (TL)</label>
                <input className={inputClass} type="number" min="0" step="0.01" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Max Kullanım</label>
                <input className={inputClass} type="number" min="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Sınırsız" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Başlangıç</label>
                <input className={inputClass} type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Bitiş</label>
                <input className={inputClass} type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
              </div>
            </div>
            {error && <p className="mt-3 rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{error}</p>}
            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={saving} className="rounded bg-accent px-5 py-2 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-accent/90 disabled:opacity-60">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded border border-[#333] px-5 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent">
                İptal
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : coupons.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Kupon bulunmuyor.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#222]">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted">
              <tr>
                <th className="p-3">Kod</th>
                <th className="p-3">Tip</th>
                <th className="p-3">Değer</th>
                <th className="p-3">Kullanım</th>
                <th className="p-3">Durum</th>
                <th className="p-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className={`border-t border-[#222] ${!c.is_active ? "opacity-50" : ""}`}>
                  <td className="p-3 font-mono text-accent">{c.code}</td>
                  <td className="p-3">{c.discount_type === "percent" ? "%" : "TL"}</td>
                  <td className="p-3">{c.discount_value}</td>
                  <td className="p-3 text-xs text-muted">
                    {c.used_count} / {c.max_uses ?? "∞"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(c.id, c.is_active)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        c.is_active
                          ? "border-green-500/30 bg-green-500/10 text-green-400"
                          : "border-red-500/30 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {c.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded border border-accent px-3 py-1 text-xs text-accent transition-colors hover:bg-accent hover:text-black"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="rounded border border-red-500 px-3 py-1 text-xs text-red-500 transition-colors hover:bg-red-500 hover:text-black"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
