"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      router.push("/giris");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    supabase.auth
      .exchangeCodeForSession(code)
      .then(async ({ error: err, data }) => {
        if (err) {
          console.error("[auth/callback] exchangeCodeForSession hatası:", err.message);
          setError(err.message);
          return;
        }
        // Welcome email akışını tetikle (fire & forget)
        const user = data?.user;
        if (user?.email) {
          const name = user.user_metadata?.name ?? user.user_metadata?.full_name ?? "";
          fetch("/api/email/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, name }),
          }).catch(() => {/* non-critical */});
        }
        // Başarılı — kullanıcıyı hesap sayfasına yönlendir
        router.push("/hesap");
      });
  }, [code, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-red-400">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl text-foreground">Doğrulama Başarısız</h1>
        <p className="max-w-sm text-sm text-muted">{error}</p>
        <button
          onClick={() => router.push("/giris")}
          className="rounded border border-accent/40 px-6 py-2.5 text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
        >
          Giriş Sayfasına Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <p className="text-sm text-muted">Hesabınız doğrulanıyor…</p>
    </div>
  );
}
