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
  const canonicalUrl = `${SITE_URL}/${locale}/mesafeli-satis-sozlesmesi`;

  return {
    title: t("distanceSales.title"),
    description: t("distanceSales.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/mesafeli-satis-sozlesmesi`])
      ),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("distanceSales.title"),
      description: t("distanceSales.description"),
      images: [{ url: `${SITE_URL}/logo.jpeg`, width: 400, height: 400, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("distanceSales.title"),
      description: t("distanceSales.description"),
    },
  };
}

export default async function DistanceSalesContractPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const doc = await getLegalContent(locale, "distance-sales");

  return <LegalPageContent document={doc} locale={locale} />;
}
