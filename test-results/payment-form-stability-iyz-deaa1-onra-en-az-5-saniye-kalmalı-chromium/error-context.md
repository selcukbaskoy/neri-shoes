# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment-form-stability.spec.ts >> iyzico Ödeme Formu Stabilite >> iyzico formu DOM'a geldikten sonra en az 5 saniye kalmalı
- Location: tests\e2e\payment-form-stability.spec.ts:94:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#iyzico-payment-container') to be visible
    55 × locator resolved to hidden <div class="w-full" id="iyzico-payment-container"></div>

```

# Test source

```ts
  29  | const STABILITY_SIZE = 40;
  30  | const STABILITY_PRICE = 5; // 5 TL — minimum iyzico sandbox tutarı
  31  | 
  32  | function makeAdmin(): SupabaseClient {
  33  |   if (!SUPABASE_URL || !SERVICE_KEY) {
  34  |     throw new Error("NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik.");
  35  |   }
  36  |   return createClient(SUPABASE_URL, SERVICE_KEY);
  37  | }
  38  | 
  39  | test.describe("iyzico Ödeme Formu Stabilite", () => {
  40  |   let admin: SupabaseClient;
  41  | 
  42  |   test.beforeAll(async () => {
  43  |     admin = makeAdmin();
  44  | 
  45  |     // Test ürünü ekle (products şemasına uygun — description/details kolonu yok)
  46  |     const { error: productErr } = await admin.from("products").upsert(
  47  |       {
  48  |         id: STABILITY_PRODUCT_ID,
  49  |         slug: STABILITY_SLUG,
  50  |         name: "Stabilite Test Ayakkabısı",
  51  |         category: "klasik",
  52  |         image: "/logo.jpeg",
  53  |         images: ["/logo.jpeg"],
  54  |         wholesale: false,
  55  |         retail: true,
  56  |         featured: false,
  57  |         is_active: true,
  58  |         price: STABILITY_PRICE,
  59  |         compare_at_price: null,
  60  |         discount_percentage: null,
  61  |         sku: "E2E-STAB-001",
  62  |         translation_status: "completed",
  63  |         content: {
  64  |           tr: {
  65  |             shortDescription: "E2E stabilite testi için",
  66  |             description: "Bu ürün otomatik test amaçlıdır.",
  67  |             features: [],
  68  |             styling: [],
  69  |           },
  70  |         },
  71  |       },
  72  |       { onConflict: "id" }
  73  |     );
  74  |     if (productErr) throw new Error(`[Setup] Ürün eklenemedi: ${productErr.message}`);
  75  | 
  76  |     await admin
  77  |       .from("product_stock")
  78  |       .delete()
  79  |       .eq("product_id", STABILITY_PRODUCT_ID)
  80  |       .eq("size", STABILITY_SIZE);
  81  |     const { error: stockErr } = await admin.from("product_stock").insert({
  82  |       product_id: STABILITY_PRODUCT_ID,
  83  |       size: STABILITY_SIZE,
  84  |       quantity: 10,
  85  |     });
  86  |     if (stockErr) throw new Error(`[Setup] Stok eklenemedi: ${stockErr.message}`);
  87  |   });
  88  | 
  89  |   test.afterAll(async () => {
  90  |     await admin.from("product_stock").delete().eq("product_id", STABILITY_PRODUCT_ID);
  91  |     await admin.from("products").delete().eq("id", STABILITY_PRODUCT_ID);
  92  |   });
  93  | 
  94  |   test("iyzico formu DOM'a geldikten sonra en az 5 saniye kalmalı", async ({ page }) => {
  95  |     // 1. Ürün detay sayfasına git, sepete ekle
  96  |     await page.goto(`${BASE_URL}/tr/urunler/${STABILITY_SLUG}`);
  97  |     await page.waitForLoadState("domcontentloaded");
  98  | 
  99  |     // Beden seç
  100 |     const sizeButton = page.locator(`button:has-text("${STABILITY_SIZE}")`).first();
  101 |     await sizeButton.waitFor({ state: "visible", timeout: 10_000 });
  102 |     await sizeButton.click();
  103 | 
  104 |     // Sepete ekle
  105 |     const addToCartBtn = page.locator('button[data-testid="add-to-cart"], button:has-text("Sepete")').first();
  106 |     await addToCartBtn.waitFor({ state: "visible", timeout: 10_000 });
  107 |     await addToCartBtn.click();
  108 | 
  109 |     // Ödeme sayfasına git
  110 |     await page.goto(`${BASE_URL}/tr/odeme`);
  111 |     await page.waitForLoadState("domcontentloaded");
  112 | 
  113 |     // Formu doldur
  114 |     await page.fill('input[placeholder*="Ad"]', "Test");
  115 |     await page.fill('input[placeholder*="Soyad"]', "Kullanıcı");
  116 |     await page.fill('input[type="email"]', "stabilite@test.com");
  117 |     await page.fill('input[type="tel"]', "05001234567");
  118 |     await page.fill("textarea", "Test Mahallesi Test Sokak No:1");
  119 |     await page.fill('input[placeholder*="İstanbul"]', "İstanbul");
  120 |     await page.fill('input[placeholder*="Kadıköy"]', "Kadıköy");
  121 | 
  122 |     // Formu gönder
  123 |     const submitBtn = page.locator('button[type="submit"]').first();
  124 |     await submitBtn.click();
  125 | 
  126 |     if (HAS_IYZICO_KEY) {
  127 |       // Gerçek iyzico: iframe veya iyzico container görünmeli
  128 |       const iyzicoContainer = page.locator("#iyzico-payment-container");
> 129 |       await iyzicoContainer.waitFor({ state: "visible", timeout: 30_000 });
      |                             ^ Error: locator.waitFor: Test timeout of 30000ms exceeded.
  130 | 
  131 |       // 5 saniye DOM'da kaldığını kanıtla
  132 |       await page.waitForTimeout(5_000);
  133 | 
  134 |       const stillVisible = await iyzicoContainer.isVisible();
  135 |       expect(stillVisible, "iyzico container 5 saniye sonra hâlâ görünür olmalı").toBe(true);
  136 | 
  137 |       // İçerik dolmuş mu kontrol et (innerHTML boş olmamalı)
  138 |       const html = await iyzicoContainer.innerHTML();
  139 |       expect(html.length, "iyzico container içeriği boş olmamalı").toBeGreaterThan(50);
  140 |     } else {
  141 |       // devMode: mock ödeme UI görünmeli
  142 |       const devMockTitle = page.locator("text=devMode, text=DEV, text=dev").first();
  143 |       // devMode UI için herhangi bir "Simüle" veya "mock" butonu
  144 |       const mockBtn = page
  145 |         .locator('button:has-text("Başarılı"), button:has-text("Başarısız"), button:has-text("Simüle")')
  146 |         .first();
  147 |       await mockBtn.waitFor({ state: "visible", timeout: 15_000 });
  148 | 
  149 |       await page.waitForTimeout(3_000);
  150 |       const stillThere = await mockBtn.isVisible();
  151 |       expect(stillThere, "devMode mock UI 3 saniye sonra hâlâ görünür olmalı").toBe(true);
  152 |     }
  153 |   });
  154 | 
  155 |   test("iyzico container AnimatePresence re-render'ından etkilenmemeli", async ({ page }) => {
  156 |     // Bu test, iyzico container'ının (#iyzico-payment-container)
  157 |     // React render döngülerinde DOM'dan silinmediğini doğrular.
  158 | 
  159 |     await page.goto(`${BASE_URL}/tr/urunler/${STABILITY_SLUG}`);
  160 |     await page.waitForLoadState("domcontentloaded");
  161 | 
  162 |     const sizeButton = page.locator(`button:has-text("${STABILITY_SIZE}")`).first();
  163 |     await sizeButton.waitFor({ state: "visible", timeout: 10_000 });
  164 |     await sizeButton.click();
  165 | 
  166 |     const addToCartBtn = page.locator('button[data-testid="add-to-cart"], button:has-text("Sepete")').first();
  167 |     await addToCartBtn.waitFor({ state: "visible", timeout: 10_000 });
  168 |     await addToCartBtn.click();
  169 | 
  170 |     await page.goto(`${BASE_URL}/tr/odeme`);
  171 |     await page.waitForLoadState("domcontentloaded");
  172 | 
  173 |     // Sepet localStorage'dan hidrate olana kadar bekle (form görünmeli)
  174 |     await page.locator('input[placeholder*="Ad"]').first().waitFor({ state: "visible", timeout: 10_000 });
  175 | 
  176 |     // iyzico container her zaman DOM'da olmalı (sadece gizli)
  177 |     const containerExists = await page.locator("#iyzico-payment-container").count();
  178 |     expect(containerExists, "#iyzico-payment-container form step'inde de DOM'da olmalı").toBe(1);
  179 | 
  180 |     // Console hatalarını yakala
  181 |     const consoleErrors: string[] = [];
  182 |     page.on("console", (msg) => {
  183 |       if (msg.type() === "error") consoleErrors.push(msg.text());
  184 |     });
  185 | 
  186 |     // Form doldur ve gönder
  187 |     await page.fill('input[placeholder*="Ad"]', "Re");
  188 |     await page.fill('input[placeholder*="Soyad"]', "Render");
  189 |     await page.fill('input[type="email"]', "rerender@test.com");
  190 |     await page.fill('input[type="tel"]', "05001234568");
  191 |     await page.fill("textarea", "Stabil Sokak No:2");
  192 |     await page.fill('input[placeholder*="İstanbul"]', "Ankara");
  193 |     await page.fill('input[placeholder*="Kadıköy"]', "Çankaya");
  194 | 
  195 |     await page.locator('button[type="submit"]').first().click();
  196 | 
  197 |     // networkidle bekle (tüm async işlemler bitsin)
  198 |     await page.waitForLoadState("networkidle", { timeout: 30_000 });
  199 | 
  200 |     // Container hâlâ DOM'da mı?
  201 |     const containerAfterSubmit = await page.locator("#iyzico-payment-container").count();
  202 |     expect(containerAfterSubmit, "#iyzico-payment-container submit sonrası silinmemeli").toBe(1);
  203 | 
  204 |     // Kritik React / iyzico hataları yok mu?
  205 |     const criticalErrors = consoleErrors.filter(
  206 |       (e) =>
  207 |         e.includes("Minified React error") ||
  208 |         e.includes("unmounted component") ||
  209 |         (e.includes("iyzico") && e.toLowerCase().includes("error"))
  210 |     );
  211 |     expect(criticalErrors, `Kritik console hataları: ${criticalErrors.join(", ")}`).toHaveLength(0);
  212 |   });
  213 | });
  214 | 
```