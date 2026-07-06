import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { type Locale } from "@/lib/types";
import AccountNav from "@/components/auth/AccountNav";

// Oturum cookie'sine bağlı içerik — asla statik üretilmemeli
export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function HesapLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/giris`);
  }

  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest text-white/30">{t("hello")}</p>
          <h1 className="mt-1 font-serif text-3xl text-white">
            {user.user_metadata?.full_name ?? user.email}
          </h1>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-52 shrink-0">
            <AccountNav locale={locale} />
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
