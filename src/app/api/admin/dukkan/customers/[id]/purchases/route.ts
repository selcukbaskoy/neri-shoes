import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const customerId = parseInt(params.id, 10);
  if (!Number.isInteger(customerId) || customerId <= 0) {
    return NextResponse.json({ error: "invalid_customer_id" }, { status: 400 });
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from("store_customers")
    .select("id")
    .eq("id", customerId)
    .maybeSingle();
  if (customerError) return NextResponse.json({ error: customerError.message }, { status: 500 });
  if (!customer) return NextResponse.json({ error: "customer_not_found" }, { status: 404 });

  const { data: sales, error: salesError } = await supabaseAdmin
    .from("store_sales")
    .select("id, sold_at, payment_method, total_price, is_reversed")
    .eq("customer_id", customerId)
    .eq("is_reversed", false)
    .order("sold_at", { ascending: false })
    .limit(50);
  if (salesError) return NextResponse.json({ error: salesError.message }, { status: 500 });

  const saleIds = (sales ?? []).map((s) => s.id);

  const itemsBySale: Record<number, { product_name: string; size: number | null; quantity: number; price: number }[]> = {};
  const sizeCounts: Record<number, number> = {};

  if (saleIds.length > 0) {
    const { data: items, error: itemsError } = await supabaseAdmin
      .from("store_sale_items")
      .select("sale_id, size, quantity, unit_price, product_id, products(name)")
      .in("sale_id", saleIds);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

    for (const item of items ?? []) {
      const productName = (item.products as unknown as { name: string } | null)?.name ?? "Bilinmeyen ürün";
      if (!itemsBySale[item.sale_id]) itemsBySale[item.sale_id] = [];
      itemsBySale[item.sale_id].push({
        product_name: productName,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.unit_price),
      });
      if (item.size != null) {
        sizeCounts[item.size] = (sizeCounts[item.size] ?? 0) + item.quantity;
      }
    }
  }

  const purchases = (sales ?? []).map((s) => ({
    id: s.id,
    date: s.sold_at,
    payment_type: s.payment_method,
    total: Number(s.total_price),
    items: itemsBySale[s.id] ?? [],
  }));

  const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);
  let favoriteSize: number | null = null;
  let favoriteSizeCount = 0;
  for (const [size, count] of Object.entries(sizeCounts)) {
    if (count > favoriteSizeCount) {
      favoriteSizeCount = count;
      favoriteSize = Number(size);
    }
  }

  return NextResponse.json({
    purchases,
    summary: {
      total_purchases: purchases.length,
      total_spent: totalSpent,
      last_purchase_date: purchases[0]?.date ?? null,
      favorite_size: favoriteSize,
    },
  });
}
