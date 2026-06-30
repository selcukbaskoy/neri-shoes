import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminAdmin } from "@/lib/supabaseAdmin";

// iyzico webhook: ödeme sonucu POST ile gelir (form-urlencoded)
export async function POST(req: NextRequest) {
  const text = await req.text();
  const params = new URLSearchParams(text);

  const status = params.get("status");
  const paymentId = params.get("paymentId");
  const token = params.get("token");
  const conversationId = params.get("conversationId");
  const merchantToken = params.get("merchantToken");
  const iyziReferenceCode = params.get("iyziReferenceCode") ?? "";

  if (!token) {
    return NextResponse.json({ error: "Token yok" }, { status: 400 });
  }

  // HMAC imza doğrulaması — zorunlu, key eksikse 503
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!secretKey) {
    console.error("IYZICO_SECRET_KEY not set — webhook disabled for security");
    return NextResponse.json({ error: "webhook disabled" }, { status: 503 });
  }
  if (!merchantToken || !iyziReferenceCode) {
    return NextResponse.json({ error: "İmza parametreleri eksik" }, { status: 400 });
  }
  const crypto = await import("crypto");
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${iyziReferenceCode}${conversationId ?? ""}${merchantToken}`)
    .digest("base64");
  if (expected !== merchantToken) {
    console.warn("iyzico webhook imza doğrulaması başarısız");
    return NextResponse.json({ error: "İmza geçersiz" }, { status: 403 });
  }

  const newStatus = status === "SUCCESS" ? "paid" : "failed";

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: newStatus,
      payment_reference: paymentId,
    })
    .eq("iyzico_token", token);

  if (error) {
    console.error("Webhook order update error:", error);
    return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
  }

  // Stok düşümü: paid siparişlerde
  if (newStatus === "paid") {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("iyzico_token", token)
      .single();

    if (order) {
      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("product_id, size, quantity")
        .eq("order_id", order.id);

      if (items) {
        for (const item of items) {
          await supabaseAdmin.rpc("decrement_stock", {
            p_product_id: item.product_id,
            p_size: item.size,
            p_qty: item.quantity,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
