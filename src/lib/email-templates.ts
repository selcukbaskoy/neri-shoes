// Email şablon dispatcher — her aşamada yeni şablonlar eklenir.
// null dönerse kuyruk işleyici o maili bu turda atlar (pending kalır).

export interface TemplateResult {
  subject: string;
  html: string;
  from?: string; // belirtilmezse flow_type'a göre otomatik seçilir
}

// ============================================================
// Paylaşılan şablon çatısı
// ============================================================

function shell(subject: string, preheader: string, body: string, footer = ""): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(subject)}</title>
  <style>@media only screen and (max-width:600px){.wrap{width:100%!important;padding:20px!important}.h1{font-size:22px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,'Times New Roman',serif;color:#e5e5e5;">
<table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0a0a0a;">
<tr><td align="center" style="padding:40px 0;">
<table class="wrap" width="600" cellspacing="0" cellpadding="0" border="0"
  style="max-width:600px;width:100%;background:#111;border:1px solid #222;border-radius:4px;">
  <!-- header -->
  <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #222;">
    <h1 class="h1" style="margin:0;font-size:26px;font-weight:400;color:#ffd700;letter-spacing:.06em;text-transform:uppercase;">Neri Shoes</h1>
    <p style="margin:6px 0 0;font-size:11px;color:#888;letter-spacing:.15em;text-transform:uppercase;">Ustanın İşi · Sessiz Özgüven</p>
  </td></tr>
  <!-- preheader (gizli) -->
  <tr><td style="display:none;font-size:1px;max-height:0;overflow:hidden;color:#0a0a0a;">${esc(preheader)}</td></tr>
  <!-- body -->
  <tr><td style="padding:32px 40px;">${body}</td></tr>
  <!-- footer -->
  <tr><td style="padding:20px 40px 32px;border-top:1px solid #222;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:#555;">Adana, Türkiye — nerishoes.com.tr</p>
    <p style="margin:0;font-size:11px;color:#444;">Bu e-posta Neri Shoes tarafından otomatik gönderilmiştir.</p>
    ${footer}
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ctaBtn(href: string, label: string) {
  return `<table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
<tr><td align="center">
  <a href="${href}" style="display:inline-block;padding:14px 36px;background:#ffd700;border-radius:3px;color:#0a0a0a;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:.08em;text-transform:uppercase;">${label}</a>
</td></tr>
</table>`;
}

function unsubFooter(email: string, flow: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nerishoes.com.tr";
  const href = `${siteUrl}/api/email/unsubscribe?email=${encodeURIComponent(email)}&flow=${flow}`;
  return `<p style="margin:12px 0 0;font-size:10px;color:#333;">
    <a href="${href}" style="color:#444;text-decoration:underline;">Abonelikten çık</a>
  </p>`;
}

interface CartItem {
  product_id?: string;
  product_name: string;
  size: number;
  quantity: number;
  unit_price: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

// ============================================================
// Aşama 5 — Welcome akışı
// ============================================================

function welcomeConfirmHtml(name: string, confirmUrl: string, guideUrl: string): string {
  return shell(
    "Neri Shoes'a Hoş Geldiniz",
    `${name}, %15 hoş geldin indiriminiz sizi bekliyor — onaylayın, aktifleştirin.`,
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#ccc;">Merhaba ${esc(name)},</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#bbb;">
Neri Shoes ailesine hoş geldiniz. Tek tıkla e-postanızı onaylayın —
<strong style="color:#ffd700;">%15 indirim kodunuz</strong> hemen aktifleşsin (24 saat geçerli).
</p>
${ctaBtn(confirmUrl, "E-postamı Onayla — %15 Kodum Aktifleşsin")}
<hr style="border:none;border-top:1px solid #222;margin:24px 0;">
<p style="margin:0 0 10px;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.1em;">Önce Değer, Sonra Alışveriş</p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#999;">
Hangi beden size uyar? Kalıplarımız nasıl kesiliyor? Satın almadan önce:
</p>
<p style="margin:0;"><a href="${guideUrl}" style="color:#ffd700;font-size:13px;text-decoration:none;border-bottom:1px solid #ffd700;">
→ Beden ve Kalıp Rehberini İncele
</a></p>`
  );
}

function welcomeReminderHtml(name: string, couponCode: string, shopUrl: string, email: string): string {
  return shell(
    `${couponCode} — Kodunuzun süresi doluyor`,
    `${name}, %15 indirim kodunuz bugün geçersiz oluyor. Son birkaç saat!`,
    `<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#ccc;">Merhaba ${esc(name)},</p>
<p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#bbb;">
<strong style="color:#ffd700;">%15 hoş geldin indiriminiz</strong> bugün gece yarısı sona eriyor.
Kaçırmamak için şimdi kullanın.
</p>
<table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;background:#0f0f0f;border:1px solid #2a2a2a;border-radius:4px;">
<tr><td style="padding:20px 24px;text-align:center;">
  <p style="margin:0 0 6px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.12em;">İndirim Kodunuz</p>
  <p style="margin:0;font-size:22px;font-weight:700;color:#ffd700;letter-spacing:.12em;">${esc(couponCode)}</p>
  <p style="margin:6px 0 0;font-size:11px;color:#555;">%15 indirim · min. sipariş yok · tek kullanım</p>
</td></tr>
</table>
${ctaBtn(shopUrl, "Alışverişe Git")}`,
    unsubFooter(email, "welcome")
  );
}

// ============================================================
// Aşama 6 — Sepet terk şablonları
// ============================================================

function cartItemsTable(items: CartItem[]): string {
  const rows = items.map(
    (it) => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;font-size:13px;color:#ccc;">
        ${esc(it.product_name)}<span style="color:#666;"> · Beden ${it.size} × ${it.quantity}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;text-align:right;font-size:13px;color:#ffd700;font-weight:600;">
        ${fmt(it.unit_price * it.quantity)}
      </td>
    </tr>`
  ).join("");
  return `<table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">${rows}</table>`;
}

function cartAbandon1h(
  name: string, items: CartItem[], total: number,
  atPayment: boolean, cartUrl: string, email: string
): string {
  const problemBlock = atPayment
    ? `<p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#999;background:#0f0f0f;border:1px solid #222;border-radius:4px;padding:14px 18px;">
        Ödeme adımında bir sorunla mı karşılaştınız?
        <a href="https://wa.me/905302608771" style="color:#ffd700;text-decoration:none;">WhatsApp'tan anında yardım alın →</a>
      </p>`
    : "";
  return shell(
    "Sepetin hâlâ seni bekliyor",
    `${name}, sepetindeki ürünler güvende — istediğinde devam edebilirsin.`,
    `<p style="margin:0 0 20px;font-size:15px;color:#ccc;">Merhaba ${esc(name)},</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#bbb;">
Sepetindeki ürünler seni bekliyor. Dilediğin zaman kaldığın yerden devam edebilirsin.
</p>
${problemBlock}
${cartItemsTable(items)}
<p style="margin:0 0 6px;text-align:right;font-size:12px;color:#666;">Toplam</p>
<p style="margin:0 0 24px;text-align:right;font-size:18px;font-weight:700;color:#ffd700;">${fmt(total)}</p>
${ctaBtn(cartUrl, "Sepetime Dön")}`,
    unsubFooter(email, "cart_abandon")
  );
}

function cartAbandon24h(
  name: string, items: CartItem[], total: number,
  stockMsg: string, cartUrl: string, email: string
): string {
  const fomoBlock = stockMsg
    ? `<p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#e5a000;background:#1a1200;border:1px solid #2a1e00;border-radius:4px;padding:14px 18px;">⚠ ${stockMsg}</p>`
    : "";
  return shell(
    "Sepetindeki ürünler hâlâ seni bekliyor",
    `${name}, seçtiğin numarada stok azalıyor — hızlı ol.`,
    `<p style="margin:0 0 20px;font-size:15px;color:#ccc;">Merhaba ${esc(name)},</p>
${fomoBlock}
<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#bbb;">
Dün sepetine eklediğin ürünler seni bekliyor.
</p>
${cartItemsTable(items)}
<p style="margin:0 0 6px;text-align:right;font-size:12px;color:#666;">Toplam</p>
<p style="margin:0 0 24px;text-align:right;font-size:18px;font-weight:700;color:#ffd700;">${fmt(total)}</p>
${ctaBtn(cartUrl, "Siparişi Tamamla")}`,
    unsubFooter(email, "cart_abandon")
  );
}

function cartAbandon72h(
  name: string, items: CartItem[], shippingCode: string,
  cartUrl: string, email: string
): string {
  return shell(
    "Kargonuz bizden — ücretsiz gönderim",
    `${name}, kargo ücreti bizden. Bugün sipariş verin, kapınıza kadar ücretsiz gelsin.`,
    `<p style="margin:0 0 20px;font-size:15px;color:#ccc;">Merhaba ${esc(name)},</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#bbb;">
Bu kez kargo ücreti bizden. Aşağıdaki kodu kullanarak siparişinizde ücretsiz gönderim kazanın.
</p>
<table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;background:#0f0f0f;border:1px solid #2a2a2a;border-radius:4px;">
<tr><td style="padding:20px 24px;text-align:center;">
  <p style="margin:0 0 6px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.12em;">Ücretsiz Kargo Kodunuz</p>
  <p style="margin:0;font-size:20px;font-weight:700;color:#ffd700;letter-spacing:.1em;">${esc(shippingCode)}</p>
  <p style="margin:6px 0 0;font-size:11px;color:#555;">7 gün geçerli · tek kullanım</p>
</td></tr>
</table>
${cartItemsTable(items)}
${ctaBtn(cartUrl, "Ücretsiz Kargo ile Sipariş Ver")}`,
    unsubFooter(email, "cart_abandon")
  );
}

// ============================================================
// Dispatcher
// ============================================================

export async function dispatchTemplate(
  template_key: string,
  payload: Record<string, unknown>
): Promise<TemplateResult | null> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nerishoes.com.tr";

  switch (template_key) {
    case "welcome_0": {
      const name = String(payload.customer_name ?? "Değerli Müşterimiz");
      const token = String(payload.opt_in_token ?? "");
      if (!token) return null;
      const confirmUrl = `${siteUrl}/api/email/confirm-optin?token=${encodeURIComponent(token)}`;
      const guideUrl = `${siteUrl}/tr/boyut-rehberi`;
      return {
        subject: "Neri Shoes'a Hoş Geldiniz — %15 Kodunuz Sizi Bekliyor",
        html: welcomeConfirmHtml(name, confirmUrl, guideUrl),
        from: `Neri Shoes <siparis@nerishoes.com.tr>`,
      };
    }

    case "welcome_20h": {
      const name = String(payload.customer_name ?? "Değerli Müşterimiz");
      const code = String(payload.coupon_code ?? "");
      const email = String(payload.customer_email ?? "");
      if (!code) return null;
      const shopUrl = `${siteUrl}/tr/urunler`;
      return {
        subject: `${code} — %15 İndiriminiz Bugün Sona Eriyor`,
        html: welcomeReminderHtml(name, code, shopUrl, email),
        from: `Neri Shoes Fırsatlar <firsat@nerishoes.com.tr>`,
      };
    }

    // Aşama 6 — Sepet terk
    case "cart_1h": {
      const name = String(payload.customer_name ?? "Değerli Müşterimiz");
      const email = String(payload.customer_email ?? "");
      const items = (payload.items ?? []) as CartItem[];
      const total = Number(payload.cart_total ?? 0);
      const atPayment = Boolean(payload.at_payment_step);
      const cartUrl = `${siteUrl}/tr/odeme`;
      return {
        subject: "Sepetin hâlâ seni bekliyor",
        html: cartAbandon1h(name, items, total, atPayment, cartUrl, email),
        from: `Neri Shoes <siparis@nerishoes.com.tr>`,
      };
    }

    case "cart_24h": {
      const name = String(payload.customer_name ?? "Değerli Müşterimiz");
      const email = String(payload.customer_email ?? "");
      const items = (payload.items ?? []) as CartItem[];
      const total = Number(payload.cart_total ?? 0);
      const cartUrl = `${siteUrl}/tr/odeme`;
      // Canlı stok çek
      let stockMsg = "";
      if (items.length > 0) {
        const first = items[0];
        if (first.product_id && first.size) {
          const { supabaseAdmin } = await import("@/lib/supabase");
          const { data: stockRow } = await supabaseAdmin
            .from("product_stock")
            .select("quantity")
            .eq("product_id", first.product_id)
            .eq("size", first.size)
            .maybeSingle();
          const qty = stockRow?.quantity ?? 0;
          if (qty > 0 && qty <= 3) {
            stockMsg = `${esc(first.product_name)} — Beden ${first.size}'de yalnızca <strong style="color:#ffd700;">${qty} adet</strong> kaldı.`;
          } else if (qty === 0) {
            stockMsg = `${esc(first.product_name)} — Beden ${first.size} tükendi. Diğer bedenler mevcut olabilir.`;
          }
        }
      }
      return {
        subject: stockMsg
          ? "Seçtiğin numarada son birkaç adet kaldı"
          : "Sepetindeki ürünler hâlâ seni bekliyor",
        html: cartAbandon24h(name, items, total, stockMsg, cartUrl, email),
        from: `Neri Shoes Fırsatlar <firsat@nerishoes.com.tr>`,
      };
    }

    case "cart_72h": {
      const name = String(payload.customer_name ?? "Değerli Müşterimiz");
      const email = String(payload.customer_email ?? "");
      const items = (payload.items ?? []) as CartItem[];
      const cartUrl = `${siteUrl}/tr/odeme`;
      // Ücretsiz kargo kuponu — önceki girişimde oluşturulmuşsa payload'dan al
      let shippingCode = String(payload.free_shipping_code ?? "");
      if (!shippingCode) {
        const { supabaseAdmin } = await import("@/lib/supabase");
        const { randomBytes } = await import("crypto");
        const suffix = randomBytes(3).toString("hex").toUpperCase();
        shippingCode = `KARGOBEDAVA-${suffix}`;
        await supabaseAdmin.from("coupons").insert({
          code: shippingCode,
          discount_type: "shipping",
          discount_value: 1,
          free_shipping: true,
          min_order_amount: 0,
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          max_uses: 1,
          is_active: true,
        });
      }
      return {
        subject: "Kargonuz bizden — ücretsiz gönderim",
        html: cartAbandon72h(name, items, shippingCode, cartUrl, email),
        from: `Neri Shoes Fırsatlar <firsat@nerishoes.com.tr>`,
      };
    }

    // Aşama 7 — Satın alma sonrası değerlendirme
    case "review_5d":
    case "review_10d":
      return null;

    // Aşama 8 — Çapraz satış
    case "cross_sell_7d":
      return null;

    // Aşama 8 — Geri kazanım
    case "win_back_30d":
    case "win_back_60d":
    case "win_back_90d":
    case "win_back_120d":
      return null;

    default:
      void payload;
      return null;
  }
}
