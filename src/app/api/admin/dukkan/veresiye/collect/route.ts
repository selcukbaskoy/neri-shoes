import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { customerId, amount, paymentMethod, note } = body as {
    customerId: number;
    amount: number;
    paymentMethod?: "nakit" | "pos";
    note?: string | null;
  };

  if (!customerId || !amount || amount <= 0) {
    return NextResponse.json({ error: "customerId and positive amount required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.rpc("allocate_collection", {
    p_customer_id: customerId,
    p_amount: amount,
    p_payment_method: paymentMethod ?? "nakit",
    p_note: note ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ collectionId: data });
}
