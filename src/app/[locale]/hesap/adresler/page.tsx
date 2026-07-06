import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type Locale } from "@/lib/types";
import AddressManager from "@/components/auth/AddressManager";

type Props = { params: Promise<{ locale: Locale }> };

export default async function AdreslerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account" });

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: addresses } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("auth_user_id", user!.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-white">{t("addresses")}</h2>
      <AddressManager initialAddresses={addresses ?? []} />
    </div>
  );
}
