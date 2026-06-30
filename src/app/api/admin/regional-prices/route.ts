import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdminAdmin } from "@/lib/supabaseAdmin";

const VALID_LOCALES = ["en", "de", "it", "ar", "ru"] as const;

export async function GET(req: NextRequest) {
  const auth = await isAdminAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("product_regional_prices")
    .select("locale_code, price, currency")
    .eq("product_id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const auth = await isAdminAuthenticated();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { productId, prices } = body as {
    productId: string;
    prices: { locale_code: string; price: string; currency: string }[];
  };

  if (!productId || !Array.isArray(prices)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Delete all existing, then upsert non-empty ones
  await supabaseAdmin.from("product_regional_prices").delete().eq("product_id", productId);

  const toInsert = prices
    .filter(
      (p) =>
        VALID_LOCALES.includes(p.locale_code as (typeof VALID_LOCALES)[number]) &&
        p.price.trim() !== "" &&
        !isNaN(parseFloat(p.price)) &&
        parseFloat(p.price) > 0
    )
    .map((p) => ({
      product_id: productId,
      locale_code: p.locale_code,
      price: parseFloat(p.price),
      currency: p.currency || "USD",
      updated_at: new Date().toISOString(),
    }));

  if (toInsert.length > 0) {
    const { error } = await supabaseAdmin.from("product_regional_prices").insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: toInsert.length });
}
