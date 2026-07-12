// Email şablon dispatcher — her aşamada yeni şablonlar eklenir.
// null dönerse kuyruk işleyici o maili bu turda atlar (pending kalır).

export interface TemplateResult {
  subject: string;
  html: string;
  from?: string; // belirtilmezse default transactional from kullanılır
}

export async function dispatchTemplate(
  template_key: string,
  payload: Record<string, unknown>
): Promise<TemplateResult | null> {
  switch (template_key) {
    // Aşama 5 — Welcome akışı (henüz implemente edilmedi)
    case "welcome_0":
    case "welcome_20h":
      return null;

    // Aşama 6 — Sepet terk (henüz implemente edilmedi)
    case "cart_1h":
    case "cart_24h":
    case "cart_72h":
      return null;

    // Aşama 7 — Satın alma sonrası değerlendirme (henüz implemente edilmedi)
    case "review_5d":
    case "review_10d":
      return null;

    // Aşama 8 — Çapraz satış (henüz implemente edilmedi)
    case "cross_sell_7d":
      return null;

    // Aşama 8 — Geri kazanım (henüz implemente edilmedi)
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
