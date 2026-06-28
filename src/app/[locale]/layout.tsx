import { notFound } from "next/navigation";
import { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, locales } from "@/i18n/routing";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HtmlAttributes from "@/components/HtmlAttributes";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { CartProvider } from "@/lib/cart";
import CartPanel from "@/components/CartPanel";
import { getExchangeRates } from "@/lib/currency";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const canonicalUrl = `${SITE_URL}/${locale}`;
  const ogLocale = localeToOgLocale[locale] ?? locale;
  const altLocales = locales
    .filter((l) => l !== locale)
    .map((l) => localeToOgLocale[l] ?? l);

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: altLocales,
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: t("title"),
      description: t("description"),
      images: [{ url: `${SITE_URL}/logo.jpeg`, width: 400, height: 400, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${SITE_URL}/logo.jpeg`],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const whatsappLink = getWhatsAppLink();
  const exchangeRates = await getExchangeRates();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.jpeg`,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sarıyakup, 23040. Sk.",
      addressLocality: "Seyhan",
      addressRegion: "Adana",
      postalCode: "01020",
      addressCountry: "TR",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
    priceRange: "$$",
    description:
      "Adana merkezli premium erkek ayakkabı markası. Hakiki deri, EVA taban teknolojisi. Toptan ve perakende satış.",
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CartProvider>
        <JsonLd data={organizationSchema} />
        <HtmlAttributes locale={locale} />
        <div className="flex min-h-screen flex-col">
          <Header whatsappLink={whatsappLink} />
          <main className="flex-1">{children}</main>
          <Footer whatsappLink={whatsappLink} />
          <CartPanel rates={exchangeRates} />
        </div>
      </CartProvider>
    </NextIntlClientProvider>
  );
}
