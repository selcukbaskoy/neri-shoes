import { NextResponse } from "next/server";
import { getIyzicoClient } from "@/lib/iyzico";

// GEÇICI DEBUG ENDPOINT — test bittikten sonra sil (dosya: src/app/api/debug-env/route.ts)
export async function GET() {
  const check = (key: string) =>
    process.env[key] !== undefined && process.env[key] !== "" ? "TANIMLI" : "EKSİK";

  // getIyzicoClient() gerçekten çalışıyor mu test et
  let iyzicoClientStatus: string;
  let iyzicoClientError: string | null = null;
  try {
    getIyzicoClient();
    iyzicoClientStatus = "BASARILI — client olusturuldu";
  } catch (e) {
    iyzicoClientStatus = "HATA — exception firlatildi";
    iyzicoClientError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    _uyari: "Bu endpoint sadece debug amaçlıdır. Test bittikten sonra silinecek.",
    NODE_ENV: process.env.NODE_ENV,
    IYZICO_API_KEY: check("IYZICO_API_KEY"),
    IYZICO_SECRET_KEY: check("IYZICO_SECRET_KEY"),
    IYZICO_BASE_URL_deger: process.env.IYZICO_BASE_URL ?? "(tanimli degil — otomatik fallback kullanilir)",
    getIyzicoClient_sonuc: iyzicoClientStatus,
    getIyzicoClient_hata: iyzicoClientError,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "(tanimli degil)",
  });
}
