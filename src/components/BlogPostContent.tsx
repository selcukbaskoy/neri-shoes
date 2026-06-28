"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { BlogPost, Locale } from "@/lib/types";
import { getBlogContent } from "@/lib/blog";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(
    locale === "ar" ? "ar-SA" : locale === "ru" ? "ru-RU" : locale === "de" ? "de-DE" : locale === "it" ? "it-IT" : locale === "en" ? "en-GB" : "tr-TR",
    { year: "numeric", month: "long", day: "numeric" }
  );
}

export default function BlogPostContent({ post, locale }: { post: BlogPost; locale: Locale }) {
  const t = useTranslations("blog");
  const content = getBlogContent(post, locale);
  const rm = useReducedMotion();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      {/* Breadcrumb */}
      <motion.nav
        initial={rm ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={rm ? { duration: 0 } : { duration: 0.4 }}
        className="mb-8 flex items-center gap-2 text-xs text-muted"
      >
        <Link href="/" className="transition-colors hover:text-accent">{t("breadcrumbHome")}</Link>
        <span>›</span>
        <Link href="/blog" className="transition-colors hover:text-accent">{t("title")}</Link>
        <span>›</span>
        <span className="text-foreground">{content.title}</span>
      </motion.nav>

      {/* Cover image */}
      {post.coverImage && (
        <motion.div
          initial={rm ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={rm ? { duration: 0 } : { duration: 0.8, ease: EASE_OUT }}
          className="mb-10 overflow-hidden rounded-2xl border border-[#222]"
        >
          <Image
            src={post.coverImage}
            alt={content.title}
            width={1200}
            height={630}
            className="w-full object-cover"
            priority
          />
        </motion.div>
      )}

      {/* Meta */}
      <motion.div
        initial={rm ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={rm ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <span className="badge">{t(`category${capitalize(post.category)}`)}</span>
        {post.publishedAt && (
          <span className="text-xs text-muted">{formatDate(post.publishedAt, locale)}</span>
        )}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={rm ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={rm ? { duration: 0 } : { duration: 0.65, delay: 0.1, ease: EASE_OUT }}
        className="mb-4 font-serif text-3xl font-bold leading-tight text-accent md:text-4xl"
      >
        {content.title}
      </motion.h1>

      {/* Divider */}
      <motion.div
        initial={rm ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={rm ? { duration: 0 } : { duration: 0.7, delay: 0.25, ease: EASE_OUT }}
        style={{ originX: 0 }}
        className="mb-8 h-px w-24 bg-gradient-to-r from-accent to-transparent"
      />

      {/* Excerpt */}
      {content.excerpt && (
        <motion.p
          initial={rm ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={rm ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
          className="mb-8 text-lg leading-relaxed text-muted"
        >
          {content.excerpt}
        </motion.p>
      )}

      {/* Body */}
      <motion.div
        initial={rm ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={rm ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
        className="leading-relaxed"
        style={{ lineHeight: 1.85, fontSize: "1rem" }}
      >
        {content.body.split("\n\n").map((paragraph, i) => (
          paragraph.trim() ? (
            <p key={i} className="mb-5 text-foreground/85">
              {paragraph}
            </p>
          ) : null
        ))}
      </motion.div>

      {/* Back link */}
      <motion.div
        initial={rm ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={rm ? { duration: 0 } : { duration: 0.5, delay: 0.6 }}
        className="mt-12 border-t border-[#222] pt-8"
      >
        <Link
          href="/blog"
          className="text-sm font-semibold uppercase tracking-wide text-accent transition-colors hover:text-foreground"
        >
          ← {t("backToBlog")}
        </Link>
      </motion.div>
    </article>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
