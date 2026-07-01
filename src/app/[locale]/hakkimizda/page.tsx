import { setRequestLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
import AboutContent from "@/components/AboutContent";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const canonicalUrl = `${SITE_URL}/${locale}/hakkimizda`;

  return {
    title: t("about.title"),
    description: t("about.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/hakkimizda`])),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("about.title"),
      description: t("about.description"),
      images: [{ url: `${SITE_URL}/logo.jpeg`, width: 400, height: 400, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("about.title"),
      description: t("about.description"),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent whatsappNumber={getWhatsAppNumber()} />;
}
