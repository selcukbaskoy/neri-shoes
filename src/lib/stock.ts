import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "./supabase";

export type StockEntry = { size: number; quantity: number };

export type StockStatus =
  | { kind: "no_data" }
  | { kind: "sold_out" }
  | { kind: "in_stock"; sizes: number[] };

export function computeStockStatus(entries: StockEntry[]): StockStatus {
  const inStock = entries.filter((e) => e.quantity > 0).map((e) => e.size);
  if (inStock.length === 0) return { kind: "sold_out" };
  return { kind: "in_stock", sizes: inStock };
}

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
