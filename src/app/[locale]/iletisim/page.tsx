import { setRequestLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
import ContactContent from "@/components/ContactContent";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const canonicalUrl = `${SITE_URL}/${locale}/iletisim`;

  return {
    title: t("contact.title"),
    description: t("contact.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/iletisim`])),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("contact.title"),
      description: t("contact.description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("contact.title"),
      description: t("contact.description"),
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent whatsappLink={getWhatsAppLink()} />;
}
