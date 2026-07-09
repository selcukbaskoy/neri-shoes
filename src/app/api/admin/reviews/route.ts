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
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
