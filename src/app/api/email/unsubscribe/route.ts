import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nerishoes.com.tr";

// GET /api/email/unsubscribe?email=X&flow=Y
// Promosyon maillerindeki "abonelikten çık" linki.
// flow=welcome|cart_abandon|cross_sell|win_back|all
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  const flow = req.nextUrl.searchParams.get("flow") ?? null;

  if (!email) {
    return NextResponse.redirect(`${SITE_URL}/tr?unsub=error`);
  }

  // unsubscribe_logs'a kaydet (KVKK kanıtı)
  await supabaseAdmin.from("unsubscribe_logs").insert({
    customer_email: email,
    flow_type: flow === "all" ? null : flow,
    reason: "link_click",
  });

  // Global unsubscribe ise promotional_opt_in'i kapat
  if (!flow || flow === "all") {
    await supabaseAdmin
      .from("user_email_preferences")
      .update({ promotional_opt_in: false, updated_at: new Date().toISOString() })
      .eq("customer_email", email);
  }

  return NextResponse.redirect(`${SITE_URL}/tr?unsub=ok`);
}
