import { NextResponse } from "next/server";
import { getIyzicoClient } from "@/lib/iyzico";

// GEÇICI DEBUG ENDPOINT — test bittikten sonra sil (dosya: src/app/api/debug-env/route.ts)
export async function GET() {
  const raw = (key: string) => process.env[key] ?? "";
  const check = (key: string) => (raw(key) !== "" ? "TANIMLI" : "EKSİK");
  const lenInfo = (key: string) => {
    const val = raw(key);
    const trimmed = val.trim();
    return {
      durum: check(key),
      uzunluk: val.length,
      trim_uzunluk: trimmed.length,
      bosluk_var_mi: val.length !== trimmed.length,
    };
  };

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
    IYZICO_API_KEY: lenInfo("IYZICO_API_KEY"),
    IYZICO_SECRET_KEY: lenInfo("IYZICO_SECRET_KEY"),
    IYZICO_BASE_URL: process.env.IYZICO_BASE_URL ?? "(tanimli degil)",
    getIyzicoClient_sonuc: iyzicoClientStatus,
    getIyzicoClient_hata: iyzicoClientError,
  });
}
