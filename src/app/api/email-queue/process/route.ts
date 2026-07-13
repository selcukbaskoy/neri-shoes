import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isBlacklisted, hasHitDailyPromoCap, isPromotional } from "@/lib/email-queue";
import { dispatchTemplate } from "@/lib/email-templates";
import { Resend } from "resend";

const BATCH_SIZE = 50;
const PROMO_FROM = process.env.PROMOTIONAL_FROM_EMAIL ?? "firsat@nerishoes.com.tr";
const TRANS_FROM = process.env.FROM_EMAIL ?? "siparis@nerishoes.com.tr";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY eksik");
  return new Resend(key);
}

/**
 * POST /api/email-queue/process
 * Vercel Cron tarafından her 5 dakikada çağrılır.
 * scheduled_at <= now olan pending kuyruğu işler.
 */
export async function POST(req: NextRequest) {
  // Vercel Cron isteği "Authorization: Bearer $CRON_SECRET" header'ı gönderir (resmi format).
  // Supabase pg_cron/pg_net 5dk tetikleme "Authorization: Bearer $CRON_SHARED_SECRET" gönderir.
  // x-cron-secret manuel/harici tetikleme (curl testi vb.) için geriye dönük destekleniyor.
  const authHeader = req.headers.get("authorization");
  const legacyHeader = req.headers.get("x-cron-secret");
  const authorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    (!!process.env.CRON_SHARED_SECRET && authHeader === `Bearer ${process.env.CRON_SHARED_SECRET}`) ||
    legacyHeader === process.env.CRON_SECRET;
  if (!authorized) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const stats = { processed: 0, sent: 0, skipped: 0, blacklisted: 0, capped: 0, failed: 0 };

  try {
    const { data: items, error } = await supabaseAdmin
      .from("email_queue")
      .select("id, flow_type, template_key, customer_email, customer_name, payload")
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) throw new Error(error.message);
    if (!items?.length) return NextResponse.json({ ...stats, message: "Kuyruk boş" });

    const resend = getResend();

    for (const item of items) {
      stats.processed++;

      // 1. Blacklist kontrolü (bounce / şikayet / global unsub) — şablon üretmeden önce,
      // çünkü bazı şablonlar (kupon üreten) yan etkili: gereksiz/tekrarlı üretimi önler.
      const blacklisted = await isBlacklisted(item.customer_email);
      if (blacklisted) {
        await setStatus(item.id, "cancelled", "Blacklisted");
        stats.blacklisted++;
        continue;
      }

      // 2. Promosyon frekans sınırı (günde 1 promosyon maili) — aynı sebeple şablondan önce.
      if (isPromotional(item.flow_type)) {
        const capped = await hasHitDailyPromoCap(item.customer_email);
        if (capped) {
          // Yarına ertele
          const tomorrow = new Date();
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          tomorrow.setUTCHours(9, 0, 0, 0);
          await supabaseAdmin
            .from("email_queue")
            .update({ scheduled_at: tomorrow.toISOString(), updated_at: new Date().toISOString() })
            .eq("id", item.id);
          stats.capped++;
          continue;
        }
      }

      // 3. Şablon hazır mı? Değilse bu turda atla (pending kalır) — kupon gibi yan etkiler burada oluşur.
      const template = await dispatchTemplate(item.template_key, item.payload ?? {});
      if (!template) {
        stats.skipped++;
        continue;
      }

      // 4. Gönder
      try {
        const from = template.from
          ?? (isPromotional(item.flow_type) ? PROMO_FROM : TRANS_FROM);

        const { data, error: sendErr } = await resend.emails.send({
          from,
          to: item.customer_email,
          subject: template.subject,
          html: template.html,
        });

        if (sendErr) throw new Error(sendErr.message);

        await supabaseAdmin
          .from("email_queue")
          .update({
            status: "sent",
            resend_email_id: data?.id ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        stats.sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await setStatus(item.id, "failed", msg);
        stats.failed++;
      }
    }

    return NextResponse.json(stats);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[email-queue/process]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

async function setStatus(id: string, status: "cancelled" | "failed", error_message?: string) {
  await supabaseAdmin
    .from("email_queue")
    .update({ status, error_message: error_message ?? null, updated_at: new Date().toISOString() })
    .eq("id", id);
}
