import { NextRequest, NextResponse } from "next/server";
import { enqueueEmail, cancelByKey } from "@/lib/email-queue";

export interface CartAbandonItem {
  product_id?: string;
  product_name: string;
  size: number;
  quantity: number;
  unit_price: number;
}

// POST /api/email/cart-abandon
// Ödeme sayfası yüklenince tetiklenir. Önce mevcut pending cart maillerini
// iptal eder (yeni sepet), sonra 1h/24h/72h sırasıyla kuyruğa alır.
export async function POST(req: NextRequest) {
  let body: {
    email: string;
    name: string;
    items: CartAbandonItem[];
    cart_total: number;
    at_payment_step?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz body" }, { status: 400 });
  }

  const email = body.email?.toLowerCase().trim();
  const name = body.name?.trim() || "Değerli Müşterimiz";
  if (!email || !body.items?.length) {
    return NextResponse.json({ error: "email ve items gerekli" }, { status: 400 });
  }

  const cancelKey = `cart_abandon_${email}`;

  // Önceki cart abandon maillerini iptal et (yeni sepet başlangıcı)
  await cancelByKey(cancelKey);

  const now = new Date();
  const payload = {
    customer_name: name,
    customer_email: email,
    items: body.items,
    cart_total: body.cart_total,
    at_payment_step: body.at_payment_step ?? false,
  };

  // +1 saat
  const t1h = new Date(now.getTime() + 60 * 60 * 1000);
  // +24 saat
  const t24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // +72 saat
  const t72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  await Promise.all([
    enqueueEmail({
      flow_type: "cart_abandon",
      template_key: "cart_1h",
      customer_email: email,
      customer_name: name,
      scheduled_at: t1h,
      cancel_key: cancelKey,
      payload,
    }),
    enqueueEmail({
      flow_type: "cart_abandon",
      template_key: "cart_24h",
      customer_email: email,
      customer_name: name,
      scheduled_at: t24h,
      cancel_key: cancelKey,
      payload,
    }),
    enqueueEmail({
      flow_type: "cart_abandon",
      template_key: "cart_72h",
      customer_email: email,
      customer_name: name,
      scheduled_at: t72h,
      cancel_key: cancelKey,
      payload,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
