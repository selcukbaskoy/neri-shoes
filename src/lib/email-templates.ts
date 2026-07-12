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
    case "cart_1h":
    case "cart_24h":
    case "cart_72h":
      return null;

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
