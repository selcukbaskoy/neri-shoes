import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCustomerByAuthUserId, getCustomerOrders, linkGuestOrdersToCustomer } from "@/lib/customer-api";

/**
 * Authorization header'dan JWT token alıp Supabase auth user doğrulama.
 */
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
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const customer = await getCustomerByAuthUserId(user.id);
    if (!customer) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await getCustomerOrders(customer.id);
    return NextResponse.json({ orders });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[siparisler] GET hatası:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/hesap/misafir-eslestir (giriş sonrası misafir sipariş eşleştirme)
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const customer = await getCustomerByAuthUserId(user.id);
    if (!customer) {
      return NextResponse.json({ linked: 0, message: "Müşteri kaydı bulunamadı" });
    }

    const linkedCount = await linkGuestOrdersToCustomer(customer);
    return NextResponse.json({ linked: linkedCount, message: `${linkedCount} misafir sipariş hesaba bağlandı.` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[misafir-eslestir] POST hatası:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
