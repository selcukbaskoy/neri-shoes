import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

type SellItem = { productId: string; size: number; quantity: number; unitPrice: number };

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    customerId,
    paymentMethod,
    items,
    discountAmount,
    note,
    promisedPayAt,
  } = body as {
    customerId?: number | null;
    paymentMethod: "nakit" | "pos" | "veresiye";
    items: SellItem[];
    discountAmount?: number;
    note?: string;
    promisedPayAt?: string;
  };

  if (!["nakit", "pos", "veresiye"].includes(paymentMethod)) {
    return NextResponse.json({ error: "invalid payment_method" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "empty cart" }, { status: 400 });
  }
  if (paymentMethod === "veresiye" && !customerId) {
    return NextResponse.json({ error: "veresiye requires customerId" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.rpc("store_sell", {
    p_customer_id: customerId ?? null,
    p_payment_method: paymentMethod,
    p_items: items.map((i) => ({
      product_id: i.productId,
      size: i.size,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    })),
    p_discount_amount: discountAmount ?? 0,
    p_note: note ?? null,
    p_promised_pay_at: promisedPayAt ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ saleId: data });
}
