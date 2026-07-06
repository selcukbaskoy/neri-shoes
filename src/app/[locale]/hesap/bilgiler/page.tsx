import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type Locale } from "@/lib/types";
import ProfileContent from "@/components/auth/ProfileContent";

type Props = { params: Promise<{ locale: Locale }> };

export default async function BilgilerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account" });

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-white">{t("profile")}</h2>
      <ProfileContent
        initialName={user?.user_metadata?.full_name ?? ""}
        email={user?.email ?? ""}
      />
    </div>
  );
}
