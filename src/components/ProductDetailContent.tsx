"use client";

import { useState } from "react";
import { StockEntry, computeStockStatus } from "@/lib/stock";
import { formatPrice } from "@/lib/currency";
import { RegionalPrice, findRegionalPrice, formatRegionalPrice } from "@/lib/regional-prices";
import { useCart } from "@/lib/cart";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Product, ProductContent } from "@/lib/types";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "./icons/WhatsAppIcon";

const WHOLESALE_MSG: Record<string, (name: string) => string> = {
  tr: (name) => `Merhaba, ${name} modeli için toptan fiyat listesi almak istiyorum.`,
  en: (name) => `Hello, I would like to get the wholesale price list for ${name}.`,
  de: (name) => `Hallo, ich möchte die Großhandelspreiseliste für ${name} erhalten.`,
  it: (name) => `Ciao, vorrei ricevere il listino prezzi all'ingrosso per ${name}.`,
  ar: (name) => `مرحباً، أود الحصول على قائمة أسعار الجملة لـ ${name}.`,
  ru: (name) => `Здравствуйте, хотел бы получить оптовый прайс-лист на ${name}.`,
};

function capitalize(v: string) {
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export default function ProductDetailContent({
  product,
  content,
  stock,
  rates,
  regionalPrices = [],
  whatsappNumber,
}: {
  product: Product;
  content: ProductContent;
  stock: StockEntry[];
  rates: Record<string, number>;
  regionalPrices?: RegionalPrice[];
  whatsappNumber: string;
}) {
  const t = useTranslations("products");
  const tCart = useTranslations("cart");
  const locale = useLocale();
  const cart = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [toast, setToast] = useState<{ key: "addedToCart" | "stockLimitReached"; visible: boolean }>({
    key: "addedToCart",
    visible: false,
  });

  function showToast(key: "addedToCart" | "stockLimitReached") {
    setToast({ key, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3500);
  }

  function handleAddToCart() {
    if (selectedSize === null) return;
    const sizeEntry = stock.find((e) => e.size === selectedSize);
    const maxQty = sizeEntry?.quantity ?? 0;
    const existingQty =
      cart.items.find(
        (i) => i.productId === product.id && i.size === selectedSize
      )?.quantity ?? 0;

    if (existingQty >= maxQty) {
      showToast("stockLimitReached");
      return;
    }

    const unitPrice =
      product.compareAtPrice != null &&
      product.price != null &&
      product.price > product.compareAtPrice
        ? product.compareAtPrice
        : product.price!;

    cart.addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug || product.id,
      productImage: product.image,
      size: selectedSize,
      unitPrice,
      maxQuantity: maxQty,
    });

    setSelectedSize(null);
    showToast("addedToCart");
  }

  const stockStatus = computeStockStatus(stock);
  const regionalPrice = findRegionalPrice(regionalPrices, locale);

  function displayPrice(tryAmount: number): string {
    if (regionalPrice) return formatRegionalPrice(regionalPrice.price, regionalPrice.currency);
    return formatPrice(tryAmount, locale, rates);
  }

  const images = product.images?.length ? product.images : [product.image];
  const infoLink = buildProductWhatsAppLink(whatsappNumber, product.name, locale);
  const wholesaleFn = WHOLESALE_MSG[locale] || WHOLESALE_MSG.tr;
  const wholesaleLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(wholesaleFn(product.name))}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-accent transition-colors">
          {t("breadcrumbHome")}
        </Link>
        <span>/</span>
        <Link href="/urunler" className="hover:text-accent transition-colors">
          {t("title")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left — Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {/* Main image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#222] bg-[#111]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[activeImg]}
                  alt={`${product.name} — görsel ${activeImg + 1}`}
                  fill
                  className="object-cover"
                  priority={activeImg === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>
            {/* Persistent corner vignette */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.25) 100%)" }}
            />
            {/* Durum B: tüm stok sıfır — diyagonal tükendi şeridi */}
            {stockStatus.kind === "sold_out" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <div
                  className="w-[150%] py-4 text-center"
                  style={{
                    transform: "rotate(-35deg)",
                    background: "rgba(8,8,8,0.78)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <span className="text-sm font-bold uppercase tracking-[0.4em] text-white/90">
                    {t("soldOut")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                    i === activeImg
                      ? "border-accent shadow-[0_0_12px_rgba(255,208,0,0.4)]"
                      : "border-[#333] hover:border-accent/50"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right — Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          {/* Category badge */}
          <span className="badge">
            {t(`category${capitalize(product.category)}`)}
          </span>

          {/* Name */}
          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            {product.name}
          </h1>

          {/* Short description */}
          {content.shortDescription && (
            <p className="text-base italic text-accent/80">{content.shortDescription}</p>
          )}

          {/* Long description */}
          {content.description && (
            <p className="text-sm leading-relaxed text-foreground/85">{content.description}</p>
          )}

          {/* Price block — only when price data exists */}
          {product.price != null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col gap-1.5"
            >
              {product.compareAtPrice != null && product.price > product.compareAtPrice ? (
                /* Durum 1: indirimli */
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-bold text-accent">
                    {displayPrice(product.compareAtPrice)}
                  </span>
                  <span className="text-base text-muted line-through">
                    {displayPrice(product.price)}
                  </span>
                  {product.discountPercentage != null && (
                    <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-3 py-0.5 text-sm font-bold text-accent">
                      %{product.discountPercentage} {t("discountBadge")}
                    </span>
                  )}
                </div>
              ) : (
                /* Durum 2: normal fiyat */
                <span className="text-3xl font-bold text-accent">
                  {displayPrice(product.price)}
                </span>
              )}
              {/* Yaklaşık fiyat notu — sadece TR dışı dillerde, bölgesel fiyat yoksa */}
              {locale !== "tr" && !regionalPrice && t("priceApproxNote") && (
                <p className="text-xs text-muted/70">
                  {t("priceApproxNote")}
                </p>
              )}
            </motion.div>
          )}
          {/* Durum 3: price == null → fiyat bloğu hiç render edilmez */}

          {/* Durum 2: sold_out — metin mesajı (görsel rozete ek) */}
          {stockStatus.kind === "sold_out" && (
            <p className="text-sm italic text-muted/70">
              {t("outOfStockMessage")}
            </p>
          )}

          {/* Beden seçici — yalnızca stoklu bedenler varsa */}
          {stockStatus.kind === "in_stock" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-normal uppercase tracking-[0.15em] text-accent/60">
                  {t("sizeSelector")}
                </span>
                <span className="text-xs text-muted/60">
                  {t("availableSizesMessage", { sizes: stockStatus.sizes.join(", ") })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stockStatus.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                    className={`min-w-[48px] rounded border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? "border-accent bg-accent/20 text-accent shadow-[0_0_8px_rgba(255,208,0,0.3)]"
                        : "border-[#333] text-foreground hover:border-accent/60 hover:text-accent/80"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Durum no_data → beden seçici hiç render edilmez (WhatsApp-only mod) */}
          {/* Durum sold_out → beden seçici hiç render edilmez (tükendi rozeti görünür) */}

          {/* Divider */}
          <div className="gold-divider" />

          {/* Features */}
          {content.features && content.features.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-normal uppercase tracking-[0.15em] text-accent/60">
                {t("featuresTitle")}
              </h3>
              <ul className="flex flex-col gap-2">
                {content.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-bold">
                      ✓
                    </span>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Styling */}
          {content.styling && content.styling.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-normal uppercase tracking-[0.15em] text-accent/60">
                {t("stylingTitle")}
              </h3>
              <ul className="flex flex-col gap-2">
                {content.styling.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent/60" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sale type badges */}
          <div className="flex gap-2">
            {product.wholesale && <span className="badge">{t("wholesale")}</span>}
            {product.retail && <span className="badge">{t("retail")}</span>}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 pt-2">
            {product.price != null && stockStatus.kind === "in_stock" ? (
              <>
                {/* PRIMARY: Sepete Ekle */}
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={selectedSize === null}
                  whileHover={selectedSize !== null ? { scale: 1.02 } : undefined}
                  whileTap={selectedSize !== null ? { scale: 0.98 } : undefined}
                  className="w-full rounded-lg bg-accent px-6 py-4 text-sm font-bold tracking-[0.1em] text-[#0a0a0a] transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(255,208,0,0.4)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-accent disabled:hover:shadow-none"
                >
                  {t("addToCart")}
                </motion.button>
                {selectedSize === null && (
                  <p className="text-center text-xs text-muted/60">{t("selectSizeFirst")}</p>
                )}
                {/* SECONDARY: WhatsApp — outline */}
                <motion.a
                  href={infoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#333] px-6 py-3 text-sm font-medium text-muted transition-all duration-200 hover:border-accent/40 hover:text-accent/70"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t("detailAskInfo")}
                </motion.a>
              </>
            ) : (
              /* No cart — WhatsApp is primary CTA */
              <motion.a
                href={infoLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-whatsapp text-center"
              >
                <span className="btn-whatsapp-content justify-center">
                  <WhatsAppIcon className="h-5 w-5" />
                  {t("detailAskInfo")}
                </span>
              </motion.a>
            )}

            {product.wholesale && (
              <motion.a
                href={wholesaleLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-accent/50 px-6 py-3 text-sm font-semibold tracking-[0.08em] text-accent transition-all duration-250 hover:border-accent hover:bg-accent/5"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {t("detailAskWholesale")}
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Cart action toast */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed bottom-6 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border px-5 py-3.5 text-center text-sm shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md ${
              toast.key === "addedToCart"
                ? "border-accent/30 bg-[#141414]/95 text-foreground/90"
                : "border-red-500/30 bg-[#141414]/95 text-red-400"
            }`}
          >
            {tCart(toast.key)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
