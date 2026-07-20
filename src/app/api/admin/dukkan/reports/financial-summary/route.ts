import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
  parseDateRange,
  round2,
  dayKey,
  agingBucket,
  fetchStoreSalesInRange,
  fetchManualSalesInRange,
  fetchOnlineOrdersInRange,
  fetchStoreSaleItemsForSales,
  fetchOrderItemsForOrders,
  fetchProductCostMap,
  fetchOpenCreditBalances,
} from "@/lib/dukkan-reports-utils";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const range = parseDateRange(request.nextUrl.searchParams);
  if ("error" in range) return NextResponse.json({ error: range.error }, { status: 400 });
  const { from, to } = range;

  try {
    const [storeSales, manualSales, onlineOrders, costMap, creditBalances, collectionsRes] = await Promise.all([
      fetchStoreSalesInRange(from, to),
      fetchManualSalesInRange(from, to),
      fetchOnlineOrdersInRange(from, to),
      fetchProductCostMap(),
      fetchOpenCreditBalances(),
      supabaseAdmin
        .from("credit_collections")
        .select("amount, collected_at, payment_method")
        .gte("collected_at", from)
        .lte("collected_at", to),
    ]);
    if (collectionsRes.error) throw new Error(collectionsRes.error.message);
    const collections = collectionsRes.data ?? [];

    const [storeItems, orderItems] = await Promise.all([
      fetchStoreSaleItemsForSales(storeSales.map((s) => s.id)),
      fetchOrderItemsForOrders(onlineOrders.map((o) => o.id)),
    ]);

    const storeRevenue = storeSales.reduce((sum, s) => sum + Number(s.total_price), 0);
    const manualRevenue = manualSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const onlineRevenue = onlineOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const gross = round2(storeRevenue + manualRevenue + onlineRevenue);

    let cost = 0;
    let costKnown = true;
    for (const item of storeItems) {
      const soldQty = item.quantity - (item.returned_quantity ?? 0);
      if (soldQty <= 0) continue;
      const c = item.product_id && item.size != null ? costMap.get(`${item.product_id}:${item.size}`) : undefined;
      if (c == null) {
        costKnown = false;
        continue;
      }
      cost += c * soldQty;
    }
    for (const item of orderItems) {
      const c = item.product_id ? costMap.get(`${item.product_id}:${item.size}`) : undefined;
      if (c == null) {
        costKnown = false;
        continue;
      }
      cost += c * item.quantity;
    }
    const hasAnyCostData = costMap.size > 0;
    const finalCost = hasAnyCostData ? round2(cost) : null;
    const grossProfit = finalCost != null ? round2(gross - finalCost) : null;
    const marginPct = finalCost != null && gross > 0 ? round2(((gross - finalCost) / gross) * 100) : null;

    let cashCollected = 0;
    let posCollected = 0;
    let creditGiven = 0;
    for (const s of storeSales) {
      const paid = Number(s.total_price);
      if (s.payment_method === "nakit") cashCollected += paid;
      else if (s.payment_method === "pos") posCollected += paid;
      else if (s.payment_method === "veresiye") creditGiven += paid;
    }
    for (const s of manualSales) {
      const paid = Number(s.total_amount);
      if (s.payment_method === "nakit") cashCollected += paid;
      else if (s.payment_method === "pos") posCollected += paid;
      else if (s.payment_method === "veresiye") creditGiven += paid;
    }
    let creditCollectedInPeriod = 0;
    for (const c of collections) {
      creditCollectedInPeriod += Number(c.amount);
      if (c.payment_method === "nakit") cashCollected += Number(c.amount);
      else if (c.payment_method === "pos") posCollected += Number(c.amount);
    }

    const now = new Date();
    const aging = { current: 0, overdue_30: 0, overdue_60: 0, overdue_90_plus: 0 } as Record<string, number>;
    let totalOutstanding = 0;
    for (const [, v] of Array.from(creditBalances)) {
      totalOutstanding += v.balance;
      const daysOld = Math.floor((now.getTime() - new Date(v.oldestSaleDate).getTime()) / (1000 * 60 * 60 * 24));
      const bucket = agingBucket(daysOld);
      const mapped =
        bucket === "0_30_days" ? "current" : bucket === "31_60_days" ? "overdue_30" : bucket === "61_90_days" ? "overdue_60" : "overdue_90_plus";
      aging[mapped] += v.balance;
    }
    for (const key of Object.keys(aging)) aging[key] = round2(aging[key]);

    const dailyMap = new Map<string, { revenue: number; cost: number; costKnown: boolean }>();
    const costByItemKey = (productId: string | null, size: number | null) =>
      productId && size != null ? costMap.get(`${productId}:${size}`) : undefined;
    const storeItemsBySale = new Map<number, typeof storeItems>();
    for (const item of storeItems) {
      const list = storeItemsBySale.get(item.sale_id) ?? [];
      list.push(item);
      storeItemsBySale.set(item.sale_id, list);
    }
    const orderItemsByOrder = new Map<string, typeof orderItems>();
    for (const item of orderItems) {
      const list = orderItemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      orderItemsByOrder.set(item.order_id, list);
    }
    for (const s of storeSales) {
      const k = dayKey(s.sold_at);
      const e = dailyMap.get(k) ?? { revenue: 0, cost: 0, costKnown: true };
      e.revenue += Number(s.total_price);
      for (const item of storeItemsBySale.get(s.id) ?? []) {
        const soldQty = item.quantity - (item.returned_quantity ?? 0);
        if (soldQty <= 0) continue;
        const c = costByItemKey(item.product_id, item.size);
        if (c == null) e.costKnown = false;
        else e.cost += c * soldQty;
      }
      dailyMap.set(k, e);
    }
    for (const s of manualSales) {
      const k = s.sale_date;
      const e = dailyMap.get(k) ?? { revenue: 0, cost: 0, costKnown: true };
      e.revenue += Number(s.total_amount);
      dailyMap.set(k, e);
    }
    for (const o of onlineOrders) {
      const k = dayKey(o.created_at);
      const e = dailyMap.get(k) ?? { revenue: 0, cost: 0, costKnown: true };
      e.revenue += Number(o.total_amount);
      for (const item of orderItemsByOrder.get(o.id) ?? []) {
        const c = costByItemKey(item.product_id, item.size);
        if (c == null) e.costKnown = false;
        else e.cost += c * item.quantity;
      }
      dailyMap.set(k, e);
    }
    const dailyBreakdown = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        revenue: round2(v.revenue),
        cost: hasAnyCostData && v.costKnown ? round2(v.cost) : null,
        profit: hasAnyCostData && v.costKnown ? round2(v.revenue - v.cost) : null,
      }));

    return NextResponse.json({
      period: { from, to },
      revenue: { gross, cost: finalCost, gross_profit: grossProfit, margin_pct: marginPct },
      collection: {
        cash_collected: round2(cashCollected),
        pos_collected: round2(posCollected),
        credit_given: round2(creditGiven),
        credit_collected_in_period: round2(creditCollectedInPeriod),
      },
      receivables: {
        total_outstanding: round2(totalOutstanding),
        aging,
      },
      daily_breakdown: dailyBreakdown,
      data_quality: {
        note: !hasAnyCostData
          ? "product_costs tablosu boş — cost/gross_profit/margin_pct alanları null döner."
          : !costKnown
            ? "Bazı satış kalemlerinde maliyet verisi yok — cost alanları eksik veriyle hesaplanmış olabilir."
            : null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown_error" }, { status: 500 });
  }
}
