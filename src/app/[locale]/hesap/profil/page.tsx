"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile, deleteAccount } from "@/lib/customer-client";
import { updateUserPassword } from "@/lib/auth-client";
import type { Customer } from "@/lib/types";

export default function ProfilePage() {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/hesap/giris");
      return;
    }
    if (isAuthenticated) loadProfile();
  }, [authLoading, isAuthenticated, router]);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await getProfile();
      setCustomer(data.customer);
      const fullName = data.user?.name || user?.user_metadata?.name || "";
      const parts = fullName.split(" ");
      setName(parts[0] || "");
      setSurname(parts.slice(1).join(" ") || "");
      setPhone(data.customer?.phone || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateProfile({ name, surname, phone });
      setSuccess(t("saved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPassword !== confirmPassword) {
      setPwError(tAuth("passwordMismatch"));
      return;
    }
    if (newPassword.length < 6) {
      setPwError(tAuth("passwordMinLength"));
      return;
    }
    setPwSaving(true);
    try {
      const { error } = await updateUserPassword(newPassword);
      if (error) throw new Error(error.message);
      setPwSuccess(t("saved"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : t("error"));
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("error"));
      setDeleting(false);
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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        <h1 className="font-serif text-3xl text-foreground">{t("profile")}</h1>

        {/* Profil Bilgileri */}
        <section className="rounded-lg border border-[#222] bg-[#0f0f0f] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-accent">{t("profile")}</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("profileName")}</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">Soyad</label>
                <input className={inputClass} value={surname} onChange={(e) => setSurname(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("profileEmail")}</label>
                <input className={`${inputClass} opacity-60`} value={user?.email || ""} disabled />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("phone")}</label>
                <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" />
              </div>
            </div>
            {error && <p className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{error}</p>}
            {success && <p className="rounded border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-400">{success}</p>}
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-accent px-5 py-2.5 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-accent/90 disabled:opacity-60"
            >
              {saving ? t("saving") : t("saveProfile")}
            </button>
          </form>
        </section>

        {/* Şifre Değiştir */}
        <section className="rounded-lg border border-[#222] bg-[#0f0f0f] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-accent">{t("changePassword")}</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("newPassword")}</label>
              <input type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("confirmPassword")}</label>
              <input type="password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            {pwError && <p className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{pwError}</p>}
            {pwSuccess && <p className="rounded border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-400">{pwSuccess}</p>}
            <button
              type="submit"
              disabled={pwSaving}
              className="rounded bg-accent px-5 py-2.5 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-accent/90 disabled:opacity-60"
            >
              {pwSaving ? t("saving") : t("updatePassword")}
            </button>
          </form>
        </section>

        {/* KVKK Hesap Silme */}
        <section className="rounded-lg border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-red-400">{t("deleteAccount")}</h2>
          <p className="mb-4 text-xs text-muted">{t("deleteAccountDesc")}</p>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="rounded border border-red-500/40 px-5 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/10"
            >
              {t("deleteAccount")}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-red-400">{t("deleteAccountConfirm")}</p>
              {deleteError && <p className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{deleteError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="rounded bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-60"
                >
                  {deleting ? t("saving") : "Evet, Sil"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded border border-[#333] px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
