"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function WelcomeCouponBanner() {
  const t = useTranslations("account");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/welcome-coupon", { method: "POST" })
      .then((r) => r.json())
      .then((d) => d.code && setCode(d.code));
  }, []);

  if (!code) return null;

  function copy() {
    navigator.clipboard.writeText(code!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-8 rounded border border-accent/30 bg-accent/8 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">{t("welcomeCoupon")}</p>
      <p className="mt-1 text-sm text-white/60">{t("welcomeCouponDesc")}</p>
      <div className="mt-3 flex items-center gap-3">
        <code className="rounded bg-white/8 px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-accent">
          {code}
        </code>
        <button
          onClick={copy}
          className="text-xs text-white/40 transition-colors hover:text-white"
        >
          {copied ? "✓" : t("couponCode")}
        </button>
      </div>
    </div>
  );
}
