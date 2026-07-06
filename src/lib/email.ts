import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

const EMAIL_FROM = "Neri Shoes <info@nerishoes.com.tr>";
const SITE_URL = "https://www.nerishoes.com.tr";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY tanımlı değil");
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

interface OrderItemRow {
  product_name: string;
  size: number;
  quantity: number;
  unit_price: number;
}

interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string | null;
  total_amount: number;
  created_at: string;
}

function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

function orderConfirmationHtml(order: OrderRow, items: OrderItemRow[]): string {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const orderDate = new Date(order.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#e8e8e8;font-size:14px;">
            ${item.product_name}
            <span style="color:#888;font-size:12px;"> — Numara ${item.size} × ${item.quantity}</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#e8e8e8;font-size:14px;text-align:right;white-space:nowrap;">
            ${formatTRY(item.unit_price * item.quantity)}
          </td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111;border:1px solid #222;border-radius:8px;overflow:hidden;">

        <tr>
          <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #222;">
            <span style="font-size:26px;letter-spacing:0.18em;color:#ffffff;">NERI SHOES</span>
            <div style="margin-top:8px;font-size:11px;letter-spacing:0.28em;color:#FFD000;text-transform:uppercase;">El Yapımı Deri Ayakkabı</div>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 8px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:normal;color:#ffffff;">Siparişiniz Alındı ✓</h1>
            <p style="margin:0;color:#aaa;font-size:14px;line-height:1.6;">
              Sayın ${order.customer_name}, ödemeniz başarıyla tamamlandı.
              Siparişiniz özenle hazırlanıp en kısa sürede kargoya verilecek.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161616;border:1px solid #222;border-radius:6px;">
              <tr>
                <td style="padding:16px 20px;">
                  <span style="color:#888;font-size:12px;">Sipariş No</span><br>
                  <span style="color:#FFD000;font-size:15px;letter-spacing:0.08em;">#${shortId}</span>
                </td>
                <td style="padding:16px 20px;text-align:right;">
                  <span style="color:#888;font-size:12px;">Tarih</span><br>
                  <span style="color:#e8e8e8;font-size:14px;">${orderDate}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${itemRows}
              <tr>
                <td style="padding:16px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Toplam</td>
                <td style="padding:16px 0;color:#FFD000;font-size:18px;font-weight:bold;text-align:right;">${formatTRY(order.total_amount)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 40px 28px;">
            <div style="background:#161616;border:1px solid #222;border-radius:6px;padding:16px 20px;">
              <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Teslimat Adresi</span>
              <p style="margin:8px 0 0;color:#e8e8e8;font-size:14px;line-height:1.5;">
                ${order.shipping_address}<br>
                ${order.shipping_district ? order.shipping_district + ", " : ""}${order.shipping_city}
              </p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <a href="${SITE_URL}/tr/hesap/siparisler" style="display:inline-block;background:#FFD000;color:#0a0a0a;text-decoration:none;padding:13px 32px;font-size:13px;letter-spacing:0.08em;border-radius:4px;font-weight:bold;">
              SİPARİŞİMİ GÖRÜNTÜLE
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px;border-top:1px solid #222;text-align:center;">
            <p style="margin:0 0 6px;color:#666;font-size:12px;">Sorularınız için: <a href="mailto:info@nerishoes.com.tr" style="color:#FFD000;text-decoration:none;">info@nerishoes.com.tr</a></p>
            <p style="margin:0;color:#444;font-size:11px;">© ${new Date().getFullYear()} Neri Shoes — nerishoes.com.tr</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Sipariş onay maili gönderir. Ödeme akışını asla bloklamamalı —
 * çağıran taraf hatayı yutup loglamalıdır; burada da throw yerine
 * sonuç objesi döner.
 */
export async function sendOrderConfirmationEmail(
  orderId: string
): Promise<{ sent: boolean; error?: string; emailId?: string }> {
  try {
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select(
        "id, customer_name, customer_email, shipping_address, shipping_city, shipping_district, total_amount, created_at"
      )
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return { sent: false, error: `Sipariş bulunamadı: ${orderErr?.message ?? orderId}` };
    }

    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_name, size, quantity, unit_price")
      .eq("order_id", orderId);

    const resend = getResendClient();
    const shortId = order.id.slice(0, 8).toUpperCase();

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: order.customer_email,
      subject: `Siparişiniz Alındı — #${shortId} | Neri Shoes`,
      html: orderConfirmationHtml(order, items ?? []),
    });

    if (error) {
      return { sent: false, error: error.message };
    }
    return { sent: true, emailId: data?.id };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}
