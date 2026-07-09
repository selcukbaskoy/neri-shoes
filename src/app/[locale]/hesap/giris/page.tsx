"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { signIn } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const t = useTranslations("auth");
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await signIn({ email, password });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    await refreshUser();
    router.push("/");
  }

  const inputClass =
    "w-full rounded border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground">{t("signInTitle")}</h1>
          <p className="mt-2 text-sm text-muted">{t("signInSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">
              {t("email")}
            </label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">
              {t("password")}
            </label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-accent px-6 py-3.5 text-sm font-bold tracking-[0.1em] text-[#0a0a0a] transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(255,208,0,0.3)] disabled:opacity-60"
          >
            {loading ? t("processing") : t("signIn")}
          </button>
        </form>

        <div className="flex flex-col gap-3 text-center text-sm">
          <Link
            href="/hesap/sifre-sifirla"
            className="text-muted transition-colors hover:text-accent"
          >
            {t("forgotPassword")}
          </Link>
          <div className="text-muted">
            {t("noAccount")}{" "}
            <Link
              href="/hesap/kayit"
              className="font-semibold text-accent transition-colors hover:text-accent/80"
            >
              {t("createAccount")}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
