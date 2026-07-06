"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Address = {
  id: string;
  title: string;
  full_name: string;
  phone: string | null;
  address_line: string;
  city: string;
  district: string | null;
  is_default: boolean;
};

type FormState = Omit<Address, "id" | "is_default"> & { id?: string };

const EMPTY_FORM: FormState = {
  title: "", full_name: "", phone: "", address_line: "", city: "", district: "",
};

export default function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const sb = getSupabaseBrowserClient();

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);

    if (form.id) {
      await sb.from("customer_addresses").update({
        title: form.title, full_name: form.full_name, phone: form.phone,
        address_line: form.address_line, city: form.city, district: form.district,
      }).eq("id", form.id);
    } else {
      const { data: { user } } = await sb.auth.getUser();
      await sb.from("customer_addresses").insert({
        ...form,
        auth_user_id: user!.id,
        is_default: addresses.length === 0,
      });
    }

    setSaving(false);
    setForm(null);
    router.refresh();
  }

  async function deleteAddress(id: string) {
    await sb.from("customer_addresses").delete().eq("id", id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function setDefault(id: string) {
    const { data: { user } } = await sb.auth.getUser();
    await sb.from("customer_addresses")
      .update({ is_default: false })
      .eq("auth_user_id", user!.id);
    await sb.from("customer_addresses")
      .update({ is_default: true })
      .eq("id", id);
    router.refresh();
  }

  if (form !== null) {
    return (
      <form onSubmit={saveAddress} className="max-w-sm space-y-4">
        <AddressField label={t("addressTitle")} value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
        <AddressField label={t("fullName")} value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
        <AddressField label={t("phone")} value={form.phone ?? ""} onChange={(v) => setForm({ ...form, phone: v })} />
        <AddressField label={t("addressLine")} value={form.address_line} onChange={(v) => setForm({ ...form, address_line: v })} required />
        <div className="grid grid-cols-2 gap-3">
          <AddressField label={t("city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
          <AddressField label={t("district")} value={form.district ?? ""} onChange={(v) => setForm({ ...form, district: v })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-accent px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? "…" : t("saveAddress")}
          </button>
          <button
            type="button"
            onClick={() => setForm(null)}
            className="rounded border border-white/10 px-5 py-2.5 text-sm text-white/50 hover:text-white transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.length === 0 && (
        <p className="text-sm text-white/40">{t("noAddresses")}</p>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="rounded border border-white/8 bg-white/2 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{addr.title}</p>
                {addr.is_default && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {t("defaultAddress")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-white/50">{addr.full_name}</p>
              <p className="text-xs text-white/40">{addr.address_line}</p>
              <p className="text-xs text-white/40">{addr.district} / {addr.city}</p>
            </div>
            <div className="flex shrink-0 gap-2 text-xs">
              <button
                onClick={() => setForm({ ...addr })}
                className="text-white/30 hover:text-white transition-colors"
              >
                {t("editAddress")}
              </button>
              {!addr.is_default && (
                <>
                  <span className="text-white/15">|</span>
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="text-white/30 hover:text-accent transition-colors"
                  >
                    {t("setDefault")}
                  </button>
                  <span className="text-white/15">|</span>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    {t("deleteAddress")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => setForm({ ...EMPTY_FORM })}
        className="mt-2 flex items-center gap-2 text-sm text-accent/70 hover:text-accent transition-colors"
      >
        <span className="text-lg leading-none">+</span> {t("addAddress")}
      </button>
    </div>
  );
}

function AddressField({
  label, value, onChange, required,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-white/30">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/60"
      />
    </div>
  );
}
