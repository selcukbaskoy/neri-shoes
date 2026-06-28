/**
 * save-blog-draft.mjs
 *
 * claude-blog → Supabase bridge.
 * Usage:
 *   node scripts/save-blog-draft.mjs \
 *     --title "Deri Ayakkabı Nasıl Temizlenir?" \
 *     --excerpt "Kısa özet..." \
 *     --body "Yazı içeriği..." \
 *     --category bakim \
 *     [--slug ozel-slug]
 *
 * Categories: bakim | stil | uretim | genel
 *
 * Writes a draft blog post to Supabase blog_posts table.
 * translationStatus = "pending" — admin panel ile çeviriyi tetikleyin.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VALID_CATEGORIES = ["bakim", "stil", "uretim", "genel"];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      args[key] = value;
    }
  }
  return args;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.title || !args.body || !args.excerpt) {
    console.error("❌  Required: --title, --body, --excerpt");
    console.error("   Optional: --category (bakim|stil|uretim|genel), --slug");
    process.exit(1);
  }

  const category = args.category || "genel";
  if (!VALID_CATEGORIES.includes(category)) {
    console.error(`❌  Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`);
    process.exit(1);
  }

  const slug = args.slug || `${slugify(args.title)}-${Date.now()}`;

  const emptyLocaleContent = { title: "", body: "", excerpt: "" };
  const emptyMeta = { tr: "", en: "", de: "", it: "", ar: "", ru: "" };

  const post = {
    slug,
    cover_image: null,
    category,
    status: "draft",
    content: {
      tr: { title: args.title, body: args.body, excerpt: args.excerpt },
      en: emptyLocaleContent,
      de: emptyLocaleContent,
      it: emptyLocaleContent,
      ar: emptyLocaleContent,
      ru: emptyLocaleContent,
    },
    meta_title: emptyMeta,
    meta_description: emptyMeta,
    translation_status: "pending",
    published_at: null,
  };

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(post)
    .select("id, slug")
    .single();

  if (error) {
    console.error("❌  Supabase insert failed:", error.message);
    process.exit(1);
  }

  console.log("✅  Blog draft saved!");
  console.log(`   ID:   ${data.id}`);
  console.log(`   Slug: ${data.slug}`);
  console.log(`   Category: ${category}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Admin paneli aç → Blog Yönetimi");
  console.log("  2. Yazıyı gör, düzenle");
  console.log("  3. '⏳ Blog Çevirilerini İşle' butonuna bas (6 dile çevirir)");
  console.log("  4. 'Yayınla' butonuna bas");
}

main().catch((err) => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});
