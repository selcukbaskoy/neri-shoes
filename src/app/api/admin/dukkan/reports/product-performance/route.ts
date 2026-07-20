import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  parseDateRange,
  round2,
  fetchStoreSalesInRange,
  fetchOnlineOrdersInRange,
  fetchStoreSaleItemsForSales,
  fetchOrderItemsForOrders,
  fetchProductsMap,
  fetchProductCostMap,
} from "@/lib/dukkan-reports-utils";

const UNKNOWN_KEY = "__unknown_legacy__";

interface ProductAgg {
  product_id: string;
  product_name: string;
  total_sold: number;
  revenue: number;
  cost: number | null;
  by_size: Record<string, number>;
  by_channel: { store: number; online: number };
  color_family: string | null;
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const range = parseDateRange(request.nextUrl.searchParams);
  if ("error" in range) return NextResponse.json({ error: range.error }, { status: 400 });
  const { from, to } = range;
  const limit = Math.min(Math.max(parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10) || 20, 1), 100);

  try {
    const [storeSales, onlineOrders, productsMap, costMap] = await Promise.all([
      fetchStoreSalesInRange(from, to),
      fetchOnlineOrdersInRange(from, to),
      fetchProductsMap(),
      fetchProductCostMap(),
    ]);
    const [storeItems, orderItems] = await Promise.all([
      fetchStoreSaleItemsForSales(storeSales.map((s) => s.id)),
      fetchOrderItemsForOrders(onlineOrders.map((o) => o.id)),
    ]);

    const agg = new Map<string, ProductAgg>();
    let unknownLegacyLineCount = 0;

    for (const item of storeItems) {
      const soldQty = item.quantity - (item.returned_quantity ?? 0);
      if (soldQty <= 0) continue;
      const key = item.product_id ?? UNKNOWN_KEY;
      if (!item.product_id) unknownLegacyLineCount += 1;
      const product = item.product_id ? productsMap.get(item.product_id) : undefined;
      const entry = agg.get(key) ?? {
        product_id: key,
        product_name: product?.name ?? "Bilinmeyen Ürün (Legacy)",
        total_sold: 0,
        revenue: 0,
        cost: 0,
        by_size: {},
        by_channel: { store: 0, online: 0 },
        color_family: product?.color_family ?? null,
      };
      entry.total_sold += soldQty;
      entry.revenue += soldQty * Number(item.unit_price);
      entry.by_channel.store += soldQty;
      if (item.size != null) {
        entry.by_size[item.size] = (entry.by_size[item.size] ?? 0) + soldQty;
      }
      const costPerUnit = item.product_id && item.size != null ? costMap.get(`${item.product_id}:${item.size}`) : undefined;
      if (costPerUnit != null) entry.cost = (entry.cost ?? 0) + costPerUnit * soldQty;
      else entry.cost = null;
      agg.set(key, entry);
    }

    for (const item of orderItems) {
      const key = item.product_id ?? UNKNOWN_KEY;
      const product = item.product_id ? productsMap.get(item.product_id) : undefined;
      const entry = agg.get(key) ?? {
        product_id: key,
        product_name: product?.name ?? item.product_name,
        total_sold: 0,
        revenue: 0,
        cost: 0,
        by_size: {},
        by_channel: { store: 0, online: 0 },
        color_family: product?.color_family ?? null,
      };
      entry.total_sold += item.quantity;
      entry.revenue += item.quantity * Number(item.unit_price);
      entry.by_channel.online += item.quantity;
      entry.by_size[item.size] = (entry.by_size[item.size] ?? 0) + item.quantity;
      const costPerUnit = item.product_id ? costMap.get(`${item.product_id}:${item.size}`) : undefined;
      if (costPerUnit != null && entry.cost != null) entry.cost += costPerUnit * item.quantity;
      else entry.cost = null;
      agg.set(key, entry);
    }

    const list = Array.from(agg.values()).map((e) => ({
      product_id: e.product_id,
      product_name: e.product_name,
      total_sold: e.total_sold,
      revenue: round2(e.revenue),
      cost: e.cost != null ? round2(e.cost) : null,
      profit_margin: e.cost != null && e.revenue > 0 ? round2(((e.revenue - e.cost) / e.revenue) * 100) : null,
      by_size: e.by_size,
      by_channel: e.by_channel,
    }));

    const topSellers = [...list].sort((a, b) => b.total_sold - a.total_sold).slice(0, limit);
    const slowMovers = [...list]
      .filter((p) => p.product_id !== UNKNOWN_KEY)
      .sort((a, b) => a.total_sold - b.total_sold)
      .slice(0, Math.min(5, limit));

    const colorMap = new Map<string, { count: number; revenue: number }>();
    for (const e of Array.from(agg.values())) {
      if (!e.color_family) continue;
      const c = colorMap.get(e.color_family) ?? { count: 0, revenue: 0 };
      c.count += e.total_sold;
      c.revenue += e.revenue;
      colorMap.set(e.color_family, c);
    }
    const byColor = Array.from(colorMap.entries()).map(([color, v]) => ({
      color,
      count: v.count,
      revenue: round2(v.revenue),
    }));

    const totalLines = storeItems.length + orderItems.length;

    return NextResponse.json({
      period: { from, to },
      top_sellers: topSellers,
      slow_movers: slowMovers,
      by_color: byColor,
      avg_turnover_days: null,
      data_quality: {
        note:
          unknownLegacyLineCount > 0
            ? `${unknownLegacyLineCount}/${totalLines} satış kalemi F3 SQLite göçünden — ürün bağı yok, "Bilinmeyen Ürün (Legacy)" altında toplandı.`
            : null,
        unknown_legacy_line_count: unknownLegacyLineCount,
        total_line_count: totalLines,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown_error" }, { status: 500 });
  }
}
