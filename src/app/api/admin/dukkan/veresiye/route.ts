import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  let customerQuery = supabaseAdmin
    .from("store_customers")
    .select("id, name, phone, credit_limit, is_blocked");
  if (q) {
    customerQuery = customerQuery.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  const { data: customers, error: custError } = await customerQuery;
  if (custError) return NextResponse.json({ error: custError.message }, { status: 500 });

  const { data: openSales, error: salesError } = await supabaseAdmin
    .from("store_sales")
    .select("customer_id, total_price, amount_paid, promised_pay_at")
    .eq("payment_method", "veresiye")
    .eq("is_paid", false)
    .eq("is_reversed", false);
  if (salesError) return NextResponse.json({ error: salesError.message }, { status: 500 });

  const balances = new Map<number, { balance: number; nearestDue: string | null }>();
  for (const sale of openSales ?? []) {
    if (!sale.customer_id) continue;
    const remaining = Number(sale.total_price) - Number(sale.amount_paid);
    const existing = balances.get(sale.customer_id) ?? { balance: 0, nearestDue: null };
    existing.balance += remaining;
    if (sale.promised_pay_at) {
      if (!existing.nearestDue || sale.promised_pay_at < existing.nearestDue) {
        existing.nearestDue = sale.promised_pay_at;
      }
    }
    balances.set(sale.customer_id, existing);
  }

  const today = new Date().toISOString().slice(0, 10);
  const result = (customers ?? [])
    .map((c) => {
      const b = balances.get(c.id);
      if (!b || b.balance <= 0) return null;
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        credit_limit: c.credit_limit,
        is_blocked: c.is_blocked,
        balance: Math.round(b.balance * 100) / 100,
        nearestDue: b.nearestDue,
        overdue: b.nearestDue !== null && b.nearestDue < today,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => {
      if (a.nearestDue && b.nearestDue) return a.nearestDue < b.nearestDue ? -1 : 1;
      if (a.nearestDue) return -1;
      if (b.nearestDue) return 1;
      return b.balance - a.balance;
    });

  return NextResponse.json({ customers: result });
}
