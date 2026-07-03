import { NextResponse } from "next/server";

// GEÇICI DEBUG ENDPOINT — test bittikten sonra sil (dosya: src/app/api/debug-env/route.ts)
export async function GET() {
  const check = (key: string) =>
    process.env[key] !== undefined && process.env[key] !== "" ? "TANIMLI" : "EKSİK";

  return NextResponse.json({
    _uyari: "Bu endpoint sadece debug amaçlıdır. Gerçek değerler gösterilmez.",
    IYZICO_API_KEY: check("IYZICO_API_KEY"),
    IYZICO_SECRET_KEY: check("IYZICO_SECRET_KEY"),
    IYZICO_BASE_URL: check("IYZICO_BASE_URL"),
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: check("NEXT_PUBLIC_SITE_URL"),
  });
}
