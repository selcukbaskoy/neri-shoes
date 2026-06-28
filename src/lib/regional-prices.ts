import { supabase } from "./supabase";

export type RegionalPrice = {
  locale_code: string;
  price: number;
  currency: string;
};

export async function getRegionalPrices(productId: string): Promise<RegionalPrice[]> {
  const { data } = await supabase
    .from("product_regional_prices")
    .select("locale_code, price, currency")
    .eq("product_id", productId);
  return (data ?? []) as RegionalPrice[];
}

export function findRegionalPrice(
  regionalPrices: RegionalPrice[],
  locale: string
): RegionalPrice | null {
  if (locale === "tr") return null;
  return regionalPrices.find((r) => r.locale_code === locale) ?? null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", RUB: "₽", AED: "د.إ", SAR: "ر.س",
  TRY: "₺", JPY: "¥", CNY: "¥", CHF: "Fr", CAD: "CA$", AUD: "A$",
};

export function formatRegionalPrice(price: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency;
  return `${symbol}${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
