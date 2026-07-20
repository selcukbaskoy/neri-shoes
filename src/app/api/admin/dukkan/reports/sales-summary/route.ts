import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  parseDateRange,
  parseChannel,
  round2,
  dayKey,
  fetchStoreSalesInRange,
  fetchManualSalesInRange,
  fetchOnlineOrdersInRange,
  fetchStoreSaleItemsForSales,
  fetchOrderItemsForOrders,
} from "@/lib/dukkan-reports-utils";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const range = parseDateRange(request.nextUrl.searchParams);
  if ("error" in range) return NextResponse.json({ error: range.error }, { status: 400 });
  const { from, to } = range;
  const channel = parseChannel(request.nextUrl.searchParams);

  try {
    const [storeSales, manualSales, onlineOrders] = await Promise.all([
      channel !== "online" ? fetchStoreSalesInRange(from, to) : Promise.resolve([]),
      channel !== "online" ? fetchManualSalesInRange(from, to) : Promise.resolve([]),
      channel !== "store" ? fetchOnlineOrdersInRange(from, to) : Promise.resolve([]),
    ]);

    const [storeItems, orderItems] = await Promise.all([
      fetchStoreSaleItemsForSales(storeSales.map((s) => s.id)),
      fetchOrderItemsForOrders(onlineOrders.map((o) => o.id)),
    ]);

    const storeRevenue = storeSales.reduce((sum, s) => sum + Number(s.total_price), 0);
    const manualRevenue = manualSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const onlineRevenue = onlineOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    const revenue = round2(storeRevenue + manualRevenue + onlineRevenue);
    const saleCount = storeSales.length + manualSales.length + onlineOrders.length;
    const itemCount =
      storeItems.reduce((sum, i) => sum + i.quantity, 0) +
      manualSales.reduce((sum, s) => sum + (s.quantity ?? 0), 0) +
      orderItems.reduce((sum, i) => sum + i.quantity, 0);

    const byPaymentType = new Map<string, { count: number; total: number }>();
    for (const s of storeSales) {
      const e = byPaymentType.get(s.payment_method) ?? { count: 0, total: 0 };
      e.count += 1;
      e.total += Number(s.total_price);
      byPaymentType.set(s.payment_method, e);
    }
    for (const s of manualSales) {
      const e = byPaymentType.get(s.payment_method) ?? { count: 0, total: 0 };
      e.count += 1;
      e.total += Number(s.total_amount);
      byPaymentType.set(s.payment_method, e);
    }
    if (onlineOrders.length > 0) {
      const e = byPaymentType.get("iyzico") ?? { count: 0, total: 0 };
      e.count += onlineOrders.length;
      e.total += onlineRevenue;
      byPaymentType.set("iyzico", e);
    }

    const byChannel = [
      { channel: "store", count: storeSales.length + manualSales.length, total: round2(storeRevenue + manualRevenue) },
      { channel: "online", count: onlineOrders.length, total: round2(onlineRevenue) },
    ].filter((c) => channel === "all" || c.channel === channel);

    const dailyMap = new Map<string, { revenue: number; count: number }>();
    for (const s of storeSales) {
      const k = dayKey(s.sold_at);
      const e = dailyMap.get(k) ?? { revenue: 0, count: 0 };
      e.revenue += Number(s.total_price);
      e.count += 1;
      dailyMap.set(k, e);
    }
    for (const s of manualSales) {
      const k = s.sale_date;
      const e = dailyMap.get(k) ?? { revenue: 0, count: 0 };
      e.revenue += Number(s.total_amount);
      e.count += 1;
      dailyMap.set(k, e);
    }
    for (const o of onlineOrders) {
      const k = dayKey(o.created_at);
      const e = dailyMap.get(k) ?? { revenue: 0, count: 0 };
      e.revenue += Number(o.total_amount);
      e.count += 1;
      dailyMap.set(k, e);
    }
    const dailyTrend = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, revenue: round2(v.revenue), count: v.count }));

    return NextResponse.json({
      period: { from, to },
      totals: {
        revenue,
        sale_count: saleCount,
        avg_basket: saleCount > 0 ? round2(revenue / saleCount) : 0,
        item_count: itemCount,
      },
      by_payment_type: Array.from(byPaymentType.entries()).map(([type, v]) => ({
        type,
        count: v.count,
        total: round2(v.total),
      })),
      by_channel: byChannel,
      daily_trend: dailyTrend,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown_error" }, { status: 500 });
  }
}
