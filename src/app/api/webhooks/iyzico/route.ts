import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getIyzicoClient } from "@/lib/iyzico";

// iyzico Checkout Form callback — tarayıcı formu olarak POST gelir (form-urlencoded)
// Sadece `token` parametresi gelir; HMAC imzası bu akışta YOKTUR.
// Doğru akış: token → checkoutFormRetrieve.retrieve() → sipariş güncelle → yönlendir
export async function POST(req: NextRequest) {
  const text = await req.text();
  const params = new URLSearchParams(text);

  const allParams: Record<string, string> = {};
  params.forEach((v, k) => { allParams[k] = v; });
  console.log("[iyzico callback] Gelen parametreler:", JSON.stringify(allParams));

  const token = params.get("token");
  const origin = new URL(req.url).origin;

  if (!token) {
    console.error("[iyzico callback] Token yok. Parametreler:", JSON.stringify(allParams));
    return NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed&reason=no_token`, { status: 303 });
  }

  let iyzico;
  try {
    iyzico = getIyzicoClient();
  } catch (err) {
    console.error("[iyzico callback] Client hatası:", err);
    return NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed&reason=config`, { status: 303 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise<NextResponse>((resolve) => {
    iyzico.checkoutFormRetrieve.retrieve(
      { token },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (err: any, result: any) => {
        console.log("[iyzico callback] Retrieve sonucu:", JSON.stringify({
          status: result?.status,
          paymentStatus: result?.paymentStatus,
          errorCode: result?.errorCode,
          errorMessage: result?.errorMessage,
          paymentId: result?.paymentId,
        }));

        if (err || result?.status !== "success") {
          const detail = err?.message ?? result?.errorMessage ?? "retrieve başarısız";
          console.error("[iyzico callback] Retrieve hatası:", detail);
          await supabaseAdmin.from("orders").update({ status: "failed" }).eq("iyzico_token", token);
          resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed`, { status: 303 }));
          return;
        }

        const paymentStatus: string = result.paymentStatus ?? "";
        const paymentId: string = result.paymentId ?? "";
        const newStatus = paymentStatus === "SUCCESS" ? "paid" : "failed";

        const { error: updateErr } = await supabaseAdmin
          .from("orders")
          .update({ status: newStatus, payment_reference: paymentId || null })
          .eq("iyzico_token", token);

        if (updateErr) {
          console.error("[iyzico callback] Order update hatası:", updateErr);
        }

        if (newStatus === "paid") {
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("iyzico_token", token)
            .single();

          if (order) {
            const { data: items } = await supabaseAdmin
              .from("order_items")
              .select("product_id, size, quantity")
              .eq("order_id", order.id);

            if (items) {
              for (const item of items) {
                await supabaseAdmin.rpc("decrement_stock", {
                  p_product_id: item.product_id,
                  p_size: item.size,
                  p_qty: item.quantity,
                });
              }
            }
          }
          resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=success`, { status: 303 }));
        } else {
          resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed`, { status: 303 }));
        }
      }
    );
  });
}
