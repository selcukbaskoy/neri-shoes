// Dükkan Raporlar sekmesi — 7 endpoint'in ortak tarih/kanal parse + veri toplama yardımcıları.
// Server-only (supabaseAdmin kullanır) — client component'ten import edilmemeli.
import { supabaseAdmin } from "@/lib/supabase";

export type Channel = "all" | "store" | "online";

export interface DateRange {
  from: string;
  to: string;
}

export function parseDateRange(searchParams: URLSearchParams): DateRange | { error: string } {
  const now = new Date();
  const defaultTo = now.toISOString();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ?? defaultFrom;
  const to = toParam ?? defaultTo;

  if (Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
    return { error: "invalid_date" };
  }
  if (from > to) {
    return { error: "invalid_range" };
  }
  return { from, to };
}

export function parseChannel(searchParams: URLSearchParams): Channel {
  const c = searchParams.get("channel");
  if (c === "store" || c === "online") return c;
  return "all";
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

export interface StoreSaleRow {
  id: number;
  customer_id: number | null;
  payment_method: "nakit" | "pos" | "veresiye";
  discount_amount: number;
  total_price: number;
  sold_at: string;
}

export async function fetchStoreSalesInRange(from: string, to: string) {
  const { data, error } = await supabaseAdmin
    .from("store_sales")
    .select("id, customer_id, payment_method, discount_amount, total_price, sold_at")
    .eq("is_reversed", false)
    .gte("sold_at", from)
    .lte("sold_at", to);
  if (error) throw new Error(error.message);
  return (data ?? []) as StoreSaleRow[];
}

export interface ManualSaleRow {
  id: number;
  customer_id: number | null;
  payment_method: "nakit" | "pos";
  discount_amount: number;
  total_amount: number;
  quantity: number;
  sale_date: string;
}

export async function fetchManualSalesInRange(from: string, to: string) {
  const fromDate = from.slice(0, 10);
  const toDate = to.slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("manual_store_sales")
    .select("id, customer_id, payment_method, discount_amount, total_amount, quantity, sale_date")
    .gte("sale_date", fromDate)
    .lte("sale_date", toDate);
  if (error) throw new Error(error.message);
  return (data ?? []) as ManualSaleRow[];
}

export interface OnlineOrderRow {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  total_amount: number;
  discount_amount: number;
  created_at: string;
}

export async function fetchOnlineOrdersInRange(from: string, to: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, customer_id, customer_email, total_amount, discount_amount, created_at")
    .eq("status", "paid")
    .gte("created_at", from)
    .lte("created_at", to);
  if (error) throw new Error(error.message);
  return (data ?? []) as OnlineOrderRow[];
}

export interface StoreSaleItemRow {
  id: number;
  sale_id: number;
  product_id: string | null;
  size: number | null;
  quantity: number;
  unit_price: number;
  returned_quantity: number;
}

export async function fetchStoreSaleItemsForSales(saleIds: number[]) {
  if (saleIds.length === 0) return [] as StoreSaleItemRow[];
  const { data, error } = await supabaseAdmin
    .from("store_sale_items")
    .select("id, sale_id, product_id, size, quantity, unit_price, returned_quantity")
    .in("sale_id", saleIds);
  if (error) throw new Error(error.message);
  return (data ?? []) as StoreSaleItemRow[];
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: number;
  quantity: number;
  unit_price: number;
}

export async function fetchOrderItemsForOrders(orderIds: string[]) {
  if (orderIds.length === 0) return [] as OrderItemRow[];
  const { data, error } = await supabaseAdmin
    .from("order_items")
    .select("id, order_id, product_id, product_name, size, quantity, unit_price")
    .in("order_id", orderIds);
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderItemRow[];
}

export interface ProductInfo {
  id: string;
  name: string;
  color_family: string | null;
  price: number;
}

export async function fetchProductsMap(): Promise<Map<string, ProductInfo>> {
  const { data, error } = await supabaseAdmin.from("products").select("id, name, color_family, price");
  if (error) throw new Error(error.message);
  const map = new Map<string, ProductInfo>();
  for (const p of data ?? []) map.set(p.id, { ...p, price: Number(p.price) } as ProductInfo);
  return map;
}

// product_costs boş olabilir (F1'den beri tablo var, veri yok) — dolarsa en güncel effective_from kullanılır.
export async function fetchProductCostMap(): Promise<Map<string, number>> {
  const { data, error } = await supabaseAdmin
    .from("product_costs")
    .select("product_id, size, purchase_price, effective_from")
    .order("effective_from", { ascending: false });
  if (error) throw new Error(error.message);
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const key = `${row.product_id}:${row.size}`;
    if (!map.has(key)) map.set(key, Number(row.purchase_price));
  }
  return map;
}

// Açık veresiye bakiyesi (tüm zamanlar — anlık durum, tarih aralığından bağımsız).
export async function fetchOpenCreditBalances(): Promise<
  Map<number, { balance: number; oldestSaleDate: string; nearestDue: string | null }>
> {
  const { data, error } = await supabaseAdmin
    .from("store_sales")
    .select("customer_id, total_price, amount_paid, promised_pay_at, sold_at")
    .eq("payment_method", "veresiye")
    .eq("is_paid", false)
    .eq("is_reversed", false);
  if (error) throw new Error(error.message);

  const balances = new Map<number, { balance: number; oldestSaleDate: string; nearestDue: string | null }>();
  for (const sale of data ?? []) {
    if (!sale.customer_id) continue;
    const remaining = Number(sale.total_price) - Number(sale.amount_paid);
    const existing = balances.get(sale.customer_id) ?? {
      balance: 0,
      oldestSaleDate: sale.sold_at,
      nearestDue: null,
    };
    existing.balance += remaining;
    if (sale.sold_at < existing.oldestSaleDate) existing.oldestSaleDate = sale.sold_at;
    if (sale.promised_pay_at) {
      if (!existing.nearestDue || sale.promised_pay_at < existing.nearestDue) {
        existing.nearestDue = sale.promised_pay_at;
      }
    }
    balances.set(sale.customer_id, existing);
  }
  return balances;
}

export function agingBucket(daysOld: number): "0_30_days" | "31_60_days" | "61_90_days" | "over_90_days" {
  if (daysOld <= 30) return "0_30_days";
  if (daysOld <= 60) return "31_60_days";
  if (daysOld <= 90) return "61_90_days";
  return "over_90_days";
}
