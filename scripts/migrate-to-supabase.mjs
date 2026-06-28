import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = "https://tphxrtxzkvivjkxoeujm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHhydHh6a3ZpdmpreG9ldWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODUwMzMsImV4cCI6MjA5NzM2MTAzM30._Eu5dVQGdJEZLydPbsFu0qpCSAHP5su5LFKAdgIM86A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const products = JSON.parse(
  readFileSync(join(__dirname, "../data/products.json"), "utf-8")
);

console.log(`Taşınacak ürün: ${products.length}`);

const rows = products.map((p) => ({
  id: p.id,
  slug: p.slug || p.id,
  name: p.name,
  category: p.category,
  images: p.images?.length ? p.images : [p.image],
  image: p.image,
  wholesale: p.wholesale ?? true,
  retail: p.retail ?? true,
  featured: p.featured ?? false,
  content: p.content,
  meta_title: p.metaTitle ?? null,
  meta_description: p.metaDescription ?? null,
  translation_status: p.translationStatus ?? "completed",
}));

const { data, error } = await supabase
  .from("products")
  .upsert(rows, { onConflict: "id" });

if (error) {
  console.error("HATA:", error.message, error.details);
  process.exit(1);
}

const { count } = await supabase
  .from("products")
  .select("*", { count: "exact", head: true });

console.log(`Supabase'deki toplam ürün: ${count}`);
console.log(
  count === products.length
    ? "✓ Migration başarılı — sayılar eşleşiyor"
    : `✗ UYARI: JSON'da ${products.length}, Supabase'de ${count}`
);
