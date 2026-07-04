/**
 * iyzico Ödeme Formu Stabilite Testi
 *
 * Kanıtlar: iyzico iframe'inin DOM'a geldikten sonra KAYBOLMADIĞINI doğrular.
 *
 * Çalıştırmak:
 *   npm run test:e2e:headed -- payment-form-stability
 *
 * NOT: devMode (IYZICO_API_KEY boş) veya gerçek sandbox key ile çalışır.
 *      devMode'da iframe yerine mock UI kontrol edilir.
 */

import { test, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import path from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(__dirname, "../../.env.local") });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HAS_IYZICO_KEY = !!(
  process.env.IYZICO_API_KEY?.trim() && process.env.IYZICO_SECRET_KEY?.trim()
);

const STABILITY_PRODUCT_ID = "stability-test-shoe-001";
const STABILITY_SLUG = "stability-test-shoe";
const STABILITY_SIZE = 40;
const STABILITY_PRICE = 5; // 5 TL — minimum iyzico sandbox tutarı

function makeAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik.");
  }
  return createClient(SUPABASE_URL, SERVICE_KEY);
}

test.describe("iyzico Ödeme Formu Stabilite", () => {
  let admin: SupabaseClient;

  test.beforeAll(async () => {
    admin = makeAdmin();

    // Test ürünü ekle
    await admin.from("products").upsert({
      id: STABILITY_PRODUCT_ID,
      name: "Stabilite Test Ayakkabısı",
      slug: STABILITY_SLUG,
      description: "E2E stabilite testi için",
      price: STABILITY_PRICE,
      category: "kadin",
      images: [],
      details: {},
    });

    await admin.from("product_stock").upsert({
      product_id: STABILITY_PRODUCT_ID,
      size: STABILITY_SIZE,
      quantity: 10,
    });
  });

  test.afterAll(async () => {
    await admin.from("product_stock").delete().eq("product_id", STABILITY_PRODUCT_ID);
    await admin.from("products").delete().eq("id", STABILITY_PRODUCT_ID);
  });

  test("iyzico formu DOM'a geldikten sonra en az 5 saniye kalmalı", async ({ page }) => {
    // 1. Ürün detay sayfasına git, sepete ekle
    await page.goto(`${BASE_URL}/tr/urunler/${STABILITY_SLUG}`);
    await page.waitForLoadState("domcontentloaded");

    // Beden seç
    const sizeButton = page.locator(`button:has-text("${STABILITY_SIZE}")`).first();
    await sizeButton.waitFor({ state: "visible", timeout: 10_000 });
    await sizeButton.click();

    // Sepete ekle
    const addToCartBtn = page.locator('button[data-testid="add-to-cart"], button:has-text("Sepete")').first();
    await addToCartBtn.waitFor({ state: "visible", timeout: 10_000 });
    await addToCartBtn.click();

    // Ödeme sayfasına git
    await page.goto(`${BASE_URL}/tr/odeme`);
    await page.waitForLoadState("domcontentloaded");

    // Formu doldur
    await page.fill('input[placeholder*="Ad"]', "Test");
    await page.fill('input[placeholder*="Soyad"]', "Kullanıcı");
    await page.fill('input[type="email"]', "stabilite@test.com");
    await page.fill('input[type="tel"]', "05001234567");
    await page.fill("textarea", "Test Mahallesi Test Sokak No:1");
    await page.fill('input[placeholder*="İstanbul"]', "İstanbul");
    await page.fill('input[placeholder*="Kadıköy"]', "Kadıköy");

    // Formu gönder
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    if (HAS_IYZICO_KEY) {
      // Gerçek iyzico: iframe veya iyzico container görünmeli
      const iyzicoContainer = page.locator("#iyzico-payment-container");
      await iyzicoContainer.waitFor({ state: "visible", timeout: 30_000 });

      // 5 saniye DOM'da kaldığını kanıtla
      await page.waitForTimeout(5_000);

      const stillVisible = await iyzicoContainer.isVisible();
      expect(stillVisible, "iyzico container 5 saniye sonra hâlâ görünür olmalı").toBe(true);

      // İçerik dolmuş mu kontrol et (innerHTML boş olmamalı)
      const html = await iyzicoContainer.innerHTML();
      expect(html.length, "iyzico container içeriği boş olmamalı").toBeGreaterThan(50);
    } else {
      // devMode: mock ödeme UI görünmeli
      const devMockTitle = page.locator("text=devMode, text=DEV, text=dev").first();
      // devMode UI için herhangi bir "Simüle" veya "mock" butonu
      const mockBtn = page
        .locator('button:has-text("Başarılı"), button:has-text("Başarısız"), button:has-text("Simüle")')
        .first();
      await mockBtn.waitFor({ state: "visible", timeout: 15_000 });

      await page.waitForTimeout(3_000);
      const stillThere = await mockBtn.isVisible();
      expect(stillThere, "devMode mock UI 3 saniye sonra hâlâ görünür olmalı").toBe(true);
    }
  });

  test("iyzico container AnimatePresence re-render'ından etkilenmemeli", async ({ page }) => {
    // Bu test, iyzico container'ının (#iyzico-payment-container)
    // React render döngülerinde DOM'dan silinmediğini doğrular.

    await page.goto(`${BASE_URL}/tr/urunler/${STABILITY_SLUG}`);
    await page.waitForLoadState("domcontentloaded");

    const sizeButton = page.locator(`button:has-text("${STABILITY_SIZE}")`).first();
    await sizeButton.waitFor({ state: "visible", timeout: 10_000 });
    await sizeButton.click();

    const addToCartBtn = page.locator('button[data-testid="add-to-cart"], button:has-text("Sepete")').first();
    await addToCartBtn.waitFor({ state: "visible", timeout: 10_000 });
    await addToCartBtn.click();

    await page.goto(`${BASE_URL}/tr/odeme`);
    await page.waitForLoadState("domcontentloaded");

    // iyzico container her zaman DOM'da olmalı (sadece gizli)
    const containerExists = await page.locator("#iyzico-payment-container").count();
    expect(containerExists, "#iyzico-payment-container form step'inde de DOM'da olmalı").toBe(1);

    // Console hatalarını yakala
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // Form doldur ve gönder
    await page.fill('input[placeholder*="Ad"]', "Re");
    await page.fill('input[placeholder*="Soyad"]', "Render");
    await page.fill('input[type="email"]', "rerender@test.com");
    await page.fill('input[type="tel"]', "05001234568");
    await page.fill("textarea", "Stabil Sokak No:2");
    await page.fill('input[placeholder*="İstanbul"]', "Ankara");
    await page.fill('input[placeholder*="Kadıköy"]', "Çankaya");

    await page.locator('button[type="submit"]').first().click();

    // networkidle bekle (tüm async işlemler bitsin)
    await page.waitForLoadState("networkidle", { timeout: 30_000 });

    // Container hâlâ DOM'da mı?
    const containerAfterSubmit = await page.locator("#iyzico-payment-container").count();
    expect(containerAfterSubmit, "#iyzico-payment-container submit sonrası silinmemeli").toBe(1);

    // Kritik React / iyzico hataları yok mu?
    const criticalErrors = consoleErrors.filter(
      (e) =>
        e.includes("Minified React error") ||
        e.includes("unmounted component") ||
        (e.includes("iyzico") && e.toLowerCase().includes("error"))
    );
    expect(criticalErrors, `Kritik console hataları: ${criticalErrors.join(", ")}`).toHaveLength(0);
  });
});
