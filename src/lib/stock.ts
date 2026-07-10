import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "./supabase";
import type { StockEntry } from "./stock-utils";

export type { StockEntry, StockStatus } from "./stock-utils";
export { computeStockStatus } from "./stock-utils";

export async function getProductStock(productId: string): Promise<StockEntry[]> {
  noStore();
  const { data, error } = await supabase
    .from("product_stock")
    .select("size, quantity")
    .eq("product_id", productId)
    .order("size");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllProductStocks(): Promise<Record<string, StockEntry[]>> {
  noStore();
  const { data, error } = await supabase
    .from("product_stock")
    .select("product_id, size, quantity")
    .order("product_id")
    .order("size");
  if (error) throw new Error(error.message);
  const result: Record<string, StockEntry[]> = {};
  for (const row of data ?? []) {
    if (!result[row.product_id]) result[row.product_id] = [];
    result[row.product_id].push({ size: row.size, quantity: row.quantity });
  }
  return result;
}
