import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getBlogPosts, updateBlogPost } from "@/lib/blog";
import { translateBlogContent, translateBlogMeta } from "@/lib/translate";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const posts = await getBlogPosts();
  const pending = posts.filter((p) => p.translationStatus === "pending");

  if (pending.length === 0) {
    return NextResponse.json({ processed: 0, remaining: 0 });
  }

  const post = pending[0];
  const trContent = post.content?.["tr"] ?? { title: "", body: "", excerpt: "" };

  try {
    const [content, { metaTitle, metaDescription }] = await Promise.all([
      translateBlogContent(trContent),
      translateBlogMeta(trContent.title, trContent.excerpt || trContent.body.slice(0, 160)),
    ]);

    await updateBlogPost({
      ...post,
      content: content as typeof post.content,
      metaTitle: metaTitle as typeof post.metaTitle,
      metaDescription: metaDescription as typeof post.metaDescription,
      translationStatus: "completed",
    });

    return NextResponse.json({
      processed: 1,
      remaining: pending.length - 1,
      title: trContent.title,
    });
  } catch (err) {
    console.error("Blog translation error for", post.id, err);
    return NextResponse.json({ error: "translation_failed", title: trContent.title }, { status: 500 });
  }
}
