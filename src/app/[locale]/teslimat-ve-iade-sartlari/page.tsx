import { setRequestLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
import LegalPageContent from "@/components/LegalPageContent";
import { getLegalContent } from "@/content/legal";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const canonicalUrl = `${SITE_URL}/${locale}/teslimat-ve-iade-sartlari`;

  return {
    title: t("delivery.title"),
    description: t("delivery.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/teslimat-ve-iade-sartlari`])
      ),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("delivery.title"),
      description: t("delivery.description"),
      images: [{ url: `${SITE_URL}/logo.jpeg`, width: 400, height: 400, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("delivery.title"),
      description: t("delivery.description"),
    },
  };
}

export default async function DeliveryPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const doc = await getLegalContent(locale, "delivery");

  return <LegalPageContent document={doc} locale={locale} />;
}
