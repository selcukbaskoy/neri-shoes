import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPostPurchaseCheckinEmail } from "@/lib/email";

/**
 * POST /api/checkins/process
 * Vercel Cron tarafından günlük çağrılır.
 * scheduled_at <= now olan ve sent_at NULL olan check-in kayıtlarını işler.
 * CRON_SECRET header ile korunur.
 */
export async function POST(req: NextRequest) {
  // Vercel Cron isteği "Authorization: Bearer $CRON_SECRET" header'ı gönderir (resmi format).
  // x-cron-secret manuel/harici tetikleme (curl testi vb.) için geriye dönük destekleniyor.
  const authHeader = req.headers.get("authorization");
  const legacyHeader = req.headers.get("x-cron-secret");
  const authorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    legacyHeader === process.env.CRON_SECRET;
  if (!authorized) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // İşlenecek check-in'leri al
    const { data: checkins, error } = await supabaseAdmin
      .from("post_purchase_checkins")
      .select("id, order_id, scheduled_at")
      .is("sent_at", null)
      .lte("scheduled_at", now)
      .limit(50);

    if (error) throw new Error(error.message);

    let sent = 0;
    let failed = 0;

    for (const checkin of checkins || []) {
      try {
        const result = await sendPostPurchaseCheckinEmail(checkin.order_id);
        if (result.sent) {
          await supabaseAdmin
            .from("post_purchase_checkins")
            .update({ sent_at: new Date().toISOString() })
            .eq("id", checkin.id);
          sent++;
        } else {
          console.error("[checkins/process] Mail gönderilemedi:", result.error, "order:", checkin.order_id);
          failed++;
        }
      } catch (err) {
        console.error("[checkins/process] Hata:", err, "order:", checkin.order_id);
        failed++;
      }
    }

    return NextResponse.json({ processed: (checkins || []).length, sent, failed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[checkins/process] Genel hata:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET /api/checkins/process
 * Manuel tetikleme için (admin kullanımı).
 */
export async function GET(req: NextRequest) {
  return POST(req);
}
