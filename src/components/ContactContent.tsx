"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import InstagramIcon from "./icons/InstagramIcon";
import TiktokIcon from "./icons/TiktokIcon";

const INSTAGRAM_URL = "https://www.instagram.com/nerishoess/";
const TIKTOK_URL = "https://www.tiktok.com/@nerishoes.outlet";

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-accent" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-accent" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

const cardStyle = { background: "linear-gradient(135deg, #141414, #0a0a0a)" };

export default function ContactContent({ whatsappLink }: { whatsappLink: string }) {
  const t = useTranslations("contact");
  const ta = useTranslations("about");

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

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0 }}
          whileHover={{ y: -8 }}
          className="flex flex-col items-center gap-5 rounded-xl border border-[#222] p-8 text-center transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(255,208,0,0.15)]"
          style={cardStyle}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/40 bg-black shadow-[0_0_20px_rgba(255,208,0,0.2)]">
            <WhatsAppIcon className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-accent">{t("whatsappTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t("whatsappText")}</p>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-auto w-full">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full"
            >
              <span className="btn-whatsapp-content">
                <WhatsAppIcon className="h-4 w-4" />
                {t("whatsappButton")}
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* Üretim Adresi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          whileHover={{ y: -8, boxShadow: "0 0 24px rgba(255,208,0,0.18)" }}
          className="flex flex-col items-center gap-4 rounded-xl border border-[#222] p-6 text-center transition-all duration-300 hover:border-accent/50"
          style={cardStyle}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-black">
            <LocationIcon />
          </div>
          <h2 className="font-serif text-xl text-accent">{ta("productionAddress")}</h2>
          <p className="text-sm leading-relaxed text-muted">{ta("productionAddressText")}</p>
        </motion.div>

        {/* Satış Adresi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          whileHover={{ y: -8, boxShadow: "0 0 24px rgba(255,208,0,0.18)" }}
          className="flex flex-col items-center gap-4 rounded-xl border border-[#222] p-6 text-center transition-all duration-300 hover:border-accent/50"
          style={cardStyle}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-black">
            <LocationIcon />
          </div>
          <h2 className="font-serif text-xl text-accent">{ta("salesAddress")}</h2>
          <p className="text-sm leading-relaxed text-muted">{ta("salesAddressText")}</p>
        </motion.div>

        {/* Çalışma Saatleri */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.3 }}
          whileHover={{ y: -8, boxShadow: "0 0 24px rgba(255,208,0,0.18)" }}
          className="flex flex-col items-center gap-4 rounded-xl border border-[#222] p-6 text-center transition-all duration-300 hover:border-accent/50"
          style={cardStyle}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-black">
            <ClockIcon />
          </div>
          <h2 className="font-serif text-xl text-accent">{t("hoursTitle")}</h2>
          <p className="text-sm text-muted">{t("hoursWeekdays")}</p>
          <p className="text-sm text-muted">{t("hoursSunday")}</p>
        </motion.div>
      </div>

      {/* Sosyal Medya */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-10"
      >
        <h2 className="mb-6 text-center font-serif text-2xl text-accent">{t("followTitle")}</h2>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <motion.a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -6 }}
            className="flex w-full max-w-[220px] flex-col items-center gap-3 rounded-xl border border-[#222] p-6 text-center transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(255,208,0,0.15)]"
            style={cardStyle}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-black">
              <InstagramIcon className="h-7 w-7 text-accent" />
            </div>
            <span className="font-serif text-lg text-accent">Instagram</span>
            <span className="text-xs text-muted">@nerishoess</span>
          </motion.a>

          <motion.a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -6 }}
            className="flex w-full max-w-[220px] flex-col items-center gap-3 rounded-xl border border-[#222] p-6 text-center transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_rgba(255,208,0,0.15)]"
            style={cardStyle}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-black">
              <TiktokIcon className="h-7 w-7 text-accent" />
            </div>
            <span className="font-serif text-lg text-accent">TikTok</span>
            <span className="text-xs text-muted">@nerishoes.outlet</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
