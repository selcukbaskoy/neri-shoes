"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const FLAGS: Record<Locale, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  de: "🇩🇪",
  it: "🇮🇹",
  ar: "🇸🇦",
  ru: "🇷🇺",
};

export default function LanguageSwitcher({ side = "right" }: { side?: "left" | "right" }) {
  const t = useTranslations("languages");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nextLocale: Locale) {
    setOpen(false);
    window.location.href = `/${nextLocale}${pathname}`;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-[#333] px-3 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
        aria-label="Language switcher"
      >
        <span className="text-lg leading-none">{FLAGS[locale]}</span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className={`absolute ${side === "left" ? "left-0" : "right-0"} z-50 mt-2 w-44 rounded-md border border-[#333] bg-surface py-1 shadow-lg`}>
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleSelect(loc)}
              className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-black hover:text-accent ${
                loc === locale ? "text-accent" : "text-foreground"
              }`}
            >
              <span className="text-lg leading-none">{FLAGS[loc]}</span>
              <span>{t(loc)}</span>
              <span className="ml-auto text-xs uppercase text-muted">{loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
