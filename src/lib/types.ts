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

// ============================================================
// Müşteri Paneli Tipleri (Adım 1+)
// ============================================================

export interface Customer {
  id: string;
  auth_user_id?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  created_at?: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  title: string;
  full_address: string;
  city: string;
  district: string;
  postal_code?: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  customer_id?: string | null;
  order_id?: string | null;
  rating: number; // 1-5
  comment?: string | null;
  media_urls?: string[] | null;
  status: "pending" | "approved" | "rejected";
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;
  // Join fields (API'den populate edilir)
  customer_name?: string;
  product_name?: string;
  verified?: boolean; // order_id dolu mu
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  max_uses?: number | null;
  used_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  order_id?: string | null;
  customer_id?: string | null;
  discount_amount: number;
  created_at?: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  size?: number | null;
  email: string;
  notified: boolean;
  created_at?: string;
}

export interface PostPurchaseCheckin {
  id: string;
  order_id: string;
  scheduled_at: string;
  sent_at?: string | null;
  response?: "memnun" | "memnun_degil" | "yanitsiz" | null;
  review_invited: boolean;
  created_at?: string;
}

// Order zaten mevcut, ama alanları güncelleyelim (runtime)
export interface OrderData {
  id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_district?: string | null;
  total_amount: number;
  discount_amount?: number;
  status: string;
  payment_provider?: string | null;
  iyzico_token?: string | null;
  coupon_id?: string | null;
  customer_id?: string | null;
  created_at?: string;
}

export interface OrderItemData {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  size: number;
  quantity: number;
  unit_price: number;
}

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
