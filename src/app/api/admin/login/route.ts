import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, generateSessionToken } from "@/lib/auth";
import { supabaseAdminAdmin } from "@/lib/supabaseAdmin";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Check existing record for this IP
  const { data: record } = await supabaseAdmin
    .from("admin_login_attempts")
    .select("attempt_count, locked_until")
    .eq("ip_address", ip)
    .maybeSingle();

  // Locked?
  if (record?.locked_until && new Date(record.locked_until) > new Date()) {
    const secsLeft = Math.ceil(
      (new Date(record.locked_until).getTime() - Date.now()) / 1000
    );
    return NextResponse.json(
      { error: "locked", secsLeft },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    const newCount = (record?.attempt_count ?? 0) + 1;
    const lockedUntil =
      newCount >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
        : null;

    await supabaseAdmin.from("admin_login_attempts").upsert(
      {
        ip_address: ip,
        attempt_count: newCount,
        last_attempt: new Date().toISOString(),
        locked_until: lockedUntil,
      },
      { onConflict: "ip_address" }
    );

    const remaining = MAX_ATTEMPTS - newCount;
    return NextResponse.json(
      { error: "invalid", remaining: remaining > 0 ? remaining : 0 },
      { status: 401 }
    );
  }

  // Success — clear attempts for this IP
  await supabaseAdmin
    .from("admin_login_attempts")
    .delete()
    .eq("ip_address", ip);

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, generateSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
