import { unstable_noStore as noStore } from "next/cache";
import { supabase, supabaseAdmin } from "./supabase";

export { LOCALE_CURRENCY, formatPrice } from "./currency-utils";

// 1 TRY = X (target currency) — fawazahmed0/currency-api (CDN hosted, no key needed)
const API_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/try.json";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

async function fetchFreshRates(): Promise<Record<string, number>> {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);
  const data = (await res.json()) as { try: Record<string, number> };
  return data.try;
}

/**
 * Kur verisini döndürür. Supabase'de 24 saatten taze bir cache varsa
 * onu kullanır; yoksa API'den çekip cache'e yazar.
 * Hata durumunda boş nesne döner (fiyatlar TL fallback'e düşer).
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  noStore();

  try {
    // Cache kontrolü
    const { data } = await supabase
      .from("exchange_rates")
      .select("rates, updated_at")
      .eq("base_currency", "TRY")
      .maybeSingle();

    if (data) {
      const ageMs = Date.now() - new Date(data.updated_at).getTime();
      if (ageMs < CACHE_TTL_MS) {
        return data.rates as Record<string, number>;
      }
    }

    // Cache yok veya eski — API'den çek
    const rates = await fetchFreshRates();

    await supabaseAdmin.from("exchange_rates").upsert(
      { base_currency: "TRY", rates, updated_at: new Date().toISOString() },
      { onConflict: "base_currency" }
    );

    return rates;
  } catch {
    // API veya DB hatası — TL fallback için boş nesne yeter
    return {};
  }
}

