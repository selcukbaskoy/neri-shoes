"use client";

import { useState, useEffect, useRef } from "react";
import { StockEntry, computeStockStatus } from "@/lib/stock";
import { formatPrice } from "@/lib/currency";
import { RegionalPrice, findRegionalPrice, formatRegionalPrice } from "@/lib/regional-prices";
import { useCart } from "@/lib/cart";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Product, ProductContent, ColorSibling } from "@/lib/types";
import ColorSwatches from "@/components/ColorSwatches";
import ProductReviews from "@/components/ProductReviews";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "./icons/WhatsAppIcon";

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
  siblings = [],
}: {
  product: Product;
  content: ProductContent;
  stock: StockEntry[];
  rates: Record<string, number>;
  regionalPrices?: RegionalPrice[];
  whatsappNumber: string;
  siblings?: ColorSibling[];
}) {
  const t = useTranslations("products");
  const tCart = useTranslations("cart");
  const tWa = useTranslations("whatsapp");
  const locale = useLocale();
  const cart = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [toast, setToast] = useState<{ key: "addedToCart" | "stockLimitReached"; visible: boolean }>({
    key: "addedToCart",
    visible: false,
  });
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Touch swipe — main image
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDidSwipe = useRef(false);
  // Touch swipe — lightbox
  const lbTouchStartX = useRef<number | null>(null);
  const lbTouchStartY = useRef<number | null>(null);
  const lbTouchDidSwipe = useRef(false);

  function handleImgTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDidSwipe.current = false;
  }
  function handleImgTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || images.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      touchDidSwipe.current = true;
      setActiveImg((i) => dx < 0 ? Math.min(images.length - 1, i + 1) : Math.max(0, i - 1));
      setIsZoomed(false);
    }
    touchStartX.current = null;
  }
  function handleLbTouchStart(e: React.TouchEvent) {
    lbTouchStartX.current = e.touches[0].clientX;
    lbTouchStartY.current = e.touches[0].clientY;
    lbTouchDidSwipe.current = false;
  }
  function handleLbTouchEnd(e: React.TouchEvent) {
    if (lbTouchStartX.current === null || images.length <= 1) return;
    const dx = e.changedTouches[0].clientX - lbTouchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (lbTouchStartY.current ?? 0));
    if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
      lbTouchDidSwipe.current = true;
      setLightboxImg((i) => dx < 0 ? Math.min(images.length - 1, i + 1) : Math.max(0, i - 1));
    }
    lbTouchStartX.current = null;
  }
  const [lightboxImg, setLightboxImg] = useState(0);

  const images = product.images?.length ? product.images : [product.image];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }

  function openLightbox() {
    setLightboxImg(activeImg);
    setLightboxOpen(true);
  }

  useEffect(() => {
    setActiveImg(0);
    setSelectedSize(null);
  }, [product.id]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setLightboxImg((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setLightboxImg((i) => Math.min(images.length - 1, i + 1));
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, images.length]);

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

  const infoLink = buildWhatsAppLink(whatsappNumber, tWa("productInfo", { productName: product.name }));
  const wholesaleLink = buildWhatsAppLink(whatsappNumber, tWa("wholesale", { productName: product.name }));

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
          <div
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#222] bg-[#111] cursor-zoom-in select-none"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onClick={() => { if (!touchDidSwipe.current) openLightbox(); }}
            onTouchStart={handleImgTouchStart}
            onTouchEnd={handleImgTouchEnd}
            role="button"
            tabIndex={0}
            aria-label={t("zoomImage")}
            onKeyDown={(e) => e.key === "Enter" && openLightbox()}
          >
            {/* Zoom wrapper — scales with cursor-origin; vignette/badge stay outside */}
            <div
              className="absolute inset-0"
              style={{
                transform: isZoomed ? "scale(1.85)" : "scale(1)",
                transformOrigin,
                transition: "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
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
            </div>

            {/* Persistent corner vignette — outside zoom so it stays fixed */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.25) 100%)" }}
            />

            {/* Zoom hint icon — outside zoom wrapper */}
            <div className="pointer-events-none absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-opacity duration-200" style={{ opacity: isZoomed ? 0 : 0.55 }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-white">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

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
                  <span className="text-sm font-bold uppercase tracking-[0.4em] text-accent">
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
                  onClick={() => { setActiveImg(i); setIsZoomed(false); }}
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

          {/* Renk seçici */}
          {siblings.length > 0 && (
            <ColorSwatches siblings={siblings} currentSlug={product.slug} />
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

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => { if (!lbTouchDidSwipe.current) setLightboxOpen(false); }}
            onTouchStart={handleLbTouchStart}
            onTouchEnd={handleLbTouchEnd}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              onClick={() => setLightboxOpen(false)}
              aria-label="Kapat"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Image */}
            <div
              className="relative m-4 h-[90vh] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxImg]}
                alt={`${product.name} — görsel ${lightboxImg + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 900px"
                quality={90}
              />
            </div>

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors disabled:opacity-30"
                  onClick={(e) => { e.stopPropagation(); setLightboxImg((i) => Math.max(0, i - 1)); }}
                  disabled={lightboxImg === 0}
                  aria-label="Önceki görsel"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors disabled:opacity-30"
                  onClick={(e) => { e.stopPropagation(); setLightboxImg((i) => Math.min(images.length - 1, i + 1)); }}
                  disabled={lightboxImg === images.length - 1}
                  aria-label="Sonraki görsel"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxImg(i); }}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === lightboxImg ? "w-6 bg-accent" : "w-1.5 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Görsel ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Yorumlar */}
      <ProductReviews productId={product.id} productName={product.name} />
    </div>
  );
}
