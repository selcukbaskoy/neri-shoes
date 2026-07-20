import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
  parseDateRange,
  round2,
  fetchStoreSalesInRange,
  fetchOnlineOrdersInRange,
  fetchStoreSaleItemsForSales,
  fetchOrderItemsForOrders,
  fetchProductsMap,
} from "@/lib/dukkan-reports-utils";

const CRITICAL_STOCK_THRESHOLD = 3;

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const range = parseDateRange(request.nextUrl.searchParams);
  if ("error" in range) return NextResponse.json({ error: range.error }, { status: 400 });
  const { from, to } = range;

  try {
    const [storeSales, onlineOrders, productsMap, stockRes] = await Promise.all([
      fetchStoreSalesInRange(from, to),
      fetchOnlineOrdersInRange(from, to),
      fetchProductsMap(),
      supabaseAdmin.from("product_stock").select("product_id, size, quantity"),
    ]);
    if (stockRes.error) throw new Error(stockRes.error.message);

    const [storeItems, orderItems] = await Promise.all([
      fetchStoreSaleItemsForSales(storeSales.map((s) => s.id)),
      fetchOrderItemsForOrders(onlineOrders.map((o) => o.id)),
    ]);

    const sizeCounts = new Map<number, number>();
    for (const i of storeItems) {
      if (i.size == null) continue;
      const soldQty = i.quantity - (i.returned_quantity ?? 0);
      sizeCounts.set(i.size, (sizeCounts.get(i.size) ?? 0) + soldQty);
    }
    for (const i of orderItems) {
      sizeCounts.set(i.size, (sizeCounts.get(i.size) ?? 0) + i.quantity);
    }

    const stockBySize = new Map<number, number>();
    for (const row of stockRes.data ?? []) {
      stockBySize.set(row.size, (stockBySize.get(row.size) ?? 0) + row.quantity);
    }

    const totalSold = Array.from(sizeCounts.values()).reduce((a, b) => a + b, 0);
    const sizeDistribution = Array.from(sizeCounts.entries())
      .sort(([a], [b]) => a - b)
      .map(([size, sold]) => ({
        size: String(size),
        sold,
        percentage: totalSold > 0 ? round2((sold / totalSold) * 100) : 0,
        current_stock: stockBySize.get(size) ?? 0,
      }));

    const productSizeMap = new Map<string, { product_name: string; sizes: Record<string, number> }>();
    for (const i of storeItems) {
      if (!i.product_id || i.size == null) continue;
      const soldQty = i.quantity - (i.returned_quantity ?? 0);
      if (soldQty <= 0) continue;
      const name = productsMap.get(i.product_id)?.name ?? "Bilinmeyen Ürün (Legacy)";
      const entry = productSizeMap.get(i.product_id) ?? { product_name: name, sizes: {} };
      entry.sizes[i.size] = (entry.sizes[i.size] ?? 0) + soldQty;
      productSizeMap.set(i.product_id, entry);
    }
    for (const i of orderItems) {
      const name = (i.product_id && productsMap.get(i.product_id)?.name) ?? i.product_name;
      const key = i.product_id ?? `online:${i.product_name}`;
      const entry = productSizeMap.get(key) ?? { product_name: name, sizes: {} };
      entry.sizes[i.size] = (entry.sizes[i.size] ?? 0) + i.quantity;
      productSizeMap.set(key, entry);
    }
    const sizeByProduct = Array.from(productSizeMap.values());

    const restockSuggestion = sizeDistribution
      .filter((s) => s.sold > 0 && s.current_stock <= CRITICAL_STOCK_THRESHOLD)
      .sort((a, b) => b.sold - a.sold)
      .map((s) => ({
        size: s.size,
        reason:
          s.current_stock === 0
            ? `Beden ${s.size} tükendi (${s.sold} adet satılmış)`
            : `Beden ${s.size} kritik stokta (${s.current_stock} adet kaldı, ${s.sold} adet satılmış)`,
      }));

    return NextResponse.json({
      period: { from, to },
      size_distribution: sizeDistribution,
      size_by_product: sizeByProduct,
      restock_suggestion: restockSuggestion,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown_error" }, { status: 500 });
  }
}
