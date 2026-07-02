/**
 * Neri Shoes — Uçtan Uca Alışveriş Akışı Testi
 *
 * Senaryo:
 *   beforeAll : Test ürünü + stok DB'ye eklenir, eski test siparişleri temizlenir
 *   test      : Ana sayfa → Ürünler → Ürün Detay → Sepet → Ödeme Formu
 *               → Dev-mode onay → Sipariş + Stok doğrulaması
 *   afterAll  : Test ürünü, stok ve siparişler DB'den silinir
 *
 * Çalıştırmak için:
 *   npm run test:e2e               # headless Chrome
 *   npm run test:e2e:headed        # görünür tarayıcı
 *   npm run test:e2e:ui            # Playwright UI modu
 *
 * NOT: IYZICO_API_KEY ve IYZICO_SECRET_KEY .env.local'da boş olmalı → dev modu devreye girer.
 *      Prod ortamında BASE_URL=https://nerishoes.com.tr ile çalıştırın ve iyzico sandbox
 *      anahtarlarını .env.local'a ekleyin — dev modu devre dışı olur.
 */

import { test, expect, Page } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import path from "path";
import { config as loadEnv } from "dotenv";

// .env.local'ı spec dosyasından da yükle (config dışı çalışma durumları için)
loadEnv({ path: path.resolve(__dirname, "../../.env.local") });

// ─────────────────────────────────────────────
// Sabitler
// ─────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_PRODUCT_ID = "e2e-test-ayakkabi-001";
const TEST_SLUG = "e2e-test-ayakkabi";
const TEST_PRODUCT_NAME = "E2E Test Ayakkabısı";
const TEST_SIZE = 42;
const INITIAL_STOCK = 5;
const TEST_PRICE = 1299; // TL
const TEST_EMAIL = "e2e-test@nerishoes.test";

// ─────────────────────────────────────────────
// Supabase admin istemcisi (test yardımcıları için)
// ─────────────────────────────────────────────
function makeAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik. " +
        ".env.local dosyasını kontrol edin."
    );
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

// ─────────────────────────────────────────────
// Test paketi
// ─────────────────────────────────────────────
test.describe("Alışveriş Akışı E2E", () => {
  let db: SupabaseClient;

  // ── Setup ──────────────────────────────────
  test.beforeAll(async () => {
    db = makeAdmin();

    console.log("\n[Setup] Test verileri hazırlanıyor...");

    // Eski test siparişlerini temizle
    const { data: staleOrders } = await db
      .from("orders")
      .select("id")
      .eq("customer_email", TEST_EMAIL);

    if (staleOrders?.length) {
      for (const o of staleOrders) {
        await db.from("order_items").delete().eq("order_id", o.id);
      }
      await db.from("orders").delete().eq("customer_email", TEST_EMAIL);
      console.log(`[Setup] ${staleOrders.length} eski test siparişi temizlendi.`);
    }

    // Test ürününü upsert et
    const { error: productErr } = await db.from("products").upsert(
      {
        id: TEST_PRODUCT_ID,
        slug: TEST_SLUG,
        name: TEST_PRODUCT_NAME,
        category: "klasik",
        image: "/logo.jpeg",
        images: ["/logo.jpeg"],
        wholesale: false,
        retail: true,
        featured: false,
        is_active: true,
        price: TEST_PRICE,
        compare_at_price: null,
        discount_percentage: null,
        sku: "E2E-TEST-001",
        translation_status: "completed",
        content: {
          tr: {
            shortDescription: "Playwright E2E testi için eklendi",
            description: "Bu ürün otomatik test amaçlıdır, gerçek bir ürün değildir.",
            features: ["Test özelliği 1", "Test özelliği 2"],
            styling: [],
          },
          en: {
            shortDescription: "Added for Playwright E2E test",
            description: "This product is for automated testing purposes only.",
            features: ["Test feature 1", "Test feature 2"],
            styling: [],
          },
          de: { shortDescription: "E2E-Test", description: "E2E Testprodukt", features: [], styling: [] },
          it: { shortDescription: "Test E2E", description: "Prodotto E2E test", features: [], styling: [] },
          ar: { shortDescription: "اختبار E2E", description: "منتج اختبار", features: [], styling: [] },
          ru: { shortDescription: "E2E тест", description: "Тестовый продукт", features: [], styling: [] },
        },
        meta_title: {
          tr: "E2E Test Ayakkabısı",
          en: "E2E Test Shoe",
          de: "E2E Testschuh",
          it: "Scarpa E2E Test",
          ar: "حذاء E2E",
          ru: "E2E тестовая обувь",
        },
        meta_description: {
          tr: "Playwright E2E test ürünü",
          en: "Playwright E2E test product",
          de: "Playwright E2E Testprodukt",
          it: "Prodotto Playwright E2E",
          ar: "منتج Playwright E2E",
          ru: "Продукт Playwright E2E",
        },
      },
      { onConflict: "id" }
    );
    if (productErr) throw new Error(`[Setup] Ürün eklenemedi: ${productErr.message}`);
    console.log(`[Setup] ✓ Test ürünü oluşturuldu: ${TEST_PRODUCT_ID}`);

    // Mevcut stok kaydını sil, taze ekle (idempotent garantisi)
    await db
      .from("product_stock")
      .delete()
      .eq("product_id", TEST_PRODUCT_ID)
      .eq("size", TEST_SIZE);

    const { error: stockErr } = await db.from("product_stock").insert({
      product_id: TEST_PRODUCT_ID,
      size: TEST_SIZE,
      quantity: INITIAL_STOCK,
    });
    if (stockErr) throw new Error(`[Setup] Stok eklenemedi: ${stockErr.message}`);
    console.log(
      `[Setup] ✓ Stok oluşturuldu: numara ${TEST_SIZE}, adet ${INITIAL_STOCK}`
    );
  });

  // ── Teardown ────────────────────────────────
  test.afterAll(async () => {
    console.log("\n[Teardown] Test verileri temizleniyor...");

    const { data: orders } = await db
      .from("orders")
      .select("id")
      .eq("customer_email", TEST_EMAIL);

    if (orders?.length) {
      for (const o of orders) {
        await db.from("order_items").delete().eq("order_id", o.id);
      }
      await db.from("orders").delete().eq("customer_email", TEST_EMAIL);
      console.log(`[Teardown] ✓ ${orders.length} test siparişi silindi.`);
    }

    await db.from("product_stock").delete().eq("product_id", TEST_PRODUCT_ID);
    await db.from("products").delete().eq("id", TEST_PRODUCT_ID);
    console.log("[Teardown] ✓ Test ürünü ve stoğu silindi.");
  });

  // ── Ana Test ───────────────────────────────
  test("Ana sayfadan sipariş onayına kadar tam akış", async ({ page }) => {
    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 1 — Ürünler sayfasına navigasyon  ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("\n[Adım 1] Ürünler sayfasına gidiliyor...");
    await page.goto(`${BASE_URL}/tr/urunler`);
    await page.waitForLoadState("networkidle");
    console.log("[Adım 1] ✓ /tr/urunler yüklendi");

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 2 — Test ürününü bul ve tıkla     ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 2] Test ürünü katalogda aranıyor...");
    // Ürün kartı doğrudan slug ile bulunur — metni bağımsız locator olarak kullan
    const productLink = page.locator(`a[href*="${TEST_SLUG}"]`).first();
    await expect(productLink).toBeVisible({ timeout: 15_000 });
    console.log(`[Adım 2] ✓ Test ürünü bulundu, tıklanıyor...`);
    await productLink.click();

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 3 — Ürün detay sayfası & numara   ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 3] Ürün detay sayfası bekleniyor...");
    await page.waitForURL(`**/${TEST_SLUG}**`, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    console.log("[Adım 3] ✓ Ürün detay sayfası yüklendi");

    // Numara seç
    const sizeButton = page.getByRole("button", {
      name: String(TEST_SIZE),
      exact: true,
    });
    await expect(sizeButton).toBeVisible({ timeout: 10_000 });
    await sizeButton.click();
    console.log(`[Adım 3] ✓ Numara seçildi: ${TEST_SIZE}`);

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 4 — Sepete ekle                   ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 4] Ürün sepete ekleniyor...");
    const addToCartBtn = page.getByRole("button", { name: "Sepete Ekle" });
    await expect(addToCartBtn).toBeEnabled({ timeout: 5_000 });
    await addToCartBtn.click();

    // Toast mesajını doğrula
    await expect(page.getByText("Sepete eklendi")).toBeVisible({ timeout: 8_000 });
    console.log("[Adım 4] ✓ Sepete eklendi toast'u görüntülendi");

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 5 — Sepet panelini aç             ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 5] Sepet paneli açılıyor...");
    const cartIcon = page.locator('[aria-label="Cart"]').first();
    await cartIcon.click();

    // Panelde ürün adını bekle
    await expect(page.getByText(TEST_PRODUCT_NAME)).toBeVisible({ timeout: 8_000 });
    console.log("[Adım 5] ✓ Sepet paneli açıldı, ürün görünüyor");

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 6 — Ödeme sayfasına geç           ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 6] Ödeme sayfasına geçiliyor...");
    // Sepet panelindeki "Ödemeye Geç" butonu
    await page.getByRole("button", { name: "Ödemeye Geç" }).click();

    await page.waitForURL("**/odeme**", { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    console.log("[Adım 6] ✓ Ödeme sayfasına ulaşıldı");

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 7 — Müşteri bilgi formunu doldur  ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 7] Müşteri bilgileri formu dolduruluyor...");

    await page.getByPlaceholder("Adınız").fill("Test");
    await page.getByPlaceholder("Soyadınız").fill("Kullanıcı");
    await page.getByPlaceholder("ornek@email.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("05XX XXX XX XX").fill("05001234567");
    await page
      .getByPlaceholder("Mahalle, Cadde, Sokak, Daire No")
      .fill("Test Mahallesi Test Sokak No:1 Daire:2");
    await page.getByPlaceholder("İstanbul").fill("İstanbul");
    await page.getByPlaceholder("Kadıköy").fill("Kadıköy");

    console.log("[Adım 7] ✓ Müşteri formu dolduruldu");

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 8 — Formu gönder                  ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 8] Ödeme formu gönderiliyor...");
    // Checkout sayfasındaki submit butonu
    await page.locator('button[type="submit"]').click();

    // Dev modu bekleniyor (iyzico keyleri boşsa bu görünür)
    await expect(page.getByText("Geliştirici Modu")).toBeVisible({ timeout: 15_000 });
    console.log("[Adım 8] ✓ Dev modu ödeme ekranı görüntülendi");

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 9 — Başarılı ödemi simüle et      ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 9] Başarılı ödeme simüle ediliyor...");
    const simulateBtn = page.getByRole("button", { name: /Simüle Et/ });
    await expect(simulateBtn).toBeVisible({ timeout: 5_000 });
    await simulateBtn.click();

    //
    // ╔══════════════════════════════════════════╗
    // ║  ADIM 10 — Sipariş onay ekranı          ║
    // ╚══════════════════════════════════════════╝
    //
    console.log("[Adım 10] Sipariş onay ekranı doğrulanıyor...");
    await expect(page.getByText("Siparişiniz Alındı")).toBeVisible({
      timeout: 10_000,
    });
    console.log("[Adım 10] ✅ SİPARİŞ ONAY EKRANI GÖRÜNTÜLENDI");

    // ────────────────────────────────────────────
    //  DB DOĞRULAMALARI
    // ────────────────────────────────────────────

    // DB yazma işleminin tamamlanması için kısa bekleme
    await page.waitForTimeout(1_500);

    await validateOrder(db, TEST_EMAIL, TEST_PRODUCT_ID, TEST_SIZE, TEST_PRICE);
    await validateStockDecrement(db, TEST_PRODUCT_ID, TEST_SIZE, INITIAL_STOCK);

    console.log("\n✅ TÜM E2E TEST ADIMLARI BAŞARIYLA TAMAMLANDI");
  });
});

// ─────────────────────────────────────────────
//  Yardımcı doğrulama fonksiyonları
// ─────────────────────────────────────────────

/**
 * orders ve order_items tablolarında test siparişinin doğru oluştuğunu kontrol eder.
 */
async function validateOrder(
  db: SupabaseClient,
  email: string,
  productId: string,
  size: number,
  expectedPrice: number
): Promise<void> {
  console.log("\n[DB Doğrulama 1] Sipariş kaydı kontrol ediliyor...");

  const { data: orders, error } = await db
    .from("orders")
    .select("id, status, total_amount, customer_email, customer_name")
    .eq("customer_email", email)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(`Sipariş sorgulanamadı: ${error.message}`);

  expect(orders, "orders tablosunda test siparişi bulunamadı").toHaveLength(1);
  const order = orders![0];

  expect(order.customer_email, "Müşteri e-postası hatalı").toBe(email);
  expect(order.total_amount, "Sipariş tutarı hatalı").toBe(expectedPrice);
  expect(
    ["pending", "paid"],
    "Sipariş durumu geçersiz"
  ).toContain(order.status);

  console.log(
    `[DB Doğrulama 1] ✓ Sipariş bulundu — ID: ${order.id} | Durum: ${order.status} | Tutar: ${order.total_amount} ₺`
  );

  // Sipariş kalemleri
  console.log("[DB Doğrulama 2] Sipariş kalemleri kontrol ediliyor...");

  const { data: items } = await db
    .from("order_items")
    .select("product_id, size, quantity, unit_price")
    .eq("order_id", order.id);

  expect(items, "order_items tablosunda kayıt bulunamadı").toHaveLength(1);
  expect(items![0].product_id, "Ürün ID'si hatalı").toBe(productId);
  expect(items![0].size, "Ayakkabı numarası hatalı").toBe(size);
  expect(items![0].quantity, "Adet hatalı").toBe(1);
  expect(items![0].unit_price, "Birim fiyat hatalı").toBe(expectedPrice);

  console.log(
    `[DB Doğrulama 2] ✓ Sipariş kalemi doğrulandı — Ürün: ${items![0].product_id} | No: ${items![0].size} | Adet: ${items![0].quantity}`
  );
}

/**
 * decrement_stock RPC'sini çalıştırarak stok düşümünü doğrular.
 * Production'da bu işlemi iyzico webhook'u tetikler; burada doğrudan test ediliyor.
 */
async function validateStockDecrement(
  db: SupabaseClient,
  productId: string,
  size: number,
  initialStock: number
): Promise<void> {
  console.log("[DB Doğrulama 3] Stok düşümü test ediliyor...");

  // Mevcut stok miktarını oku
  const { data: before } = await db
    .from("product_stock")
    .select("quantity")
    .eq("product_id", productId)
    .eq("size", size)
    .single();

  const stockBefore = before?.quantity ?? initialStock;
  console.log(`[DB Doğrulama 3] Stok öncesi: ${stockBefore}`);

  // Production'da webhook tarafından çağrılan RPC'yi doğrudan çalıştır
  const { error: rpcErr } = await db.rpc("decrement_stock", {
    p_product_id: productId,
    p_size: size,
    p_qty: 1,
  });

  if (rpcErr) {
    throw new Error(`decrement_stock RPC çağrısı başarısız: ${rpcErr.message}`);
  }

  // Stok sonrası miktarı oku ve doğrula
  const { data: after } = await db
    .from("product_stock")
    .select("quantity")
    .eq("product_id", productId)
    .eq("size", size)
    .single();

  const stockAfter = after?.quantity;
  const expected = stockBefore - 1;

  expect(stockAfter, `Stok ${expected} olmalıydı ama ${stockAfter} bulundu`).toBe(expected);

  console.log(
    `[DB Doğrulama 3] ✓ Stok düştü: ${stockBefore} → ${stockAfter} (beklenen: ${expected})`
  );
}
