import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ customers: [] });

  const { data, error } = await supabaseAdmin
    .from("store_customers")
    .select("id, name, phone, credit_limit, is_blocked")
    .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
    .order("name")
    .limit(15);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ customers: data ?? [] });
}
