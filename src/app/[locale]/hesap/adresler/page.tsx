"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "@/lib/customer-client";
import type { CustomerAddress } from "@/lib/types";

const EMPTY_ADDRESS = {
  title: "",
  full_address: "",
  city: "",
  district: "",
  postal_code: "",
  is_default: false,
};

export default function AddressesPage() {
  const t = useTranslations("account");
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/giris");
      return;
    }
    if (isAuthenticated) loadAddresses();
  }, [authLoading, isAuthenticated, router]);

  async function loadAddresses() {
    setLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data.addresses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(addr: CustomerAddress) {
    setEditingId(addr.id);
    setForm({
      title: addr.title,
      full_address: addr.full_address,
      city: addr.city,
      district: addr.district,
      postal_code: addr.postal_code || "",
      is_default: addr.is_default,
    });
  }

  function startNew() {
    setEditingId("new");
    setForm(EMPTY_ADDRESS);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId === "new") {
        await createAddress(form);
      } else if (editingId) {
        await updateAddress(editingId, form);
      }
      setEditingId(null);
      setForm(EMPTY_ADDRESS);
      loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("deleteAddress") + "?")) return;
    try {
      await deleteAddress(id);
      loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  const inputClass =
    "w-full rounded border border-[#2a2a2a] bg-[#111] px-4 py-2.5 text-sm text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60";

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl text-foreground">{t("addresses")}</h1>
          <button
            onClick={startNew}
            className="rounded border border-accent/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            {t("addAddress")}
          </button>
        </div>

        {error && <p className="rounded border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs text-red-400">{error}</p>}

        <AnimatePresence>
          {editingId && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 overflow-hidden rounded-lg border border-[#222] bg-[#0f0f0f] p-5"
            >
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">
                {editingId === "new" ? t("addAddress") : t("editAddress")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("addressTitle")}</label>
                  <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ev, İş, vb." required />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("addressLine")}</label>
                  <textarea className={`${inputClass} resize-none`} rows={2} value={form.full_address} onChange={(e) => setForm({ ...form, full_address: e.target.value })} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("city")}</label>
                  <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("district")}</label>
                  <input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Posta Kodu</label>
                  <input className={inputClass} value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={form.is_default}
                    onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    className="h-4 w-4 accent-accent"
                  />
                  <label htmlFor="is_default" className="text-xs uppercase tracking-[0.1em] text-muted">{t("setDefault")}</label>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-accent px-5 py-2 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-accent/90 disabled:opacity-60"
                >
                  {saving ? t("saving") : t("saveAddress")}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded border border-[#333] px-5 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {t("cancel")}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {addresses.length === 0 ? (
          <p className="text-center text-sm text-muted py-8">{t("noAddresses")}</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="relative rounded-lg border border-[#222] bg-[#0f0f0f] p-5 transition-all hover:border-[#333]"
              >
                {addr.is_default && (
                  <span className="absolute right-4 top-4 rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                    {t("defaultAddress")}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-foreground">{addr.title}</h3>
                <p className="mt-1 text-sm text-muted">{addr.full_address}</p>
                <p className="text-xs text-muted/60">{addr.district}, {addr.city} {addr.postal_code}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(addr)}
                    className="rounded border border-[#333] px-3 py-1 text-xs text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {t("editAddress")}
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="rounded border border-red-500/20 px-3 py-1 text-xs text-red-400 transition-colors hover:border-red-500/40"
                  >
                    {t("deleteAddress")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
