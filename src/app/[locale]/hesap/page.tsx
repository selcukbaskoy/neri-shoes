import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { type Locale } from "@/lib/types";
import { Link } from "@/i18n/navigation";
import WelcomeCouponBanner from "@/components/auth/WelcomeCouponBanner";

type Props = { params: Promise<{ locale: Locale }> };

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400",
  paid: "text-accent",
  processing: "text-blue-400",
  shipped: "text-purple-400",
  delivered: "text-green-400",
  cancelled: "text-white/30",
  failed: "text-red-400",
};

export default async function HesapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account" });

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Misafirken verilen siparişleri doğrulanmış e-posta ile hesaba bağla
  if (user?.email && user.email_confirmed_at) {
    await supabaseAdmin
      .from("orders")
      .update({ auth_user_id: user.id })
      .eq("customer_email", user.email)
      .is("auth_user_id", null);
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, total_amount, status, discount_amount")
    .eq("auth_user_id", user!.id)
    .order("created_at", { ascending: false });

  const isNewUser = !orders || orders.length === 0;

  return (
    <div>
      {isNewUser && <WelcomeCouponBanner />}

      <h2 className="mb-6 text-lg font-medium text-white">{t("orders")}</h2>

      {!orders || orders.length === 0 ? (
        <div className="rounded border border-white/8 p-8 text-center">
          <p className="mb-4 text-sm text-white/40">{t("noOrders")}</p>
          <Link
            href="/urunler"
            className="inline-block bg-accent px-6 py-2.5 text-sm font-semibold text-[#0a0a0a] rounded hover:bg-accent/90 transition-colors"
          >
            {t("shopNow")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded border border-white/8 bg-white/2 p-4 hover:border-white/15 transition-colors"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-white/30">{t("orderNumber")}{order.id.substring(0, 8).toUpperCase()}</p>
                  <p className="mt-0.5 text-sm text-white/60">
                    {new Date(order.created_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-sm font-medium ${STATUS_COLORS[order.status] ?? "text-white/40"}`}>
                    {t(`status.${order.status}` as keyof typeof t)}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {Number(order.total_amount).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
