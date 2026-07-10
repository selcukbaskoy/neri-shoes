"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/currency-utils";

export default function CartPanel({ rates }: { rates: Record<string, number> }) {
  const t = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    totalAmount,
    totalCount,
    isOpen,
    setOpen,
    stockMap,
    hasStockIssues,
    isValidatingStock,
  } = useCart();

  function handleCheckout() {
    setOpen(false);
    router.push("/odeme");
  }

  const isRTL = locale === "ar";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            key="cart-panel"
            data-testid="cart-panel"
            initial={{ x: isRTL ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "-100%" : "100%" }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={`fixed top-0 z-[61] flex h-full w-full flex-col border-[#222] bg-[#0f0f0f] shadow-[0_0_60px_rgba(0,0,0,0.8)] sm:w-[420px] ${
              isRTL ? "left-0 border-r" : "right-0 border-l"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222] px-5 py-4">
              <h2 className="font-serif text-lg font-bold tracking-[0.06em] text-accent">
                {t("cartTitle")}
                {totalCount > 0 && (
                  <span className="ms-2 text-sm font-normal text-muted">
                    {t("cartItemCount", { count: totalCount })}
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#333] text-muted transition-colors hover:border-accent/60 hover:text-accent"
                aria-label="Close cart"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-16 w-16 text-muted/30"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p className="text-sm text-muted">{t("cartEmpty")}</p>
                <Link
                  href="/urunler"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-lg border border-accent/40 px-5 py-2.5 text-sm font-medium text-accent transition-all hover:border-accent hover:bg-accent/10"
                >
                  {t("viewProducts")}
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <ul className="flex flex-col divide-y divide-[#1a1a1a]">
                  {items.map((item) => {
                    const stockKey = `${item.productId}-${item.size}`;
                    const liveQty = stockMap[stockKey];
                    const isOutOfStock = liveQty !== undefined && liveQty === 0;
                    const isQtyExceeded = liveQty !== undefined && liveQty > 0 && item.quantity > liveQty;

                    return (
                      <li key={stockKey} className="flex gap-4 px-5 py-4">
                        {/* Image */}
                        <Link
                          href={`/urunler/${item.productSlug}`}
                          onClick={() => setOpen(false)}
                          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#222] bg-[#111]"
                        >
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </Link>

                        {/* Info */}
                        <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/urunler/${item.productSlug}`}
                              onClick={() => setOpen(false)}
                              className="truncate text-sm font-medium text-foreground transition-colors hover:text-accent"
                            >
                              {item.productName}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId, item.size)}
                              className="flex-shrink-0 text-muted/50 transition-colors hover:text-red-400"
                              aria-label={t("removeItem")}
                            >
                              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                                <path
                                  d="M6 6l12 12M18 6L6 18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </div>

                          <p className="text-xs text-muted">
                            {t("size")}: {item.size}
                          </p>

                          <div className="flex items-center justify-between gap-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.productId, item.size, item.quantity - 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded border border-[#333] text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40"
                              >
                                −
                              </button>
                              <span className="min-w-[24px] text-center text-sm font-medium text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.productId, item.size, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.maxQuantity}
                                className="flex h-7 w-7 items-center justify-center rounded border border-[#333] text-sm text-foreground transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>

                            {/* Line total */}
                            <span className="text-sm font-bold text-accent">
                              {formatPrice(item.unitPrice * item.quantity, locale, rates)}
                            </span>
                          </div>

                          {/* Stock warning */}
                          {isOutOfStock && (
                            <p className="text-xs font-medium text-red-400">
                              {t("cartItemOutOfStock")}
                            </p>
                          )}
                          {isQtyExceeded && (
                            <p className="text-xs font-medium text-amber-400">
                              {t("cartItemQuantityExceeded", { max: liveQty })}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Validating indicator */}
                {isValidatingStock && (
                  <p className="px-5 py-2 text-xs text-muted/50">{t("validatingStock")}</p>
                )}
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#222] px-5 py-5">
                {hasStockIssues && (
                  <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    {t("checkoutBlockedByStock")}
                  </p>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.12em] text-muted">
                    {t("total")}
                  </span>
                  <span className="text-2xl font-bold text-accent">
                    {formatPrice(totalAmount, locale, rates)}
                  </span>
                </div>

                <motion.button
                  type="button"
                  onClick={handleCheckout}
                  disabled={hasStockIssues}
                  whileHover={!hasStockIssues ? { scale: 1.02 } : undefined}
                  whileTap={!hasStockIssues ? { scale: 0.98 } : undefined}
                  className="w-full rounded-lg bg-accent px-6 py-3.5 text-sm font-bold tracking-[0.1em] text-[#0a0a0a] transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(255,208,0,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent disabled:hover:shadow-none"
                >
                  {t("proceedToCheckout")}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
