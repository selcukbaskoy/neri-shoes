"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "motion/react";
import LanguageSwitcher from "./LanguageSwitcher";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import InstagramIcon from "./icons/InstagramIcon";
import TiktokIcon from "./icons/TiktokIcon";
import CartIcon from "./icons/CartIcon";
import UserIcon from "./icons/UserIcon";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth-context";

const INSTAGRAM_URL = "https://www.instagram.com/nerishoess/";
const TIKTOK_URL = "https://www.tiktok.com/@nerishoes.outlet";

export default function Header({ whatsappNumber }: { whatsappNumber: string }) {
  const t = useTranslations("nav");
  const tWa = useTranslations("whatsapp");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalCount, setOpen: setCartOpen } = useCart();
  const { user } = useAuth();
  const accountHref = user ? "/hesap" : "/giris";
  const accountLabel = user ? tAuth("myAccount") : tAuth("login");
  const whatsappLink = buildWhatsAppLink(whatsappNumber, tWa("generalContact"));

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: t("home") },
    { href: "/urunler", label: t("products") },
    { href: "/hakkimizda", label: t("about") },
    { href: "/toptan", label: t("wholesale") },
    { href: "/blog", label: t("blog") },
    { href: "/iletisim", label: t("contact") },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "border-[#222] bg-black/90 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-[12px]"
          : "border-transparent bg-black/70 backdrop-blur-[4px]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/logo.jpeg"
            alt="Neri Shoes"
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover shadow-[0_0_12px_rgba(255,208,0,0.25)]"
            priority
          />
          <span className="font-serif text-xl font-bold tracking-[0.08em] text-accent">NERI SHOES</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "text-accent active" : "text-foreground hover:text-accent"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black hover:shadow-[0_0_15px_rgba(255,208,0,0.5)]"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black hover:shadow-[0_0_15px_rgba(255,208,0,0.5)]"
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black hover:shadow-[0_0_15px_rgba(255,208,0,0.5)]"
          >
            <TiktokIcon className="h-4 w-4" />
          </a>
          {/* Account icon: girişli → /hesap, girişsiz → /giris */}
          <Link
            href={accountHref}
            aria-label={accountLabel}
            title={accountLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black hover:shadow-[0_0_15px_rgba(255,208,0,0.5)]"
          >
            <UserIcon className="h-4 w-4" />
          </Link>
          {/* Cart icon with badge */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black hover:shadow-[0_0_15px_rgba(255,208,0,0.5)]"
          >
            <CartIcon className="h-4 w-4" />
            <AnimatePresence>
              {totalCount > 0 && (
                <motion.span
                  key={totalCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-[#0a0a0a]"
                >
                  {totalCount > 9 ? "9+" : totalCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile account icon */}
        <Link
          href={accountHref}
          aria-label={accountLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black md:hidden"
          onClick={() => setOpen(false)}
        >
          <UserIcon className="h-4 w-4" />
        </Link>
        {/* Mobile cart icon */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label="Cart"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black md:hidden"
        >
          <CartIcon className="h-4 w-4" />
          <AnimatePresence>
            {totalCount > 0 && (
              <motion.span
                key={totalCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-[#0a0a0a]"
              >
                {totalCount > 9 ? "9+" : totalCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-[#333] p-2 text-accent transition-colors hover:border-accent md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-[#222] bg-black/95 px-4 py-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium uppercase tracking-[0.1em] transition-colors hover:text-accent ${
                    isActive ? "text-accent" : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <LanguageSwitcher side="left" />
            <div className="flex items-center gap-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 text-accent transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black"
              >
                <TiktokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
