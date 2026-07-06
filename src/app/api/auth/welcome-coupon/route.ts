import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(_request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Kullanıcıya özgü deterministik kod (tekrar çağrılırsa aynı kodu döner)
  const userPrefix = user.id.replace(/-/g, "").substring(0, 8).toUpperCase();
  const code = `HOSGELDIN-${userPrefix}`;

  // Zaten var mı?
  const { data: existing } = await supabaseAdmin
    .from("coupons")
    .select("code")
    .eq("code", code)
    .single();

  if (existing) {
    return NextResponse.json({ code: existing.code });
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .insert({
      code,
      discount_type: "percent",
      discount_value: 10,
      min_order_amount: 500,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_uses: 1,
      is_active: true,
    })
    .select("code")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ code: data.code });
}
