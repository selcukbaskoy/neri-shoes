"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { resetPassword } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await resetPassword(email);
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setSuccess(true);
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10 mx-auto">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-accent">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-foreground">{t("resetSentTitle")}</h1>
          <p className="text-sm text-muted">{t("resetSentDesc")}</p>
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
          <h1 className="font-serif text-3xl text-foreground">{t("resetPasswordTitle")}</h1>
          <p className="mt-2 text-sm text-muted">{t("resetPasswordDesc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">{t("email")}</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
            />
          </div>

          {error && (
            <p className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-accent px-6 py-3.5 text-sm font-bold tracking-[0.1em] text-[#0a0a0a] transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(255,208,0,0.3)] disabled:opacity-60"
          >
            {loading ? t("processing") : t("sendResetLink")}
          </button>
        </form>

        <div className="text-center text-sm text-muted">
          <Link href="/hesap/giris" className="text-accent transition-colors hover:text-accent/80">
            {t("backToSignIn")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
