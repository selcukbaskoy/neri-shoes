import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { enqueueEmail } from "@/lib/email-queue";
import { randomBytes } from "crypto";

// POST /api/email/welcome
// Kayıt sonrası tetiklenir. Opt-in token oluşturur, welcome_0 kuyruğa alır.
// İdempotent: aynı email için ikinci çağrı hiçbir şey yapmaz.
export async function POST(req: NextRequest) {
  let body: { email: string; name: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz body" }, { status: 400 });
  }

  const email = body.email?.toLowerCase().trim();
  const name = body.name?.trim() || "Değerli Müşterimiz";
  if (!email) return NextResponse.json({ error: "email gerekli" }, { status: 400 });

  // İdempotency: zaten var mı?
  const { data: existing } = await supabaseAdmin
    .from("user_email_preferences")
    .select("id, opt_in_token")
    .eq("customer_email", email)
    .maybeSingle();

  if (existing) {
    // Zaten kayıtlı — welcome tekrar gönderilmez
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Opt-in token oluştur
  const opt_in_token = randomBytes(32).toString("hex");

  // user_email_preferences kaydı oluştur
  const { error: prefErr } = await supabaseAdmin.from("user_email_preferences").insert({
    customer_email: email,
    promotional_opt_in: false,
    opt_in_token,
  });
  if (prefErr) {
    console.error("[email/welcome] pref insert:", prefErr.message);
    return NextResponse.json({ error: prefErr.message }, { status: 500 });
  }

  // welcome_0 kuyruğa al — hemen gönderilsin
  const { error: qErr } = await enqueueEmail({
    flow_type: "welcome",
    template_key: "welcome_0",
    customer_email: email,
    customer_name: name,
    scheduled_at: new Date(),
    payload: { opt_in_token, customer_name: name },
  });
  if (qErr) {
    console.error("[email/welcome] enqueue:", qErr.message);
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
