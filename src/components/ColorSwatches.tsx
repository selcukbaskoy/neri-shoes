"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ColorSibling } from "@/lib/types";

interface ColorSwatchesProps {
  siblings: ColorSibling[];
  currentSlug: string;
}

export default function ColorSwatches({ siblings, currentSlug }: ColorSwatchesProps) {
  const t = useTranslations("products");
  const locale = useLocale();

  if (!siblings || siblings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-normal uppercase tracking-[0.15em] text-accent/60">
        {t("colorLabel")}
      </span>
      <div className="flex flex-wrap gap-3">
        {siblings.map((sibling) => {
          const isActive = sibling.slug === currentSlug;
          const colorNameMap = sibling.colorName as Record<string, string> | null;
          const colorLabel = colorNameMap?.[locale] ?? colorNameMap?.["tr"] ?? sibling.name;
          const thumbnail = sibling.images?.[0] ?? null;

          return (
            <Link
              key={sibling.id}
              href={`/urunler/${sibling.slug}`}
              prefetch={true}
              className="group relative flex flex-col items-center gap-1.5"
              aria-label={colorLabel}
              aria-current={isActive ? "true" : undefined}
            >
              <div
                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                  isActive
                    ? "border-accent ring-2 ring-[--accent] ring-offset-2 ring-offset-[#0a0a0a] shadow-[0_0_8px_rgba(255,208,0,0.3)]"
                    : "border-[#333] hover:border-accent/60 hover:scale-[1.04]"
                } ${!sibling.inStock ? "opacity-50" : ""}`}
              >
                {thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={colorLabel}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ backgroundColor: sibling.colorHex || "#333" }}
                  />
                )}
                {/* Tükenen çapraz çizgi */}
                {!sibling.inStock && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-px w-[120%] rotate-45 bg-[#555]" />
                  </div>
                )}
                {/* Aktif check işareti */}
                {isActive && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-[#0a0a0a]">
                    ✓
                  </div>
                )}
              </div>
              <span
                className={`max-w-[56px] truncate text-[10px] leading-tight ${
                  isActive ? "text-accent" : "text-muted/80 group-hover:text-foreground/80"
                }`}
              >
                {sibling.inStock ? colorLabel : t("colorOutOfStock")}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
