import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ products: [] });

  // Barkod tam eşleşmesi önce denenir (tek input, barkod veya isim).
  const { data: barcodeStock } = await supabaseAdmin
    .from("product_stock")
    .select("product_id, size, quantity, barcode")
    .eq("barcode", q)
    .maybeSingle();

  if (barcodeStock) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, name, image, price, sku")
      .eq("id", barcodeStock.product_id)
      .maybeSingle();

    if (product) {
      return NextResponse.json({
        products: [
          {
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price != null ? Number(product.price) : 0,
            sku: product.sku,
            stock: [{ size: barcodeStock.size, quantity: barcodeStock.quantity }],
          },
        ],
      });
    }
  }

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("id, name, image, price, sku")
    .eq("is_active", true)
    .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
    .limit(15);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!products || products.length === 0) return NextResponse.json({ products: [] });

  const productIds = products.map((p) => p.id);
  const { data: stockRows } = await supabaseAdmin
    .from("product_stock")
    .select("product_id, size, quantity")
    .in("product_id", productIds)
    .gt("quantity", 0);

  const stockByProduct: Record<string, { size: number; quantity: number }[]> = {};
  for (const row of stockRows ?? []) {
    if (!stockByProduct[row.product_id]) stockByProduct[row.product_id] = [];
    stockByProduct[row.product_id].push({ size: row.size, quantity: row.quantity });
  }

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      price: p.price != null ? Number(p.price) : 0,
      sku: p.sku,
      stock: (stockByProduct[p.id] ?? []).sort((a, b) => a.size - b.size),
    })),
  });
}
