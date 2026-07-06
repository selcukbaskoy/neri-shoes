import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getIyzicoClient } from "@/lib/iyzico";
import { sendOrderConfirmationEmail } from "@/lib/email";

// iyzico Checkout Form callback — tarayıcı formu olarak POST gelir (form-urlencoded)
// Sadece `token` parametresi gelir; HMAC imzası bu akışta YOKTUR.
export async function POST(req: NextRequest) {
  let origin = "https://www.nerishoes.com.tr";
  try {
    origin = new URL(req.url).origin;
  } catch {
    // req.url geçersiz olsa bile devam et
  }

  let text = "";
  try {
    text = await req.text();
  } catch (e) {
    console.error("[iyzico callback] req.text() hatası:", e);
    return NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed&reason=parse`, { status: 303 });
  }

  const params = new URLSearchParams(text);
  const allParams: Record<string, string> = {};
  params.forEach((v, k) => { allParams[k] = v; });
  console.log("[iyzico callback] Gelen parametreler:", JSON.stringify(allParams));

  const token = params.get("token");

  if (!token) {
    console.error("[iyzico callback] Token yok.");
    return NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed&reason=no_token`, { status: 303 });
  }

  let iyzico;
  try {
    iyzico = getIyzicoClient();
  } catch (err) {
    console.error("[iyzico callback] Client hatası:", err);
    return NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed&reason=config`, { status: 303 });
  }

  return new Promise<NextResponse>((resolve) => {
    try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (iyzico as any).checkoutForm.retrieve({ token }, async (err: any, result: any) => {
      try {
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
          try {
            await supabaseAdmin.from("orders").update({ status: "failed" }).eq("iyzico_token", token);
          } catch (dbErr) {
            console.error("[iyzico callback] DB update hatası (failed):", dbErr);
          }
          resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed`, { status: 303 }));
          return;
        }

        const paymentStatus: string = result.paymentStatus ?? "";
        const paymentId: string = result.paymentId ?? "";
        const newStatus = paymentStatus === "SUCCESS" ? "paid" : "failed";

        try {
          await supabaseAdmin
            .from("orders")
            .update({ status: newStatus, payment_reference: paymentId || null })
            .eq("iyzico_token", token);
        } catch (dbErr) {
          console.error("[iyzico callback] Order update hatası:", dbErr);
        }

        if (newStatus === "paid") {
          try {
            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id, confirmation_email_sent_at")
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

              // Sipariş onay maili — ödeme akışını asla bloklamaz, hata sadece loglanır.
              // confirmation_email_sent_at dolu ise (callback ikinci kez geldiyse) tekrar gönderilmez.
              if (!order.confirmation_email_sent_at) {
                const mailResult = await sendOrderConfirmationEmail(order.id);
                if (mailResult.sent) {
                  await supabaseAdmin
                    .from("orders")
                    .update({ confirmation_email_sent_at: new Date().toISOString() })
                    .eq("id", order.id);
                  console.log("[iyzico callback] Onay maili gönderildi:", mailResult.emailId);
                } else {
                  console.error("[iyzico callback] Onay maili gönderilemedi:", mailResult.error);
                }
              }
            }
          } catch (stockErr) {
            console.error("[iyzico callback] Stok/mail güncelleme hatası:", stockErr);
          }
          resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=success`, { status: 303 }));
        } else {
          resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed`, { status: 303 }));
        }
      } catch (callbackErr) {
        console.error("[iyzico callback] Beklenmedik hata:", callbackErr);
        resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed&reason=error`, { status: 303 }));
      }
    });
    } catch (sdkErr) {
      console.error("[iyzico callback] SDK sync hatası:", sdkErr);
      resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed&reason=sdk`, { status: 303 }));
    }
  });
}
