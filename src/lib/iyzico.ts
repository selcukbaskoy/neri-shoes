import Iyzipay from "iyzipay";

export function getIyzicoClient(): Iyzipay {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;

  // Production'da IYZICO_BASE_URL tanımlı değilse gerçek API'ye düşer.
  // Local dev'de tanımlı değilse sandbox'a düşer.
  const uri =
    process.env.IYZICO_BASE_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://api.iyzipay.com"
      : "https://sandbox-api.iyzipay.com");

  if (!apiKey || !secretKey) {
    throw new Error("IYZICO_API_KEY ve IYZICO_SECRET_KEY env değişkenleri eksik");
  }

  return new Iyzipay({ apiKey, secretKey, uri });
}

export function verifyIyzicoWebhookSignature(
  iyziReferenceCode: string,
  conversationId: string,
  merchantToken: string,
  secretKey: string
): boolean {
  const crypto = require("crypto") as typeof import("crypto");
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(`${iyziReferenceCode}${conversationId}${merchantToken}`)
    .digest("base64");
  return hash === merchantToken;
}
