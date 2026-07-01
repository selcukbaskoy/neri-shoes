import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json() as { items: Array<{ productId: string; size: number }> };
  const items = body?.items ?? [];

  if (!items.length) return NextResponse.json({ results: [] });

  const productIds = Array.from(new Set(items.map((i) => i.productId)));

  const { data, error } = await supabaseAdmin
    .from("product_stock")
    .select("product_id, size, quantity")
    .in("product_id", productIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = (data ?? [])
    .filter((row) => items.some((i) => i.productId === row.product_id && i.size === row.size))
    .map((row) => ({ productId: row.product_id, size: row.size, quantity: row.quantity }));

  return NextResponse.json({ results });
}
