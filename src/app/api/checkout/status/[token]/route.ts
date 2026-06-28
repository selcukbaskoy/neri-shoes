import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getIyzicoClient } from "@/lib/iyzico";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Token eksik" }, { status: 400 });

  // Dev mode token
  if (token.startsWith("dev-")) {
    const orderId = token.replace("dev-", "");
    const { data } = await supabase.from("orders").select("status").eq("id", orderId).single();
    return NextResponse.json({ status: data?.status ?? "pending", devMode: true });
  }

  let iyzico;
  try {
    iyzico = getIyzicoClient();
  } catch {
    return NextResponse.json({ error: "iyzico yapılandırması eksik" }, { status: 503 });
  }

  return new Promise<NextResponse>((resolve) => {
    iyzico.checkoutFormRetrieve.retrieve({ token }, (err, result) => {
      if (err || result.status !== "success") {
        resolve(
          NextResponse.json(
            { error: result?.errorMessage ?? "Durum sorgulanamadı" },
            { status: 502 }
          )
        );
        return;
      }
      resolve(
        NextResponse.json({
          paymentStatus: result.paymentStatus,
          paymentId: result.paymentId,
          paidPrice: result.paidPrice,
        })
      );
    });
  });
}
