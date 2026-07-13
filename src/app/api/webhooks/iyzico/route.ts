import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getIyzicoClient, verifyIyzicoWebhookSignature } from "@/lib/iyzico";
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

  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  if (!secretKey) {
    console.error("[iyzico webhook] IYZICO_SECRET_KEY eksik");
    return NextResponse.json({ error: "webhook disabled" }, { status: 503 });
  }

  // HMAC doğrulama (iyzico Checkout Form callback'te bu parametreler form-urlencoded olarak gelir)
  const iyziReferenceCode = params.get("iyziReferenceCode");
  const conversationId = params.get("conversationId");
  const merchantToken = params.get("merchantToken");

  if (iyziReferenceCode && conversationId && merchantToken) {
    const valid = verifyIyzicoWebhookSignature(
      iyziReferenceCode,
      conversationId,
      merchantToken,
      secretKey
    );
    if (!valid) {
      console.error("[iyzico webhook] HMAC doğrulama başarısız");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
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
          
          // Idempotency: Zaten failed ise tekrar failed yapma (stok/kupon etkilenmemeli)
          const { data: existingOrder } = await supabaseAdmin
            .from("orders")
            .select("status")
            .eq("iyzico_token", token)
            .single();
          
          if (existingOrder?.status === "failed") {
            resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=failed`, { status: 303 }));
            return;
          }
          
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
          // Idempotency: Sipariş zaten paid ise işlem yapma
          const { data: existingOrder } = await supabaseAdmin
            .from("orders")
            .select("status")
            .eq("iyzico_token", token)
            .single();

          if (existingOrder?.status === "paid") {
            console.log("[iyzico webhook] Sipariş zaten paid, tekrar işlem yapılmıyor:", token);
            resolve(NextResponse.redirect(`${origin}/tr/odeme?payment_status=success`, { status: 303 }));
            return;
          }
          
          try {
            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id, confirmation_email_sent_at, coupon_id, customer_id, discount_amount, customer_email")
              .eq("iyzico_token", token)
              .single();

            if (order) {
              const { data: items } = await supabaseAdmin
                .from("order_items")
                .select("product_id, size, quantity")
                .eq("order_id", order.id);

              // Kategori bazlı check-in gecikmesi: spor/günlük hızlı değerlendirilir (+5),
              // klasik/deri ayakkabı 1 günde değerlendirilemez (+10, varsayılan)
              const FAST_REVIEW_CATEGORIES = new Set(["spor", "gunluk"]);
              let checkinDelayDays = 10;
              if (items && items.length > 0) {
                const { data: firstProduct } = await supabaseAdmin
                  .from("products")
                  .select("category")
                  .eq("id", items[0].product_id)
                  .maybeSingle();
                if (firstProduct?.category && FAST_REVIEW_CATEGORIES.has(firstProduct.category)) {
                  checkinDelayDays = 5;
                }
              }

              if (items) {
                for (const item of items) {
                  await supabaseAdmin.rpc("decrement_stock", {
                    p_product_id: item.product_id,
                    p_size: item.size,
                    p_qty: item.quantity,
                  });
                }
              }

              // Kupon kullanımını kaydet
              if (order.coupon_id && order.discount_amount > 0) {
                try {
                  const { recordCouponRedemption } = await import("@/lib/coupon");
                  await recordCouponRedemption(order.coupon_id, order.id, order.customer_id, order.discount_amount);
                  console.log("[iyzico callback] Kupon kullanımı kaydedildi:", order.coupon_id);
                } catch (couponErr) {
                  console.error("[iyzico callback] Kupon kayıt hatası:", couponErr);
                }
                // Kupon kullanıldı → welcome_20h hatırlatıcısını iptal et
                if (order.customer_email) {
                  try {
                    const { cancelByKey } = await import("@/lib/email-queue");
                    await cancelByKey(`welcome_used_${order.customer_email}`);
                  } catch { /* non-critical */ }
                }
              }

              // Sepet terk hatırlatıcılarını iptal et — satın alma tamamlandı
              if (order.customer_email) {
                try {
                  const { cancelByKey } = await import("@/lib/email-queue");
                  await cancelByKey(`cart_abandon_${order.customer_email.toLowerCase().trim()}`);
                } catch { /* non-critical */ }
              }

              // Post-purchase check-in kaydı oluştur (kategori bazlı: +5 veya +10 gün)
              try {
                const scheduledAt = new Date();
                scheduledAt.setDate(scheduledAt.getDate() + checkinDelayDays);
                await supabaseAdmin
                  .from("post_purchase_checkins")
                  .insert({
                    order_id: order.id,
                    scheduled_at: scheduledAt.toISOString(),
                  });
                console.log("[iyzico callback] Post-purchase check-in oluşturuldu:", order.id);
              } catch (checkinErr) {
                console.error("[iyzico callback] Check-in oluşturma hatası:", checkinErr);
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
