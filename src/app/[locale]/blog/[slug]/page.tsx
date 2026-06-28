import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBlogPostBySlug, getPublishedBlogPosts, getBlogMeta, getBlogContent } from "@/lib/blog";
import { Locale } from "@/lib/types";
import BlogPostContent from "@/components/BlogPostContent";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, localeToOgLocale } from "@/lib/seo";
import { locales } from "@/i18n/routing";

export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  const { title, description } = getBlogMeta(post, locale as Locale);
  const content = getBlogContent(post, locale as Locale);
  const canonicalUrl = `${SITE_URL}/${locale}/blog/${slug}`;
  const ogImage = post.coverImage
    ? [{ url: post.coverImage, alt: title || content.title }]
    : [{ url: `${SITE_URL}/logo.jpeg`, width: 400, height: 400, alt: SITE_NAME }];

  return {
    title: title || content.title,
    description: description || content.excerpt,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/blog/${slug}`])),
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      locale: localeToOgLocale[locale] ?? locale,
      siteName: SITE_NAME,
      title: title || content.title,
      description: description || content.excerpt,
      images: ogImage,
      publishedTime: post.publishedAt ?? undefined,
      authors: [SITE_NAME],
    },
    twitter: {
      card: "summary_large_image",
      title: title || content.title,
      description: description || content.excerpt,
      images: post.coverImage ? [post.coverImage] : [`${SITE_URL}/logo.jpeg`],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getBlogPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const content = getBlogContent(post, locale as Locale);
  const { title, description } = getBlogMeta(post, locale as Locale);
  const canonicalUrl = `${SITE_URL}/${locale}/blog/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title || content.title,
    description: description || content.excerpt,
    image: post.coverImage ?? `${SITE_URL}/logo.jpeg`,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.publishedAt ?? post.createdAt,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpeg` },
    },
    mainEntityOfPage: canonicalUrl,
    inLanguage: locale,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/${locale}/blog` },
      { "@type": "ListItem", position: 3, name: title || content.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <BlogPostContent post={post} locale={locale as Locale} />
    </>
  );
}
