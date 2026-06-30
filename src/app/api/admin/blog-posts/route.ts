import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getBlogPosts, saveBlogPost, updateBlogPost, deleteBlogPost, publishBlogPost, unpublishBlogPost } from "@/lib/blog";
import { BlogPost, BlogPostContent, BLOG_CATEGORIES, BlogCategory, Locale } from "@/lib/types";

const LOCALES: Locale[] = ["tr", "en", "de", "it", "ar", "ru"];

function generateSlug(title: string): string {
  // Unicode escapes avoid source-file encoding ambiguity for Turkish chars
  const map: [string, string][] = [
    ["ç", "c"], ["Ç", "c"], // ç Ç
    ["ğ", "g"], ["Ğ", "g"], // ğ Ğ
    ["ı", "i"], ["İ", "i"], // ı İ
    ["ö", "o"], ["Ö", "o"], // ö Ö
    ["ş", "s"], ["Ş", "s"], // ş Ş
    ["ü", "u"], ["Ü", "u"], // ü Ü
  ];
  let slug = title.toLowerCase();
  // split/join avoids RegExp constructor issues with non-ASCII keys
  for (const [k, v] of map) slug = slug.split(k).join(v);
  // NFD strip handles any remaining diacritics (ç→c etc. as fallback)
  slug = slug.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return slug.replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  const posts = await getBlogPosts();
  const others = posts.filter((p) => p.id !== excludeId);
  if (!others.some((p) => p.slug === slug)) return slug;
  let n = 2;
  while (others.some((p) => p.slug === `${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

async function uploadCoverImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `blog/${randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("products")
    .upload(filename, buffer, { contentType: file.type || "image/jpeg" });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from("products").getPublicUrl(filename);
  return data.publicUrl;
}

function isValidCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.includes(value as BlogCategory);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const posts = await getBlogPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "");
  const body = String(formData.get("body") || "");
  const excerpt = String(formData.get("excerpt") || body.slice(0, 160));
  const categoryRaw = String(formData.get("category") || "genel");
  const category = isValidCategory(categoryRaw) ? categoryRaw : "genel";

  let coverImage: string | null = null;
  const imageFile = formData.get("coverImage") as File | null;
  if (imageFile && imageFile.size > 0) {
    coverImage = await uploadCoverImage(imageFile);
  }

  const rawSlug = generateSlug(title) || randomUUID();
  const id = rawSlug;
  const slug = await ensureUniqueSlug(rawSlug);

  const trContent: BlogPostContent = { title, body, excerpt };
  const emptyContent: BlogPostContent = { title: "", body: "", excerpt: "" };
  const content = Object.fromEntries(LOCALES.map((l) => [l, l === "tr" ? trContent : { ...emptyContent }])) as Record<Locale, BlogPostContent>;

  const trMetaTitle = `${title} | Neri Shoes Blog`;
  const trMetaDesc = excerpt.slice(0, 155);
  const metaTitle = Object.fromEntries(LOCALES.map((l) => [l, trMetaTitle])) as Record<Locale, string>;
  const metaDescription = Object.fromEntries(LOCALES.map((l) => [l, trMetaDesc])) as Record<Locale, string>;

  const newPost: BlogPost = {
    id,
    slug,
    coverImage,
    category,
    status: "draft",
    content,
    metaTitle,
    metaDescription,
    translationStatus: "pending",
    publishedAt: null,
    createdAt: new Date().toISOString(),
  };

  await saveBlogPost(newPost);
  return NextResponse.json(newPost, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // Publish / unpublish actions
  if (action === "publish" || action === "unpublish") {
    const { id } = await request.json() as { id: string };
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
    if (action === "publish") {
      await publishBlogPost(id);
    } else {
      await unpublishBlogPost(id);
    }
    return NextResponse.json({ success: true });
  }

  // Edit post
  const formData = await request.formData();
  const id = String(formData.get("id") || "");
  const posts = await getBlogPosts();
  const existing = posts.find((p) => p.id === id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const title = String(formData.get("title") || "");
  const body = String(formData.get("body") || "");
  const excerpt = String(formData.get("excerpt") || body.slice(0, 160));
  const categoryRaw = String(formData.get("category") || "genel");
  const category = isValidCategory(categoryRaw) ? categoryRaw : "genel";

  let coverImage = existing.coverImage;
  const imageFile = formData.get("coverImage") as File | null;
  if (imageFile && imageFile.size > 0) {
    coverImage = await uploadCoverImage(imageFile);
  }

  const titleChanged = title !== (existing.content?.tr?.title ?? "");
  const bodyChanged = body !== (existing.content?.tr?.body ?? "");
  const contentChanged = titleChanged || bodyChanged;

  let content = existing.content;
  let metaTitle = existing.metaTitle;
  let metaDescription = existing.metaDescription;

  if (contentChanged) {
    const trContent: BlogPostContent = { title, body, excerpt };
    const emptyContent: BlogPostContent = { title: "", body: "", excerpt: "" };
    content = Object.fromEntries(LOCALES.map((l) => [l, l === "tr" ? trContent : { ...emptyContent }])) as Record<Locale, BlogPostContent>;
    const trMeta = `${title} | Neri Shoes Blog`;
    metaTitle = Object.fromEntries(LOCALES.map((l) => [l, trMeta])) as Record<Locale, string>;
    metaDescription = Object.fromEntries(LOCALES.map((l) => [l, excerpt.slice(0, 155)])) as Record<Locale, string>;
  }

  const updated: BlogPost = {
    ...existing,
    coverImage,
    category,
    content,
    metaTitle,
    metaDescription,
    translationStatus: contentChanged ? "pending" : existing.translationStatus,
  };

  await updateBlogPost(updated);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await deleteBlogPost(id);
  return NextResponse.json({ success: true });
}
