import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getActiveProducts, getProductBySlug, getProductContent, getProductMeta, getColorFamily, getSimilarProducts } from "@/lib/products";
import { getProductStock } from "@/lib/stock";
import { getExchangeRates } from "@/lib/currency";
import { getRegionalPrices } from "@/lib/regional-prices";
import { getWhatsAppNumber } from "@/lib/whatsapp";
import { locales } from "@/i18n/routing";
import { Locale } from "@/lib/types";
import ProductDetailContent from "@/components/ProductDetailContent";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const products = await getActiveProducts();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const product of products) {
      params.push({ locale, slug: product.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const meta = getProductMeta(product, locale as Locale);
  const content = getProductContent(product, locale as Locale);
  const canonicalUrl = `${SITE_URL}/${locale}/urunler/${slug}`;
  const primaryImage = product.images?.[0] ?? `${SITE_URL}/logo.jpeg`;

  return {
    title: meta.title || `${product.name} | ${SITE_NAME}`,
    description: meta.description || content.shortDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/urunler/${slug}`])
      ),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: meta.title || product.name,
      description: meta.description || content.shortDescription,
      images: [{ url: primaryImage, alt: meta.title || product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title || product.name,
      description: meta.description || content.shortDescription,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [stock, rates, regionalPrices, siblings, similarProducts] = await Promise.all([
    getProductStock(product.id),
    getExchangeRates(),
    getRegionalPrices(product.id),
    product.colorFamily ? getColorFamily(product.colorFamily, product.id) : Promise.resolve([]),
    getSimilarProducts(product.category, product.id, 4),
  ]);
  const content = getProductContent(product, locale as Locale);
  const meta = getProductMeta(product, locale as Locale);
  const canonicalUrl = `${SITE_URL}/${locale}/urunler/${slug}`;
  const primaryImage = product.images?.[0] ?? `${SITE_URL}/logo.jpeg`;

  const isOutOfStock = stock.length > 0 && stock.every((s) => s.quantity === 0);
  const availability = isOutOfStock
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: meta.title || product.name,
    description: meta.description || content.shortDescription,
    image: product.images?.length ? product.images : [primaryImage],
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      availability,
      priceCurrency: "TRY",
      url: canonicalUrl,
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    inLanguage: locale,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Ürünler", item: `${SITE_URL}/${locale}/urunler` },
      { "@type": "ListItem", position: 3, name: meta.title || product.name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProductDetailContent
        product={product}
        content={content}
        stock={stock}
        rates={rates}
        regionalPrices={regionalPrices}
        whatsappNumber={getWhatsAppNumber()}
        siblings={siblings}
        similarProducts={similarProducts}
      />
    </>
  );
}
