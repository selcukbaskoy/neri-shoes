import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { enqueueEmail } from "@/lib/email-queue";
import { randomBytes } from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nerishoes.com.tr";

// GET /api/email/confirm-optin?token=XXX
// Kullanıcı welcome_0 mailindeki linke tıklayınca buraya gelir.
// 1. Token doğrula
// 2. promotional_opt_in = true
// 3. %15 kupon oluştur (24h geçerli, tek kullanım)
// 4. welcome_20h kuyruğa al (20 saat sonra)
// 5. /tr/hesap?kupon=KOD adresine yönlendir
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${SITE_URL}/tr/hesap?welcome=error`);
  }

  // Token'ı bul
  const { data: pref } = await supabaseAdmin
    .from("user_email_preferences")
    .select("id, customer_email, promotional_opt_in, opt_in_confirmed_at")
    .eq("opt_in_token", token)
    .maybeSingle();

  if (!pref) {
    return NextResponse.redirect(`${SITE_URL}/tr/hesap?welcome=invalid`);
  }

  // Zaten onaylanmışsa sadece yönlendir
  if (pref.promotional_opt_in) {
    return NextResponse.redirect(`${SITE_URL}/tr/hesap?welcome=already`);
  }

  const email = pref.customer_email;
  const now = new Date();

  // Opt-in güncelle
  await supabaseAdmin
    .from("user_email_preferences")
    .update({
      promotional_opt_in: true,
      opt_in_confirmed_at: now.toISOString(),
      opt_in_token: null, // tek kullanım
      updated_at: now.toISOString(),
    })
    .eq("id", pref.id);

  // %15 kupon oluştur — 24 saat geçerli
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  const couponCode = `NERISUBS-${suffix}`;
  const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { error: couponErr } = await supabaseAdmin.from("coupons").insert({
    code: couponCode,
    discount_type: "percent",
    discount_value: 15,
    min_order_amount: 0,
    valid_from: now.toISOString(),
    valid_until: validUntil.toISOString(),
    max_uses: 1,
    is_active: true,
  });

  if (couponErr) {
    console.error("[confirm-optin] coupon insert:", couponErr.message);
    return NextResponse.redirect(`${SITE_URL}/tr/hesap?welcome=error`);
  }

  // welcome_20h kuyruğa al — 20 saat sonra, kupon kullanılırsa iptal
  const scheduledAt = new Date(now.getTime() + 20 * 60 * 60 * 1000);
  await enqueueEmail({
    flow_type: "welcome",
    template_key: "welcome_20h",
    customer_email: email,
    scheduled_at: scheduledAt,
    cancel_key: `welcome_used_${email}`,
    payload: {
      coupon_code: couponCode,
      customer_email: email,
      valid_until: validUntil.toISOString(),
    },
  });

  // /tr/hesap?kupon=KOD adresine yönlendir (AccountPage kodu gösterir)
  return NextResponse.redirect(
    `${SITE_URL}/tr/hesap?welcome=1&kupon=${encodeURIComponent(couponCode)}`
  );
}
