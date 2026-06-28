import { setRequestLocale, getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/blog";
import BlogContent from "@/components/BlogContent";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const canonicalUrl = `${SITE_URL}/${locale}/blog`;

  return {
    title: t("blog.title"),
    description: t("blog.description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/blog`])),
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: t("blog.title"),
      description: t("blog.description"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("blog.title"),
      description: t("blog.description"),
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = await getPublishedBlogPosts();
  return <BlogContent posts={posts} />;
}
