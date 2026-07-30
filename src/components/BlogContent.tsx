"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { BlogPost, Locale } from "@/lib/types";
import { getBlogContent } from "@/lib/blog-utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "ru" ? "ru-RU" : locale === "de" ? "de-DE" : locale === "it" ? "it-IT" : locale === "en" ? "en-GB" : "tr-TR", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function BlogContent({ posts }: { posts: BlogPost[] }) {
  const t = useTranslations("blog");
  const locale = useLocale() as Locale;
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT }}
        className="mb-14 text-center"
      >
        <h1 className="section-title">{t("title")}</h1>
        <div className="gold-divider mx-auto my-4 w-24" />
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </motion.div>

      {posts.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted"
        >
          {t("noPosts")}
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => {
            const content = getBlogContent(post, locale);
            return (
              <motion.article
                key={post.id}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, delay: i * 0.08, ease: EASE_OUT }}
                whileHover={shouldReduceMotion ? undefined : {
                  y: -6,
                  boxShadow: "0 0 28px rgba(255,208,0,0.18)",
                  transition: { duration: 0.2, ease: EASE_OUT },
                }}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#222] transition-colors duration-300 hover:border-accent/50"
                style={{ background: "linear-gradient(135deg,#141414,#0a0a0a)" }}
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.coverImage ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={content.title}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.3) 100%)" }} />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full product-pattern" />
                  )}
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center gap-2">
                    <span className="badge">{t(`category${capitalize(post.category)}`)}</span>
                    {post.publishedAt && (
                      <span className="text-[11px] text-muted">{formatDate(post.publishedAt, locale)}</span>
                    )}
                  </div>

                  <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-accent">
                    <h2 className="font-serif text-lg font-semibold leading-snug text-foreground line-clamp-2">
                      {content.title}
                    </h2>
                  </Link>

                  <p className="line-clamp-3 text-sm text-muted">{content.excerpt}</p>

                  <div className="mt-auto">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:text-foreground"
                    >
                      {t("readMore")} →
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
