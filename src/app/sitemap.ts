import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { locales } from '@/i18n/routing';
import { getActiveProducts } from '@/lib/products';
import { getPublishedBlogPosts } from '@/lib/blog';

const staticPages = ['', 'urunler', 'blog', 'hakkimizda', 'iletisim', 'toptan'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogPosts] = await Promise.all([
    getActiveProducts(),
    getPublishedBlogPosts(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${page ? `/${page}` : ''}`,
      lastModified: new Date(),
      changeFrequency: (page === '' ? 'daily' : 'weekly') as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: page === '' ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}${page ? `/${page}` : ''}`])
        ),
      },
    }))
  );

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/urunler/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/urunler/${product.slug}`])
        ),
      },
    }))
  );

  const blogEntries: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: 'monthly' as MetadataRoute.Sitemap[number]['changeFrequency'],
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/blog/${post.slug}`])
        ),
      },
    }))
  );

  return [...staticEntries, ...productEntries, ...blogEntries];
}
