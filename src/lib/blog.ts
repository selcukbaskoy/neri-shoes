import { unstable_noStore as noStore } from "next/cache";
import { supabase, supabaseAdmin } from "./supabase";
import { BlogPost, BlogPostContent, BlogCategory, Locale } from "./types";

function mapRow(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    slug: row.slug as string,
    coverImage: row.cover_image as string | null,
    category: row.category as BlogCategory,
    status: row.status as "draft" | "published",
    content: (row.content as Record<Locale, BlogPostContent>) ?? {},
    metaTitle: (row.meta_title as Record<Locale, string>) ?? {},
    metaDescription: (row.meta_description as Record<Locale, string>) ?? {},
    translationStatus: (row.translation_status as "pending" | "completed") ?? "pending",
    publishedAt: row.published_at as string | null,
    createdAt: row.created_at as string,
  };
}

function toRow(p: BlogPost) {
  return {
    id: p.id,
    slug: p.slug,
    cover_image: p.coverImage ?? null,
    category: p.category,
    status: p.status,
    content: p.content,
    meta_title: p.metaTitle ?? null,
    meta_description: p.metaDescription ?? null,
    translation_status: p.translationStatus ?? "pending",
    published_at: p.publishedAt ?? null,
  };
}

// Admin-only: returns ALL posts including drafts (bypasses RLS via service_role key)
export async function getBlogPosts(): Promise<BlogPost[]> {
  noStore();
  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  noStore();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  noStore();
  // .eq() is parameterized — safe with any character including non-ASCII
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data) : undefined;
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  const { error } = await supabaseAdmin
    .from("blog_posts")
    .upsert(toRow(post), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function updateBlogPost(post: BlogPost): Promise<void> {
  const { error } = await supabaseAdmin
    .from("blog_posts")
    .update(toRow(post))
    .eq("id", post.id);
  if (error) throw new Error(error.message);
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function publishBlogPost(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("blog_posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function unpublishBlogPost(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("blog_posts")
    .update({ status: "draft", published_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export function getBlogContent(post: BlogPost, locale: Locale): BlogPostContent {
  const c = post.content[locale];
  if (!c || !c.title) return post.content["tr"] ?? { title: "", body: "", excerpt: "" };
  return c;
}

export function getBlogMeta(post: BlogPost, locale: Locale) {
  return {
    title: post.metaTitle?.[locale] || post.metaTitle?.["tr"] || "",
    description: post.metaDescription?.[locale] || post.metaDescription?.["tr"] || "",
  };
}
