import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "neri_admin_session";

export function generateSessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET env var not set");
  const nonce = randomBytes(16).toString("hex");
  const sig = createHmac("sha256", secret).update(nonce).digest("hex");
  return `${nonce}.${sig}`;
}

export function validateSessionToken(token: string): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx < 0) return false;
  const nonce = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expected = createHmac("sha256", secret).update(nonce).digest("hex");
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig, "utf8"), Buffer.from(expected, "utf8"));
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!value) return false;
  return validateSessionToken(value);
}
