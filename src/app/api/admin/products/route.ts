import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getProducts, saveProduct, updateProduct, deleteProduct } from "@/lib/products";
import { Product, ProductContent, PRODUCT_CATEGORIES, ProductCategory } from "@/lib/types";
import { ContentBlock } from "@/lib/translate";

const EMPTY_CONTENT: ProductContent = { shortDescription: "", description: "", features: [], styling: [] };
const EMPTY_MULTILINGUAL = { tr: EMPTY_CONTENT, en: EMPTY_CONTENT, de: EMPTY_CONTENT, it: EMPTY_CONTENT, ar: EMPTY_CONTENT, ru: EMPTY_CONTENT };

// --- Slug ---

function generateSlug(name: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i",
    İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  let slug = name.toLowerCase();
  Object.entries(map).forEach(([k, v]) => {
    slug = slug.replace(new RegExp(k, "g"), v);
  });
  return slug.replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  const products = await getProducts();
  const others = products.filter((p) => p.id !== excludeId);
  if (!others.some((p) => p.slug === slug)) return slug;
  let n = 2;
  while (others.some((p) => p.slug === `${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

// --- Image upload to Supabase Storage ---

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("products")
    .upload(filename, buffer, { contentType: file.type || "image/jpeg" });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from("products").getPublicUrl(filename);
  return data.publicUrl;
}

async function buildImagesArray(formData: FormData): Promise<string[]> {
  const imageOrderRaw = formData.get("imageOrder") as string | null;
  const newFiles = formData.getAll("images") as File[];

  if (imageOrderRaw) {
    const imageOrder: (string | null)[] = JSON.parse(imageOrderRaw);
    let fi = 0;
    const images: string[] = [];
    for (const slot of imageOrder) {
      if (slot === null) {
        const file = newFiles[fi++];
        if (file && file.size > 0) images.push(await uploadImage(file));
      } else {
        images.push(slot);
      }
    }
    return images;
  }

  const images: string[] = [];
  for (const file of newFiles) {
    if (file && file.size > 0) images.push(await uploadImage(file));
  }
  return images;
}

// --- Category guard ---

function isValidCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

// --- Handlers ---

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const category = String(formData.get("category") || "");
  if (!isValidCategory(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  let images = await buildImagesArray(formData);
  if (images.length === 0) {
    const single = formData.get("image") as File | null;
    if (single && single.size > 0) images = [await uploadImage(single)];
    else images = ["/products/model-1.svg"];
  }

  const name = String(formData.get("name") || "");
  const rawSlug = generateSlug(name) || randomUUID();
  const slug = await ensureUniqueSlug(rawSlug);

  const description = String(formData.get("description") || "");
  const trContent: ContentBlock = { shortDescription: "", description, features: [], styling: [] };

  const fallbackContent = {
    tr: trContent,
    en: { ...trContent }, de: { ...trContent }, it: { ...trContent },
    ar: { ...trContent }, ru: { ...trContent },
  };

  const trMetaTitle = `${name} Erkek Ayakkabı | Neri Shoes`;
  const trMetaDesc = `${description.slice(0, 100)} | Neri Shoes erkek ayakkabı koleksiyonu.`.slice(0, 155);
  const fallbackMeta = {
    metaTitle: { tr: trMetaTitle, en: trMetaTitle, de: trMetaTitle, it: trMetaTitle, ar: trMetaTitle, ru: trMetaTitle },
    metaDescription: { tr: trMetaDesc, en: trMetaDesc, de: trMetaDesc, it: trMetaDesc, ar: trMetaDesc, ru: trMetaDesc },
  };

  const priceRaw = formData.get("price");
  const compareAtPriceRaw = formData.get("compareAtPrice");
  const price = priceRaw && String(priceRaw).trim() !== "" ? Number(priceRaw) : null;
  const compareAtPriceNum = compareAtPriceRaw && String(compareAtPriceRaw).trim() !== "" ? Number(compareAtPriceRaw) : null;
  const compareAtPrice = compareAtPriceNum != null && compareAtPriceNum > 0 ? compareAtPriceNum : null;
  const discountPercentage =
    price != null && compareAtPrice != null && price > compareAtPrice
      ? Math.round(((price - compareAtPrice) / price) * 100)
      : null;

  const skuRaw = formData.get("sku");
  const isActiveRaw = formData.get("is_active");

  const colorFamilyRaw = formData.get("colorFamily");
  const colorNameRaw = formData.get("colorName");
  const colorHexRaw = formData.get("colorHex");

  const colorFamily = colorFamilyRaw && String(colorFamilyRaw).trim() ? String(colorFamilyRaw).trim() : null;
  const colorName = colorNameRaw && String(colorNameRaw).trim() ? { tr: String(colorNameRaw).trim() } : null;
  const colorHex = colorHexRaw && String(colorHexRaw).trim() ? String(colorHexRaw).trim() : null;

  const newProduct: Product = {
    id: slug,
    slug,
    name,
    category,
    images,
    image: images[0],
    wholesale: formData.get("wholesale") === "true",
    retail: formData.get("retail") === "true",
    featured: formData.get("featured") === "true",
    content: fallbackContent as Record<"tr" | "en" | "de" | "it" | "ar" | "ru", ProductContent>,
    metaTitle: fallbackMeta.metaTitle as Record<"tr" | "en" | "de" | "it" | "ar" | "ru", string>,
    metaDescription: fallbackMeta.metaDescription as Record<"tr" | "en" | "de" | "it" | "ar" | "ru", string>,
    translationStatus: "pending",
    price,
    compareAtPrice,
    discountPercentage,
    sku: skuRaw && String(skuRaw).trim() ? String(skuRaw).trim() : null,
    is_active: isActiveRaw !== null ? isActiveRaw === "true" : true,
    colorFamily,
    colorName,
    colorHex,
  };

  await saveProduct(newProduct);
  return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const id = String(formData.get("id") || "");
  const products = await getProducts();
  const existing = products.find((p) => p.id === id);
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const category = String(formData.get("category") || "");
  if (!isValidCategory(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  let images = await buildImagesArray(formData);
  if (images.length === 0) {
    const single = formData.get("image") as File | null;
    if (single && single.size > 0) images = [await uploadImage(single)];
    else images = existing.images?.length ? existing.images : [existing.image];
  }

  const name = String(formData.get("name") || "");
  const description = String(formData.get("description") || "");
  const prevDesc = existing.content?.tr?.description ?? "";
  const descriptionChanged = description !== prevDesc;

  let content = existing.content as unknown as Record<string, ContentBlock>;
  let metaTitle = existing.metaTitle as unknown as Record<string, string>;
  let metaDescription = existing.metaDescription as unknown as Record<string, string>;

  if (descriptionChanged) {
    const trContent: ContentBlock = {
      shortDescription: existing.content?.tr?.shortDescription ?? "",
      description,
      features: existing.content?.tr?.features ?? [],
      styling: existing.content?.tr?.styling ?? [],
    };
    const trMeta = `${name} Erkek Ayakkabı | Neri Shoes`;
    const trMetaDesc = `${description.slice(0, 100)} | Neri Shoes erkek ayakkabı koleksiyonu.`.slice(0, 155);
    content = { tr: trContent, en: { ...trContent }, de: { ...trContent }, it: { ...trContent }, ar: { ...trContent }, ru: { ...trContent } };
    metaTitle = { tr: trMeta, en: trMeta, de: trMeta, it: trMeta, ar: trMeta, ru: trMeta };
    metaDescription = { tr: trMetaDesc, en: trMetaDesc, de: trMetaDesc, it: trMetaDesc, ar: trMetaDesc, ru: trMetaDesc };
  }

  const putPriceRaw = formData.get("price");
  const putCompareAtPriceRaw = formData.get("compareAtPrice");
  const putPrice = putPriceRaw && String(putPriceRaw).trim() !== "" ? Number(putPriceRaw) : null;
  const putCompareAtPriceNum = putCompareAtPriceRaw && String(putCompareAtPriceRaw).trim() !== "" ? Number(putCompareAtPriceRaw) : null;
  const putCompareAtPrice = putCompareAtPriceNum != null && putCompareAtPriceNum > 0 ? putCompareAtPriceNum : null;
  const putDiscountPercentage =
    putPrice != null && putCompareAtPrice != null && putPrice > putCompareAtPrice
      ? Math.round(((putPrice - putCompareAtPrice) / putPrice) * 100)
      : null;

  const putSkuRaw = formData.get("sku");
  const putIsActiveRaw = formData.get("is_active");

  const putColorFamilyRaw = formData.get("colorFamily");
  const putColorNameRaw = formData.get("colorName");
  const putColorHexRaw = formData.get("colorHex");

  const putColorFamily = putColorFamilyRaw && String(putColorFamilyRaw).trim() ? String(putColorFamilyRaw).trim() : null;
  const putColorName = putColorNameRaw && String(putColorNameRaw).trim() ? { tr: String(putColorNameRaw).trim() } : null;
  const putColorHex = putColorHexRaw && String(putColorHexRaw).trim() ? String(putColorHexRaw).trim() : null;

  const updated: Product = {
    ...existing,
    name,
    category,
    images,
    image: images[0],
    wholesale: formData.get("wholesale") === "true",
    retail: formData.get("retail") === "true",
    featured: formData.get("featured") === "true",
    content: content as Record<"tr" | "en" | "de" | "it" | "ar" | "ru", ProductContent>,
    metaTitle: metaTitle as Record<"tr" | "en" | "de" | "it" | "ar" | "ru", string>,
    metaDescription: metaDescription as Record<"tr" | "en" | "de" | "it" | "ar" | "ru", string>,
    translationStatus: descriptionChanged ? "pending" : existing.translationStatus,
    price: putPrice,
    compareAtPrice: putCompareAtPrice,
    discountPercentage: putDiscountPercentage,
    sku: putSkuRaw && String(putSkuRaw).trim() ? String(putSkuRaw).trim() : null,
    is_active: putIsActiveRaw !== null ? putIsActiveRaw === "true" : (existing.is_active ?? true),
    colorFamily: putColorFamily,
    colorName: putColorName,
    colorHex: putColorHex,
  };

  await updateProduct(updated);
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  await deleteProduct(id);
  return NextResponse.json({ success: true });
}
