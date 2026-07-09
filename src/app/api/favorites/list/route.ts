import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCustomerByAuthUserId } from "@/lib/customer-api";

// GET /api/favorites/list — kullanıcının favori ürünlerini listele
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  try {
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const customer = await getCustomerByAuthUserId(userData.user.id);
    if (!customer) return NextResponse.json({ favorites: [] });

    const { data } = await supabaseAdmin
      .from("customer_favorites")
      .select("product_id, products(id, slug, name, image, price)")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    const favorites = (data || []).map((row: Record<string, unknown>) => {
      const p = row.products as Record<string, unknown> | null;
      return {
        id: p?.id || "",
        slug: p?.slug || "",
        name: p?.name || "",
        image: p?.image || "",
        price: p?.price != null ? Number(p.price) : null,
      };
    });

    return NextResponse.json({ favorites });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
