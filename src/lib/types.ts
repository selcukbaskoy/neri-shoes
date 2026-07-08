export type ProductCategory = "erkek" | "spor" | "klasik" | "gunluk";
export type Locale = "tr" | "en" | "de" | "it" | "ar" | "ru";

export interface ProductContent {
  shortDescription: string;
  description: string;
  features: string[];
  styling: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  images: string[];
  image: string;
  wholesale: boolean;
  retail: boolean;
  featured: boolean;
  content: Record<Locale, ProductContent>;
  metaTitle: Record<Locale, string>;
  metaDescription: Record<Locale, string>;
  translationStatus?: "pending" | "completed";
  price?: number | null;
  compareAtPrice?: number | null;
  discountPercentage?: number | null;
  sku?: string | null;
  is_active?: boolean;
  colorFamily?: string | null;
  colorName?: Partial<Record<Locale, string>> | null;
  colorHex?: string | null;
}

export interface ColorSibling {
  id: string;
  slug: string;
  name: string;
  colorName?: Partial<Record<Locale, string>> | null;
  colorHex?: string | null;
  images: string[];
  inStock: boolean;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "erkek",
  "spor",
  "klasik",
  "gunluk",
];

export type BlogCategory = "bakim" | "stil" | "uretim" | "genel";
export const BLOG_CATEGORIES: BlogCategory[] = ["bakim", "stil", "uretim", "genel"];

export interface BlogPostContent {
  title: string;
  body: string;
  excerpt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  coverImage: string | null;
  category: BlogCategory;
  status: "draft" | "published";
  content: Record<Locale, BlogPostContent>;
  metaTitle: Record<Locale, string>;
  metaDescription: Record<Locale, string>;
  translationStatus: "pending" | "completed";
  publishedAt: string | null;
  createdAt: string;
}
