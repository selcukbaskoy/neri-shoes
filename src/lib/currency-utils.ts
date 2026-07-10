export const LOCALE_CURRENCY: Record<string, { code: string; symbol: string }> = {
  tr: { code: "try", symbol: "₺" },
  en: { code: "usd", symbol: "$" },
  de: { code: "eur", symbol: "€" },
  it: { code: "eur", symbol: "€" },
  ar: { code: "usd", symbol: "$" },
  ru: { code: "rub", symbol: "₽" },
};

export function formatPrice(
  priceTRY: number,
  locale: string,
  rates: Record<string, number>
): string {
  if (locale === "tr") {
    return `${priceTRY.toLocaleString("tr-TR")} TL`;
  }
  const { code, symbol } = LOCALE_CURRENCY[locale] ?? { code: "usd", symbol: "$" };
  const rate = rates[code];
  if (!rate) {
    return `${priceTRY.toLocaleString("tr-TR")} TL`;
  }
  const converted = Math.round(priceTRY * rate);
  return `~${symbol}${converted.toLocaleString("en-US")}`;
}
