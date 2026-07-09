import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCustomerByAuthUserId } from "@/lib/customer-api";

// GET /api/reviews?productId=xxx — public, sadece approved yorumlar
export async function GET(req: NextRequest) {
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId gerekli" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("product_reviews")
      .select("id, rating, comment, media_urls, created_at, order_id, customer_id, customers(name)")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const reviews = (data || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      media_urls: r.media_urls,
      created_at: r.created_at,
      verified: !!r.order_id,
      customer_name: (r.customers as Record<string, unknown> | null)?.name || null,
    }));

    return NextResponse.json({ reviews });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/reviews — auth kullanıcı, kendi adına yorum ekle
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment, mediaUrls } = body;
    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const customer = await getCustomerByAuthUserId(userData.user.id);
    if (!customer) {
      return NextResponse.json({ error: "Müşteri kaydı bulunamadı" }, { status: 404 });
    }

    // Verified purchase: kullanıcının bu ürün için başarılı siparişi var mı?
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("customer_id", customer.id)
      .eq("status", "paid")
      .limit(1);

    const orderId = orders && orders.length > 0 ? orders[0].id : null;

    const { data, error } = await supabaseAdmin
      .from("product_reviews")
      .insert({
        product_id: productId,
        customer_id: customer.id,
        order_id: orderId,
        rating,
        comment: comment || null,
        media_urls: mediaUrls || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
