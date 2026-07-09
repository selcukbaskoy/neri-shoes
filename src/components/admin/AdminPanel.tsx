"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Product, ProductCategory, PRODUCT_CATEGORIES, BlogPost, BlogCategory, BLOG_CATEGORIES } from "@/lib/types";
import AdminReviews from "./AdminReviews";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SIZES = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46];

type ImageItem =
  | { type: "existing"; url: string }
  | { type: "new"; file: File; previewUrl: string };

const EMPTY_PRODUCT_FORM = {
  id: "",
  name: "",
  category: "erkek" as ProductCategory,
  description: "",
  wholesale: true,
  retail: true,
  featured: false,
  is_active: true,
  sku: "",
  price: "",
  compareAtPrice: "",
  colorFamily: "",
  colorName: "",
  colorHex: "",
};

const EMPTY_BLOG_FORM = {
  id: "",
  title: "",
  excerpt: "",
  body: "",
  category: "genel" as BlogCategory,
};

export default function AdminPanel({
  initialProducts,
  initialBlogPosts,
}: {
  initialProducts: Product[];
  initialBlogPosts: BlogPost[];
}) {
  const t = useTranslations("admin");
  const tp = useTranslations("products");
  const tb = useTranslations("blog");
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"products" | "blog" | "stock" | "reviews">("products");

  // ─── Products state ───────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [processingProducts, setProcessingProducts] = useState(false);

  // ─── Blog state ───────────────────────────────────────────────────────────
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG_FORM);
  const [blogCoverFile, setBlogCoverFile] = useState<File | null>(null);
  const [blogCoverPreview, setBlogCoverPreview] = useState<string | null>(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [processingBlog, setProcessingBlog] = useState(false);

  // ─── Stock state ──────────────────────────────────────────────────────────
  const [allStocks, setAllStocks] = useState<Record<string, Record<number, number>>>({});
  const [stocksLoaded, setStocksLoaded] = useState(false);
  const [selectedStockProductId, setSelectedStockProductId] = useState<string>("");
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});
  const [savingStock, setSavingStock] = useState(false);

  // ─── Modal accordion + inline stock ──────────────────────────────────────
  const [accordionOpen, setAccordionOpen] = useState({ basic: true, pricing: true, regional: false, stock: false });
  const [modalStockInputs, setModalStockInputs] = useState<Record<number, string>>({});
  const [savingModalStock, setSavingModalStock] = useState(false);

  // ─── Regional prices ──────────────────────────────────────────────────────
  type RegionalPriceRow = { price: string; currency: string };
  const REGIONAL_LOCALES = [
    { code: "en", label: "English (EN)", defaultCurrency: "USD" },
    { code: "de", label: "Deutsch (DE)", defaultCurrency: "EUR" },
    { code: "it", label: "Italiano (IT)", defaultCurrency: "EUR" },
    { code: "ar", label: "العربية (AR)", defaultCurrency: "USD" },
    { code: "ru", label: "Русский (RU)", defaultCurrency: "RUB" },
  ];
  const emptyRegional = () =>
    Object.fromEntries(
      REGIONAL_LOCALES.map((l) => [l.code, { price: "", currency: l.defaultCurrency }])
    ) as Record<string, RegionalPriceRow>;
  const [regionalPrices, setRegionalPrices] = useState<Record<string, RegionalPriceRow>>(emptyRegional());
  const [savingRegional, setSavingRegional] = useState(false);

  // ─── Shared ────────────────────────────────────────────────────────────────
  const [notification, setNotification] = useState<{ text: string; type: "info" | "success" | "error" } | null>(null);

  const pendingProductCount = products.filter((p) => p.translationStatus === "pending").length;
  const pendingBlogCount = blogPosts.filter((p) => p.translationStatus === "pending").length;

  useEffect(() => {
    refetchAllStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function notify(text: string, type: "info" | "success" | "error" = "info") {
    setNotification({ text, type });
  }

  function toggleAccordion(key: keyof typeof accordionOpen) {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  // ─── Products ─────────────────────────────────────────────────────────────
  async function refetchProducts() {
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
  }

  function openAddProductForm() {
    setProductForm(EMPTY_PRODUCT_FORM);
    setImageItems([]);
    const emptyInputs: Record<number, string> = {};
    for (const size of SIZES) emptyInputs[size] = "0";
    setModalStockInputs(emptyInputs);
    setRegionalPrices(emptyRegional());
    setAccordionOpen({ basic: true, pricing: true, regional: false, stock: false });
    setNotification(null);
    setShowProductForm(true);
  }

  function openEditProductForm(product: Product) {
    setProductForm({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.content?.tr?.description ?? product.content?.tr?.shortDescription ?? "",
      wholesale: product.wholesale,
      retail: product.retail,
      featured: product.featured,
      is_active: product.is_active ?? true,
      sku: product.sku ?? "",
      price: product.price != null ? String(product.price) : "",
      compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
      colorFamily: product.colorFamily ?? "",
      colorName: product.colorName?.tr ?? "",
      colorHex: product.colorHex ?? "",
    });
    const existingUrls = product.images?.length ? product.images : [product.image];
    setImageItems(existingUrls.map((url) => ({ type: "existing" as const, url })));
    const existingStock = allStocks[product.id] ?? {};
    const stockInit: Record<number, string> = {};
    for (const size of SIZES) stockInit[size] = String(existingStock[size] ?? 0);
    setModalStockInputs(stockInit);
    // Load existing regional prices
    const rp = emptyRegional();
    setRegionalPrices(rp);
    setAccordionOpen({ basic: true, pricing: true, regional: false, stock: false });
    setNotification(null);
    setShowProductForm(true);
    fetch(`/api/admin/regional-prices?productId=${product.id}`)
      .then((r) => r.json())
      .then((rows: { locale_code: string; price: number; currency: string }[]) => {
        if (!Array.isArray(rows)) return;
        const updated = emptyRegional();
        rows.forEach((row) => {
          if (updated[row.locale_code] !== undefined) {
            updated[row.locale_code] = { price: String(row.price), currency: row.currency };
          }
        });
        setRegionalPrices(updated);
      })
      .catch(() => {});
  }

  function closeProductForm() {
    imageItems.forEach((item) => {
      if (item.type === "new") URL.revokeObjectURL(item.previewUrl);
    });
    setShowProductForm(false);
  }

  function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      alert(`Şu dosyalar 5MB limitini aşıyor:\n${oversized.map((f) => f.name).join("\n")}`);
    }
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE);
    const remaining = MAX_IMAGES - imageItems.length;
    if (valid.length > remaining) {
      alert(`Maksimum ${MAX_IMAGES} görsel yüklenebilir. ${remaining} tane daha ekleyebilirsiniz.`);
    }
    const toAdd = valid.slice(0, remaining);
    setImageItems((prev) => [
      ...prev,
      ...toAdd.map((file) => ({
        type: "new" as const,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImageItems((prev) => {
      const item = prev[index];
      if (item.type === "new") URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    setImageItems((prev) => {
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (imageItems.length === 0) {
      alert("En az 1 görsel eklemelisiniz.");
      return;
    }

    const priceVal = productForm.price.trim();
    const compareAtPriceVal = productForm.compareAtPrice.trim();
    if (priceVal && compareAtPriceVal) {
      const p = parseFloat(priceVal);
      const cp = parseFloat(compareAtPriceVal);
      if (!isNaN(p) && !isNaN(cp) && cp >= p) {
        alert("İndirimli fiyat, normal fiyattan düşük olmalıdır.");
        return;
      }
    }

    setSavingProduct(true);
    const formData = new FormData();
    formData.set("name", productForm.name);
    formData.set("category", productForm.category);
    formData.set("description", productForm.description);
    formData.set("wholesale", String(productForm.wholesale));
    formData.set("retail", String(productForm.retail));
    formData.set("featured", String(productForm.featured));
    formData.set("is_active", String(productForm.is_active));
    const skuVal = productForm.sku.trim();
    if (skuVal) formData.set("sku", skuVal);
    if (priceVal) formData.set("price", priceVal);
    if (compareAtPriceVal) formData.set("compareAtPrice", compareAtPriceVal);
    const colorFamilyVal = productForm.colorFamily.trim();
    if (colorFamilyVal) formData.set("colorFamily", colorFamilyVal);
    const colorNameVal = productForm.colorName.trim();
    if (colorNameVal) formData.set("colorName", colorNameVal);
    const colorHexVal = productForm.colorHex.trim();
    if (colorHexVal) formData.set("colorHex", colorHexVal);
    const imageOrder: (string | null)[] = imageItems.map((item) =>
      item.type === "existing" ? item.url : null
    );
    formData.set("imageOrder", JSON.stringify(imageOrder));
    imageItems.forEach((item) => {
      if (item.type === "new") formData.append("images", item.file);
    });
    try {
      if (productForm.id) {
        formData.set("id", productForm.id);
        const res = await fetch("/api/admin/products", { method: "PUT", body: formData });
        if (!res.ok) {
          notify("Ürün kaydedilemedi. Tekrar deneyin.", "error");
          setSavingProduct(false);
          return;
        }
      } else {
        const res = await fetch("/api/admin/products", { method: "POST", body: formData });
        if (!res.ok) {
          notify("Ürün eklenemedi. Tekrar deneyin.", "error");
          setSavingProduct(false);
          return;
        }
        const newProduct = await res.json();
        const hasStock = SIZES.some((s) => parseInt(modalStockInputs[s] || "0", 10) > 0);
        if (hasStock && newProduct?.id) {
          const entries = SIZES.map((size) => ({
            size,
            quantity: Math.max(0, parseInt(modalStockInputs[size] || "0", 10) || 0),
          }));
          await fetch("/api/admin/stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: newProduct.id, entries }),
          });
          await refetchAllStocks();
        }
        notify("Ürün eklendi! Çeviriler hazır olduğunda aşağıdaki butona basın.", "info");
      }
      setShowProductForm(false);
      await refetchProducts();
    } catch {
      notify("Bağlantı hatası. Tekrar deneyin.", "error");
    }
    setSavingProduct(false);
  }

  async function handleDeleteProduct(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    await refetchProducts();
  }

  async function handleSaveModalStock() {
    if (!productForm.id) return;
    setSavingModalStock(true);
    const entries = SIZES.map((size) => ({
      size,
      quantity: Math.max(0, parseInt(modalStockInputs[size] || "0", 10) || 0),
    }));
    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productForm.id, entries }),
      });
      if (res.ok) {
        await refetchAllStocks();
        notify("Stok kaydedildi!", "success");
      } else {
        notify("Stok kaydedilemedi.", "error");
      }
    } catch {
      notify("Bağlantı hatası.", "error");
    }
    setSavingModalStock(false);
  }

  async function handleSaveRegionalPrices() {
    if (!productForm.id) return;
    setSavingRegional(true);
    const prices = Object.entries(regionalPrices).map(([locale_code, row]) => ({
      locale_code,
      price: row.price,
      currency: row.currency,
    }));
    try {
      const res = await fetch("/api/admin/regional-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productForm.id, prices }),
      });
      if (res.ok) {
        notify("Bölgesel fiyatlar kaydedildi!", "success");
      } else {
        notify("Kaydedilemedi.", "error");
      }
    } catch {
      notify("Bağlantı hatası.", "error");
    }
    setSavingRegional(false);
  }

  async function handleProcessProductTranslations() {
    setProcessingProducts(true);
    try {
      const res = await fetch("/api/admin/process-translations", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        notify(`Çeviri hatası: ${data.error}`, "error");
      } else if (data.processed === 0) {
        notify("Bekleyen çeviri yok.", "success");
      } else {
        notify(
          data.remaining > 0
            ? `"${data.name}" çevrildi. Hâlâ ${data.remaining} ürün bekliyor — tekrar tıklayın.`
            : `"${data.name}" çevrildi. Tüm çeviriler tamamlandı!`,
          data.remaining > 0 ? "info" : "success"
        );
        await refetchProducts();
      }
    } catch {
      notify("Bağlantı hatası.", "error");
    }
    setProcessingProducts(false);
  }

  // ─── Blog ─────────────────────────────────────────────────────────────────
  async function refetchBlogPosts() {
    const res = await fetch("/api/admin/blog-posts");
    if (res.ok) setBlogPosts(await res.json());
  }

  function openAddBlogForm() {
    setBlogForm(EMPTY_BLOG_FORM);
    setBlogCoverFile(null);
    setBlogCoverPreview(null);
    setNotification(null);
    setShowBlogForm(true);
  }

  function openEditBlogForm(post: BlogPost) {
    setBlogForm({
      id: post.id,
      title: post.content?.tr?.title ?? "",
      excerpt: post.content?.tr?.excerpt ?? "",
      body: post.content?.tr?.body ?? "",
      category: post.category,
    });
    setBlogCoverFile(null);
    setBlogCoverPreview(post.coverImage ?? null);
    setNotification(null);
    setShowBlogForm(true);
  }

  function closeBlogForm() {
    if (blogCoverPreview && blogCoverFile) URL.revokeObjectURL(blogCoverPreview);
    setShowBlogForm(false);
  }

  function handleBlogCoverSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("Görsel 5MB limitini aşıyor.");
      return;
    }
    if (blogCoverFile && blogCoverPreview) URL.revokeObjectURL(blogCoverPreview);
    setBlogCoverFile(file);
    setBlogCoverPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function handleBlogSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingBlog(true);
    const formData = new FormData();
    formData.set("title", blogForm.title);
    formData.set("excerpt", blogForm.excerpt);
    formData.set("body", blogForm.body);
    formData.set("category", blogForm.category);
    if (blogCoverFile) formData.set("coverImage", blogCoverFile);
    if (blogForm.id) {
      formData.set("id", blogForm.id);
      const res = await fetch("/api/admin/blog-posts", { method: "PUT", body: formData });
      if (!res.ok) {
        notify("Kaydetme başarısız. Tekrar deneyin.", "error");
        setSavingBlog(false);
        return;
      }
    } else {
      const res = await fetch("/api/admin/blog-posts", { method: "POST", body: formData });
      if (!res.ok) {
        notify("Kaydetme başarısız. Tekrar deneyin.", "error");
        setSavingBlog(false);
        return;
      }
    }
    setShowBlogForm(false);
    await refetchBlogPosts();
    notify("Yazı taslak olarak kaydedildi. Çeviriler başlatılıyor...", "info");
    setSavingBlog(false);

    try {
      const tr = await fetch("/api/admin/process-blog-translations", { method: "POST" });
      const td = await tr.json();
      if (tr.ok && td.processed > 0) {
        await refetchBlogPosts();
        notify(`"${td.title}" çevrildi. Yayınlamak için "Yayınla" butonuna basın.`, "success");
      } else if (!tr.ok) {
        notify("Çeviri başlatılamadı. 'Blog Çevirilerini İşle' butonunu manuel kullanın.", "info");
      }
    } catch {
      notify("Çeviri başlatılamadı. 'Blog Çevirilerini İşle' butonunu manuel kullanın.", "info");
    }
  }

  async function handleDeleteBlog(id: string) {
    if (!window.confirm(t("confirmDeleteBlog"))) return;
    await fetch(`/api/admin/blog-posts?id=${id}`, { method: "DELETE" });
    await refetchBlogPosts();
  }

  async function handlePublishBlog(id: string, action: "publish" | "unpublish") {
    const res = await fetch(`/api/admin/blog-posts?action=${action}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      notify(
        action === "publish" ? "Yayınlama başarısız. Tekrar deneyin." : "Yayından kaldırma başarısız.",
        "error"
      );
      return;
    }
    notify(
      action === "publish" ? "Yazı yayınlandı!" : "Yazı yayından kaldırıldı.",
      action === "publish" ? "success" : "info"
    );
    await refetchBlogPosts();
  }

  async function handleProcessBlogTranslations() {
    setProcessingBlog(true);
    try {
      const res = await fetch("/api/admin/process-blog-translations", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        notify(`Çeviri hatası: ${data.error}`, "error");
      } else if (data.processed === 0) {
        notify("Bekleyen blog çevirisi yok.", "success");
      } else {
        notify(
          data.remaining > 0
            ? `"${data.title}" çevrildi. Hâlâ ${data.remaining} yazı bekliyor — tekrar tıklayın.`
            : `"${data.title}" çevrildi. Tüm blog çevirileri tamamlandı!`,
          data.remaining > 0 ? "info" : "success"
        );
        await refetchBlogPosts();
      }
    } catch {
      notify("Bağlantı hatası.", "error");
    }
    setProcessingBlog(false);
  }

  // ─── Stock ────────────────────────────────────────────────────────────────
  async function refetchAllStocks() {
    const res = await fetch("/api/admin/stock");
    if (res.ok) {
      const data = await res.json();
      setAllStocks(data.stocks ?? {});
    }
    setStocksLoaded(true);
  }

  function getStockTotal(productId: string): number {
    const stock = allStocks[productId];
    if (!stock) return 0;
    return Object.values(stock).reduce((sum, qty) => sum + qty, 0);
  }

  function handleSelectStockProduct(productId: string) {
    setSelectedStockProductId(productId);
    const existing = allStocks[productId] ?? {};
    const inputs: Record<number, string> = {};
    for (const size of SIZES) {
      inputs[size] = String(existing[size] ?? 0);
    }
    setStockInputs(inputs);
    setTimeout(() => {
      document.getElementById("stock-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function handleSaveStock() {
    if (!selectedStockProductId) return;
    setSavingStock(true);
    const entries = SIZES.map((size) => ({
      size,
      quantity: Math.max(0, parseInt(stockInputs[size] || "0", 10) || 0),
    }));
    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedStockProductId, entries }),
      });
      if (res.ok) {
        await refetchAllStocks();
        notify("Stok kaydedildi!", "success");
      } else {
        notify("Stok kaydedilemedi.", "error");
      }
    } catch {
      notify("Bağlantı hatası. Tekrar deneyin.", "error");
    }
    setSavingStock(false);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const notifColors = {
    info: "bg-blue-900/60 border-blue-500 text-blue-200",
    success: "bg-green-900/60 border-green-500 text-green-200",
    error: "bg-red-900/60 border-red-500 text-red-300",
  };

  const computedDiscount = (() => {
    const p = parseFloat(productForm.price);
    const cp = parseFloat(productForm.compareAtPrice);
    if (productForm.price && productForm.compareAtPrice && !isNaN(p) && !isNaN(cp) && p > 0 && cp > 0) {
      if (cp >= p) return { valid: false, pct: 0 };
      return { valid: true, pct: Math.round(((p - cp) / p) * 100) };
    }
    return null;
  })();

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="section-title">Admin Panel</h1>
        <button type="button" className="btn-primary" onClick={handleLogout}>
          {t("logout")}
        </button>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex gap-2 border-b border-[#222]">
        {(["products", "blog", "stock", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setNotification(null); }}
            className={`pb-3 px-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
              activeTab === tab
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab === "products"
              ? t("productsTabTitle")
              : tab === "blog"
              ? t("blogTabTitle")
              : tab === "stock"
              ? "Stok Yönetimi"
              : "Yorumlar"}
          </button>
        ))}
      </div>

      {notification && (
        <div className={`mb-6 rounded border px-4 py-3 text-sm ${notifColors[notification.type]}`}>
          {notification.text}
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-3 opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Products Tab ───────────────────────────────────────────────────── */}
      {activeTab === "products" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted">{products.length} ürün</span>
            <div className="flex flex-wrap gap-3">
              {pendingProductCount > 0 && (
                <button
                  type="button"
                  disabled={processingProducts}
                  onClick={handleProcessProductTranslations}
                  className="rounded border border-yellow-500 px-3 py-1.5 text-sm text-yellow-400 transition-colors hover:bg-yellow-500 hover:text-black disabled:opacity-50"
                >
                  {processingProducts ? "Çevriliyor..." : `⏳ Çevirileri İşle (${pendingProductCount})`}
                </button>
              )}
              <button type="button" className="btn-primary" onClick={openAddProductForm}>
                {t("addProduct")}
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <p className="text-muted">{t("noProducts")}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#222]">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-muted">
                  <tr>
                    <th className="p-3">{t("tableImage")}</th>
                    <th className="p-3">{t("tableName")}</th>
                    <th className="p-3">{t("tableCategory")}</th>
                    <th className="p-3">{t("tableType")}</th>
                    <th className="p-3">{t("tableFeatured")}</th>
                    <th className="p-3">Fiyat</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3 text-right">{t("tableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-t border-[#222] transition-opacity ${
                        product.is_active === false ? "opacity-50" : ""
                      }`}
                    >
                      <td className="p-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded object-cover"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {product.name}
                          {product.translationStatus === "pending" && (
                            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">
                              Çeviri Bekliyor
                            </span>
                          )}
                          {product.is_active === false && (
                            <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                              Pasif
                            </span>
                          )}
                          {product.sku && (
                            <span className="text-[10px] text-muted/60">SKU: {product.sku}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 capitalize">{tp(`category${capitalize(product.category)}`)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {product.wholesale && <span className="badge">{tp("wholesale")}</span>}
                          {product.retail && <span className="badge">{tp("retail")}</span>}
                        </div>
                      </td>
                      <td className="p-3">{product.featured ? "✓" : "—"}</td>
                      <td className="p-3">
                        {product.price != null ? (
                          <div className="flex flex-col">
                            <span>{product.price.toLocaleString("tr-TR")} TL</span>
                            {product.discountPercentage ? (
                              <span className="text-[11px] text-green-400">%{product.discountPercentage} ind.</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {!stocksLoaded ? (
                          <span className="text-muted text-xs">...</span>
                        ) : getStockTotal(product.id) > 0 ? (
                          <span>{getStockTotal(product.id)} adet</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProductForm(product)}
                            className="rounded border border-accent px-3 py-1 text-accent transition-colors hover:bg-accent hover:text-black"
                          >
                            {t("edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="rounded border border-red-500 px-3 py-1 text-red-500 transition-colors hover:bg-red-500 hover:text-black"
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── Blog Tab ────────────────────────────────────────────────────────── */}
      {activeTab === "blog" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted">{blogPosts.length} yazı</span>
            <div className="flex flex-wrap gap-3">
              {pendingBlogCount > 0 && (
                <button
                  type="button"
                  disabled={processingBlog}
                  onClick={handleProcessBlogTranslations}
                  className="rounded border border-yellow-500 px-3 py-1.5 text-sm text-yellow-400 transition-colors hover:bg-yellow-500 hover:text-black disabled:opacity-50"
                >
                  {processingBlog ? "Çevriliyor..." : `⏳ Blog Çevirilerini İşle (${pendingBlogCount})`}
                </button>
              )}
              <button type="button" className="btn-primary" onClick={openAddBlogForm}>
                {t("addBlogPost")}
              </button>
            </div>
          </div>

          {blogPosts.length === 0 ? (
            <p className="text-muted">{t("noBlogPosts")}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#222]">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-muted">
                  <tr>
                    <th className="p-3">{t("blogTableTitle")}</th>
                    <th className="p-3">{t("blogTableCategory")}</th>
                    <th className="p-3">{t("blogTableStatus")}</th>
                    <th className="p-3 text-right">{t("blogTableActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {blogPosts.map((post) => (
                    <tr key={post.id} className="border-t border-[#222]">
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-clamp-1 max-w-[220px]">
                            {post.content?.tr?.title || "—"}
                          </span>
                          {post.translationStatus === "pending" && (
                            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-400">
                              Çeviri Bekliyor
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{tb(`category${capitalize(post.category)}`)}</td>
                      <td className="p-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            post.status === "published"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-[#333] text-muted"
                          }`}
                        >
                          {post.status === "published" ? t("statusPublished") : t("statusDraft")}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditBlogForm(post)}
                            className="rounded border border-accent px-3 py-1 text-accent transition-colors hover:bg-accent hover:text-black"
                          >
                            {t("edit")}
                          </button>
                          {post.status === "draft" ? (
                            <button
                              type="button"
                              onClick={() => handlePublishBlog(post.id, "publish")}
                              className="rounded border border-green-500 px-3 py-1 text-green-500 transition-colors hover:bg-green-500 hover:text-black"
                            >
                              {t("publish")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePublishBlog(post.id, "unpublish")}
                              className="rounded border border-[#555] px-3 py-1 text-muted transition-colors hover:bg-[#333]"
                            >
                              {t("unpublish")}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(post.id)}
                            className="rounded border border-red-500 px-3 py-1 text-red-500 transition-colors hover:bg-red-500 hover:text-black"
                          >
                            {t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─── Stock Tab ──────────────────────────────────────────────────────── */}
      {activeTab === "stock" && (
        <>
          {/* Editor */}
          <div id="stock-editor" className="mb-8 scroll-mt-4">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Numara Bazında Stok Gir</h2>
            <div className="card p-6">
              <label className="mb-2 block text-sm text-muted">Ürün Seç</label>
              <select
                value={selectedStockProductId}
                onChange={(e) => handleSelectStockProduct(e.target.value)}
                className="input-field mb-6 max-w-sm"
              >
                <option value="">— Ürün Seçin —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.colorName?.tr ? ` (${p.colorName.tr})` : ""}
                  </option>
                ))}
              </select>

              {selectedStockProductId && (
                <>
                  <table className="mb-6 text-sm">
                    <thead>
                      <tr className="border-b border-[#333]">
                        <th className="pb-2 pr-12 text-left text-muted">Numara</th>
                        <th className="pb-2 text-left text-muted">Stok Adedi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIZES.map((size) => (
                        <tr key={size} className="border-b border-[#1a1a1a]">
                          <td className="py-2 pr-12 font-medium text-foreground">{size}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              min="0"
                              value={stockInputs[size] ?? "0"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setStockInputs((prev) => ({ ...prev, [size]: val }));
                              }}
                              className="input-field w-24 py-1 text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    disabled={savingStock}
                    onClick={handleSaveStock}
                    className="btn-primary disabled:opacity-40"
                  >
                    {savingStock ? "Kaydediliyor..." : "Stok Kaydet"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Overview table */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Tüm Ürünler Stok Durumu</h2>
            <div className="overflow-x-auto rounded-lg border border-[#222]">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-muted">
                  <tr>
                    <th className="p-3">Ürün</th>
                    <th className="p-3">Toplam Stok</th>
                    <th className="p-3">Stoklu Numaralar</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const total = getStockTotal(p.id);
                    const stockedSizes = SIZES.filter(
                      (s) => (allStocks[p.id]?.[s] ?? 0) > 0
                    )
                      .map((s) => `${s}(${allStocks[p.id][s]})`)
                      .join(", ");
                    return (
                      <tr key={p.id} className="border-t border-[#222]">
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleSelectStockProduct(p.id)}
                            className="text-accent hover:underline"
                          >
                            {p.name}
                            {p.colorName?.tr ? (
                              <span className="ml-1 text-muted/60">({p.colorName.tr})</span>
                            ) : null}
                          </button>
                        </td>
                        <td className="p-3">
                          {total > 0 ? (
                            `${total} adet`
                          ) : (
                            <span className="text-muted">0</span>
                          )}
                        </td>
                        <td className="p-3">
                          {stockedSizes || <span className="text-muted">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Reviews Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "reviews" && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Yorum Moderasyonu</h2>
            <p className="text-xs text-muted">Onaysız yorumlar siteye yansımaz.</p>
          </div>
          <AdminReviews />
        </>
      )}

      {/* ─── Product Form Modal ───────────────────────────────────────────────── */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-8">
          <form
            onSubmit={handleProductSubmit}
            className="card mb-8 w-full max-w-4xl p-6"
          >
            <h2 className="mb-5 text-xl font-semibold text-accent">
              {productForm.id ? t("editProduct") : t("addProduct")}
            </h2>

            {/* Section 1: Temel Bilgiler */}
            <AccordionSection
              title="Temel Bilgiler"
              isOpen={accordionOpen.basic}
              onToggle={() => toggleAccordion("basic")}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted">{t("nameLabel")}</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">{t("categoryLabel")}</label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value as ProductCategory })
                    }
                    className="input-field"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {tp(`category${capitalize(cat)}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">
                  {t("imageLabel")}{" "}
                  <span className="text-xs opacity-60">
                    ({imageItems.length}/{MAX_IMAGES}) — İlk görsel kapak fotoğrafı
                  </span>
                </label>
                {imageItems.length > 0 && (
                  <div className="mb-3 grid grid-cols-5 gap-2 sm:grid-cols-8">
                    {imageItems.map((item, i) => {
                      const src = item.type === "existing" ? item.url : item.previewUrl;
                      return (
                        <div
                          key={i}
                          className={`relative overflow-hidden rounded border-2 ${
                            i === 0 ? "border-yellow-400" : "border-[#333]"
                          }`}
                        >
                          {i === 0 && (
                            <span className="absolute left-0 top-0 z-10 rounded-br bg-yellow-400 px-1 text-[9px] font-bold leading-tight text-black">
                              Kapak
                            </span>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-16 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/70 text-[10px] text-white hover:bg-red-600"
                          >
                            ✕
                          </button>
                          <div className="flex justify-center gap-1 bg-[#111] py-0.5">
                            <button
                              type="button"
                              onClick={() => moveImage(i, -1)}
                              disabled={i === 0}
                              className="px-1.5 text-xs text-muted hover:text-white disabled:opacity-20"
                            >
                              ←
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(i, 1)}
                              disabled={i === imageItems.length - 1}
                              className="px-1.5 text-xs text-muted hover:text-white disabled:opacity-20"
                            >
                              →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {imageItems.length < MAX_IMAGES && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="input-field"
                  />
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted">{t("descriptionLabel")}</label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="input-field min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-muted">{t("colorFamilyLabel")}</label>
                  <input
                    type="text"
                    list="colorFamilyList"
                    value={productForm.colorFamily}
                    onChange={(e) => setProductForm({ ...productForm, colorFamily: e.target.value })}
                    placeholder="örn: NS-Runner-314"
                    className="input-field"
                  />
                  <datalist id="colorFamilyList">
                    {Array.from(new Set(products.map((p) => p.colorFamily).filter((f): f is string => !!f))).map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                  <p className="mt-1 text-[11px] text-muted/60">NS-{"{MODEL}"} formatı önerilir.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">{t("colorNameLabel")}</label>
                  <input
                    type="text"
                    value={productForm.colorName}
                    onChange={(e) => setProductForm({ ...productForm, colorName: e.target.value })}
                    placeholder="örn: Siyah"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="block text-sm text-muted">{t("colorHexLabel")}</label>
                <input
                  type="color"
                  value={productForm.colorHex || "#000000"}
                  onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={productForm.colorHex}
                  onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                  placeholder="#000000"
                  className="input-field max-w-[120px]"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
              {(() => {
                const familyPreview = productForm.colorFamily
                  ? products.filter((p) => p.colorFamily === productForm.colorFamily && p.id !== productForm.id)
                  : [];
                if (familyPreview.length === 0) return null;
                return (
                  <div className="rounded border border-[#333] bg-[#111] p-3">
                    <p className="mb-2 text-xs text-muted">{t("familyPreviewLabel")}</p>
                    <div className="flex flex-wrap gap-2">
                      {familyPreview.map((p) => (
                        <span key={p.id} className="rounded bg-[#222] px-2 py-1 text-xs text-foreground">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </AccordionSection>

            {/* Section 2: Fiyat & Satış */}
            <AccordionSection
              title="Fiyat & Satış"
              isOpen={accordionOpen.pricing}
              onToggle={() => toggleAccordion("pricing")}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-muted">Normal Fiyat (TL)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="örn: 3000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted">İndirimli Fiyat (TL)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.compareAtPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, compareAtPrice: e.target.value })
                    }
                    placeholder="örn: 1800"
                    className="input-field"
                  />
                </div>
              </div>
              {computedDiscount?.valid && (
                <p className="text-xs text-green-400">
                  Bu fiyatlarla %{computedDiscount.pct} indirim gösterilecek
                </p>
              )}
              {computedDiscount && !computedDiscount.valid && (
                <p className="text-xs text-red-400">
                  İndirimli fiyat normal fiyattan düşük olmalı
                </p>
              )}

              <div>
                <label className="mb-1 block text-sm text-muted">SKU (Stok Kodu)</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="örn: NRS-2024-001"
                  className="input-field max-w-xs"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={productForm.wholesale}
                    onChange={(e) =>
                      setProductForm({ ...productForm, wholesale: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#FFD000]"
                  />
                  {t("wholesaleLabel")}
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={productForm.retail}
                    onChange={(e) =>
                      setProductForm({ ...productForm, retail: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#FFD000]"
                  />
                  {t("retailLabel")}
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) =>
                      setProductForm({ ...productForm, featured: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#FFD000]"
                  />
                  {t("featuredLabel")}
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(e) =>
                      setProductForm({ ...productForm, is_active: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#FFD000]"
                  />
                  <span>
                    Aktif{" "}
                    <span className="text-[11px] text-muted/60">
                      (işaretsiz = sitede gizlenir)
                    </span>
                  </span>
                </label>
              </div>
            </AccordionSection>

            {/* Section 3: Bölgesel Fiyatlandırma */}
            <AccordionSection
              title="Bölgesel Fiyatlandırma"
              isOpen={accordionOpen.regional}
              onToggle={() => toggleAccordion("regional")}
            >
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  Boş bırakılan diller için otomatik döviz çevirisi kullanılır.
                </p>
                {REGIONAL_LOCALES.map((loc) => (
                  <div key={loc.code} className="grid grid-cols-[1fr_120px_80px] gap-2 items-center">
                    <label className="text-xs font-medium text-muted">{loc.label}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="—"
                      value={regionalPrices[loc.code]?.price ?? ""}
                      onChange={(e) =>
                        setRegionalPrices((prev) => ({
                          ...prev,
                          [loc.code]: { ...prev[loc.code], price: e.target.value },
                        }))
                      }
                      className="rounded border border-[#333] bg-[#111] px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
                    />
                    <select
                      value={regionalPrices[loc.code]?.currency ?? loc.defaultCurrency}
                      onChange={(e) =>
                        setRegionalPrices((prev) => ({
                          ...prev,
                          [loc.code]: { ...prev[loc.code], currency: e.target.value },
                        }))
                      }
                      className="rounded border border-[#333] bg-[#111] px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
                    >
                      {["USD", "EUR", "GBP", "RUB", "AED", "SAR", "TRY"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {productForm.id && (
                  <button
                    type="button"
                    disabled={savingRegional}
                    onClick={handleSaveRegionalPrices}
                    className="btn-primary mt-2 disabled:opacity-40"
                  >
                    {savingRegional ? "Kaydediliyor..." : "Bölgesel Fiyatları Kaydet"}
                  </button>
                )}
                {!productForm.id && (
                  <p className="text-xs text-muted/60">Ürünü önce kaydedin, sonra bölgesel fiyat ekleyin.</p>
                )}
              </div>
            </AccordionSection>

            {/* Section 4: Stok */}
            <AccordionSection
              title="Stok"
              isOpen={accordionOpen.stock}
              onToggle={() => toggleAccordion("stock")}
            >
              {!productForm.id ? (
                <p className="text-sm text-muted/70">
                  Stok girişi için önce ürünü kaydedin, ardından tekrar düzenleyin.
                </p>
              ) : (
                <>
                  <table className="text-sm">
                    <thead>
                      <tr className="border-b border-[#333]">
                        <th className="pb-2 pr-12 text-left text-muted">Numara</th>
                        <th className="pb-2 text-left text-muted">Stok Adedi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SIZES.map((size) => (
                        <tr key={size} className="border-b border-[#1a1a1a]">
                          <td className="py-2 pr-12 font-medium text-foreground">{size}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              min="0"
                              value={modalStockInputs[size] ?? "0"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setModalStockInputs((prev) => ({ ...prev, [size]: val }));
                              }}
                              className="input-field w-24 py-1 text-center"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    disabled={savingModalStock}
                    onClick={handleSaveModalStock}
                    className="btn-primary disabled:opacity-40"
                  >
                    {savingModalStock ? "Kaydediliyor..." : "Stok Kaydet"}
                  </button>
                </>
              )}
            </AccordionSection>

            <div className="mt-2 flex justify-end gap-3">
              <button type="button" onClick={closeProductForm} className="btn-primary">
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={savingProduct}
                className="btn-whatsapp"
              >
                {savingProduct ? "Kaydediliyor..." : t("save")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Blog Form Modal ─────────────────────────────────────────────────── */}
      {showBlogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleBlogSubmit}
            className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
          >
            <h2 className="mb-4 text-xl font-semibold text-accent">
              {blogForm.id ? t("editBlogPost") : t("addBlogPost")}
            </h2>

            <label className="mb-1 block text-sm text-muted">{t("blogTitleLabel")}</label>
            <input
              type="text"
              required
              value={blogForm.title}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
              className="input-field mb-4"
            />

            <label className="mb-1 block text-sm text-muted">{t("blogCategoryLabel")}</label>
            <select
              value={blogForm.category}
              onChange={(e) =>
                setBlogForm({ ...blogForm, category: e.target.value as BlogCategory })
              }
              className="input-field mb-4"
            >
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {tb(`category${capitalize(cat)}`)}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-sm text-muted">{t("blogExcerptLabel")}</label>
            <textarea
              required
              value={blogForm.excerpt}
              onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
              className="input-field mb-4 min-h-16"
              rows={3}
            />

            <label className="mb-1 block text-sm text-muted">{t("blogBodyLabel")}</label>
            <textarea
              required
              value={blogForm.body}
              onChange={(e) => setBlogForm({ ...blogForm, body: e.target.value })}
              className="input-field mb-4 min-h-48"
              rows={12}
            />

            <label className="mb-2 block text-sm text-muted">{t("blogCoverLabel")}</label>
            {blogCoverPreview && (
              <div className="mb-3 overflow-hidden rounded border border-[#333]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={blogCoverPreview} alt="Cover preview" className="h-40 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    if (blogCoverFile && blogCoverPreview) URL.revokeObjectURL(blogCoverPreview);
                    setBlogCoverFile(null);
                    setBlogCoverPreview(null);
                  }}
                  className="w-full bg-[#111] py-1 text-xs text-muted hover:text-red-400"
                >
                  Görseli Kaldır
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBlogCoverSelect}
              className="input-field mb-6"
            />

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeBlogForm} className="btn-primary">
                {t("cancel")}
              </button>
              <button type="submit" disabled={savingBlog} className="btn-whatsapp">
                {savingBlog ? "Kaydediliyor..." : t("save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-[#2a2a2a]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-[#1a1a1a] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-[#222]"
      >
        <span>{title}</span>
        <span className="text-xs text-muted">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && <div className="space-y-4 p-4">{children}</div>}
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
