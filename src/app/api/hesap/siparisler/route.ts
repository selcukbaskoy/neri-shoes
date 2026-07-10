import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateCustomer, getCustomerOrders, linkGuestOrdersToCustomer } from "@/lib/customer-api";

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// GET /api/hesap/siparisler
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  try {
    // Auto-create customer record if not exists
    await getOrCreateCustomer(user.id, user.email || "");
    // Siparişler auth_user_id üzerinden çekilir
    const orders = await getCustomerOrders(user.id);
    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[siparisler] GET hatası:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/hesap/siparisler — misafir sipariş eşleştirme
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  try {
    const customer = await getOrCreateCustomer(user.id, user.email || "");
    const linkedCount = await linkGuestOrdersToCustomer(customer);
    return NextResponse.json({ linked: linkedCount, message: `${linkedCount} misafir sipariş hesaba bağlandı.` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[misafir-eslestir] POST hatası:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
