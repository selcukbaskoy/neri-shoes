import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
  parseDateRange,
  round2,
  agingBucket,
  fetchStoreSalesInRange,
  fetchStoreSaleItemsForSales,
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
    const [customersRes, storeSales, creditBalances] = await Promise.all([
      supabaseAdmin.from("store_customers").select("id, name, phone, email, created_at"),
      fetchStoreSalesInRange(from, to),
      fetchOpenCreditBalances(),
    ]);
    if (customersRes.error) throw new Error(customersRes.error.message);
    const customers = customersRes.data ?? [];

    const storeItems = await fetchStoreSaleItemsForSales(storeSales.map((s) => s.id));
    const itemsBySale = new Map<number, typeof storeItems>();
    for (const item of storeItems) {
      const list = itemsBySale.get(item.sale_id) ?? [];
      list.push(item);
      itemsBySale.set(item.sale_id, list);
    }

    const perCustomer = new Map<
      number,
      { totalSpent: number; count: number; lastPurchase: string; sizeCounts: Map<number, number> }
    >();
    for (const sale of storeSales) {
      if (!sale.customer_id) continue;
      const e = perCustomer.get(sale.customer_id) ?? {
        totalSpent: 0,
        count: 0,
        lastPurchase: sale.sold_at,
        sizeCounts: new Map<number, number>(),
      };
      e.totalSpent += Number(sale.total_price);
      e.count += 1;
      if (sale.sold_at > e.lastPurchase) e.lastPurchase = sale.sold_at;
      for (const item of itemsBySale.get(sale.id) ?? []) {
        if (item.size == null) continue;
        e.sizeCounts.set(item.size, (e.sizeCounts.get(item.size) ?? 0) + item.quantity);
      }
      perCustomer.set(sale.customer_id, e);
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newThisMonth = customers.filter((c) => c.created_at >= monthStart).length;

    const activeCustomerIds = Array.from(perCustomer.keys());
    const returningCount = activeCustomerIds.filter((id: number) => (perCustomer.get(id)?.count ?? 0) > 1).length;
    const returningRate = activeCustomerIds.length > 0 ? round2((returningCount / activeCustomerIds.length) * 100) : 0;
    const totalRangeRevenue = Array.from(perCustomer.values()).reduce((sum, e) => sum + e.totalSpent, 0);
    const avgSpendPerCustomer = activeCustomerIds.length > 0 ? round2(totalRangeRevenue / activeCustomerIds.length) : 0;

    const topCustomers = Array.from(perCustomer.entries())
      .map(([id, e]) => {
        const customer = customers.find((c) => c.id === id);
        let favoriteSize: number | null = null;
        let maxCount = 0;
        for (const [size, count] of Array.from(e.sizeCounts.entries())) {
          if (count > maxCount) {
            maxCount = count;
            favoriteSize = size;
          }
        }
        return {
          id,
          name: customer?.name ?? "Bilinmeyen",
          phone: customer?.phone ?? null,
          total_spent: round2(e.totalSpent),
          purchase_count: e.count,
          last_purchase: e.lastPurchase,
          favorite_size: favoriteSize,
          credit_balance: round2(creditBalances.get(id)?.balance ?? 0),
        };
      })
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 20);

    const monthlyMap = new Map<string, { new: number; returning: number }>();
    const fromMonth = from.slice(0, 7);
    const toMonth = to.slice(0, 7);
    for (const c of customers) {
      const m = c.created_at.slice(0, 7);
      if (m < fromMonth || m > toMonth) continue;
      const e = monthlyMap.get(m) ?? { new: 0, returning: 0 };
      e.new += 1;
      monthlyMap.set(m, e);
    }
    for (const sale of storeSales) {
      if (!sale.customer_id) continue;
      const customer = customers.find((c) => c.id === sale.customer_id);
      if (!customer) continue;
      const m = sale.sold_at.slice(0, 7);
      const isNewInThisMonth = customer.created_at.slice(0, 7) === m;
      if (isNewInThisMonth) continue;
      const e = monthlyMap.get(m) ?? { new: 0, returning: 0 };
      e.returning += 1;
      monthlyMap.set(m, e);
    }
    const newVsReturningTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, new: v.new, returning: v.returning }));

    const aging = { "0_30_days": 0, "31_60_days": 0, "61_90_days": 0, over_90_days: 0 } as Record<string, number>;
    let totalOutstanding = 0;
    for (const [, v] of Array.from(creditBalances)) {
      totalOutstanding += v.balance;
      const daysOld = Math.floor((now.getTime() - new Date(v.oldestSaleDate).getTime()) / (1000 * 60 * 60 * 24));
      aging[agingBucket(daysOld)] += v.balance;
    }
    for (const key of Object.keys(aging)) aging[key] = round2(aging[key]);

    return NextResponse.json({
      period: { from, to },
      overview: {
        total_customers: customers.length,
        new_this_month: newThisMonth,
        returning_rate: returningRate,
        avg_spend_per_customer: avgSpendPerCustomer,
      },
      top_customers: topCustomers,
      new_vs_returning_trend: newVsReturningTrend,
      credit_summary: {
        total_outstanding: round2(totalOutstanding),
        customers_with_credit: creditBalances.size,
        aging,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown_error" }, { status: 500 });
  }
}
