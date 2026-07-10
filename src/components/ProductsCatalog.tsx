"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import { Product, ProductCategory, Locale } from "@/lib/types";
import { StockEntry } from "@/lib/stock-utils";
import ProductCard from "./ProductCard";

const CATEGORIES: ProductCategory[] = ["erkek", "spor", "klasik", "gunluk"];

type SaleType = "all" | "wholesale" | "retail";
type SortType = "newest" | "price_asc" | "price_desc";

export default function ProductsCatalog({
  products,
  stocksMap,
  rates,
  whatsappNumber,
}: {
  products: Product[];
  stocksMap: Record<string, StockEntry[]>;
  rates: Record<string, number>;
  whatsappNumber: string;
}) {
  const t = useTranslations("products");
  const locale = useLocale() as Locale;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [saleType, setSaleType] = useState<SaleType>("all");
  const [sort, setSort] = useState<SortType>("newest");

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category !== "all") count++;
    if (saleType !== "all") count++;
    if (search.trim() !== "") count++;
    return count;
  }, [category, saleType, search]);

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const c = product.content?.[locale] ?? product.content?.["tr"];
      const haystack = [product.name, c?.shortDescription, c?.description]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const matchesSearch = haystack.includes(search.toLocaleLowerCase());
      const matchesCategory = category === "all" || product.category === category;
      const matchesSaleType =
        saleType === "all" ||
        (saleType === "wholesale" && product.wholesale) ||
        (saleType === "retail" && product.retail);

      return matchesSearch && matchesCategory && matchesSaleType;
    });

    if (sort === "price_asc") {
      return [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }
    if (sort === "price_desc") {
      return [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }
    return result;
  }, [products, search, category, saleType, sort, locale]);

  const categoryLabel = (value: ProductCategory | "all") =>
    value === "all" ? t("categoryAll") : t(`category${capitalize(value)}`);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="input-field max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">{t("title")}:</span>
          {(["all", ...CATEGORIES] as const).map((cat) => (
            <FilterButton
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              label={categoryLabel(cat)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">{t("filterType")}:</span>
          {(["all", "wholesale", "retail"] as const).map((type) => (
            <FilterButton
              key={type}
              active={saleType === type}
              onClick={() => setSaleType(type)}
              label={type === "all" ? t("filterAll") : t(type)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">{t("sortLabel")}:</span>
          {(["newest", "price_asc", "price_desc"] as const).map((s) => (
            <FilterButton
              key={s}
              active={sort === s}
              onClick={() => setSort(s)}
              label={t(s === "newest" ? "sortNewest" : s === "price_asc" ? "sortPriceAsc" : "sortPriceDesc")}
            />
          ))}
          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              {t("activeFilters", { count: activeFilterCount })}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.p
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 text-center text-muted"
          >
            {t("noResults")}
          </motion.p>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
              >
                <ProductCard product={product} stock={stocksMap[product.id] ?? []} rates={rates} whatsappNumber={whatsappNumber} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-250 ${
        active
          ? "border-accent bg-accent text-black shadow-[0_0_12px_rgba(255,208,0,0.4)]"
          : "border-[#333] text-foreground hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </motion.button>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
