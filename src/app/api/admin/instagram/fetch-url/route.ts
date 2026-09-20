import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// Token gerektirmeyen basit yol: Instagram post sayfasinin HTML'inden
// og:image / og:description meta taglarini okuyup gorseli kendi
// Storage'imiza re-host eder. Resmi API degil — sadece admin'in kendi
// hesabindan tek tek link yapistirarak tetikledigi manuel bir aksiyon.

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function isInstagramPostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)instagram\.com$/.test(parsed.hostname)) return false;
    return /\/(p|reel)\/[^/]+/.test(parsed.pathname);
  } catch {
    return false;
  }
}

function extractMetaContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(re);
  return match ? match[1] : null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// og:description formati genelde: 'X Likes, Y Comments - username on Instagram: "caption metni"'
function parseCaption(ogDescription: string | null): string {
  if (!ogDescription) return "";
  const decoded = decodeHtmlEntities(ogDescription);
  const quoted = decoded.match(/:\s*"([\s\S]*)"\s*$/);
  return quoted ? quoted[1] : decoded;
}

async function rehostImage(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
  });
  if (!res.ok) throw new Error(`Görsel indirilemedi: ${res.status}`);

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

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { url } = await request.json();
  if (!url || typeof url !== "string" || !isInstagramPostUrl(url)) {
    return NextResponse.json(
      { error: "Geçerli bir Instagram gönderi linki girin (instagram.com/p/... veya /reel/...)" },
      { status: 400 }
    );
  }

  const pageRes = await fetch(url, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
    redirect: "follow",
  });

  if (!pageRes.ok) {
    return NextResponse.json(
      { error: `Instagram sayfası alınamadı (${pageRes.status})` },
      { status: 502 }
    );
  }

  const html = await pageRes.text();
  const ogImage = extractMetaContent(html, "og:image");
  const ogDescription = extractMetaContent(html, "og:description");

  if (!ogImage) {
    return NextResponse.json(
      {
        error:
          "Görsel bulunamadı — Instagram bu isteği engellemiş olabilir (giriş duvarı). Görseli manuel indirip yüklemeyi deneyin.",
      },
      { status: 502 }
    );
  }

  let hostedImageUrl: string;
  try {
    hostedImageUrl = await rehostImage(decodeHtmlEntities(ogImage));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Görsel aktarımı başarısız";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    images: [hostedImageUrl],
    caption: parseCaption(ogDescription),
  });
}
