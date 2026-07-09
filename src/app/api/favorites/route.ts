import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCustomerByAuthUserId } from "@/lib/customer-api";

// GET /api/favorites?productId=xxx — favori kontrolü
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ isFavorite: false });

  try {
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ isFavorite: false });

    const customer = await getCustomerByAuthUserId(userData.user.id);
    if (!customer) return NextResponse.json({ isFavorite: false });

    const productId = new URL(req.url).searchParams.get("productId");
    if (!productId) return NextResponse.json({ isFavorite: false });

    const { data } = await supabaseAdmin
      .from("customer_favorites")
      .select("id")
      .eq("customer_id", customer.id)
      .eq("product_id", productId)
      .maybeSingle();

    return NextResponse.json({ isFavorite: !!data });
  } catch {
    return NextResponse.json({ isFavorite: false });
  }
}

// POST /api/favorites — favori ekle
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId } = body;
    if (!productId) return NextResponse.json({ error: "productId gerekli" }, { status: 400 });

    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const customer = await getCustomerByAuthUserId(userData.user.id);
    if (!customer) return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });

    await supabaseAdmin.from("customer_favorites").insert({ customer_id: customer.id, product_id: productId });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/favorites — favori sil
export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const body = await req.json();
    const { productId } = body;
    if (!productId) return NextResponse.json({ error: "productId gerekli" }, { status: 400 });

    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const customer = await getCustomerByAuthUserId(userData.user.id);
    if (!customer) return NextResponse.json({ error: "Müşteri bulunamadı" }, { status: 404 });

    await supabaseAdmin
      .from("customer_favorites")
      .delete()
      .eq("customer_id", customer.id)
      .eq("product_id", productId);

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
