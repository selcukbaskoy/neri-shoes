import { setRequestLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
import WholesaleContent from "@/components/WholesaleContent";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const canonicalUrl = `${SITE_URL}/${locale}/toptan`;

  return {
    title: t("wholesale.title"),
    description: t("wholesale.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/toptan`])),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("wholesale.title"),
      description: t("wholesale.description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("wholesale.title"),
      description: t("wholesale.description"),
    },
  };
}

export default async function WholesalePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WholesaleContent whatsappNumber={getWhatsAppNumber()} />;
}
