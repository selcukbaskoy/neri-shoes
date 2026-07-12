import { supabaseAdmin } from "@/lib/supabase";

export type FlowType =
  | "welcome"
  | "cart_abandon"
  | "review"
  | "cross_sell"
  | "win_back";

const PROMOTIONAL_FLOWS: FlowType[] = [
  "welcome",
  "cart_abandon",
  "cross_sell",
  "win_back",
];

export interface EnqueueParams {
  flow_type: FlowType;
  template_key: string;
  customer_email: string;
  customer_name?: string;
  scheduled_at: Date;
  cancel_key?: string;
  payload?: Record<string, unknown>;
}

export async function enqueueEmail(params: EnqueueParams) {
  return supabaseAdmin.from("email_queue").insert({
    flow_type: params.flow_type,
    template_key: params.template_key,
    customer_email: params.customer_email.toLowerCase().trim(),
    customer_name: params.customer_name ?? null,
    scheduled_at: params.scheduled_at.toISOString(),
    cancel_key: params.cancel_key ?? null,
    payload: params.payload ?? {},
    status: "pending",
  });
}

// Sepet terk gibi: satın alınca kuyruktaki bekleyen mailleri iptal et
export async function cancelByKey(cancel_key: string) {
  return supabaseAdmin
    .from("email_queue")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("cancel_key", cancel_key)
    .eq("status", "pending");
}

// Hard bounce / spam şikayeti / global unsubscribe kontrolü
export async function isBlacklisted(customer_email: string): Promise<boolean> {
  const email = customer_email.toLowerCase().trim();

  const [prefResult, unsubResult] = await Promise.all([
    supabaseAdmin
      .from("user_email_preferences")
      .select("hard_bounced, spam_complained")
      .eq("customer_email", email)
      .maybeSingle(),
    supabaseAdmin
      .from("unsubscribe_logs")
      .select("id")
      .eq("customer_email", email)
      .is("flow_type", null)
      .limit(1),
  ]);

  if (prefResult.data?.hard_bounced || prefResult.data?.spam_complained) return true;
  if ((unsubResult.data?.length ?? 0) > 0) return true;
  return false;
}

// Günlük frekans sınırı: aynı müşteriye bugün zaten 1 promosyon maili gönderildiyse true
export async function hasHitDailyPromoCap(customer_email: string): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from("email_queue")
    .select("id", { count: "exact", head: true })
    .eq("customer_email", customer_email.toLowerCase().trim())
    .eq("status", "sent")
    .in("flow_type", PROMOTIONAL_FLOWS)
    .gte("updated_at", todayStart.toISOString());

  return (count ?? 0) >= 1;
}

export function isPromotional(flow_type: string): boolean {
  return PROMOTIONAL_FLOWS.includes(flow_type as FlowType);
}
