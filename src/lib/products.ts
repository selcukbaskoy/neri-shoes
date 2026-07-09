import { unstable_noStore as noStore } from "next/cache";
import { supabase, supabaseAdmin } from "./supabase";
import { Product, ProductContent, Locale, ProductCategory, ColorSibling } from "./types";

function mapRow(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    slug: (row.slug as string) || (row.id as string),
    name: row.name as string,
    category: row.category as ProductCategory,
    images: (row.images as string[]) || [],
    image: row.image as string,
    wholesale: row.wholesale as boolean,
    retail: row.retail as boolean,
    featured: row.featured as boolean,
    content: row.content as Product["content"],
    metaTitle: row.meta_title as Product["metaTitle"],
    metaDescription: row.meta_description as Product["metaDescription"],
    translationStatus: row.translation_status as Product["translationStatus"],
    price: row.price != null ? Number(row.price) : null,
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    discountPercentage: row.discount_percentage != null ? Number(row.discount_percentage) : null,
    sku: row.sku != null ? String(row.sku) : null,
    is_active: row.is_active !== false,
    colorFamily: row.color_family != null ? String(row.color_family) : null,
    colorName: row.color_name as Product["colorName"] ?? null,
    colorHex: row.color_hex != null ? String(row.color_hex) : null,
  };
}

function toRow(p: Product) {
  return {
    id: p.id,
    slug: p.slug || p.id,
    name: p.name,
    category: p.category,
    images: p.images?.length ? p.images : [p.image],
    image: p.image,
    wholesale: p.wholesale,
    retail: p.retail,
    featured: p.featured,
    content: p.content,
    meta_title: p.metaTitle ?? null,
    meta_description: p.metaDescription ?? null,
    translation_status: p.translationStatus ?? "completed",
    price: p.price ?? null,
    compare_at_price: p.compareAtPrice ?? null,
    discount_percentage: p.discountPercentage ?? null,
    sku: p.sku ?? null,
    is_active: p.is_active ?? true,
    color_family: p.colorFamily ?? null,
    color_name: p.colorName ?? null,
    color_hex: p.colorHex ?? null,
  };
}

export async function getProducts(): Promise<Product[]> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

function deduplicateByColorFamily(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (!p.colorFamily) return true; // Tekil ürünler aynen kalır
    if (seen.has(p.colorFamily)) return false; // Aile zaten temsil ediliyor
    seen.add(p.colorFamily);
    return true; // İlk temsilci tutulur
  });
}

export async function getActiveProducts(): Promise<Product[]> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return deduplicateByColorFamily((data ?? []).map(mapRow));
}

export async function getActiveProductImages(limit = 12): Promise<string[]> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("image")
    .eq("is_active", true)
    .not("image", "is", null)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.image as string).filter(Boolean);
}

function hasStock(row: Record<string, unknown>): boolean {
  const stocks = (row.product_stock as Array<{ quantity: number }>) ?? [];
  return stocks.reduce((sum, s) => sum + (s.quantity ?? 0), 0) > 0;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  noStore();

  // Priority 1: admin-curated featured products with stock > 0 (discounted first)
  const { data: featuredData, error: e1 } = await supabase
    .from("products")
    .select("*, product_stock(quantity)")
    .eq("featured", true)
    .eq("is_active", true)
    .order("compare_at_price", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (e1) throw new Error(e1.message);

  const featuredProducts = deduplicateByColorFamily(
    (featuredData ?? []).filter(hasStock).map(mapRow)
  );
  if (featuredProducts.length >= limit) return featuredProducts.slice(0, limit);

  // Priority 2: fill remaining slots with in-stock discounted active products
  const needed = limit - featuredProducts.length;
  const excludeIds = featuredProducts.map((p) => p.id);

  const fillerBase = supabase
    .from("products")
    .select("*, product_stock(quantity)")
    .eq("featured", false)
    .eq("is_active", true)
    .not("compare_at_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(needed + 8);

  const { data: fillerData, error: e2 } = excludeIds.length > 0
    ? await fillerBase.not("id", "in", `(${excludeIds.join(",")})`)
    : await fillerBase;
  if (e2) throw new Error(e2.message);

  const fillerProducts = (fillerData ?? []).filter(hasStock).map(mapRow);
  const combined = [...featuredProducts, ...fillerProducts];
  return deduplicateByColorFamily(combined).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data) : undefined;
}

export async function getSimilarProducts(category: ProductCategory, excludeId: string, limit = 4): Promise<Product[]> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_stock(quantity)")
    .eq("category", category)
    .eq("is_active", true)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit + 4);

  if (error) throw new Error(error.message);
  return deduplicateByColorFamily((data ?? []).filter(hasStock).map(mapRow)).slice(0, limit);
}

export async function getColorFamily(family: string, excludeId: string): Promise<ColorSibling[]> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, color_name, color_hex, images, product_stock(quantity)")
    .eq("color_family", family)
    .eq("is_active", true)
    .neq("id", excludeId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Record<string, unknown>) => {
    const stocks = (row.product_stock as Array<{ quantity: number }>) ?? [];
    const inStock = stocks.reduce((sum, s) => sum + (s.quantity ?? 0), 0) > 0;
    return {
      id: row.id as string,
      slug: row.slug as string,
      name: row.name as string,
      colorName: row.color_name as Partial<Record<Locale, string>> | null,
      colorHex: row.color_hex as string | null,
      images: (row.images as string[]) || [],
      inStock,
    };
  });
}

export async function saveProduct(product: Product): Promise<void> {
  const { error } = await supabaseAdmin
    .from("products")
    .upsert(toRow(product), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function updateProduct(product: Product): Promise<void> {
  const { error } = await supabaseAdmin
    .from("products")
    .update(toRow(product))
    .eq("id", product.id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function getProductContent(product: Product, locale: Locale): ProductContent {
  return product.content[locale] ?? product.content["tr"];
}

export function getProductMeta(product: Product, locale: Locale) {
  return {
    title: product.metaTitle?.[locale] ?? product.metaTitle?.["tr"] ?? "",
    description: product.metaDescription?.[locale] ?? product.metaDescription?.["tr"] ?? "",
  };
}
