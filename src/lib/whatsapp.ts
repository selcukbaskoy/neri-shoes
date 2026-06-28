// WhatsApp numarası sadece sunucu tarafında okunur (process.env), böylece
// sunucu ve istemci arasında href tutarsızlığı (hydration mismatch) oluşmaz.
export function getWhatsAppNumber(): string {
  return process.env.WHATSAPP_NUMBER || "";
}

export function buildWhatsAppLink(number: string, message?: string): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}

export function getWhatsAppLink(message?: string): string {
  return buildWhatsAppLink(getWhatsAppNumber(), message);
}

export function buildProductWhatsAppLink(number: string, productName: string, locale: string): string {
  const messages: Record<string, string> = {
    tr: `Merhaba, ${productName} hakkında bilgi almak istiyorum.`,
    en: `Hello, I would like to get information about ${productName}.`,
    de: `Hallo, ich möchte Informationen über ${productName} erhalten.`,
    it: `Ciao, vorrei avere informazioni su ${productName}.`,
    ar: `مرحباً، أود الحصول على معلومات حول ${productName}.`,
    ru: `Здравствуйте, я хотел бы получить информацию о ${productName}.`,
  };

  return buildWhatsAppLink(number, messages[locale] || messages.tr);
}
