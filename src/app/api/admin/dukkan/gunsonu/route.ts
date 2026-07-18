import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function dayRangeIstanbul(date: string) {
  const start = `${date}T00:00:00+03:00`;
  const next = new Date(`${date}T00:00:00+03:00`);
  next.setUTCDate(next.getUTCDate() + 1);
  const end = next.toISOString();
  return { start, end };
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const { start, end } = dayRangeIstanbul(date);

  const [storeSalesRes, manualSalesRes, ordersRes, collectionsRes] = await Promise.all([
    supabaseAdmin
      .from("store_sales")
      .select("payment_method, total_price")
      .eq("is_reversed", false)
      .gte("sold_at", start)
      .lt("sold_at", end),
    supabaseAdmin
      .from("manual_store_sales")
      .select("payment_method, total_amount")
      .eq("sale_date", date),
    supabaseAdmin
      .from("orders")
      .select("total_amount")
      .eq("status", "paid")
      .gte("created_at", start)
      .lt("created_at", end),
    supabaseAdmin
      .from("credit_collections")
      .select("payment_method, amount")
      .gte("collected_at", start)
      .lt("collected_at", end),
  ]);

  if (storeSalesRes.error) return NextResponse.json({ error: storeSalesRes.error.message }, { status: 500 });
  if (manualSalesRes.error) return NextResponse.json({ error: manualSalesRes.error.message }, { status: 500 });
  if (ordersRes.error) return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
  if (collectionsRes.error) return NextResponse.json({ error: collectionsRes.error.message }, { status: 500 });

  const store = { nakit: 0, pos: 0, veresiye: 0 };
  for (const s of storeSalesRes.data ?? []) {
    if (s.payment_method === "nakit") store.nakit += Number(s.total_price);
    else if (s.payment_method === "pos") store.pos += Number(s.total_price);
    else if (s.payment_method === "veresiye") store.veresiye += Number(s.total_price);
  }

  const manual = { nakit: 0, pos: 0 };
  for (const s of manualSalesRes.data ?? []) {
    if (s.payment_method === "nakit") manual.nakit += Number(s.total_amount);
    else if (s.payment_method === "pos") manual.pos += Number(s.total_amount);
  }

  const online = (ordersRes.data ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const creditCollected = { nakit: 0, pos: 0 };
  for (const c of collectionsRes.data ?? []) {
    if (c.payment_method === "pos") creditCollected.pos += Number(c.amount);
    else creditCollected.nakit += Number(c.amount);
  }

  const totalRevenue = store.nakit + store.pos + store.veresiye + manual.nakit + manual.pos + online;

  return NextResponse.json({
    date,
    store,
    manual,
    online,
    creditCollected,
    creditCollectedTotal: creditCollected.nakit + creditCollected.pos,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
  });
}
