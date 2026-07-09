import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupon";

// POST /api/coupons/validate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, cartTotal } = body;

    if (!code || typeof cartTotal !== "number" || cartTotal < 0) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    const result = await validateCoupon(code, cartTotal);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
