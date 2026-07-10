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
