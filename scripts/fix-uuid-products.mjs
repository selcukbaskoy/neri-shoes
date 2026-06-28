// Migration: UUID id/slug → name-based slugs + Google Translate content
import { translate } from "@vitalets/google-translate-api";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = join(__dirname, "../data/products.json");

const LANGS = ["en", "de", "it", "ar", "ru"];

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tr(text, to) {
  if (!text?.trim()) return text || "";
  try {
    const r = await translate(text, { from: "tr", to });
    return r.text;
  } catch {
    return text;
  }
}

function generateSlug(name) {
  const map = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i",
    İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  let slug = name.toLowerCase();
  for (const [k, v] of Object.entries(map)) slug = slug.replaceAll(k, v);
  return slug.replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function ensureUniqueSlug(slug, products, excludeId) {
  const others = products.filter((p) => p.id !== excludeId);
  if (!others.some((p) => p.slug === slug)) return slug;
  let n = 2;
  while (others.some((p) => p.slug === `${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const products = JSON.parse(readFileSync(PRODUCTS_PATH, "utf-8"));
  const uuids = products.filter((p) => UUID_RE.test(p.id));

  if (uuids.length === 0) {
    console.log("UUID ürün bulunamadı, işlem yok.");
    return;
  }

  console.log(`${uuids.length} UUID ürün bulundu:`, uuids.map((p) => `${p.id} → ${p.name}`));

  for (const product of uuids) {
    console.log(`\nDüzeltiliyor: "${product.name}" (${product.id})`);

    const rawSlug = generateSlug(product.name);
    const newSlug = ensureUniqueSlug(rawSlug, products, product.id);
    console.log(`  Slug: ${product.id} → ${newSlug}`);

    const trContent = product.content?.tr ?? {
      shortDescription: "",
      description: "",
      features: [],
      styling: [],
    };

    const content = { tr: trContent };

    for (const lang of LANGS) {
      console.log(`  Çevriliyor: ${lang}...`);
      try {
        const shortDescription = await tr(trContent.shortDescription, lang);
        await delay(300);
        const description = await tr(trContent.description, lang);
        await delay(300);
        const features = [];
        for (const f of trContent.features || []) {
          features.push(await tr(f, lang));
          await delay(200);
        }
        const styling = [];
        for (const s of trContent.styling || []) {
          styling.push(await tr(s, lang));
          await delay(200);
        }
        content[lang] = { shortDescription, description, features, styling };
      } catch (err) {
        console.warn(`  [UYARI] ${lang} çevirisi başarısız, TR fallback kullanılıyor:`, err.message);
        content[lang] = { ...trContent };
      }
    }

    // metaTitle / metaDescription
    const metaTitle = { tr: `${product.name} Erkek Ayakkabı | Neri Shoes` };
    const metaDescription = {
      tr: `${trContent.shortDescription || trContent.description || product.name} | Neri Shoes erkek ayakkabı koleksiyonu.`.slice(0, 155),
    };

    const META_SUFFIX = {
      en: "Men's Shoes | Neri Shoes",
      de: "Herrenschuhe | Neri Shoes",
      it: "Scarpe Uomo | Neri Shoes",
      ar: "أحذية رجالية | Neri Shoes",
      ru: "Мужская обувь | Neri Shoes",
    };

    for (const lang of LANGS) {
      try {
        const tName = await tr(product.name, lang);
        await delay(200);
        const tDesc = await tr(trContent.shortDescription || trContent.description || product.name, lang);
        await delay(200);
        metaTitle[lang] = `${tName} ${META_SUFFIX[lang]}`;
        metaDescription[lang] = `${tDesc} | Neri Shoes.`.slice(0, 155);
      } catch {
        metaTitle[lang] = metaTitle.tr;
        metaDescription[lang] = metaDescription.tr;
      }
    }

    // Ürünü güncelle
    const idx = products.findIndex((p) => p.id === product.id);
    products[idx] = {
      ...products[idx],
      id: newSlug,
      slug: newSlug,
      content,
      metaTitle,
      metaDescription,
    };

    console.log(`  ✓ "${product.name}" → slug: "${newSlug}" tamamlandı.`);
  }

  writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf-8");
  console.log(`\nproducts.json güncellendi. ${uuids.length} ürün düzeltildi.`);
}

main().catch(console.error);
