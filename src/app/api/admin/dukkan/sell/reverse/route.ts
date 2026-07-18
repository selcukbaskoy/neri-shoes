import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { saleId } = (await request.json()) as { saleId: number };
  if (!saleId) return NextResponse.json({ error: "saleId required" }, { status: 400 });

  const { error } = await supabaseAdmin.rpc("store_reverse_sale", {
    p_sale_id: saleId,
    p_actor: "admin-panel",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
