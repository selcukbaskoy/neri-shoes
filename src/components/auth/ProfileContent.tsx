"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ProfileContent({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const t = useTranslations("account");
  const [name, setName] = useState(initialName);
  const [newPassword, setNewPassword] = useState("");
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameStatus("saving");
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.updateUser({ data: { full_name: name } });
    setNameStatus(error ? "error" : "saved");
    setTimeout(() => setNameStatus("idle"), 2500);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) return;
    setPwStatus("saving");
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.updateUser({ password: newPassword });
    setPwStatus(error ? "error" : "saved");
    if (!error) setNewPassword("");
    setTimeout(() => setPwStatus("idle"), 2500);
  }

  return (
    <div className="space-y-8 max-w-sm">
      {/* Ad */}
      <form onSubmit={saveName} className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">
          {t("profileName")}
        </h3>
        <FieldInput
          label={t("profileName")}
          value={name}
          onChange={setName}
          type="text"
        />
        <FieldInput
          label={t("profileEmail")}
          value={email}
          onChange={() => {}}
          type="email"
          disabled
        />
        <StatusButton status={nameStatus} label={t("saveProfile")} />
      </form>

      {/* Şifre */}
      <form onSubmit={savePassword} className="space-y-4 pt-6 border-t border-white/8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">
          {t("changePassword")}
        </h3>
        <FieldInput
          label={t("newPassword")}
          value={newPassword}
          onChange={setNewPassword}
          type="password"
        />
        <StatusButton status={pwStatus} label={t("updatePassword")} disabled={newPassword.length < 8} />
      </form>
    </div>
  );
}

function FieldInput({
  label, value, onChange, type, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/30">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

function StatusButton({
  status, label, disabled,
}: {
  status: "idle" | "saving" | "saved" | "error";
  label: string;
  disabled?: boolean;
}) {
  const t = useTranslations("account");
  const display =
    status === "saving" ? t("saving") :
    status === "saved" ? t("saved") :
    status === "error" ? t("error") :
    label;
  return (
    <button
      type="submit"
      disabled={disabled || status === "saving"}
      className={`rounded px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-40 ${
        status === "saved" ? "bg-green-500/20 text-green-400" :
        status === "error" ? "bg-red-500/20 text-red-400" :
        "bg-accent text-[#0a0a0a] hover:bg-accent/90"
      }`}
    >
      {display}
    </button>
  );
}
