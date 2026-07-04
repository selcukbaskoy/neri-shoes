"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { motion, useInView } from "motion/react";
import { Link } from "@/i18n/navigation";
import WhatsAppIcon from "./icons/WhatsAppIcon";

/* ─── Count-up hook ──────────────────────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { count, ref };
}

/* ─── fadeUp helper — returns motion props directly ──────────── */
function fu(delay = 0, margin = "-60px") {
  return {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 } as { opacity: number; y: number },
    transition: { duration: 0.65, ease: "easeOut" as const, delay },
    viewport: { once: true as const, margin },
  };
}

/* ─── Hero letter animation ──────────────────────────────────── */
const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const heroLetter = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ─── SVG Icons ──────────────────────────────────────────────── */
function LeatherIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 2.686-9 6s4.03 6 9 6 9-2.686 9-6-4.03-6-9-6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9c0 3.314 4.03 6 9 6s9-2.686 9-6M3 12c0 3.314 4.03 6 9 6s9-2.686 9-6" />
    </svg>
  );
}
function SoleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
    </svg>
  );
}
function CraftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
    </svg>
  );
}
function NetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

/* ─── Stat card with count-up ────────────────────────────────── */
function StatCard({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(target);
  return (
    <div className="flex flex-col items-center gap-2">
      <span ref={ref} className="font-serif text-4xl font-bold text-accent md:text-5xl">
        {count}{suffix}
      </span>
      <span className="text-xs uppercase tracking-[0.14em] text-muted">{label}</span>
    </div>
  );
}

/* ─── Address card ───────────────────────────────────────────── */
function AddressCard({ title, address, icon }: { title: string; address: string; icon: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 0 28px rgba(255,208,0,0.22)" }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3 rounded-xl border border-[#333] p-6 transition-colors hover:border-accent/60"
      style={{ background: "linear-gradient(135deg, #141414, #0a0a0a)" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent">
          {icon}
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted">{address}</p>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function AboutContent({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations("about");
  const tWa = useTranslations("whatsapp");
  const whatsappLink = buildWhatsAppLink(whatsappNumber, tWa("generalContact"));
  const heroChars = Array.from(t("heroTitle"));

  const iconCards = [
    { icon: <LeatherIcon />, text: t("icon1") },
    { icon: <SoleIcon />,    text: t("icon2") },
    { icon: <CraftIcon />,   text: t("icon3") },
    { icon: <NetworkIcon />, text: t("icon4") },
  ];

  const stats: { target: number; suffix: string; labelKey: string }[] = [
    { target: 25,  suffix: "+", labelKey: "stat1Label" },
    { target: 500, suffix: "+", labelKey: "stat2Label" },
    { target: 50,  suffix: "+", labelKey: "stat3Label" },
    { target: 2,   suffix: "",  labelKey: "stat4Label" },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ════ SECTION 1 · Hero Banner ════════════════════════════ */}
      <section className="relative flex min-h-[54vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,208,0,0.09),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 product-pattern opacity-20" />

        <motion.h1
          className="relative z-10 font-serif text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl lg:text-6xl"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
          aria-label={t("heroTitle")}
        >
          {heroChars.map((char, i) => (
            <motion.span key={i} variants={heroLetter} className="inline-block">
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 1.1, ease: "easeOut" }}
          style={{ originX: 0.5 }}
          className="relative z-10 my-5 h-px w-40 bg-gradient-to-r from-transparent via-accent to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="relative z-10 max-w-xl text-base text-muted md:text-lg"
        >
          {t("heroSubtitle")}
        </motion.p>
      </section>

      {/* ════ SECTION 2 · Biz Kimiz ══════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <motion.div {...fu(0, "-80px")}>
            <h2 className="mb-6 font-serif text-3xl text-accent md:text-4xl">{t("whoTitle")}</h2>
            <p className="leading-relaxed text-muted">{t("whoText")}</p>
          </motion.div>

          <motion.div {...fu(0.15, "-80px")} className="relative">
            <div className="overflow-hidden rounded-2xl border-2 border-accent/35 shadow-[0_0_40px_rgba(255,208,0,0.15)]">
              <Image
                src="/images/magaza.png"
                alt="Neri Shoes Mağazası"
                width={700}
                height={460}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            <div className="pointer-events-none absolute -bottom-3 -right-3 h-full w-full rounded-2xl border border-accent/15" />
          </motion.div>
        </div>
      </section>

      {/* ════ SECTION 3 · Zanaat, Kalite, Teknoloji ═════════════ */}
      <section className="bg-surface px-4 py-20 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...fu(0)}>
            <h2 className="mb-5 font-serif text-2xl text-accent md:text-3xl">{t("craftTitle")}</h2>
            <p className="mx-auto max-w-3xl leading-relaxed text-muted">{t("craftText")}</p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {iconCards.map((card, i) => (
              <motion.div
                key={i}
                {...fu(i * 0.15, "-40px")}
                whileHover={{ y: -6, boxShadow: "0 0 20px rgba(255,208,0,0.18)" }}
                className="flex flex-col items-center gap-3 rounded-xl border border-[#2a2a2a] bg-black p-6 text-center transition-colors hover:border-accent/50"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-surface text-accent">
                  {card.icon}
                </div>
                <p className="text-sm font-medium text-foreground">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SECTION 4 · Misyon & Vizyon ═══════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[
            { title: t("missionTitle"), text: t("missionText") },
            { title: t("visionTitle"),  text: t("visionText") },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="rounded-xl border border-accent/30 bg-surface p-8"
            >
              <div className="mb-4 h-px w-10 bg-gradient-to-r from-accent to-transparent" />
              <h3 className="mb-4 font-serif text-xl text-accent">
                {item.title}
              </h3>
              <p className="leading-relaxed text-muted">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════ SECTION 5 · Üretimden Son Tüketiciye ══════════════ */}
      <section className="bg-surface px-4 py-20 md:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fu(0)} className="mb-10 text-center">
            <h2 className="mb-4 font-serif text-2xl text-accent md:text-3xl">{t("directTitle")}</h2>
            <p className="mx-auto max-w-2xl leading-relaxed text-muted">{t("directText")}</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <motion.div {...fu(0.1)}>
              <AddressCard title={t("productionAddress")} address={t("productionAddressText")} icon={<PinIcon />} />
            </motion.div>
            <motion.div {...fu(0.2)}>
              <AddressCard title={t("salesAddress")} address={t("salesAddressText")} icon={<PinIcon />} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════ SECTION 6 · Rakamlarla Neri Shoes ═════════════════ */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            {...fu(0)}
            className="mb-12 text-center font-serif text-2xl text-accent md:text-3xl"
          >
            {t("statsTitle")}
          </motion.h2>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.labelKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-center rounded-xl border border-[#222] bg-surface px-4 py-8 text-center"
              >
                <StatCard target={s.target} suffix={s.suffix} label={t(s.labelKey as Parameters<typeof t>[0])} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ SECTION 7 · CTA ════════════════════════════════════ */}
      <section className="bg-surface px-4 py-16 text-center md:px-8">
        <motion.div {...fu(0)} className="mx-auto max-w-xl">
          <div className="gold-divider mx-auto mb-10 w-16" />
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/urunler" className="btn-primary">
                {t("ctaExplore")}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <span className="btn-whatsapp-content">
                  <WhatsAppIcon className="h-4 w-4" />
                  {t("ctaWhatsapp")}
                </span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
