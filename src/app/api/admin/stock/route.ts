import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdminAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("product_stock")
    .select("product_id, size, quantity")
    .order("product_id")
    .order("size");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stocks: Record<string, Record<number, number>> = {};
  for (const row of data ?? []) {
    if (!stocks[row.product_id]) stocks[row.product_id] = {};
    stocks[row.product_id][row.size] = row.quantity;
  }

  return NextResponse.json({ stocks });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productId, entries } = body as {
    productId: string;
    entries: { size: number; quantity: number }[];
  };

  if (!productId || !Array.isArray(entries)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const rows = entries.map((e) => ({
    product_id: productId,
    size: e.size,
    quantity: Math.max(0, e.quantity),
  }));

  const { error } = await supabaseAdmin
    .from("product_stock")
    .upsert(rows, { onConflict: "product_id,size" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
