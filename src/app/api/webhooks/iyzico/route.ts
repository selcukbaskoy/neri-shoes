import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

  // HMAC imza doğrulaması (güvenlik)
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (secretKey && merchantToken && iyziReferenceCode) {
    const crypto = await import("crypto");
    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(`${iyziReferenceCode}${conversationId ?? ""}${merchantToken}`)
      .digest("base64");

    if (expected !== merchantToken) {
      console.warn("iyzico webhook imza doğrulaması başarısız");
      return NextResponse.json({ error: "İmza geçersiz" }, { status: 403 });
    }
  }

  const newStatus = status === "SUCCESS" ? "paid" : "failed";

  const { error } = await supabase
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
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("iyzico_token", token)
      .single();

    if (order) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, size, quantity")
        .eq("order_id", order.id);

      if (items) {
        for (const item of items) {
          await supabase.rpc("decrement_stock", {
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
