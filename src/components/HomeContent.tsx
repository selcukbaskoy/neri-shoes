"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/ProductCard";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { Product } from "@/lib/types";
import { StockEntry } from "@/lib/stock";

interface Props {
  featured: Product[];
  stocksMap: Record<string, StockEntry[]>;
  rates: Record<string, number>;
  whatsappLink: string;
  whatsappNumber: string;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export default function HomeContent({ featured, stocksMap, rates, whatsappLink, whatsappNumber }: Props) {
  const t = useTranslations("home");
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
            <motion.span
              key={i}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.65, delay: shouldReduceMotion ? 0 : 0.4 + i * 0.15, ease: EASE_OUT }}
              className="inline-block"
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
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
