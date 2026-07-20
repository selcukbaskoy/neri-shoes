import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const PHONE_RE = /^0?5\d{9}$/;

function escapeIlike(value: string): string {
  return value.replace(/[%_,]/g, (ch) => `\\${ch}`);
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  let query = supabaseAdmin
    .from("store_customers")
    .select("id, name, phone, credit_limit, is_blocked, created_at")
    .order(q ? "name" : "created_at", { ascending: q ? true : false })
    .limit(q ? 15 : 10);

  if (q) {
    const safe = escapeIlike(q);
    query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ customers: data ?? [] });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { name, phone } = (body ?? {}) as { name?: unknown; phone?: unknown };

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "name_min_2_chars" }, { status: 400 });
  }
  const trimmedName = name.trim().slice(0, 120);

  let normalizedPhone: string | null = null;
  if (phone !== undefined && phone !== null && phone !== "") {
    if (typeof phone !== "string" || !PHONE_RE.test(phone.trim())) {
      return NextResponse.json({ error: "invalid_phone_format" }, { status: 400 });
    }
    const digits = phone.trim().replace(/^0/, "");
    normalizedPhone = `0${digits}`;

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("store_customers")
      .select("id")
      .eq("phone", normalizedPhone)
      .limit(1);
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "phone_already_exists" }, { status: 409 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("store_customers")
    .insert({ name: trimmedName, phone: normalizedPhone })
    .select("id, name, phone, credit_limit, is_blocked, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ customer: data }, { status: 201 });
}
