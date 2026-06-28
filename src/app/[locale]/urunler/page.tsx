import { getTranslations, setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import ProductsCatalog from "@/components/ProductsCatalog";
import { getActiveProducts } from "@/lib/products";
import { getAllProductStocks } from "@/lib/stock";
import { getExchangeRates } from "@/lib/currency";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const canonicalUrl = `${SITE_URL}/${locale}/urunler`;

  return {
    title: t("products.title"),
    description: t("products.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/urunler`])),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("products.title"),
      description: t("products.description"),
      images: [{ url: `${SITE_URL}/logo.jpeg`, width: 400, height: 400, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("products.title"),
      description: t("products.description"),
    },
  };
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("products");
  const [products, stocksMap, rates] = await Promise.all([
    getActiveProducts(),
    getAllProductStocks(),
    getExchangeRates(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="mb-10 text-center animate-fade-in-up">
        <h1 className="section-title">{t("title")}</h1>
        <div className="gold-divider mx-auto my-4 w-24" />
        <p className="mt-2 text-muted">{t("subtitle")}</p>
      </div>
      <ProductsCatalog products={products} stocksMap={stocksMap} rates={rates} whatsappNumber={getWhatsAppNumber()} />
    </div>
  );
}
