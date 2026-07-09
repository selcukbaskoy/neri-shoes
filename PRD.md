# Neri Shoes — Teknik Eksiklik Giderme PRD

## 1. Başlık ve Versiyon

| Alan | Değer |
|---|---|
| **Proje Adı** | Neri Shoes (nerishoes.com.tr) |
| **Doküman Türü** | Product Requirement Document (PRD) — Teknik Eksiklik Giderme |
| **Versiyon** | 1.0 |
| **Tarih** | 2026-07-09 |
| **Yazar** | Teknik Dokümantasyon ve Proje Yönetimi Uzmanı |
| **Hedef Kitle** | Geliştirme Ekibi, DevOps, Ürün Yöneticisi |

---

## 2. Hedef ve Kapsam

### 2.1 Hedef
Tespit edilen teknik eksikliklerin kapatılması, güvenlik açıklarının giderilmesi, sistem stabilizasyonu ve canlı ortamın güvenilir çalışmasının sağlanması.

### 2.2 Kapsam Dışı
- Yeni özellik geliştirme (F1 Müşteri paneli — MOBIL-EKSIKLER.md'de beklemede)
- UI/UX redesign
- CMS entegrasyonu
- Çok dilli içerik çeviri altyapısı (mevcut çeviri altyapısı korunacak)

### 2.3 Bağımlılıklar
- Vercel deployment ortamı
- Supabase (production veritabanı)
- iyzico sandbox/live API anahtarları
- Upstash Redis / Vercel KV (rate limiting için)

---

## 3. Teknik Gereksinimler

Her eksiklik için aşağıda teknik çözüm spesifikasyonları, kabul kriterleri (Acceptance Criteria) ve ilgili dosya değişiklikleri listelenmiştir.

### 3.1. [F-K1] Routing / Auth
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/app/[locale]/hesap/layout.tsx:24-26`
- **Kabul Kriteri:** `hesap/layout.tsx` içinde `if (!user) redirect(...)` kaldırılacak. `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/(auth)` grup dizini altına alınarak ayrı bir layout'a taşınacak. Sadece korumalı sayfalar ana `hesap/layout.tsx` altında kalacak.
- **Etkilenen Dosyalar:** `src/app/[locale]/hesap/layout.tsx`, `src/app/[locale]/hesap/giris/page.tsx`, `src/app/[locale]/hesap/kayit/page.tsx`, `src/app/[locale]/hesap/sifre-sifirla/page.tsx`

### 3.2. [F-K2] SEO / Schema.org
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/app/[locale]/urunler/[slug]/page.tsx:93`
- **Kabul Kriteri:** `page.tsx` içinde `stock` verisini çekip `computeStockStatus()` ile dinamik `availability` üret. Tükenmiş ürünler `OutOfStock`, stokta olanlar `InStock`.
- **Etkilenen Dosyalar:** `src/app/[locale]/urunler/[slug]/page.tsx`

### 3.3. [F-K3] Hydration Mismatch
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/app/layout.tsx:47` + `src/components/HtmlAttributes.tsx:8-11`
- **Kabul Kriteri:** `HtmlAttributes.tsx` kaldırılacak. Client-side locale değişimi `next-intl` `useRouter` ile `router.replace(pathname, { locale: nextLocale })` yapılacak.
- **Etkilenen Dosyalar:** `src/components/HtmlAttributes.tsx`, `src/components/LanguageSwitcher.tsx`, `src/app/[locale]/layout.tsx`

### 3.4. [B-K1] Security / Supabase Auth
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/lib/supabase.ts:11`
- **Kabul Kriteri:** `SUPABASE_SERVICE_ROLE_KEY` env var'ını tanımla. Fallback kaldır; env eksikse uygulama build-time'da hata atsın.
- **Etkilenen Dosyalar:** `src/lib/supabase.ts`

### 3.5. [B-K2] Security / Webhook HMAC
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/app/api/webhooks/iyzico/route.ts` (tümü) + `src/lib/iyzico.ts:22-34`
- **Kabul Kriteri:** Webhook handler'ın en başına HMAC doğrulaması ekle. `IYZICO_SECRET_KEY` yoksa `503` döndür. HMAC başarısızsa `401`.
- **Etkilenen Dosyalar:** `src/app/api/webhooks/iyzico/route.ts`, `src/lib/iyzico.ts`

### 3.6. [B-K3] Security / Idempotency
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/app/api/webhooks/iyzico/route.ts:99-116`
- **Kabul Kriteri:** Webhook işlemi başlamadan önce `orders.status === 'paid'` kontrolü ekle. Eğer zaten `paid` ise `200` döndür, işlem yapma.
- **Etkilenen Dosyalar:** `src/app/api/webhooks/iyzico/route.ts`

### 3.7. [B-K4] Database / RPC Missing
- **Öncelik:** 🔴 Kritik
- **Konum:** `supabase/migrations/20260706_customer_panel_step1.sql` + `src/app/api/webhooks/iyzico/route.ts:99`
- **Kabul Kriteri:** Migration dosyasına `decrement_stock` RPC fonksiyonu ekle veya Supabase SQL Editor'de manuel tanımla.
- **Etkilenen Dosyalar:** `supabase/migrations/20260706_customer_panel_step1.sql`

### 3.8. [B-K5] Security / Broken Access Control
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/lib/customer-api.ts:182-188` ve `162-180`
- **Kabul Kriteri:** Tüm `customer-api.ts` fonksiyonlarına `customer_id` filtresi ekle. Route handler'da da `customer_id` doğrula.
- **Etkilenen Dosyalar:** `src/lib/customer-api.ts`, `src/app/api/hesap/adresler/route.ts`

### 3.9. [B-K6] Security / Price Tampering
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/app/api/checkout/create-payment/route.ts:43`
- **Kabul Kriteri:** Server-side `create-payment` route'ta her item için DB'den `products.price` çek ve client `unitPrice` ile karşılaştır. Fark varsa `400`.
- **Etkilenen Dosyalar:** `src/app/api/checkout/create-payment/route.ts`

### 3.10. [B-K7] Database / Transaction Integrity
- **Öncelik:** 🔴 Kritik
- **Konum:** `src/app/api/checkout/create-payment/route.ts:115`
- **Kabul Kriteri:** `orders` + `order_items` insert'ünü Supabase transaction (RPC) ile sar veya hata kontrolü ekle. Hata olursa ödeme başlatma.
- **Etkilenen Dosyalar:** `src/app/api/checkout/create-payment/route.ts`

### 3.11. [F-Y1] Performans
- **Öncelik:** 🟠 Yüksek
- **Konum:** `next.config.mjs:28`
- **Kabul Kriteri:** `unoptimized: true` kaldır. Vercel'de host ediliyorsa otomatik çalışır. Vercel dışındaysa `sharp` paketi kur: `npm install sharp`.
- **Etkilenen Dosyalar:** `next.config.mjs`, `package.json`

### 3.12. [F-Y2] Canlı Site / Routing
- **Öncelik:** 🟠 Yüksek
- **Konum:** `https://www.nerishoes.com.tr/tr/urunler`
- **Kabul Kriteri:** Vercel deployment logları kontrol edilmeli. `getActiveProducts()` canlı ortamda Supabase hatası veriyor olabilir veya `next.config.mjs` içinde beklenmeyen bir redirect kuralı olabilir.
- **Etkilenen Dosyalar:** `src/app/[locale]/urunler/page.tsx`, `next.config.mjs`

### 3.13. [F-Y3] UI / Navigation
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/components/Header.tsx:74`
- **Kabul Kriteri:** `pathname` ile `link.href` karşılaştırması için `pathname`'in locale prefix'i kaldırılmış şekli kullanılmalı.
- **Etkilenen Dosyalar:** `src/components/Header.tsx`

### 3.14. [F-Y4] UX / Routing
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/components/LanguageSwitcher.tsx:36`
- **Kabul Kriteri:** `next-intl` `useRouter` ile client-side navigation.
- **Etkilenen Dosyalar:** `src/components/LanguageSwitcher.tsx`

### 3.15. [F-Y5] Memory Leak
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/components/ReviewForm.tsx:55`
- **Kabul Kriteri:** Component unmount'ta tüm preview URL'lerini temizleyen `useEffect` cleanup ekle.
- **Etkilenen Dosyalar:** `src/components/ReviewForm.tsx`

### 3.16. [F-Y6] HTML / Form
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/components/StarRating.tsx:24`
- **Kabul Kriteri:** `type="button"` sabit yap, `disabled={!interactive}` ekle.
- **Etkilenen Dosyalar:** `src/components/StarRating.tsx`

### 3.17. [F-Y7] HTML / Form / Accessibility
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/components/CheckoutContent.tsx:247-350`
- **Kabul Kriteri:** Her input'a `name` ve `id` attribute'ları ekle, `label` element'leri `htmlFor` ile input `id`'sine bağla.
- **Etkilenen Dosyalar:** `src/components/CheckoutContent.tsx`

### 3.18. [F-Y8] Routing / Tutarsızlık
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/[locale]/hesap/giris/page.tsx` + `src/app/[locale]/giris/page.tsx`
- **Kabul Kriteri:** `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/layout.tsx` dışına alınmalı. Tek bir giriş sayfası (`/giris`) kullanılmalı.
- **Etkilenen Dosyalar:** `src/app/[locale]/hesap/giris/page.tsx`, `src/app/[locale]/giris/page.tsx`

### 3.19. [B-Y1] Compliance / Legal Risk
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/checkout/create-payment/route.ts:170`
- **Kabul Kriteri:** Checkout formuna TCKN alanı ekle (opsiyonel, TC vatandaşı olmayanlar için). Varsayılan: boş string veya kullanıcıdan alınan değer.
- **Etkilenen Dosyalar:** `src/app/api/checkout/create-payment/route.ts`, `src/components/CheckoutContent.tsx`

### 3.20. [B-Y2] Security / Timing Attack
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/admin/login/route.ts:39`
- **Kabul Kriteri:** `crypto.timingSafeEqual` kullan. Password buffer'a dönüştürülerek karşılaştır.
- **Etkilenen Dosyalar:** `src/app/api/admin/login/route.ts`

### 3.21. [B-Y3] Error Handling
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/admin/login/route.ts:37`
- **Kabul Kriteri:** `try-catch` ile sarmala, geçersiz JSON'da `400` dön.
- **Etkilenen Dosyalar:** `src/app/api/admin/login/route.ts`

### 3.22. [B-Y4] Security / Cookie
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/admin/login/route.ts:70-75`
- **Kabul Kriteri:** `secure: true` ekle. `NODE_ENV` production kontrolü ile şartlı da yapılabilir.
- **Etkilenen Dosyalar:** `src/app/api/admin/login/route.ts`

### 3.23. [B-Y5] Security / Brute Force
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/coupons/validate/route.ts`
- **Kabul Kriteri:** Vercel KV veya upstash-redis ile rate limiting ekle: IP başına 10 deneme / 1 dakika.
- **Etkilenen Dosyalar:** `src/app/api/coupons/validate/route.ts`

### 3.24. [B-Y6] Business Logic / Data Integrity
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/reviews/route.ts:64-71`
- **Kabul Kriteri:** `orders` sorgusuna `order_items` join ile `product_id` filtre ekle.
- **Etkilenen Dosyalar:** `src/app/api/reviews/route.ts`

### 3.25. [B-Y7] Security / Broken Access Control
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/admin/layout.tsx`
- **Kabul Kriteri:** Layout'ta server-side `isAdminAuthenticated()` kontrolü ekle. Yetkisizse redirect.
- **Etkilenen Dosyalar:** `src/app/admin/layout.tsx`

### 3.26. [B-Y8] Security / Auth Misuse
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/hesap/profil/route.ts:44-48`
- **Kabul Kriteri:** Mevcut kullanıcının session token'ı ile `supabase` (anon/authenticated) client kullan. Veya `admin.user.update` kullan.
- **Etkilenen Dosyalar:** `src/app/api/hesap/profil/route.ts`

### 3.27. [B-Y9] Security / Broken Access Control
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/admin/test-email/route.ts`
- **Kabul Kriteri:** `isAdminAuthenticated()` veya ayrı `ADMIN_API_SECRET` ile koru. Veya admin session kontrolü.
- **Etkilenen Dosyalar:** `src/app/api/admin/test-email/route.ts`

### 3.28. [B-Y10] Security / Filter Injection
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/lib/customer-api.ts:26-28` ve `226`
- **Kabul Kriteri:** Parametrik `.or()` kullan. Veya email input validation (regex) yap. Özel karakterleri sanitize et.
- **Etkilenen Dosyalar:** `src/lib/customer-api.ts`

### 3.29. [B-Y11] Error Handling / Data Integrity
- **Öncelik:** 🟠 Yüksek
- **Konum:** `src/app/api/webhooks/iyzico/route.ts:75-80`
- **Kabul Kriteri:** Order update hatası durumunda `500` döndür, client'a success gösterme. Veya retry queue kullan.
- **Etkilenen Dosyalar:** `src/app/api/webhooks/iyzico/route.ts`

### 3.30. [F-O1] Memory Leak
- **Öncelik:** 🟡 Orta
- **Konum:** `src/components/AboutContent.tsx:17-29`
- **Kabul Kriteri:** `rafId` sakla, cleanup'ta `cancelAnimationFrame` çağır.
- **Etkilenen Dosyalar:** `src/components/AboutContent.tsx`

### 3.31. [F-O2] Memory Leak
- **Öncelik:** 🟡 Orta
- **Konum:** `src/components/ProductDetailContent.tsx:137-139`
- **Kabul Kriteri:** `useRef` ile timer ID sakla, cleanup'ta `clearTimeout`.
- **Etkilenen Dosyalar:** `src/components/ProductDetailContent.tsx`

### 3.32. [F-O3] Accessibility / WCAG
- **Öncelik:** 🟡 Orta
- **Konum:** `src/components/CheckoutContent.tsx:247-350`
- **Kabul Kriteri:** F-Y7 ile birlikte çözülecek. label `htmlFor` ve input `id` eşleştirilmeli.
- **Etkilenen Dosyalar:** `src/components/CheckoutContent.tsx`

### 3.33. [F-O4] Next.js / Static Gen
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/[locale]/blog/[slug]/page.tsx:15-18`
- **Kabul Kriteri:** `locales.flatMap` ile `locale` + `slug` kombinasyonu döndür.
- **Etkilenen Dosyalar:** `src/app/[locale]/blog/[slug]/page.tsx`

### 3.34. [F-O5] Next.js / Metadata
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/[locale]/layout.tsx:21-61`
- **Kabul Kriteri:** Tüm sayfalar (`/hakkimizda`, `/toptan`, `/odeme`, hesap sayfaları) kendi `generateMetadata` fonksiyonlarını tanımlamalı.
- **Etkilenen Dosyalar:** `src/app/[locale]/hakkimizda/page.tsx`, `src/app/[locale]/toptan/page.tsx`, `src/app/[locale]/odeme/page.tsx`

### 3.35. [F-O6] Security / CSP
- **Öncelik:** 🟡 Orta
- **Konum:** `next.config.mjs:9`
- **Kabul Kriteri:** B-O9 ile birlikte çözülecek. `img-src` sadece bilinen domain'leri içermeli.
- **Etkilenen Dosyalar:** `next.config.mjs`

### 3.36. [B-O1] Security / Rate Limiting
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/checkout/status/[token]/route.ts`
- **Kabul Kriteri:** Vercel KV / Upstash Redis ile rate limiting ekle. Token format UUID regex validation.
- **Etkilenen Dosyalar:** `src/app/api/checkout/status/[token]/route.ts`

### 3.37. [B-O2] Security / Auth
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/checkins/respond/route.ts`
- **Kabul Kriteri:** Link'e cryptographically signed token ekle (HMAC-SHA256). Token'siz veya imza geçersizse `401`.
- **Etkilenen Dosyalar:** `src/app/api/checkins/respond/route.ts`, `src/lib/email.ts`

### 3.38. [B-O3] Error Handling
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/cart/validate-stock/route.ts:5`
- **Kabul Kriteri:** `try-catch` ile sarmala, geçersiz JSON'da `400`.
- **Etkilenen Dosyalar:** `src/app/api/cart/validate-stock/route.ts`

### 3.39. [B-O4] Security / Silent Fail
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/favorites/route.ts:11-12`
- **Kabul Kriteri:** `401` döndür, client hata ayıklaması için net ol.
- **Etkilenen Dosyalar:** `src/app/api/favorites/route.ts`

### 3.40. [B-O5] Security / Abuse
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/reviews/route.ts`
- **Kabul Kriteri:** Rate limiting (IP/user başına 5 yorum / saat), comment max 2000 karakter, duplicate check.
- **Etkilenen Dosyalar:** `src/app/api/reviews/route.ts`

### 3.41. [B-O6] Security / XSS
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/reviews/route.ts:81`
- **Kabul Kriteri:** Tüm `mediaUrls` öğeleri `https://` scheme ile başlayan URL regex ile validate et.
- **Etkilenen Dosyalar:** `src/app/api/reviews/route.ts`

### 3.42. [B-O7] Validation
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/stock-alerts/route.ts:10`
- **Kabul Kriteri:** zod schema kullan: `z.string().email()`.
- **Etkilenen Dosyalar:** `src/app/api/stock-alerts/route.ts`

### 3.43. [B-O8] Security / Timing Attack
- **Öncelik:** 🟡 Orta
- **Konum:** `src/lib/iyzico.ts:33`
- **Kabul Kriteri:** `timingSafeEqual` kullan. (B-K2 ile birlikte çözülecek.)
- **Etkilenen Dosyalar:** `src/lib/iyzico.ts`

### 3.44. [B-O9] Security / CSP
- **Öncelik:** 🟡 Orta
- **Konum:** `next.config.mjs:7`
- **Kabul Kriteri:** `unsafe-inline` kaldırılamıyorsa (Next.js gerekli), nonce kullan. `unsafe-eval`'i eval kullanmıyorsan kaldır.
- **Etkilenen Dosyalar:** `next.config.mjs`

### 3.45. [B-O10] Security / CORS
- **Öncelik:** 🟡 Orta
- **Konum:** `next.config.mjs`
- **Kabul Kriteri:** API route'larına CORS middleware ekle. Sadece `nerishoes.com.tr` domain'lerine izin ver.
- **Etkilenen Dosyalar:** `next.config.mjs`, `src/lib/cors.ts` (yeni)

### 3.46. [B-O11] Security / Filter Injection
- **Öncelik:** 🟡 Orta
- **Konum:** `src/lib/products.ts:152`
- **Kabul Kriteri:** `slug` önce sanitize et (sadece alfanümerik, tire, alt tire). Veya `.or()` yerine iki ayrı `.eq().or()` zinciri.
- **Etkilenen Dosyalar:** `src/lib/products.ts`

### 3.47. [B-O12] Privacy / Compliance
- **Öncelik:** 🟡 Orta
- **Konum:** `src/app/api/checkout/create-payment/route.ts:141-144`
- **Kabul Kriteri:** Hardcoded IP kaldır. Fallback: `undefined` veya `"0.0.0.0"`.
- **Etkilenen Dosyalar:** `src/app/api/checkout/create-payment/route.ts`

### 3.48. [B-O13] TypeScript / Runtime Safety
- **Öncelik:** 🟡 Orta
- **Konum:** `src/lib/supabase.ts:3-4`
- **Kabul Kriteri:** Runtime kontrol ekle. Env eksikse build-time hata.
- **Etkilenen Dosyalar:** `src/lib/supabase.ts`

### 3.49. [F-D1] Next.js / App Router
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/app/not-found.tsx:17-62`
- **Kabul Kriteri:** `html` ve `body` etiketleri kaldır, sadece içerik render et.
- **Etkilenen Dosyalar:** `src/app/not-found.tsx`

### 3.50. [F-D2] Tailwind CSS
- **Öncelik:** 🟢 Düşük
- **Konum:** `tailwind.config.ts:6`
- **Kabul Kriteri:** `"./src/pages/**/*"` satırı kaldır.
- **Etkilenen Dosyalar:** `tailwind.config.ts`

### 3.51. [F-D3] Dead Code
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/components/PageTransition.tsx`
- **Kabul Kriteri:** `src/components/PageTransition.tsx` dosyası kaldır.
- **Etkilenen Dosyalar:** `src/components/PageTransition.tsx`

### 3.52. [F-D4] i18n / SEO
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/app/[locale]/layout.tsx:106-108`
- **Kabul Kriteri:** `getTranslations({ locale, namespace: "schema" })` kullanarak dinamik description ekle.
- **Etkilenen Dosyalar:** `src/app/[locale]/layout.tsx`

### 3.53. [F-D5] Test Infrastructure
- **Öncelik:** 🟢 Düşük
- **Konum:** `tests/e2e/shopping-flow.spec.ts`, `tests/e2e/payment-form-stability.spec.ts`
- **Kabul Kriteri:** Local geliştirme ortamında Node.js kurulu ve `npm install` yapılmış olmalı. CI/CD pipeline (GitHub Actions) kur.
- **Etkilenen Dosyalar:** `.github/workflows/e2e.yml` (yeni)

### 3.54. [B-D1] Code Style
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/app/api/admin/logout/route.ts:4`
- **Kabul Kriteri:** `NextRequest` parametresi ekle.
- **Etkilenen Dosyalar:** `src/app/api/admin/logout/route.ts`

### 3.55. [B-D2] Code Style
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/lib/iyzico.ts:28`
- **Kabul Kriteri:** `import { createHmac, timingSafeEqual } from "crypto"` dosya başında yap.
- **Etkilenen Dosyalar:** `src/lib/iyzico.ts`

### 3.56. [B-D3] Configuration
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/lib/whatsapp.ts:4`
- **Kabul Kriteri:** Fallback numarası ekle veya env şartlı hata.
- **Etkilenen Dosyalar:** `src/lib/whatsapp.ts`

### 3.57. [B-D4] Security / MIME Spoof
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/app/api/admin/products/route.ts:42`
- **Kabul Kriteri:** Server-side magic number (`file-type` paketi) ile MIME type doğrula.
- **Etkilenen Dosyalar:** `src/app/api/admin/products/route.ts`

### 3.58. [B-D5] Validation
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/app/api/admin/stock/route.ts:45`
- **Kabul Kriteri:** `size` pozitif integer validation ekle.
- **Etkilenen Dosyalar:** `src/app/api/admin/stock/route.ts`

### 3.59. [B-D6] Validation
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/app/api/admin/products/route.ts:134-135`
- **Kabul Kriteri:** `Number.isNaN()` kontrolü ekle.
- **Etkilenen Dosyalar:** `src/app/api/admin/products/route.ts`

### 3.60. [B-D7] Validation
- **Öncelik:** 🟢 Düşük
- **Konum:** `src/app/api/admin/coupons/route.ts:47`
- **Kabul Kriteri:** `Number.isNaN()` kontrolü ekle.
- **Etkilenen Dosyalar:** `src/app/api/admin/coupons/route.ts`

---

## 4. Uygulama Adımları (Aşamalı)

Sprint planı, öncelik (Kritik → Yüksek → Orta → Düşük) ve bağımlılık sırasına göre oluşturulmuştur.

### Sprint 1 — Hafta 1 (Kritik Güvenlik + Canlı Düzeltme)

| # | Bulgu ID | Görev | Kabul Kriteri |
|---|---|---|---|
| 1 | B-K1 | `SUPABASE_SERVICE_ROLE_KEY` env tanımla, `supabaseAdmin` fallback kaldır | Test geçer, kod review onaylar |
| 2 | B-K2 | iyzico webhook HMAC doğrulaması ekle (K-1 gerçekten düzelt) | Test geçer, kod review onaylar |
| 3 | B-K3 | Webhook idempotency ekle (`paid` kontrolü) | Test geçer, kod review onaylar |
| 4 | B-K4 | `decrement_stock` RPC fonksiyonu migration'a ekle | Test geçer, kod review onaylar |
| 5 | B-K6 | Checkout fiyat manipülasyonu önle (DB'den doğrula) | Test geçer, kod review onaylar |
| 6 | B-K7 | `order_items` insert hata kontrolü + transaction | Test geçer, kod review onaylar |
| 7 | F-K1 | `hesap/layout.tsx` redirect düzelt, giriş/kayıt sayfaları dışarı al | Test geçer, kod review onaylar |
| 8 | F-Y2 | Canlı site `/tr/urunler` hatası — Vercel log incele + düzelt | Test geçer, kod review onaylar |

### Sprint 2 — Hafta 2 (Auth + Access Control)

| # | Bulgu ID | Görev | Kabul Kriteri |
|---|---|---|---|
| 1 | B-K5 | Adres silme/güncelleme sahip doğrulaması ekle | Test geçer, kod review onaylar |
| 2 | B-Y7 | Admin layout auth kontrolü ekle | Test geçer, kod review onaylar |
| 3 | B-Y8 | `supabaseAdmin.auth.updateUser` → authenticated client kullan | Test geçer, kod review onaylar |
| 4 | B-Y9 | `test-email` endpoint admin auth ile koru | Test geçer, kod review onaylar |
| 5 | B-Y2 | Admin login `timingSafeEqual` ile karşılaştır | Test geçer, kod review onaylar |
| 6 | B-Y3 | Admin login body parse hata kontrolü | Test geçer, kod review onaylar |
| 7 | B-Y4 | Admin cookie `secure` flag ekle | Test geçer, kod review onaylar |

### Sprint 3 — Hafta 3 (Rate Limiting + Brute Force Koruma)

| # | Bulgu ID | Görev | Kabul Kriteri |
|---|---|---|---|
| 1 | B-Y5 | Kupon brute-force — Upstash Redis rate limiting | Test geçer, kod review onaylar |
| 2 | B-O1 | `status/[token]` rate limiting + UUID validation | Test geçer, kod review onaylar |
| 3 | B-O5 | Review spam — rate limiting + duplicate check + max length | Test geçer, kod review onaylar |
| 4 | B-O2 | Check-in respond signed token ekle | Test geçer, kod review onaylar |
| 5 | B-O3 | `validate-stock` body parse hata kontrolü | Test geçer, kod review onaylar |
| 6 | B-O4 | Favorites GET `401` dön, silent fail kaldır | Test geçer, kod review onaylar |

### Sprint 4 — Hafta 4 (Frontend + SEO + Performans)

| # | Bulgu ID | Görev | Kabul Kriteri |
|---|---|---|---|
| 1 | F-K2 | Schema.org `availability` dinamik hale getir | Test geçer, kod review onaylar |
| 2 | F-K3 | `HtmlAttributes.tsx` kaldır, hydration mismatch düzelt | Test geçer, kod review onaylar |
| 3 | F-Y1 | `next/image` `unoptimized` kaldır, `sharp` kur | Test geçer, kod review onaylar |
| 4 | F-Y3 | Header nav `isActive` karşılaştırması düzelt | Test geçer, kod review onaylar |
| 5 | F-Y4 | `LanguageSwitcher` client-side navigation | Test geçer, kod review onaylar |
| 6 | F-Y5 | `ReviewForm` memory leak düzelt (`revokeObjectURL`) | Test geçer, kod review onaylar |
| 7 | F-Y6 | `StarRating` button type düzelt | Test geçer, kod review onaylar |
| 8 | F-Y7 | Checkout form `name`/`id` + label eşleşmesi | Test geçer, kod review onaylar |
| 9 | F-Y8 | İki farklı giriş sayfası birleştir | Test geçer, kod review onaylar |

### Sprint 5 — Hafta 5 (Validation + Input Security + Metadata)

| # | Bulgu ID | Görev | Kabul Kriteri |
|---|---|---|---|
| 1 | B-Y1 | Sabit sahte TCKN → form alanı ekle | Test geçer, kod review onaylar |
| 2 | B-Y6 | Verified Purchase `product_id` filtre ekle | Test geçer, kod review onaylar |
| 3 | B-Y10 | Supabase `.or()` string interpolation düzelt | Test geçer, kod review onaylar |
| 4 | B-Y11 | Webhook order update hata → response'a yansıt | Test geçer, kod review onaylar |
| 5 | B-O6 | Review `mediaUrls` URL validation | Test geçer, kod review onaylar |
| 6 | B-O7 | Stock alert email zod validation | Test geçer, kod review onaylar |
| 7 | B-O11 | `getProductBySlug` slug sanitize | Test geçer, kod review onaylar |
| 8 | B-O12 | Hardcoded fallback IP kaldır | Test geçer, kod review onaylar |
| 9 | B-O13 | Supabase non-null assertion → runtime kontrol | Test geçer, kod review onaylar |
| 10 | F-O4 | blog `generateStaticParams` locale ekle | Test geçer, kod review onaylar |
| 11 | F-O5 | Alt sayfalar `generateMetadata` override | Test geçer, kod review onaylar |

### Sprint 6 — Hafta 6 (CSP + CORS + Dead Code + Temizlik)

| # | Bulgu ID | Görev | Kabul Kriteri |
|---|---|---|---|
| 1 | B-O8 | HMAC `timingSafeEqual` düzelt | Test geçer, kod review onaylar |
| 2 | B-O9 | CSP `unsafe-inline` nonce ile değiştir | Test geçer, kod review onaylar |
| 3 | B-O10 | API route CORS politikası tanımla | Test geçer, kod review onaylar |
| 4 | F-O1 | `AboutContent` `requestAnimationFrame` cleanup | Test geçer, kod review onaylar |
| 5 | F-O2 | `ProductDetailContent` toast `setTimeout` cleanup | Test geçer, kod review onaylar |
| 6 | F-O6 | CSP `img-src` genişliği daralt | Test geçer, kod review onaylar |
| 7 | F-D1 | `not-found.tsx` `html`/`body` kaldır | Test geçer, kod review onaylar |
| 8 | F-D2 | `tailwind.config.ts` `pages` pattern kaldır | Test geçer, kod review onaylar |
| 9 | F-D3 | `PageTransition` dead code kaldır | Test geçer, kod review onaylar |
| 10 | F-D4 | `organizationSchema` i18n description | Test geçer, kod review onaylar |
| 11 | B-D1 | `logout` handler imza düzelt | Test geçer, kod review onaylar |
| 12 | B-D2 | `require crypto` → `import crypto` | Test geçer, kod review onaylar |
| 13 | B-D3 | `WHATSAPP_NUMBER` fallback düzelt | Test geçer, kod review onaylar |
| 14 | B-D4 | Image upload MIME server-side doğrula | Test geçer, kod review onaylar |
| 15 | B-D5 | Admin stock `size` validation | Test geçer, kod review onaylar |
| 16 | B-D6 | Admin products `price` NaN kontrolü | Test geçer, kod review onaylar |
| 17 | B-D7 | Admin coupons `discount_value` NaN kontrolü | Test geçer, kod review onaylar |
| 18 | F-D5 | Playwright CI/CD pipeline kur | Test geçer, kod review onaylar |

---

## 5. Öncelik Matrisi (Impact × Effort)

```
Impact (Etki)
    ^
    |  🔴 Kritik: B-K1, B-K2, B-K3, B-K4, B-K6, B-K7
 Yüksek |  🟠 Yüksek: B-Y5, B-Y7, B-Y2, B-Y6, F-K1, F-Y2
    |  🟡 Orta:  B-O5, B-O1, B-O2, B-O6
    |  🟢 Düşük: F-D3, F-D2, B-D1, B-D2, B-D3
    |
    +-----------------------------------> Effort (Çaba)
         Düşük      Orta      Yüksek
```

| Çeyrek | Strateji | Bulgu Örnekleri |
|---|---|---|
| **Yüksek Etki / Düşük Çaba** | Hemen yap | B-K3 (idempotency), B-Y4 (secure cookie), B-Y3 (body parse), F-Y6 (button type) |
| **Yüksek Etki / Yüksek Çaba** | Sprint 1-2 öncelik | B-K2 (HMAC), B-K6 (fiyat doğrulama), B-K7 (transaction), B-Y5 (rate limiting) |
| **Düşük Etki / Düşük Çaba** | Sprint 6'da yap | F-D1 (not-found), F-D2 (tailwind), F-D3 (dead code), B-D1-B-D3 (style) |
| **Düşük Etki / Yüksek Çaba** | Planlı / Gelecek sprint | B-O9 (CSP nonce), B-O10 (CORS middleware), F-D5 (Playwright CI) |

---

## 6. Riskler ve Mitigasyonlar

| Risk | Olasılık | Etki | Mitigasyon |
|---|---|---|---|
| iyzico webhook HMAC eklendikten sonra mevcut ödeme akışı bozulur | Orta | 🔴 Kritik | Sandbox ortamında test et; canlıya geçmeden iyzico sandbox callback simülasyonu yap |
| SUPABASE_SERVICE_ROLE_KEY yanlış tanımlanır, production RLS bozulur | Düşük | 🔴 Kritik | Staging ortamında önce test et; Supabase dashboard'dan RLS policy preview |
| Rate limiting Redis bağlantısı koparsa, API'ler yavaşlar | Düşük | 🟠 Yüksek | Redis timeout düşük tut (100ms); Redis yoksa passthrough (fail-open) |
| next/image unoptimized kaldırılırsa Vercel dışı hosting'te sharp eksikliği hata verir | Düşük | 🟠 Yüksek | `npm install sharp` ekle; build logundan sharp detection kontrol et |
| Fiyat doğrulama eklendiğinde client-side caching tutarsızlığı | Düşük | 🟡 Orta | Cart state'i server'a her submit'te yeniden doğrula; client-side cache süresini kısalt |
| Admin layout auth eklendiğinde meşru admin erişimi bozulabilir | Düşük | 🟠 Yüksek | Admin token yapısını `isAdminAuthenticated` fonksiyonu ile staging'de test et |

---

## 7. Başarı Kriterleri (Acceptance Criteria)

### 7.1 Güvenlik Kriterleri
- [ ] `/api/webhooks/iyzico` endpoint'ine HMAC imzasız POST atıldığında `401 Unauthorized` döner.
- [ ] Aynı `token` ile webhook iki kez çağrıldığında stok ve kupon tekrar işlenmez (idempotency).
- [ ] `decrement_stock` RPC çağrısı başarılı çalışır, stok negatif olmaz.
- [ ] Client-side `unitPrice` manipülasyonu `/api/checkout/create-payment` tarafından reddedilir (`400`).
- [ ] Başka bir kullanıcının adresi `DELETE /api/hesap/adresler` ile silinemez (`403`).
- [ ] `/admin/*` sayfalarına yetkisiz erişim `redirect` veya `401` alır.
- [ ] Admin login brute-force koruması aktif (5 deneme / 15 dk).
- [ ] Kupon kodu brute-force denemeleri `429 Too Many Requests` ile sınırlandırılır.

### 7.2 Frontend Kriterleri
- [ ] Giriş yapmadan `/tr/hesap/giris` açılabilir (yönlendirme yok).
- [ ] `/tr/urunler` sayfası ürün kataloğu içeriği döndürür (iletişim değil).
- [ ] Header nav link'i aktif sayfada altın renk/alt çizgi alır.
- [ ] Dil değiştirme tam sayfa yenilemesi yapmadan client-side navigation ile gerçekleşir.
- [ ] Tükenmiş ürünün Schema.org `availability` değeri `OutOfStock` olarak görünür.
- [ ] Checkout form input'larında browser autofill çalışır.

### 7.3 Performans Kriterleri
- [ ] Lighthouse resim optimizasyonu uyarısı kalkar.
- [ ] Initial bundle size `ProductsCatalog` ve `ProductDetailContent` dynamic import ile azalır.
- [ ] Memory leak testi (Chrome DevTools Memory tab) blob URL birikimi göstermez.

### 7.4 Test Kriterleri
- [ ] Her Sprint sonunda `npm run build` hatasız çalışır.
- [ ] `npm run test:e2e` Playwright testleri başarılı geçer (CI pipeline kurulduğunda).
- [ ] Vercel Preview Deployment her PR'da otomatik oluşur.

---

## 8. Değişiklik Yönetimi

| Değişiklik Türü | Onay Gereksinimi | Test Gereksinimi |
|---|---|---|
| Env var değişikliği (SUPABASE_SERVICE_ROLE_KEY, IYZICO_SECRET_KEY) | Ürün Yöneticisi + DevOps | Staging deployment testi |
| DB migration (decrement_stock RPC) | DBA review + yedek | Staging Supabase migration testi |
| API route auth değişikliği (admin, webhook) | Güvenlik review | Unit test + E2E test |
| CSP / CORS header değişikliği | Güvenlik review | CSP Evaluator + canlı test |
| next.config.mjs değişikliği | Frontend lead review | Build + Lighthouse |

---

## 9. Ek Bilgiler

### 9.1 Eski Teknik Doküman Uyarısı
`PROJE_TEKNIK_DOKUMANI.md` dosyası, eski NeriShoes (lokal Windows/SQLite/Express.js) projesine aittir. Mevcut web projesi (Next.js 14 / Supabase / iyzico) ile **eşleşmemektedir**. Bu PRD ve `tespit_edilen_eksiklikler.md` yalnızca mevcut web projesini kapsar.

### 9.2 Referans Raporlar
- `frontend_bulgu_raporu.md` — Frontend denetim raporu (2026-07-09)
- `backend_bulgu_raporu.md` — Backend/API denetim raporu (2026-07-09)
- `DENETIM-RAPORU.md` — Güvenlik denetim raporu (2026-06-30)
- `MOBIL-EKSIKLER.md` — Mobil uyumluluk iş planı

---

*Bu PRD, 2026-07-09 tarihinde Frontend ve Backend denetim raporları birleştirilerek oluşturulmuştur. Tüm bulgular somut kod kanıtı ile desteklenmiştir.*
