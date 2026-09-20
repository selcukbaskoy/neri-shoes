import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Instagram CDN URL'inden indirip Supabase Storage'a re-host eder.
// Hotlink YOK — IG CDN linkleri sureli/kararsiz oldugu icin her zaman kendi storage'imiza tasiriz.
async function rehostImage(igUrl: string): Promise<string> {
  const res = await fetch(igUrl);
  if (!res.ok) throw new Error(`Instagram gorseli indirilemedi: ${res.status}`);

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const filename = `instagram/${randomUUID()}.${ext}`;
  const buffer = await res.arrayBuffer();

  const { error } = await supabase.storage
    .from("products")
    .upload(filename, buffer, { contentType });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from("products").getPublicUrl(filename);
  return data.publicUrl;
}

// POST { id } — taslagi al, gorselleri re-host et, status='imported' isaretle, { images, caption } don
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  }

  const { data: draft, error: fetchError } = await supabaseAdmin
    .from("instagram_imports")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !draft) {
    return NextResponse.json({ error: "taslak bulunamadi" }, { status: 404 });
  }

  let images: string[];
  try {
    images = await Promise.all(
      (draft.image_urls as string[]).map((url: string) => rehostImage(url))
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "gorsel aktarimi basarisiz";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("instagram_imports")
    .update({ status: "imported" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ images, caption: draft.caption || "" });
}
