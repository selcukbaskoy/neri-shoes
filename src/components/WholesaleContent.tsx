"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function WholesaleContent({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations("wholesale");
  const tWa = useTranslations("whatsapp");
  const whatsappLink = buildWhatsAppLink(whatsappNumber, tWa("generalContact"));

  const advantages = [
    t("advantage1"),
    t("advantage2"),
    t("advantage3"),
    t("advantage4"),
    t("advantage5"),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="section-title">{t("title")}</h1>
        <div className="gold-divider mx-auto my-4 w-24" />
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </motion.div>

      <div className="mt-14">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-serif text-2xl text-accent"
        >
          {t("advantagesTitle")}
        </motion.h2>
        <ul className="mt-5 space-y-3">
          {advantages.map((advantage, i) => (
            <motion.li
              key={advantage}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-3 rounded-lg border border-[#222] p-4 transition-all duration-300 hover:border-accent/40"
              style={{ background: "linear-gradient(135deg, #141414, #0a0a0a)" }}
            >
              <span className="mt-0.5 text-accent/70">◆</span>
              <span className="text-muted">{advantage}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-10 rounded-xl border-2 border-accent/40 p-6"
        style={{ background: "linear-gradient(135deg, #141414, #0a0a0a)" }}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent/40 bg-black">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-accent" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-xl text-accent">{t("minOrderTitle")}</h2>
            <p className="mt-2 text-muted">{t("minOrderText")}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 text-center"
      >
        <h2 className="section-title">{t("ctaTitle")}</h2>
        <div className="gold-divider mx-auto my-4 w-24" />
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-6 inline-block"
        >
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp text-base"
          >
            <span className="btn-whatsapp-content">
              <WhatsAppIcon className="h-5 w-5" />
              {t("ctaButton")}
            </span>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
