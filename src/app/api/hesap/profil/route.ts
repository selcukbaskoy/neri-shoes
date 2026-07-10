import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateCustomer, updateCustomerProfile } from "@/lib/customer-api";

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// GET /api/hesap/profil
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  try {
    const customer = await getCustomerByAuthUserId(user.id);
    return NextResponse.json({
      customer,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/hesap/profil
export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  try {
    const body = await req.json();
    const customer = await getCustomerByAuthUserId(user.id);

    // Supabase Auth user metadata güncelle (isim)
    if (body.name || body.surname) {
      const fullName = `${body.name || user.user_metadata?.name || ""} ${body.surname || user.user_metadata?.surname || ""}`.trim();
      await supabaseAdmin.auth.updateUser({
        data: { name: body.name, surname: body.surname, full_name: fullName },
      });
    }

    if (customer) {
      const updated = await updateCustomerProfile(customer.id, {
        name: body.name || customer.name,
        phone: body.phone || customer.phone,
        email: user.email || customer.email,
      });
      return NextResponse.json({ customer: updated });
    }

    return NextResponse.json({ message: "Profil güncellendi" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
