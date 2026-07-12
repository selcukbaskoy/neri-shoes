import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createHmac } from "crypto";

// Resend webhook signature: t=TIMESTAMP,v1=HMAC-SHA256(timestamp.body, secret)
function verifySignature(body: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  try {
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
    const timestamp = parts["t"];
    const sig = parts["v1"];
    if (!timestamp || !sig) return false;

    // Replay attack: 5 dakikadan eski istekleri reddet
    const age = Date.now() / 1000 - parseInt(timestamp, 10);
    if (age > 300) return false;

    const expected = createHmac("sha256", secret)
      .update(`${timestamp}.${body}`)
      .digest("hex");

    return expected === sig;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // Webhook secret tanımlıysa imzayı doğrula
  if (webhookSecret) {
    const sig = req.headers.get("resend-signature");
    if (!verifySignature(rawBody, sig, webhookSecret)) {
      return NextResponse.json({ error: "Geçersiz imza" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const eventType = payload["type"] as string | undefined;
  const data = payload["data"] as Record<string, unknown> | undefined;
  if (!eventType || !data) {
    return NextResponse.json({ ok: true }); // bilinmeyen event — yoksay
  }

  const resendEmailId = data["email_id"] as string | undefined;
  const customerEmail = (data["to"] as string[] | undefined)?.[0];

  // email_events tablosuna kaydet
  await supabaseAdmin.from("email_events").insert({
    resend_email_id: resendEmailId ?? "unknown",
    event_type: eventType,
    customer_email: customerEmail ?? null,
    payload,
  });

  // Bounce / şikayet durumunda user_email_preferences güncelle
  if (customerEmail) {
    if (eventType === "email.bounced") {
      const bounceClass = (data["bounce"] as Record<string, string> | undefined)?.["type"];
      const isHard = bounceClass === "hard";

      // upsert: kayıt yoksa oluştur, varsa güncelle
      const { data: existing } = await supabaseAdmin
        .from("user_email_preferences")
        .select("id, bounce_count")
        .eq("customer_email", customerEmail)
        .maybeSingle();

      const newCount = (existing?.bounce_count ?? 0) + 1;
      const hardBounced = isHard || newCount >= 2;

      if (existing) {
        await supabaseAdmin
          .from("user_email_preferences")
          .update({ bounce_count: newCount, hard_bounced: hardBounced, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin.from("user_email_preferences").insert({
          customer_email: customerEmail,
          bounce_count: newCount,
          hard_bounced: hardBounced,
        });
      }
    }

    if (eventType === "email.complained") {
      const { data: existing } = await supabaseAdmin
        .from("user_email_preferences")
        .select("id")
        .eq("customer_email", customerEmail)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("user_email_preferences")
          .update({ spam_complained: true, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin.from("user_email_preferences").insert({
          customer_email: customerEmail,
          spam_complained: true,
        });
      }

      // Global unsubscribe kaydı (KVKK)
      await supabaseAdmin.from("unsubscribe_logs").insert({
        customer_email: customerEmail,
        flow_type: null,
        reason: "spam_complaint",
      });
    }

    // last_opened_at güncelle
    if (eventType === "email.opened") {
      const { data: existing } = await supabaseAdmin
        .from("user_email_preferences")
        .select("id")
        .eq("customer_email", customerEmail)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("user_email_preferences")
          .update({ last_opened_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
