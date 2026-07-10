"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Tab = "login" | "register";

export default function LoginRegisterContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/hesap";

  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(t("invalidCredentials"));
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError(t("passwordMinLength")); return; }
    if (password !== confirmPassword) { setError(t("passwordMismatch")); return; }
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message.includes("already") ? t("emailAlreadyUsed") : authError.message);
      return;
    }
    // Welcome coupon arka planda oluştur (email confirm sonrası oturum açılınca)
    setSuccess(t("registerSuccess"));
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    });
    setLoading(false);
    setSuccess(t("resetEmailSent"));
  }

  if (showForgot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <div className="w-full max-w-md">
          <h1 className="mb-8 font-serif text-3xl text-white">{t("forgotPassword")}</h1>
          {success ? (
            <p className="text-accent">{success}</p>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input label={t("email")} type="email" value={email} onChange={setEmail} required />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <AuthButton loading={loading}>{t("sendResetLink")}</AuthButton>
            </form>
          )}
          <button onClick={() => setShowForgot(false)} className="mt-4 text-sm text-white/50 hover:text-white">
            {t("backToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 font-serif text-4xl text-white">Neri Shoes</h1>

        {/* Tabs */}
        <div className="mb-8 flex border-b border-white/10">
          {(["login", "register"] as Tab[]).map((t_) => (
            <button
              key={t_}
              onClick={() => { setTab(t_); setError(""); setSuccess(""); }}
              className={`mr-6 pb-3 text-sm font-medium transition-colors ${
                tab === t_ ? "border-b-2 border-accent text-accent" : "text-white/40 hover:text-white/70"
              }`}
            >
              {t_ === "login" ? t("loginTab") : t("registerTab")}
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-6 rounded border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
            {success}
          </div>
        )}

        <AnimatePresence mode="wait">
          {tab === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <Input label={t("email")} type="email" value={email} onChange={setEmail} required />
              <Input label={t("password")} type="password" value={password} onChange={setPassword} required />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <AuthButton loading={loading}>{t("login")}</AuthButton>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="mt-1 block text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                {t("forgotPassword")}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <Input label={t("fullName")} type="text" value={fullName} onChange={setFullName} required />
              <Input label={t("email")} type="email" value={email} onChange={setEmail} required />
              <Input label={t("password")} type="password" value={password} onChange={setPassword} required />
              <Input label={t("confirmPassword")} type="password" value={confirmPassword} onChange={setConfirmPassword} required />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <AuthButton loading={loading}>{t("register")}</AuthButton>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Input({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-accent/60 focus:bg-white/8 rounded"
      />
    </div>
  );
}

function AuthButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full bg-accent py-3.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:bg-accent/90 disabled:opacity-50 rounded"
    >
      {loading ? "…" : children}
    </button>
  );
}
