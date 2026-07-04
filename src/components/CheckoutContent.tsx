"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/currency";
import { Link } from "@/i18n/navigation";

type Step = "form" | "payment" | "success" | "error";

interface FormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  surname: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  district: "",
};

export default function CheckoutContent({ rates }: { rates: Record<string, number> }) {
  const t = useTranslations("odeme");
  const locale = useLocale();
  const { items, totalAmount, clearCart } = useCart();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [devMode, setDevMode] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  // useRef: re-render tetiklemez, AnimatePresence ile çakışmaz
  const iyzicoContainerRef = useRef<HTMLDivElement>(null);
  // Çift enjeksiyonu engeller (StrictMode + gereksiz effect tekrarları)
  const injectedRef = useRef(false);

  useEffect(() => {
    if (step !== "payment" || !checkoutHtml || !iyzicoContainerRef.current || injectedRef.current) return;

    injectedRef.current = true;
    const container = iyzicoContainerRef.current;
    container.innerHTML = checkoutHtml;

    // innerHTML ile eklenen script'ler tarayıcı tarafından çalıştırılmaz;
    // manuel olarak yeniden oluşturulması gerekir.
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [step, checkoutHtml]);

  // Kullanıcı "tekrar dene" ile form'a dönerse injection flag'ini sıfırla
  useEffect(() => {
    if (step === "form") {
      injectedRef.current = false;
      if (iyzicoContainerRef.current) {
        iyzicoContainerRef.current.innerHTML = "";
      }
    }
  }, [step]);

  // iyzico callback URL parametrelerini işle (payment_status=success/failed)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment_status");
    if (paymentStatus === "success") {
      clearCart();
      setStep("success");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (paymentStatus === "failed") {
      setErrorMsg("Ödeme başarısız. Lütfen tekrar deneyin.");
      setStep("error");
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0 && step === "form") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-muted">{t("emptyCart")}</p>
        <Link
          href="/urunler"
          className="rounded border border-accent/40 px-6 py-2.5 text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
        >
          {t("goToProducts")}
        </Link>
      </div>
    );
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = t("required");
    if (!form.surname.trim()) e.surname = t("required");
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = t("invalidEmail");
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10)
      e.phone = t("invalidPhone");
    if (!form.address.trim()) e.address = t("required");
    if (!form.city.trim()) e.city = t("required");
    if (!form.district.trim()) e.district = t("required");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: form }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? t("genericError"));
        setStep("error");
        return;
      }

      if (data.devMode && process.env.NODE_ENV !== "production") {
        setDevMode(true);
        setStep("payment");
        return;
      }

      setCheckoutHtml(data.checkoutFormContent ?? null);
      setStep("payment");
    } catch {
      setErrorMsg(t("networkError"));
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  function handleSuccess() {
    clearCart();
    setStep("success");
  }

  const inputClass =
    "w-full rounded border border-[#2a2a2a] bg-[#111] px-4 py-2.5 text-sm text-foreground placeholder-muted/40 outline-none transition-colors focus:border-accent/60 focus:ring-0";
  const labelClass = "mb-1 block text-xs uppercase tracking-[0.1em] text-muted";
  const errorClass = "mt-1 text-xs text-red-400";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-10 font-serif text-3xl text-foreground">{t("title")}</h1>

      {/*
        iyzico container — AnimatePresence DIŞINDA, her zaman DOM'da.
        React hiçbir zaman bu elementi unmount etmez; sadece CSS ile gizlenir/gösterilir.
        Bu sayede AnimatePresence render döngüleri iframe'i etkileyemez.
      */}
      <div
        ref={iyzicoContainerRef}
        id="iyzico-payment-container"
        style={{ display: step === "payment" && !devMode ? "block" : "none" }}
        className="w-full"
      />

      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid gap-10 lg:grid-cols-[1fr_380px]"
          >
            {/* Sol: Müşteri Bilgileri */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-accent">
                  {t("customerInfo")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>{t("name")}</label>
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t("namePlaceholder")}
                    />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t("surname")}</label>
                    <input
                      className={inputClass}
                      value={form.surname}
                      onChange={(e) => setForm({ ...form, surname: e.target.value })}
                      placeholder={t("surnamePlaceholder")}
                    />
                    {errors.surname && <p className={errorClass}>{errors.surname}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t("email")}</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ornek@email.com"
                    />
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>{t("phone")}</label>
                    <input
                      type="tel"
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                    />
                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-accent">
                  {t("shippingInfo")}
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label className={labelClass}>{t("address")}</label>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder={t("addressPlaceholder")}
                    />
                    {errors.address && <p className={errorClass}>{errors.address}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>{t("city")}</label>
                      <input
                        className={inputClass}
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder={t("cityPlaceholder")}
                      />
                      {errors.city && <p className={errorClass}>{errors.city}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>{t("district")}</label>
                      <input
                        className={inputClass}
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        placeholder={t("districtPlaceholder")}
                      />
                      {errors.district && <p className={errorClass}>{errors.district}</p>}
                    </div>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-accent px-6 py-3.5 text-sm font-bold tracking-[0.1em] text-[#0a0a0a] transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(255,208,0,0.3)] disabled:opacity-60"
              >
                {loading ? t("processing") : t("proceedToPayment")}
              </button>

              <div className="flex items-center justify-center pt-2">
                <Image
                  src="/payment-logos/pay_with_iyzico_white.svg"
                  alt="iyzico ile güvenli öde"
                  width={140}
                  height={32}
                  className="h-8 w-auto opacity-60"
                />
              </div>
            </form>

            {/* Sağ: Sipariş Özeti */}
            <aside className="rounded-lg border border-[#222] bg-[#0f0f0f] p-6 h-fit">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-accent">
                {t("orderSummary")}
              </h2>
              <ul className="mb-6 space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.size}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-muted">
                      {item.productName}{" "}
                      <span className="text-muted/60">
                        × {item.quantity} ({t("size")} {item.size})
                      </span>
                    </span>
                    <span className="font-medium text-foreground">
                      {formatPrice(item.unitPrice * item.quantity, locale, rates)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-[#222] pt-4">
                <span className="text-sm uppercase tracking-[0.1em] text-muted">{t("total")}</span>
                <span className="text-xl font-bold text-accent">
                  {formatPrice(totalAmount, locale, rates)}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted/60">{t("tryNote")}</p>
            </aside>
          </motion.div>
        )}

        {/* devMode mock — sadece development'ta, gerçek iyzico yokken */}
        {step === "payment" && devMode && process.env.NODE_ENV !== "production" && (
          <motion.div
            key="payment-dev"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-8 text-center max-w-md">
              <p className="mb-2 text-sm font-semibold text-yellow-400">{t("devModeTitle")}</p>
              <p className="text-xs text-muted">{t("devModeDesc")}</p>
              <div className="mt-6 flex gap-3 justify-center">
                <button
                  onClick={handleSuccess}
                  className="rounded bg-accent px-5 py-2 text-sm font-bold text-[#0a0a0a]"
                >
                  {t("simulateSuccess")}
                </button>
                <button
                  onClick={() => setStep("error")}
                  className="rounded border border-red-500/40 px-5 py-2 text-sm text-red-400"
                >
                  {t("simulateFailure")}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-green-400">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-foreground">{t("successTitle")}</h2>
            <p className="max-w-sm text-sm text-muted">{t("successDesc")}</p>
            <Link
              href="/urunler"
              className="mt-4 rounded border border-accent/40 px-6 py-2.5 text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
            >
              {t("continueShopping")}
            </Link>
          </motion.div>
        )}

        {step === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-red-400">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-foreground">{t("errorTitle")}</h2>
            <p className="max-w-sm text-sm text-muted">{errorMsg || t("errorDesc")}</p>
            <button
              onClick={() => setStep("form")}
              className="mt-4 rounded border border-accent/40 px-6 py-2.5 text-sm text-accent transition-colors hover:border-accent hover:bg-accent/10"
            >
              {t("tryAgain")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
