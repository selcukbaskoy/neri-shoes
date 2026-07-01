import { setRequestLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import { getFeaturedProducts, getActiveProductImages } from "@/lib/products";
import { getAllProductStocks } from "@/lib/stock";
import { getExchangeRates } from "@/lib/currency";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";
import { JsonLd } from "@/components/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const canonicalUrl = `${SITE_URL}/${locale}`;

  return {
    title: t("home.title"),
    description: t("home.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}`])),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("home.title"),
      description: t("home.description"),
      images: [{ url: `${SITE_URL}/logo.jpeg`, width: 400, height: 400, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("home.title"),
      description: t("home.description"),
      images: [`${SITE_URL}/logo.jpeg`],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [featuredRaw, stocksMap, rates, stripImages] = await Promise.all([
    getFeaturedProducts(),
    getAllProductStocks(),
    getExchangeRates(),
    getActiveProductImages(12),
  ]);

  // Smart sort: in-stock > featured > discounted, tükenmiş products sink to bottom
  const totalStock = (id: string) =>
    (stocksMap[id] ?? []).reduce((sum: number, s) => sum + s.quantity, 0);
  const featured = [...featuredRaw].sort((a, b) => {
    const stockScore = (id: string) => (totalStock(id) > 0 ? 0 : 1);
    const featuredScore = (f: boolean) => (f ? 0 : 1);
    const discountScore = (p: typeof a) => (p.compareAtPrice != null ? 0 : 1);
    return (
      stockScore(a.id) - stockScore(b.id) ||
      featuredScore(a.featured) - featuredScore(b.featured) ||
      discountScore(a) - discountScore(b)
    );
  });
  const whatsappNumber = getWhatsAppNumber();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/urunler?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <JsonLd data={websiteSchema} />
      <HomeContent
        featured={featured}
        stocksMap={stocksMap}
        rates={rates}
        whatsappNumber={whatsappNumber}
        stripImages={stripImages}
      />
    </>
  );
}
