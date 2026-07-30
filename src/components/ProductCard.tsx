"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Product, Locale } from "@/lib/types";
import { StockEntry, computeStockStatus } from "@/lib/stock-utils";
import { formatPrice } from "@/lib/currency-utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "./icons/WhatsAppIcon";

export default function ProductCard({
  product,
  stock,
  rates,
  whatsappNumber,
}: {
  product: Product;
  stock: StockEntry[];
  rates: Record<string, number>;
  whatsappNumber: string;
}) {
  const t = useTranslations("products");
  const tWa = useTranslations("whatsapp");
  const locale = useLocale() as Locale;
  const shouldReduceMotion = useReducedMotion();
  const content = product.content?.[locale] ?? product.content?.["tr"];
  const whatsappLink = buildWhatsAppLink(whatsappNumber, tWa("productInfo", { productName: product.name }));
  const slug = product.slug || product.id;
  const detailHref = `/urunler/${slug}` as const;

  const stockStatus = computeStockStatus(stock);

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -8, boxShadow: "0 0 32px rgba(255,208,0,0.22)" }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="group flex flex-col overflow-hidden rounded-lg border border-[#222] transition-colors duration-[400ms] ease-out hover:border-accent/60"
      style={{ background: "linear-gradient(135deg, #141414, #0a0a0a)" }}
    >
      <Link href={detailHref} className="block">
        <div className="relative aspect-square w-full overflow-hidden product-pattern">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
          />
          {/* Persistent corner vignette — blends light studio bg with dark card */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.28) 100%)" }}
          />
          {/* Gold vignette overlay on hover */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out group-hover:opacity-100"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,208,0,0.06) 0%, rgba(0,0,0,0.25) 100%)" }}
          />
          {/* Durum B: tüm stok sıfır — diyagonal tükendi şeridi */}
          {stockStatus.kind === "sold_out" && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              role="img"
              aria-label={t("soldOut")}
            >
              <div
                aria-hidden="true"
                className="w-[150%] py-2.5 text-center"
                style={{
                  transform: "rotate(-35deg)",
                  background: "rgba(8,8,8,0.78)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
                  {t("soldOut")}
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={detailHref} className="transition-colors hover:text-accent">
            <h3 className="text-base font-semibold text-foreground">{product.name}</h3>
          </Link>
          <span className="badge whitespace-nowrap">
            {t(`category${capitalize(product.category)}`)}
          </span>
        </div>

        <p className="line-clamp-1 text-sm text-muted">
          {content?.shortDescription || content?.description}
        </p>

        {/* Price block — compact, same 3-state logic as detail page */}
        {product.price != null && (
          <div className="flex flex-wrap items-center gap-2">
            {product.compareAtPrice != null && product.compareAtPrice > 0 && product.price > product.compareAtPrice ? (
              /* Durum 1: indirimli */
              <>
                <span className="text-base font-bold text-accent">
                  {formatPrice(product.compareAtPrice, locale, rates)}
                </span>
                <span className="text-xs text-muted line-through">
                  {formatPrice(product.price, locale, rates)}
                </span>
                {product.discountPercentage != null && (
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
                    %{product.discountPercentage}
                  </span>
                )}
              </>
            ) : (
              /* Durum 2: normal fiyat */
              <span className="text-base font-bold text-accent">
                {formatPrice(product.price, locale, rates)}
              </span>
            )}
          </div>
        )}
        {/* Durum 3: price == null → fiyat bloğu hiç render edilmez */}

        <div className="flex flex-wrap gap-2">
          {product.wholesale && <span className="badge">{t("wholesale")}</span>}
          {product.retail && <span className="badge">{t("retail")}</span>}
        </div>

        {stockStatus.kind === "in_stock" && (
          <div
            className="flex flex-wrap gap-1"
            aria-label={t("availableSizesMessage", { sizes: stockStatus.sizes.join(", ") })}
          >
            {stockStatus.sizes.map((size) => (
              <span
                key={size}
                aria-hidden="true"
                className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-[#2a2a2a] bg-[#111] px-1.5 text-[10px] font-medium text-muted"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("whatsappAria", { name: product.name })}
            className="btn-whatsapp flex-1"
          >
            <span className="btn-whatsapp-content">
              <WhatsAppIcon className="h-4 w-4" />
              {t("askWhatsapp")}
            </span>
          </a>
          <Link
            href={detailHref}
            className="flex min-h-[44px] items-center justify-center rounded border border-[#2e2e2e] px-3 text-xs text-muted/70 transition-colors hover:border-[#444] hover:text-foreground"
          >
            {t("viewDetail")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
