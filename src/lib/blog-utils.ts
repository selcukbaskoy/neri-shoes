import { BlogPost, BlogPostContent, Locale } from "./types";

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
