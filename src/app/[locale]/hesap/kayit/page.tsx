"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { signUp } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const t = useTranslations("auth");
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);
    const { data, error: err } = await signUp({
      email,
      password,
      name,
      surname,
    });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    // Supabase Auth confirmation email gönderirse (default), onay gerekir
    // Eğer email confirmation kapalıysa direkt giriş yapılır
    if (data.session) {
      await refreshUser();
      router.push("/");
    } else {
      setSuccess(true);
    }
  }

  const inputClass =
    "w-full rounded border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60";

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 mx-auto">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-green-400">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-foreground">{t("verifyEmailTitle")}</h1>
          <p className="text-sm text-muted">{t("verifyEmailDesc")}</p>
          <Link
            href="/hesap/giris"
            className="inline-block rounded border border-accent/40 px-6 py-2.5 text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            {t("goToSignIn")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground">{t("signUpTitle")}</h1>
          <p className="mt-2 text-sm text-muted">{t("signUpSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("name")}</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} required />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("surname")}</label>
              <input className={inputClass} value={surname} onChange={(e) => setSurname(e.target.value)} placeholder={t("surnamePlaceholder")} required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("email")}</label>
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" required />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("phone")}</label>
            <input type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("password")}</label>
            <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("confirmPassword")}</label>
            <input type="password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && (
            <p className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-accent px-6 py-3.5 text-sm font-bold tracking-[0.1em] text-[#0a0a0a] transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(255,208,0,0.3)] disabled:opacity-60"
          >
            {loading ? t("processing") : t("signUp")}
          </button>
        </form>

        <div className="text-center text-sm text-muted">
          {t("hasAccount")}{" "}
          <Link href="/hesap/giris" className="font-semibold text-accent transition-colors hover:text-accent/80">
            {t("goToSignIn")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
