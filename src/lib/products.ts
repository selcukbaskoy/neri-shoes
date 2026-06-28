import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "./supabase";
import { Product, ProductContent, Locale, ProductCategory } from "./types";

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

export async function getActiveProducts(): Promise<Product[]> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  noStore();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
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

export async function saveProduct(product: Product): Promise<void> {
  const { error } = await supabase
    .from("products")
    .upsert(toRow(product), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function updateProduct(product: Product): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update(toRow(product))
    .eq("id", product.id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
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
