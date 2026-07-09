"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/hesap/giris");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email || t("hello");

  const cards = [
    {
      href: "/hesap/favoriler",
      title: "Favorilerim",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-accent" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/hesap/siparisler",
      title: t("orders"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-accent" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/hesap/adresler",
      title: t("addresses"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-accent" stroke="currentColor" strokeWidth="1.5">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/hesap/profil",
      title: t("profile"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-accent" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="font-serif text-3xl text-foreground">
            {t("hello")}, <span className="text-accent">{userName}</span>
          </h1>
          <p className="mt-2 text-sm text-muted">{user?.email}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-center gap-4 rounded-lg border border-[#222] bg-[#0f0f0f] p-5 transition-all hover:border-accent/40 hover:shadow-[0_0_20px_rgba(255,208,0,0.08)]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/5 transition-colors group-hover:border-accent/40 group-hover:bg-accent/10">
                {card.icon}
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors group-hover:text-accent">
                {card.title}
              </span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="ml-auto h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}

          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="group flex items-center gap-4 rounded-lg border border-[#222] bg-[#0f0f0f] p-5 transition-all hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/5 transition-colors group-hover:border-red-500/40 group-hover:bg-red-500/10">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-red-400" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors group-hover:text-red-400">
              {tAuth("logout")}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
