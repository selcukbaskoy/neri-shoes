"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ErrorState =
  | { type: "invalid"; remaining: number }
  | { type: "locked"; mins: number }
  | null;

export default function AdminLogin() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorState>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh();
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      const mins = Math.ceil((data.secsLeft ?? 900) / 60);
      setError({ type: "locked", mins });
    } else {
      setError({ type: "invalid", remaining: data.remaining ?? 0 });
    }
  }

  const isLocked = error?.type === "locked";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-accent">
          {t("loginTitle")}
        </h1>
        <label className="mb-2 block text-sm text-muted">{t("passwordLabel")}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field disabled:opacity-40"
          autoFocus
          disabled={isLocked}
        />
        {error?.type === "invalid" && (
          <p className="mt-2 text-sm text-red-500">
            {error.remaining > 0
              ? t("loginErrorRemaining", { count: error.remaining })
              : t("loginError")}
          </p>
        )}
        {error?.type === "locked" && (
          <p className="mt-2 text-sm text-red-500">
            {t("loginErrorLocked", { mins: error.mins })}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || isLocked}
          className="btn-primary mt-6 w-full disabled:opacity-40"
        >
          {t("loginButton")}
        </button>
      </form>
    </div>
  );
}
