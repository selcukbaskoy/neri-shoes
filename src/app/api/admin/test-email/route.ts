import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Sipariş onay mailini gerçek ödeme akışına girmeden test etmek için.
// CRON_SECRET ile korunur (cron/translate-pending ile aynı desen).
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  let orderId: string | undefined;
  try {
    const body = await req.json();
    orderId = body?.orderId;
  } catch {
    // body yoksa en son sipariş kullanılır
  }

  if (!orderId) {
    const { data: latest } = await supabaseAdmin
      .from("orders")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!latest) {
      return NextResponse.json({ error: "Hiç sipariş yok" }, { status: 404 });
    }
    orderId = latest.id;
  }

  const result = await sendOrderConfirmationEmail(orderId!);
  return NextResponse.json({ orderId, ...result }, { status: result.sent ? 200 : 502 });
}
