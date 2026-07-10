"use client";
import { Fragment } from "react";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/ProductCard";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Product } from "@/lib/types";
import { StockEntry } from "@/lib/stock-utils";

interface Props {
  featured: Product[];
  stocksMap: Record<string, StockEntry[]>;
  rates: Record<string, number>;
  whatsappNumber: string;
  stripImages: string[];
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function HomeContent({ featured, stocksMap, rates, whatsappNumber, stripImages }: Props) {
  const t = useTranslations("home");
  const tWa = useTranslations("whatsapp");
  const whatsappLink = buildWhatsAppLink(whatsappNumber, tWa("generalContact"));
  const shouldReduceMotion = useReducedMotion();
  const words = t("heroTitle").split(" ");

  return (
    <>
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-black px-4 text-center">
        {/* Radial glow — soft, organic, breathing */}
        <div className="hero-ambient-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,208,0,0.08),transparent_70%)]" />
        {/* Leather grain texture */}
        <div className="hero-grain pointer-events-none absolute inset-0" />

        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1.2, ease: EASE_OUT }}
          className="relative z-10 mb-8"
        >
          <Image
            src="/logo.jpeg"
            alt="Neri Shoes"
            width={160}
            height={160}
            className="logo-glow h-32 w-32 rounded-2xl object-cover md:h-40 md:w-40"
            priority
          />
        </motion.div>

        <h1 className="relative z-10 font-serif text-5xl font-bold tracking-tight text-accent md:text-7xl">
          {words.map((word, i) => (
            <Fragment key={i}>
              <span className="inline-block overflow-hidden pb-1 leading-tight">
                <motion.span
                  initial={{ y: shouldReduceMotion ? 0 : "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0.01 : 0.8, delay: shouldReduceMotion ? 0 : 0.25 + i * 0.18, ease: EASE_OUT }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              </span>
              {i < words.length - 1 && " "}
            </Fragment>
          ))}
        </h1>

        <motion.div
          initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.9, delay: shouldReduceMotion ? 0 : 1.0, ease: EASE_OUT }}
          style={{ originX: 0.5 }}
          className="relative z-10 my-6 h-px w-56 bg-gradient-to-r from-transparent via-accent to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 1.1 }}
          className="relative z-10 max-w-xl text-balance text-base text-muted md:text-lg"
        >
          {t("heroSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 1.3 }}
          className="relative z-10 mt-10"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link href="/urunler" className="btn-primary">
            {t("exploreButton")}
          </Link>
        </motion.div>

        {stripImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 1.4, delay: shouldReduceMotion ? 0 : 1.8 }}
            className="strip-mask pointer-events-none absolute bottom-20 left-0 z-[1] w-full overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="flex gap-4"
              style={{
                width: "max-content",
                animation: shouldReduceMotion ? "none" : "strip-scroll 42s linear infinite",
              }}
            >
              {[...stripImages, ...stripImages].map((src, i) => (
                <div key={i} className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-sm">
                  <Image src={src} alt="" fill className="object-cover grayscale" sizes="96px" />
                  <div className="absolute inset-0 bg-black/55" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.8, delay: shouldReduceMotion ? 0 : 2.0 }}
          className="scroll-indicator absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-accent/60"
          >
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, ease: EASE_OUT }}
          className="mb-14 text-center"
        >
          <h2 className="section-title">{t("featuredTitle")}</h2>
          <motion.div
            initial={{ scaleX: shouldReduceMotion ? 1 : 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: EASE_OUT }}
            style={{ originX: 0.5 }}
            className="mx-auto my-4 h-px w-24 bg-gradient-to-r from-transparent via-accent to-transparent"
          />
          <p className="mt-1 text-muted">{t("featuredSubtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.55, delay: shouldReduceMotion ? 0 : i * 0.1, ease: EASE_OUT }}
            >
              <ProductCard product={product} stock={stocksMap[product.id] ?? []} rates={rates} whatsappNumber={whatsappNumber} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.5, delay: shouldReduceMotion ? 0 : 0.3, ease: EASE_OUT }}
          className="mt-14 text-center"
        >
          <Link href="/urunler" className="btn-primary">
            {t("viewAll")}
          </Link>
        </motion.div>
      </section>

      {/* Marka Hikayesi */}
      <section className="relative overflow-hidden border-y border-[#1a1a1a] px-4 py-24 md:px-8">
        <div className="hero-grain pointer-events-none absolute inset-0" style={{ opacity: 0.02 }} />
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 md:grid-cols-2 md:gap-20">

            {/* Sol: Hikaye metni */}
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: EASE_OUT }}
              className="border-l-2 border-accent/40 pl-7"
            >
              <p className="mb-4 text-xs uppercase tracking-[0.2em] text-accent/70">
                {t("brand.eyebrow")}
              </p>
              <h2 className="mb-6 font-serif text-3xl font-bold leading-snug text-foreground md:text-4xl">
                {t("brand.title")}
              </h2>
              <p className="leading-relaxed text-muted">
                {t("brand.text")}
              </p>
              <motion.div
                className="mt-8"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/hakkimizda" className="btn-primary">
                  {t("brand.cta")}
                </Link>
              </motion.div>
            </motion.div>

            {/* Sağ: İstatistik kartları */}
            <div className="grid grid-cols-3 gap-4">
              {(["500+", "25+", "50+"] as const).map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: shouldReduceMotion ? 0.01 : 0.5, delay: shouldReduceMotion ? 0 : i * 0.12, ease: EASE_OUT }}
                  className="flex flex-col items-center justify-center rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] to-[#0a0a0a] px-3 py-8 text-center"
                >
                  <span className="mb-2 font-serif text-4xl font-bold text-accent">{value}</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-muted">
                    {t(`brand.stat${i + 1}` as "brand.stat1" | "brand.stat2" | "brand.stat3")}
                  </span>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#222] bg-surface px-4 py-24 text-center md:px-8">
        <div className="hero-grain pointer-events-none absolute inset-0" style={{ opacity: 0.02 }} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,208,0,0.06),transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, ease: EASE_OUT }}
        >
          <h2 className="section-title">{t("whatsappTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">{t("whatsappSubtitle")}</p>
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-10 inline-block"
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <span className="btn-whatsapp-content">
                <WhatsAppIcon className="h-5 w-5" />
                {t("whatsappButton")}
              </span>
            </a>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
