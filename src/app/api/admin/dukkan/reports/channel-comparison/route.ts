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
} from "@/lib/dukkan-reports-utils";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const range = parseDateRange(request.nextUrl.searchParams);
  if ("error" in range) return NextResponse.json({ error: range.error }, { status: 400 });
  const { from, to } = range;

  try {
    const [storeSales, onlineOrders, productsMap] = await Promise.all([
      fetchStoreSalesInRange(from, to),
      fetchOnlineOrdersInRange(from, to),
      fetchProductsMap(),
    ]);
    const [storeItems, orderItems] = await Promise.all([
      fetchStoreSaleItemsForSales(storeSales.map((s) => s.id)),
      fetchOrderItemsForOrders(onlineOrders.map((o) => o.id)),
    ]);

    const storeRevenue = storeSales.reduce((sum, s) => sum + Number(s.total_price), 0);
    const onlineRevenue = onlineOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const storeCustomers = new Set(storeSales.map((s) => s.customer_id).filter((c): c is number => c != null));
    const onlineCustomers = new Set(onlineOrders.map((o) => o.customer_email).filter((e): e is string => !!e));

    const store = {
      revenue: round2(storeRevenue),
      count: storeSales.length,
      avg_basket: storeSales.length > 0 ? round2(storeRevenue / storeSales.length) : 0,
      unique_customers: storeCustomers.size,
    };
    const online = {
      revenue: round2(onlineRevenue),
      count: onlineOrders.length,
      avg_basket: onlineOrders.length > 0 ? round2(onlineRevenue / onlineOrders.length) : 0,
      unique_customers: onlineCustomers.size,
    };

    const storeByProduct = new Map<string, { sold: number; revenue: number }>();
    for (const i of storeItems) {
      if (!i.product_id) continue;
      const soldQty = i.quantity - (i.returned_quantity ?? 0);
      if (soldQty <= 0) continue;
      const e = storeByProduct.get(i.product_id) ?? { sold: 0, revenue: 0 };
      e.sold += soldQty;
      e.revenue += soldQty * Number(i.unit_price);
      storeByProduct.set(i.product_id, e);
    }
    const onlineByProduct = new Map<string, { sold: number; revenue: number }>();
    for (const i of orderItems) {
      if (!i.product_id) continue;
      const e = onlineByProduct.get(i.product_id) ?? { sold: 0, revenue: 0 };
      e.sold += i.quantity;
      e.revenue += i.quantity * Number(i.unit_price);
      onlineByProduct.set(i.product_id, e);
    }

    const allProductIds = new Set([...Array.from(storeByProduct.keys()), ...Array.from(onlineByProduct.keys())]);
    const productComparison = Array.from(allProductIds).map((id) => {
      const s = storeByProduct.get(id);
      const o = onlineByProduct.get(id);
      return {
        product_id: id,
        product_name: productsMap.get(id)?.name ?? "Bilinmeyen Ürün",
        store_sold: s?.sold ?? 0,
        store_revenue: round2(s?.revenue ?? 0),
        online_sold: o?.sold ?? 0,
        online_revenue: round2(o?.revenue ?? 0),
      };
    });

    const storeOnlyProducts = productComparison.filter((p) => p.store_sold > 0 && p.online_sold === 0);
    const onlineOnlyProducts = productComparison.filter((p) => p.online_sold > 0 && p.store_sold === 0);

    return NextResponse.json({
      period: { from, to },
      store,
      online,
      product_comparison: productComparison.sort((a, b) => b.store_revenue + b.online_revenue - (a.store_revenue + a.online_revenue)),
      store_only_products: storeOnlyProducts,
      online_only_products: onlineOnlyProducts,
      data_quality: {
        note: "product_comparison yalnızca product_id bağlı satış kalemlerini içerir — F3 legacy dükkan satışlarının çoğunda ürün bağı yok (bkz. product-performance endpoint notu).",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown_error" }, { status: 500 });
  }
}
