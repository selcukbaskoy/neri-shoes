import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchInstagramMedia } from "@/lib/instagram";

// GET — bekleyen taslaklari listele
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("instagram_imports")
    .select("*")
    .eq("status", "pending")
    .order("ig_timestamp", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST — Instagram Graph API'den yeni postlari cekip taslak kuyruguna ekle (upsert, dedupe)
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let posts;
  try {
    posts = await fetchInstagramMedia();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Instagram sync basarisiz";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (posts.length === 0) {
    return NextResponse.json({ synced: 0 });
  }

  const rows = posts.map((post) => ({
    ig_media_id: post.ig_media_id,
    permalink: post.permalink,
    caption: post.caption,
    media_type: post.media_type,
    image_urls: post.image_urls,
    ig_timestamp: post.timestamp,
  }));

  const { error } = await supabaseAdmin
    .from("instagram_imports")
    .upsert(rows, { onConflict: "ig_media_id", ignoreDuplicates: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ synced: rows.length });
}

// DELETE — taslagi reddet (siler degil, status='rejected' isaretler)
export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("instagram_imports")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
