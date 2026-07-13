import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/auth";

// GET /api/admin/reviews — tüm yorumlar (admin yetkisi gerekir)
export async function GET(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("product_reviews")
      .select("*, products(name), customers(name)")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const reviews = (data || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      media_urls: r.media_urls,
      status: r.status,
      created_at: r.created_at,
      product_id: r.product_id,
      product_name: (r.products as Record<string, unknown> | null)?.name || "",
      customer_name: (r.customers as Record<string, unknown> | null)?.name || null,
      admin_note: r.admin_note,
      order_id: r.order_id,
    }));

    return NextResponse.json({ reviews });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/admin/reviews — yorum durumunu güncelle (onayla/reddet)
export async function PUT(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, admin_note } = body;
    if (!id || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("product_reviews")
      .update({ status, admin_note: admin_note ?? null })
      .eq("id", id);

    if (error) throw new Error(error.message);

    // Fotoğraflı değerlendirme onaylandıysa %10 kupon ver (tek seferlik, fraud koruması: admin onayından sonra)
    if (status === "approved") {
      try {
        await issueReviewCoupon(id);
      } catch (couponErr) {
        console.error("[admin/reviews] Review kupon hatası:", couponErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Onaylanan fotoğraflı yorum için tek kullanımlık %10 kupon oluşturur ve müşteriye mail kuyruğuna yazar.
async function issueReviewCoupon(reviewId: string) {
  const { data: review } = await supabaseAdmin
    .from("product_reviews")
    .select("id, order_id, media_urls, coupon_issued, products(name)")
    .eq("id", reviewId)
    .maybeSingle();

  if (!review || review.coupon_issued) return;
  const hasPhoto = Array.isArray(review.media_urls) && review.media_urls.length > 0;
  if (!hasPhoto || !review.order_id) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("customer_email, customer_name")
    .eq("id", review.order_id)
    .maybeSingle();

  if (!order?.customer_email) return;

  const { randomBytes } = await import("crypto");
  const code = `YORUM10-${randomBytes(3).toString("hex").toUpperCase()}`;

  await supabaseAdmin.from("coupons").insert({
    code,
    discount_type: "percent",
    discount_value: 10,
    min_order_amount: 0,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    max_uses: 1,
    is_active: true,
  });

  await supabaseAdmin
    .from("product_reviews")
    .update({ coupon_issued: true })
    .eq("id", reviewId);

  const { enqueueEmail } = await import("@/lib/email-queue");
  const productName = (review.products as { name?: string } | null)?.name ?? "";
  await enqueueEmail({
    flow_type: "review",
    template_key: "review_coupon_awarded",
    customer_email: order.customer_email,
    customer_name: order.customer_name ?? undefined,
    scheduled_at: new Date(),
    payload: {
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      product_name: productName,
      coupon_code: code,
    },
  });
}
