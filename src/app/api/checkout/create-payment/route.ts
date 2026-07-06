import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getIyzicoClient } from "@/lib/iyzico";

interface CartItem {
  productId: string;
  productName: string;
  size: number;
  quantity: number;
  unitPrice: number;
}

interface CheckoutBody {
  items: CartItem[];
  customer: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
}

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const { items, customer } = body;
  if (!items?.length || !customer?.name || !customer?.email || !customer?.phone) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const orderId = crypto.randomUUID();
  const conversationId = orderId;

  // Girişli müşteri ise siparişi hesabına bağla (misafir checkout değişmez)
  let authUserId: string | null = null;
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authUserId = user?.id ?? null;
  } catch {
    // Oturum okunamazsa misafir olarak devam et
  }

  // 1. Siparişi veritabanına kaydet
  const { error: orderErr } = await supabaseAdmin.from("orders").insert({
    id: orderId,
    customer_name: `${customer.name} ${customer.surname}`,
    customer_email: customer.email,
    customer_phone: customer.phone,
    shipping_address: customer.address,
    shipping_city: customer.city,
    shipping_district: customer.district,
    total_amount: totalAmount,
    status: "pending",
    payment_provider: "iyzico",
    auth_user_id: authUserId,
  });

  if (orderErr) {
    console.error("Order insert error:", orderErr);
    return NextResponse.json({ error: "Sipariş oluşturulamadı" }, { status: 500 });
  }

  // 2. Sipariş kalemlerini kaydet
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    product_name: item.productName,
    size: item.size,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  await supabaseAdmin.from("order_items").insert(orderItems);

  // 3. iyzico checkout form token al
  let iyzico;
  try {
    iyzico = getIyzicoClient();
  } catch (clientErr) {
    if (process.env.NODE_ENV === "production") {
      await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", orderId);
      const reason = clientErr instanceof Error ? clientErr.message : String(clientErr);
      console.error("[create-payment] getIyzicoClient hatası:", reason);
      return NextResponse.json(
        { error: `Ödeme sistemi şu an kullanılamıyor. Neden: ${reason}` },
        { status: 503 }
      );
    }
    // Sadece development modunda simülasyon
    await supabaseAdmin.from("orders").update({ iyzico_token: `dev-${orderId}` }).eq("id", orderId);
    return NextResponse.json({
      token: `dev-${orderId}`,
      checkoutFormContent: null,
      devMode: true,
      orderId,
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "85.34.78.112";

  const priceStr = totalAmount.toFixed(2);
  // NEXT_PUBLIC_SITE_URL Vercel'de www'suz ayarlanmış olabilir; callbackUrl daima www ile olsun.
  const rawSite = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nerishoes.com.tr";
  const siteUrl = rawSite.replace("https://nerishoes.com.tr", "https://www.nerishoes.com.tr");

  return new Promise<NextResponse>((resolve) => {
    iyzico.checkoutFormInitialize.create(
      {
        locale: "tr",
        conversationId,
        price: priceStr,
        paidPrice: priceStr,
        currency: "TRY",
        basketId: orderId,
        paymentGroup: "PRODUCT",
        callbackUrl: `${siteUrl}/api/webhooks/iyzico`,
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
          id: orderId,
          name: customer.name,
          surname: customer.surname,
          email: customer.email,
          phone: customer.phone,
          identityNumber: "11111111111",
          registrationAddress: customer.address,
          city: customer.city,
          country: "Turkey",
          ip,
        },
        shippingAddress: {
          contactName: `${customer.name} ${customer.surname}`,
          city: customer.city,
          country: "Turkey",
          address: customer.address,
        },
        billingAddress: {
          contactName: `${customer.name} ${customer.surname}`,
          city: customer.city,
          country: "Turkey",
          address: customer.address,
        },
        basketItems: items.map((item) => ({
          id: item.productId,
          name: item.productName,
          category1: "Ayakkabı",
          itemType: "PHYSICAL" as const,
          price: (item.unitPrice * item.quantity).toFixed(2),
        })),
      },
      async (err, result) => {
        if (err || result.status !== "success" || !result.token) {
          const detail = err?.message ?? result?.errorMessage ?? result?.errorCode ?? "iyzico yanıt vermedi";
          console.error("[create-payment] iyzico API hatası:", detail, JSON.stringify(result ?? {}));
          await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", orderId);
          resolve(
            NextResponse.json(
              { error: `Ödeme başlatılamadı: ${detail}` },
              { status: 502 }
            )
          );
          return;
        }

        await supabaseAdmin
          .from("orders")
          .update({ iyzico_token: result.token })
          .eq("id", orderId);

        resolve(
          NextResponse.json({
            token: result.token,
            checkoutFormContent: result.checkoutFormContent,
            orderId,
          })
        );
      }
    );
  });
}
