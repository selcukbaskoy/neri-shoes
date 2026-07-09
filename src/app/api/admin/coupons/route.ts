import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/auth";

// GET /api/admin/coupons — tüm kuponlar
export async function GET(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ coupons: data || [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/admin/coupons — yeni kupon oluştur
export async function POST(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, description, discount_type, discount_value, min_order_amount, valid_from, valid_until, max_uses } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: "Kod, indirim tipi ve değer zorunludur." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: code.trim().toUpperCase(),
        description: description || null,
        discount_type,
        discount_value: Number(discount_value),
        min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        max_uses: max_uses ? Number(max_uses) : null,
        used_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ coupon: data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/admin/coupons — kupon güncelle
export async function PUT(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .update({
        ...fields,
        code: fields.code ? fields.code.trim().toUpperCase() : undefined,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ coupon: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/coupons?id=xxx
export async function DELETE(req: NextRequest) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
