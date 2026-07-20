import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { round2, fetchProductsMap } from "@/lib/dukkan-reports-utils";

const CRITICAL_STOCK_THRESHOLD = 3;
const DEAD_STOCK_DAYS = 90;

export async function GET(_request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [productsMap, stockRes, lastSaleRes] = await Promise.all([
      fetchProductsMap(),
      supabaseAdmin.from("product_stock").select("product_id, size, quantity"),
      supabaseAdmin
        .from("store_sale_items")
        .select("product_id, size, sale:store_sales(sold_at)")
        .not("product_id", "is", null),
    ]);
    if (stockRes.error) throw new Error(stockRes.error.message);
    if (lastSaleRes.error) throw new Error(lastSaleRes.error.message);

    const stockRows = stockRes.data ?? [];

    const lastSaleMap = new Map<string, string>();
    for (const row of lastSaleRes.data ?? []) {
      const soldAt = (row.sale as unknown as { sold_at: string } | null)?.sold_at;
      if (!row.product_id || !soldAt) continue;
      const key = `${row.product_id}:${row.size}`;
      const existing = lastSaleMap.get(key);
      if (!existing || soldAt > existing) lastSaleMap.set(key, soldAt);
    }

    const matrixMap = new Map<string, { product_name: string; sizes: Record<string, number> }>();
    for (const row of stockRows) {
      const name = productsMap.get(row.product_id)?.name ?? "Bilinmeyen Ürün";
      const entry = matrixMap.get(row.product_id) ?? { product_name: name, sizes: {} };
      entry.sizes[row.size] = (entry.sizes[row.size] ?? 0) + row.quantity;
      matrixMap.set(row.product_id, entry);
    }

    const priceMap = productsMap;
    const stockMatrix = Array.from(matrixMap.entries()).map(([productId, e]) => {
      const total = Object.values(e.sizes).reduce((a, b) => a + b, 0);
      const price = priceMap.get(productId)?.price ?? 0;
      return {
        product_id: productId,
        product_name: e.product_name,
        sizes: e.sizes,
        total,
        value: round2(total * price),
      };
    });

    const totalStockUnits = stockRows.reduce((sum, r) => sum + r.quantity, 0);
    const totalStockValue = stockMatrix.reduce((sum, p) => sum + p.value, 0);
    const zeroStockVariants = stockRows.filter((r) => r.quantity === 0).length;

    const criticalStock = stockRows
      .filter((r) => r.quantity > 0 && r.quantity <= CRITICAL_STOCK_THRESHOLD)
      .map((r) => ({
        product_id: r.product_id,
        product_name: productsMap.get(r.product_id)?.name ?? "Bilinmeyen Ürün",
        size: r.size,
        quantity: r.quantity,
      }))
      .sort((a, b) => a.quantity - b.quantity);

    const now = new Date();
    const deadStock: { product: string; size: number; quantity: number; days_since_last_sale: number | null; value: number }[] = [];
    for (const row of stockRows) {
      if (row.quantity <= 0) continue;
      const key = `${row.product_id}:${row.size}`;
      const lastSale = lastSaleMap.get(key);
      const daysSince = lastSale
        ? Math.floor((now.getTime() - new Date(lastSale).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      if (daysSince !== null && daysSince < DEAD_STOCK_DAYS) continue;
      const price = priceMap.get(row.product_id)?.price ?? 0;
      deadStock.push({
        product: productsMap.get(row.product_id)?.name ?? "Bilinmeyen Ürün",
        size: row.size,
        quantity: row.quantity,
        days_since_last_sale: daysSince,
        value: round2(row.quantity * price),
      });
    }
    deadStock.sort((a, b) => (b.days_since_last_sale ?? 9999) - (a.days_since_last_sale ?? 9999));

    return NextResponse.json({
      overview: {
        total_products: matrixMap.size,
        total_stock_units: totalStockUnits,
        total_stock_value: round2(totalStockValue),
        zero_stock_variants: zeroStockVariants,
      },
      stock_matrix: stockMatrix,
      critical_stock: criticalStock,
      dead_stock: deadStock,
      data_quality: {
        note: "days_since_last_sale yalnızca product_id bağlı dükkan satışlarından hesaplanır (F3 legacy kayıtların çoğu hariç) — null ise hiç eşleşen satış bulunamadı demektir, illa hiç satılmadı anlamına gelmez.",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown_error" }, { status: 500 });
  }
}
