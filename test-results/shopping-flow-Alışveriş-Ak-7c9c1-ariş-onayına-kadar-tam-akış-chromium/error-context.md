# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shopping-flow.spec.ts >> Alışveriş Akışı E2E >> Ana sayfadan sipariş onayına kadar tam akış
- Location: tests\e2e\shopping-flow.spec.ts:183:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Geliştirici Modu')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText('Geliştirici Modu')

```

```yaml
- banner:
  - link "Neri Shoes NERI SHOES":
    - /url: /tr
    - img "Neri Shoes"
    - text: NERI SHOES
  - navigation:
    - link "Ana Sayfa":
      - /url: /tr
    - link "Ürünler":
      - /url: /tr/urunler
    - link "Hakkımızda":
      - /url: /tr/hakkimizda
    - link "Toptan":
      - /url: /tr/toptan
    - link "Blog":
      - /url: /tr/blog
    - link "İletişim":
      - /url: /tr/iletisim
  - button "Language switcher":
    - text: 🇹🇷
    - img
  - link "WhatsApp":
    - /url: https://wa.me/905302608771?text=Merhaba%2C%20Neri%20Shoes%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.
  - link "Instagram":
    - /url: https://www.instagram.com/nerishoess/
  - link "TikTok":
    - /url: https://www.tiktok.com/@nerishoes.outlet
  - link "Giriş Yap":
    - /url: /tr/hesap/giris
  - button "Cart": "1"
- main:
  - heading "Ödeme" [level=1]
  - img
  - heading "Ödeme Başarısız" [level=2]
  - paragraph: Sipariş oluşturulamadı
  - button "Tekrar Dene"
- contentinfo:
  - link "Neri Shoes NERI SHOES":
    - /url: /tr
    - img "Neri Shoes"
    - text: NERI SHOES
  - paragraph: Her Adımda Stil
  - link "WhatsApp ile İletişime Geç":
    - /url: https://wa.me/905302608771?text=Merhaba%2C%20Neri%20Shoes%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.
  - link "Instagram":
    - /url: https://www.instagram.com/nerishoess/
  - link "TikTok":
    - /url: https://www.tiktok.com/@nerishoes.outlet
  - heading "Sayfalar" [level=3]
  - navigation:
    - link "Ana Sayfa":
      - /url: /tr
    - link "Ürünler":
      - /url: /tr/urunler
    - link "Hakkımızda":
      - /url: /tr/hakkimizda
    - link "Toptan":
      - /url: /tr/toptan
    - link "İletişim":
      - /url: /tr/iletisim
  - heading "Yasal" [level=3]
  - navigation:
    - link "Gizlilik Politikası":
      - /url: /tr/gizlilik-politikasi
    - link "Kullanım Şartları":
      - /url: /tr/kullanim-sartlari
    - link "Teslimat ve İade":
      - /url: /tr/teslimat-ve-iade-sartlari
    - link "Mesafeli Satış Sözleşmesi":
      - /url: /tr/mesafeli-satis-sozlesmesi
  - heading "İletişim" [level=3]
  - paragraph: ÜRETİM ADRESİ
  - paragraph: Sarıyakup, 23040. Sk., 01020 Seyhan/Adana
  - paragraph: SATIŞ ADRESİ
  - paragraph: Yenibaraj, 68045. Sk. Turan Apt. No:4B Kat:Z Seyhan/Adana
  - text: Güvenli Ödeme
  - img "Visa Mastercard"
  - img "iyzico ile öde"
  - text: © 2026 Neri Shoes. Tüm hakları saklıdır.
  - link "Gizlilik Politikası":
    - /url: /tr/gizlilik-politikasi
  - text: ·
  - link "Kullanım Şartları":
    - /url: /tr/kullanim-sartlari
  - text: ·
  - link "Teslimat ve İade":
    - /url: /tr/teslimat-ve-iade-sartlari
  - text: ·
  - link "Mesafeli Satış Sözleşmesi":
    - /url: /tr/mesafeli-satis-sozlesmesi
- alert: Neri Shoes | Premium Ayakkabı Koleksiyonu | Neri Shoes
```

# Test source

```ts
  196 |     // ║  ADIM 2 — Test ürününü bul ve tıkla     ║
  197 |     // ╚══════════════════════════════════════════╝
  198 |     //
  199 |     console.log("[Adım 2] Test ürünü katalogda aranıyor...");
  200 |     // Ürün kartı doğrudan slug ile bulunur — metni bağımsız locator olarak kullan
  201 |     const productLink = page.locator(`a[href*="${TEST_SLUG}"]`).first();
  202 |     await expect(productLink).toBeVisible({ timeout: 15_000 });
  203 |     console.log(`[Adım 2] ✓ Test ürünü bulundu, tıklanıyor...`);
  204 |     await productLink.click();
  205 | 
  206 |     //
  207 |     // ╔══════════════════════════════════════════╗
  208 |     // ║  ADIM 3 — Ürün detay sayfası & numara   ║
  209 |     // ╚══════════════════════════════════════════╝
  210 |     //
  211 |     console.log("[Adım 3] Ürün detay sayfası bekleniyor...");
  212 |     await page.waitForURL(`**/${TEST_SLUG}**`, { timeout: 15_000 });
  213 |     await page.waitForLoadState("networkidle");
  214 |     console.log("[Adım 3] ✓ Ürün detay sayfası yüklendi");
  215 | 
  216 |     // Numara seç
  217 |     const sizeButton = page.getByRole("button", {
  218 |       name: String(TEST_SIZE),
  219 |       exact: true,
  220 |     });
  221 |     await expect(sizeButton).toBeVisible({ timeout: 10_000 });
  222 |     await sizeButton.click();
  223 |     console.log(`[Adım 3] ✓ Numara seçildi: ${TEST_SIZE}`);
  224 | 
  225 |     //
  226 |     // ╔══════════════════════════════════════════╗
  227 |     // ║  ADIM 4 — Sepete ekle                   ║
  228 |     // ╚══════════════════════════════════════════╝
  229 |     //
  230 |     console.log("[Adım 4] Ürün sepete ekleniyor...");
  231 |     const addToCartBtn = page.getByRole("button", { name: "Sepete Ekle" });
  232 |     await expect(addToCartBtn).toBeEnabled({ timeout: 5_000 });
  233 |     await addToCartBtn.click();
  234 | 
  235 |     // Toast mesajını doğrula
  236 |     await expect(page.getByText("Sepete eklendi")).toBeVisible({ timeout: 8_000 });
  237 |     console.log("[Adım 4] ✓ Sepete eklendi toast'u görüntülendi");
  238 | 
  239 |     //
  240 |     // ╔══════════════════════════════════════════╗
  241 |     // ║  ADIM 5 — Sepet panelini aç             ║
  242 |     // ╚══════════════════════════════════════════╝
  243 |     //
  244 |     console.log("[Adım 5] Sepet paneli açılıyor...");
  245 |     const cartIcon = page.locator('[aria-label="Cart"]').first();
  246 |     await cartIcon.click();
  247 | 
  248 |     // Panelde ürün adını bekle (sayfadaki h1/breadcrumb ile karışmasın diye panele scope'lu)
  249 |     await expect(
  250 |       page.getByTestId("cart-panel").getByText(TEST_PRODUCT_NAME)
  251 |     ).toBeVisible({ timeout: 8_000 });
  252 |     console.log("[Adım 5] ✓ Sepet paneli açıldı, ürün görünüyor");
  253 | 
  254 |     //
  255 |     // ╔══════════════════════════════════════════╗
  256 |     // ║  ADIM 6 — Ödeme sayfasına geç           ║
  257 |     // ╚══════════════════════════════════════════╝
  258 |     //
  259 |     console.log("[Adım 6] Ödeme sayfasına geçiliyor...");
  260 |     // Sepet panelindeki "Ödemeye Geç" butonu
  261 |     await page.getByRole("button", { name: "Ödemeye Geç" }).click();
  262 | 
  263 |     await page.waitForURL("**/odeme**", { timeout: 15_000 });
  264 |     await page.waitForLoadState("networkidle");
  265 |     console.log("[Adım 6] ✓ Ödeme sayfasına ulaşıldı");
  266 | 
  267 |     //
  268 |     // ╔══════════════════════════════════════════╗
  269 |     // ║  ADIM 7 — Müşteri bilgi formunu doldur  ║
  270 |     // ╚══════════════════════════════════════════╝
  271 |     //
  272 |     console.log("[Adım 7] Müşteri bilgileri formu dolduruluyor...");
  273 | 
  274 |     await page.getByPlaceholder("Adınız", { exact: true }).fill("Test");
  275 |     await page.getByPlaceholder("Soyadınız").fill("Kullanıcı");
  276 |     await page.getByPlaceholder("ornek@email.com").fill(TEST_EMAIL);
  277 |     await page.getByPlaceholder("05XX XXX XX XX").fill("05001234567");
  278 |     await page
  279 |       .getByPlaceholder("Mahalle, Cadde, Sokak, Daire No")
  280 |       .fill("Test Mahallesi Test Sokak No:1 Daire:2");
  281 |     await page.getByPlaceholder("İstanbul").fill("İstanbul");
  282 |     await page.getByPlaceholder("Kadıköy").fill("Kadıköy");
  283 | 
  284 |     console.log("[Adım 7] ✓ Müşteri formu dolduruldu");
  285 | 
  286 |     //
  287 |     // ╔══════════════════════════════════════════╗
  288 |     // ║  ADIM 8 — Formu gönder                  ║
  289 |     // ╚══════════════════════════════════════════╝
  290 |     //
  291 |     console.log("[Adım 8] Ödeme formu gönderiliyor...");
  292 |     // Checkout sayfasındaki submit butonu
  293 |     await page.locator('button[type="submit"]').click();
  294 | 
  295 |     // Dev modu bekleniyor (iyzico keyleri boşsa bu görünür)
> 296 |     await expect(page.getByText("Geliştirici Modu")).toBeVisible({ timeout: 15_000 });
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  297 |     console.log("[Adım 8] ✓ Dev modu ödeme ekranı görüntülendi");
  298 | 
  299 |     //
  300 |     // ╔══════════════════════════════════════════╗
  301 |     // ║  ADIM 9 — Başarılı ödemi simüle et      ║
  302 |     // ╚══════════════════════════════════════════╝
  303 |     //
  304 |     console.log("[Adım 9] Başarılı ödeme simüle ediliyor...");
  305 |     const simulateBtn = page.getByRole("button", { name: /Başarılı .*Simüle Et/ });
  306 |     await expect(simulateBtn).toBeVisible({ timeout: 5_000 });
  307 |     await simulateBtn.click();
  308 | 
  309 |     //
  310 |     // ╔══════════════════════════════════════════╗
  311 |     // ║  ADIM 10 — Sipariş onay ekranı          ║
  312 |     // ╚══════════════════════════════════════════╝
  313 |     //
  314 |     console.log("[Adım 10] Sipariş onay ekranı doğrulanıyor...");
  315 |     await expect(page.getByText("Siparişiniz Alındı")).toBeVisible({
  316 |       timeout: 10_000,
  317 |     });
  318 |     console.log("[Adım 10] ✅ SİPARİŞ ONAY EKRANI GÖRÜNTÜLENDI");
  319 | 
  320 |     // ────────────────────────────────────────────
  321 |     //  DB DOĞRULAMALARI
  322 |     // ────────────────────────────────────────────
  323 | 
  324 |     // DB yazma işleminin tamamlanması için kısa bekleme
  325 |     await page.waitForTimeout(1_500);
  326 | 
  327 |     await validateOrder(db, TEST_EMAIL, TEST_PRODUCT_ID, TEST_SIZE, TEST_PRICE);
  328 |     await validateStockDecrement(db, TEST_PRODUCT_ID, TEST_SIZE, INITIAL_STOCK);
  329 | 
  330 |     console.log("\n✅ TÜM E2E TEST ADIMLARI BAŞARIYLA TAMAMLANDI");
  331 |   });
  332 | });
  333 | 
  334 | // ─────────────────────────────────────────────
  335 | //  Yardımcı doğrulama fonksiyonları
  336 | // ─────────────────────────────────────────────
  337 | 
  338 | /**
  339 |  * orders ve order_items tablolarında test siparişinin doğru oluştuğunu kontrol eder.
  340 |  */
  341 | async function validateOrder(
  342 |   db: SupabaseClient,
  343 |   email: string,
  344 |   productId: string,
  345 |   size: number,
  346 |   expectedPrice: number
  347 | ): Promise<void> {
  348 |   console.log("\n[DB Doğrulama 1] Sipariş kaydı kontrol ediliyor...");
  349 | 
  350 |   const { data: orders, error } = await db
  351 |     .from("orders")
  352 |     .select("id, status, total_amount, customer_email, customer_name")
  353 |     .eq("customer_email", email)
  354 |     .order("created_at", { ascending: false })
  355 |     .limit(1);
  356 | 
  357 |   if (error) throw new Error(`Sipariş sorgulanamadı: ${error.message}`);
  358 | 
  359 |   expect(orders, "orders tablosunda test siparişi bulunamadı").toHaveLength(1);
  360 |   const order = orders![0];
  361 | 
  362 |   expect(order.customer_email, "Müşteri e-postası hatalı").toBe(email);
  363 |   expect(order.total_amount, "Sipariş tutarı hatalı").toBe(expectedPrice);
  364 |   expect(
  365 |     ["pending", "paid"],
  366 |     "Sipariş durumu geçersiz"
  367 |   ).toContain(order.status);
  368 | 
  369 |   console.log(
  370 |     `[DB Doğrulama 1] ✓ Sipariş bulundu — ID: ${order.id} | Durum: ${order.status} | Tutar: ${order.total_amount} ₺`
  371 |   );
  372 | 
  373 |   // Sipariş kalemleri
  374 |   console.log("[DB Doğrulama 2] Sipariş kalemleri kontrol ediliyor...");
  375 | 
  376 |   const { data: items } = await db
  377 |     .from("order_items")
  378 |     .select("product_id, size, quantity, unit_price")
  379 |     .eq("order_id", order.id);
  380 | 
  381 |   expect(items, "order_items tablosunda kayıt bulunamadı").toHaveLength(1);
  382 |   expect(items![0].product_id, "Ürün ID'si hatalı").toBe(productId);
  383 |   expect(items![0].size, "Ayakkabı numarası hatalı").toBe(size);
  384 |   expect(items![0].quantity, "Adet hatalı").toBe(1);
  385 |   expect(items![0].unit_price, "Birim fiyat hatalı").toBe(expectedPrice);
  386 | 
  387 |   console.log(
  388 |     `[DB Doğrulama 2] ✓ Sipariş kalemi doğrulandı — Ürün: ${items![0].product_id} | No: ${items![0].size} | Adet: ${items![0].quantity}`
  389 |   );
  390 | }
  391 | 
  392 | /**
  393 |  * decrement_stock RPC'sini çalıştırarak stok düşümünü doğrular.
  394 |  * Production'da bu işlemi iyzico webhook'u tetikler; burada doğrudan test ediliyor.
  395 |  */
  396 | async function validateStockDecrement(
```