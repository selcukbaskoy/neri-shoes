import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/stock-alerts — stok bildirimi kaydet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, size, email } = body;

    if (!productId || !email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("stock_alerts").insert({
      product_id: productId,
      size: size ?? null,
      email: email.trim().toLowerCase(),
    });

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
