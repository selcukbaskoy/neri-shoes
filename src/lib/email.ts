// src/lib/email.ts
// Resend e-posta altyapısı — sipariş onayları, check-in mailleri, stok bildirimleri.
// Her gönderim asenkron ve hata-toleranslıdır; ödeme akışını asla bloklamaz.

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL ?? "siparis@nerishoes.com.tr";
const promotionalFromEmail = process.env.PROMOTIONAL_FROM_EMAIL ?? "firsat@nerishoes.com.tr";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY ortam değişkeni tanımlı değil.");
    }
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
}

// ============================================================
// HTML şablon: marka estetiği (siyah / altın / minimalist)
// ============================================================

function brandEmailTemplate(options: {
  subject: string;
  preheader: string;
  bodyHtml: string;
  footerHtml?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.subject)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .title { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0a; font-family:'Georgia','Times New Roman',serif; color:#e5e5e5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; width:100%; background-color:#111111; border:1px solid #222222; border-radius:4px;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px; text-align:center; border-bottom:1px solid #222222;">
              <h1 class="title" style="margin:0; font-family:'Georgia','Times New Roman',serif; font-size:28px; font-weight:400; color:#ffd700; letter-spacing:0.05em; text-transform:uppercase;">
                Neri Shoes
              </h1>
              <p style="margin:8px 0 0; font-size:11px; color:#888888; letter-spacing:0.15em; text-transform:uppercase;">
                Ustanın İşi · Sessiz Özgüven
              </p>
            </td>
          </tr>
          <!-- Preheader (gizli) -->
          <tr>
            <td style="display:none; font-size:1px; color:#0a0a0a; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
              ${escapeHtml(options.preheader)}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${options.bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px; border-top:1px solid #222222; text-align:center;">
              <p style="margin:0 0 8px; font-size:12px; color:#666666;">
                Adana, Türkiye
              </p>
              <p style="margin:0; font-size:11px; color:#444444;">
                Bu e-posta Neri Shoes tarafından otomatik olarak gönderilmiştir.
              </p>
              ${options.footerHtml ?? ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// Sipariş Onay E-postası
// ============================================================

export interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    size: number;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  orderDate: string;
}

export function buildOrderConfirmationHtml(data: OrderConfirmationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0; border-bottom:1px solid #222222; font-size:14px; color:#e5e5e5;">
            ${escapeHtml(item.productName)}
            <span style="color:#888888; font-size:12px;">— Beden ${item.size} × ${item.quantity}</span>
          </td>
          <td style="padding:12px 0; border-bottom:1px solid #222222; text-align:right; font-size:14px; color:#ffd700; font-weight:600;">
            ${formatCurrency(item.unitPrice * item.quantity)}
          </td>
        </tr>
      `
    )
    .join("");

  return brandEmailTemplate({
    subject: `Siparişiniz Alındı — #${data.orderId.slice(0, 8).toUpperCase()}`,
    preheader: `Neri Shoes siparişiniz başarıyla alındı. Toplam tutar: ${formatCurrency(data.totalAmount)}`,
    bodyHtml: `
      <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#bbbbbb;">
        Merhaba ${escapeHtml(data.customerName)},
      </p>
      <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#bbbbbb;">
        Siparişiniz bize ulaştı. En kısa sürede hazırlayıp kargoya teslim edeceğiz.
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px; background-color:#0f0f0f; border:1px solid #222222; border-radius:4px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 4px; font-size:11px; color:#888888; text-transform:uppercase; letter-spacing:0.1em;">Sipariş No</p>
            <p style="margin:0; font-size:16px; color:#ffd700; font-weight:600; letter-spacing:0.05em;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
          </td>
          <td style="padding:16px 20px; text-align:right;">
            <p style="margin:0 0 4px; font-size:11px; color:#888888; text-transform:uppercase; letter-spacing:0.1em;">Tarih</p>
            <p style="margin:0; font-size:14px; color:#e5e5e5;">${data.orderDate}</p>
          </td>
        </tr>
      </table>

      <h2 style="margin:0 0 16px; font-size:13px; font-weight:600; color:#888888; text-transform:uppercase; letter-spacing:0.12em; border-bottom:1px solid #222222; padding-bottom:8px;">
        Sipariş Özeti
      </h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${itemsHtml}
        <tr>
          <td style="padding:16px 0 0; font-size:14px; font-weight:600; color:#e5e5e5; text-transform:uppercase; letter-spacing:0.1em;">
            Toplam
          </td>
          <td style="padding:16px 0 0; text-align:right; font-size:18px; font-weight:700; color:#ffd700;">
            ${formatCurrency(data.totalAmount)}
          </td>
        </tr>
      </table>

      <h2 style="margin:32px 0 16px; font-size:13px; font-weight:600; color:#888888; text-transform:uppercase; letter-spacing:0.12em; border-bottom:1px solid #222222; padding-bottom:8px;">
        Teslimat Adresi
      </h2>
      <p style="margin:0; font-size:14px; line-height:1.6; color:#bbbbbb;">
        ${escapeHtml(data.shippingAddress)}<br>
        ${escapeHtml(data.shippingCity)}
      </p>

      <p style="margin:32px 0 0; font-size:12px; line-height:1.6; color:#666666;">
        Siparişinizin durumunu <a href="https://nerishoes.com.tr/hesap/siparisler" style="color:#ffd700; text-decoration:none; border-bottom:1px solid #ffd700;">hesabınızdan</a> takip edebilirsiniz.
      </p>
    `,
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================
// Gönderim fonksiyonları
// ============================================================

export interface EmailResult {
  sent: boolean;
  emailId?: string;
  error?: string;
}

export async function sendOrderConfirmationEmail(orderId: string): Promise<EmailResult> {
  try {
    const { data: order, error: orderErr } = await (await import("@/lib/supabase")).supabaseAdmin
      .from("orders")
      .select("id, customer_name, customer_email, total_amount, shipping_address, shipping_city, created_at")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return { sent: false, error: orderErr?.message ?? "Sipariş bulunamadı" };
    }

    const { data: items, error: itemsErr } = await (await import("@/lib/supabase")).supabaseAdmin
      .from("order_items")
      .select("product_name, size, quantity, unit_price")
      .eq("order_id", orderId);

    if (itemsErr) {
      return { sent: false, error: itemsErr.message };
    }

    const html = buildOrderConfirmationHtml({
      orderId: order.id,
      customerName: order.customer_name || "Değerli Müşterimiz",
      customerEmail: order.customer_email || "",
      items: (items || []).map((it: Record<string, unknown>) => ({
        productName: String(it.product_name || ""),
        size: Number(it.size || 0),
        quantity: Number(it.quantity || 0),
        unitPrice: Number(it.unit_price || 0),
      })),
      totalAmount: order.total_amount || 0,
      shippingAddress: order.shipping_address || "",
      shippingCity: order.shipping_city || "",
      orderDate: order.created_at
        ? new Date(order.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
        : "",
    });

    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: order.customer_email,
      subject: `Siparişiniz Alındı — #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    });

    if (error) {
      return { sent: false, error: error.message };
    }

    return { sent: true, emailId: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { sent: false, error: msg };
  }
}

// ============================================================
// Gelecekte kullanılacak şablonlar (stub)
// ============================================================

export async function sendPostPurchaseCheckinEmail(orderId: string): Promise<EmailResult> {
  try {
    const { data: order, error: orderErr } = await (await import("@/lib/supabase")).supabaseAdmin
      .from("orders")
      .select("id, customer_name, customer_email, total_amount, created_at")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return { sent: false, error: orderErr?.message ?? "Sipariş bulunamadı" };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nerishoes.com.tr";
    const checkinUrl = `${siteUrl}/api/checkins/respond?orderId=${order.id}`;

    const html = brandEmailTemplate({
      subject: `Neri Shoes Siparişiniz — Memnun musunuz?`,
      preheader: `Siparişiniz hakkında kısa bir geri bildirim rica ediyoruz.`,
      bodyHtml: `
        <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#bbbbbb;">
          Merhaba ${escapeHtml(order.customer_name || "Değerli Müşterimiz")},
        </p>
        <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#bbbbbb;">
          #${order.id.slice(0, 8).toUpperCase()} numaralı siparişiniz üzerinden bir hafta geçti.
          Ürünlerimizden memnun kaldınız mı? Kısa bir yanıtınız bizim için çok değerli.
        </p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
          <tr>
            <td align="center">
              <a href="${checkinUrl}&response=memnun" style="display:inline-block; padding:14px 32px; background-color:#1a1a1a; border:1px solid #333; border-radius:4px; color:#ffd700; font-size:13px; font-weight:600; text-decoration:none; text-transform:uppercase; letter-spacing:0.08em; margin-right:12px;">
                ✓ Memnunum
              </a>
              <a href="${checkinUrl}&response=memnun_degil" style="display:inline-block; padding:14px 32px; background-color:#1a1a1a; border:1px solid #333; border-radius:4px; color:#bbbbbb; font-size:13px; font-weight:600; text-decoration:none; text-transform:uppercase; letter-spacing:0.08em;">
                ✗ Memnun Değilim
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0; font-size:12px; line-height:1.6; color:#666666;">
          Her iki durumda da size yardımcı olmaktan mutluluk duyarız.
          Memnun kaldıysanız <a href="${siteUrl}/urunler" style="color:#ffd700; text-decoration:none; border-bottom:1px solid #ffd700;">diğer ürünlerimizi</a> inceleyebilir,
          yardıma ihtiyacınız varsa <a href="https://wa.me/905443191977" style="color:#ffd700; text-decoration:none; border-bottom:1px solid #ffd700;">WhatsApp</a> üzerinden bize ulaşabilirsiniz.
        </p>
      `,
    });

    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: order.customer_email,
      subject: `Neri Shoes — Siparişiniz Hakkında Geri Bildirim`,
      html,
    });

    if (error) {
      return { sent: false, error: error.message };
    }

    return { sent: true, emailId: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { sent: false, error: msg };
  }
}

export async function sendStockAlertEmail(_productName: string, _email: string): Promise<EmailResult> {
  // Adım 9'da implemente edilecek
  return { sent: false, error: "Not implemented" };
}

// Promosyon akışları için gönderici (firsat@nerishoes.com.tr)
export function getPromotionalFrom(): string {
  return promotionalFromEmail;
}
