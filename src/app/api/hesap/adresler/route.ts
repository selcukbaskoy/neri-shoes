import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  getCustomerByAuthUserId,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/customer-api";
import type { CustomerAddress } from "@/lib/types";

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// GET /api/hesap/adresler
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  try {
    const customer = await getCustomerByAuthUserId(user.id);
    if (!customer) return NextResponse.json({ addresses: [] });
    const addresses = await getCustomerAddresses(customer.id);
    return NextResponse.json({ addresses });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/hesap/adresler
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  try {
    const body = await req.json();
    const customer = await getCustomerByAuthUserId(user.id);
    if (!customer) return NextResponse.json({ error: "Müşteri kaydı bulunamadı" }, { status: 404 });

    const address = await createCustomerAddress({
      customer_id: customer.id,
      title: body.title,
      full_address: body.full_address,
      city: body.city,
      district: body.district,
      postal_code: body.postal_code ?? null,
      is_default: body.is_default ?? false,
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/hesap/adresler?id=...
export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Adres ID gerekli" }, { status: 400 });

  try {
    const body = await req.json();
    const customer = await getCustomerByAuthUserId(user.id);
    if (!customer) return NextResponse.json({ error: "Müşteri kaydı bulunamadı" }, { status: 404 });

    const address = await updateCustomerAddress(id, {
      ...body,
      customer_id: customer.id,
    });

    return NextResponse.json({ address });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/hesap/adresler?id=...
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Adres ID gerekli" }, { status: 400 });

  try {
    await deleteCustomerAddress(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
