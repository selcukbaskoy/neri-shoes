import { supabase } from "./supabase";
import type { RegionalPrice } from "./regional-prices-utils";

export type { RegionalPrice } from "./regional-prices-utils";
export { findRegionalPrice, formatRegionalPrice } from "./regional-prices-utils";

export async function getRegionalPrices(productId: string): Promise<RegionalPrice[]> {
  const { data } = await supabase
    .from("product_regional_prices")
    .select("locale_code, price, currency")
    .eq("product_id", productId);
  return (data ?? []) as RegionalPrice[];
}
