import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { type Locale } from "@/lib/types";
import LoginRegisterContent from "@/components/auth/LoginRegisterContent";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("pageTitle") + " | Neri Shoes" };
}

export default async function GirisPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginRegisterContent />;
}
