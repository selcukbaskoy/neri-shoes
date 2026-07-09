import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/checkins/respond?orderId=xxx&response=memnun|memnun_degil
 * Post-purchase check-in yanıtı. Kullanıcı mail'deki butona tıkladığında yönlendirilir.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const response = searchParams.get("response");

  if (!orderId || !response || !["memnun", "memnun_degil"].includes(response)) {
    return NextResponse.redirect("/");
  }

  try {
    // Check-in kaydını güncelle
    const { data: checkin } = await supabaseAdmin
      .from("post_purchase_checkins")
      .select("id, order_id, response, review_invited")
      .eq("order_id", orderId)
      .single();

    if (!checkin) {
      return NextResponse.redirect("/");
    }

    await supabaseAdmin
      .from("post_purchase_checkins")
      .update({ response })
      .eq("id", checkin.id);

    // Siparişten ürün bilgilerini al (review daveti için)
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select("product_id, product_name")
      .eq("order_id", orderId)
      .limit(1);

    const productSlug = orderItems?.[0]?.product_id || "";
    const productName = orderItems?.[0]?.product_name || "";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nerishoes.com.tr";

    if (response === "memnun") {
      // Memnun → değerlendirme daveti
      await supabaseAdmin
        .from("post_purchase_checkins")
        .update({ review_invited: true })
        .eq("id", checkin.id);

      const reviewUrl = `${siteUrl}/urunler/${productSlug}`;
      return NextResponse.redirect(`${reviewUrl}?review_invite=true`);
    } else {
      // Memnun değil → WhatsApp destek
      const whatsappUrl = `https://wa.me/905443191977?text=Merhaba, #${orderId.slice(0, 8)} numaralı siparişim hakkında yardıma ihtiyacım var.`;
      return NextResponse.redirect(whatsappUrl);
    }
  } catch (err) {
    console.error("[checkins/respond] Hata:", err);
    return NextResponse.redirect("/");
  }
}
