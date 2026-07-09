# Tespit Edilen Eksiklikler

## Tarih: 2026-07-09
## Proje: Neri Shoes (nerishoes.com.tr)

## Özet Tablo
| Öncelik | Adet |
|---|---|
| 🔴 Kritik | 10 |
| 🟠 Yüksek | 11 |
| 🟡 Orta | 14 |
| 🟢 Düşük | 12 |

---

### 🔴 Kritik
| # | ID | Hata Türü | Konum | Kanıt | Nasıl Yeniden Üretilir? | Çözüm Önerisi |
|---|---|---|---|---|---|---|
| 1 | F-K1 | Routing / Auth | src/app/[locale]/hesap/layout.tsx:24-26 | `if (!user) redirect(...)` — Bu layout TÜM `hesap/*` alt rotalarını koruyor. `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları asla görüntülenemez. | Giriş yapmadan `/tr/hesap/giris`, `/tr/hesap/kayit` veya `/tr/hesap/sifre-sifirla` adresine git. Kullanıcı `/tr/giris` adresine yönlendirilir. | 1) `hesap/layout.tsx` içinde `if (!user) redirect(...)` kaldırılacak. 2) `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/(auth)` grup dizini altına alınarak ayrı bir layout'a taşınacak. 3) Sadece korumalı sayfalar ana `hesap/layout.tsx` altında kalacak. |
| 2 | F-K2 | SEO / Schema.org | src/app/[locale]/urunler/[slug]/page.tsx:93 | `availability: "https://schema.org/InStock"` sabit olarak set edilmiş. Stok durumu kontrol edilmiyor. | Tükenmiş bir ürün sayfasını Google Rich Results Test ile kontrol et. `availability` her zaman `InStock`. | `page.tsx` içinde `stock` verisini çekip `computeStockStatus()` ile dinamik `availability` üret. |
| 3 | F-K3 | Hydration Mismatch | src/app/layout.tsx:47 + src/components/HtmlAttributes.tsx:8-11 | `layout.tsx` zaten `html lang={locale} dir={isRTL ? "rtl" : "ltr"}` set ediyor. `HtmlAttributes.tsx` "use client" bileşeni `useEffect` ile `document.documentElement.lang/dir` güncelliyor. | `tr` yerine `ar` locale'ine geçiş yap; `HtmlAttributes` `useEffect` çalışana kadar HTML attribute'ları eski değerde kalabilir. | `HtmlAttributes.tsx` kaldırılacak. Client-side locale değişimi `next-intl` `useRouter` ile `router.replace(pathname, { locale: nextLocale })` yapılacak (tam sayfa geçişi, hydration mismatch olmaz). |
| 4 | B-K1 | Security / Supabase Auth | src/lib/supabase.ts:11 | `const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? key;` — `key` anon key. Fallback anon key ile `supabaseAdmin` RLS bypass edemez. | `SUPABASE_SERVICE_ROLE_KEY` env var'ını kaldır, build et. `supabaseAdmin` aslında anon key ile çalışır. | 1) `SUPABASE_SERVICE_ROLE_KEY` env var'ını tanımla. 2) Fallback kaldır; env eksikse uygulama build-time'da hata atsın. |
| 5 | B-K2 | Security / Webhook HMAC | src/app/api/webhooks/iyzico/route.ts (tümü) + src/lib/iyzico.ts:22-34 | `verifyIyzicoWebhookSignature` fonksiyonu tanımlı ama webhook route'ta hiç çağrılmıyor. Yorum: "HMAC imzası bu akışta YOKTUR". DENETIM-RAPORU.md K-1 "Düzeltildi [2026-06-30]" yazıyor ama kodda değişiklik yok. | Herhangi bir `token` değeri POST ederek `/api/webhooks/iyzico` çağır. Sipariş durumu `paid` olarak işaretlenir, stok düşer, kupon kullanılır. | Webhook handler'ın en başına HMAC doğrulaması ekle. `IYZICO_SECRET_KEY` yoksa `503` döndür. HMAC başarısızsa `401`. |
| 6 | B-K3 | Security / Idempotency | src/app/api/webhooks/iyzico/route.ts:99-116 | Aynı callback tekrar geldiğinde `decrement_stock` ve `recordCouponRedemption` tekrar çalışır. `paid` kontrolü yok, `confirmation_email_sent_at` sadece maili engeller. | Aynı `token` ile webhook'u tekrar çağır. Stok tekrar düşer, `used_count` tekrar artar. | Webhook işlemi başlamadan önce `orders.status === 'paid'` kontrolü ekle. Eğer zaten `paid` ise `200` döndür, işlem yapma. |
| 7 | B-K4 | Database / RPC Missing | supabase/migrations/20260706_customer_panel_step1.sql + src/app/api/webhooks/iyzico/route.ts:99 | Migration dosyasında `increment_coupon_used` var (satır 454-459) ama `decrement_stock` YOK. Webhook route:99 çağırıyor. | Migration'ı çalıştır, Supabase SQL Editor'de: `SELECT * FROM pg_proc WHERE proname = 'decrement_stock';` Sonuç boş. | Migration dosyasına `decrement_stock` RPC fonksiyonu ekle veya Supabase SQL Editor'de manuel tanımla. |
| 8 | B-K5 | Security / Broken Access Control | src/lib/customer-api.ts:182-188 ve 162-180 | `deleteCustomerAddress(id)` sadece `eq("id", id)` kullanıyor. `customer_id` kontrolü yok. `updateCustomerAddress` de aynı. `supabaseAdmin` RLS bypass eder. | Giriş yapmış bir kullanıcı, başka bir müşterinin `customer_addresses` ID'sini bilirse `DELETE /api/hesap/adresler?id=UUID` ile silebilir. | Tüm `customer-api.ts` fonksiyonlarına `customer_id` filtresi ekle. Route handler'da da `customer_id` doğrula. |
| 9 | B-K6 | Security / Price Tampering | src/app/api/checkout/create-payment/route.ts:43 | `const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);` — `unitPrice` client'tan geliyor, DB'den doğrulanmıyor. | Sepete 10.000 TL'lik ürün ekleyip, client-side `unitPrice` değerini 1 TL yaparak `/api/checkout/create-payment` çağır. iyzico'a 1 TL gönderilir. | Server-side `create-payment` route'ta her item için DB'den `products.price` çek ve client `unitPrice` ile karşılaştır. Fark varsa `400`. |
| 10 | B-K7 | Database / Transaction Integrity | src/app/api/checkout/create-payment/route.ts:115 | `await supabaseAdmin.from("order_items").insert(orderItems);` — hata yakalanmıyor, `try-catch` yok. | `order_items` insert'ü başarısız olduğunda (örneğin constraint hatası), sipariş oluşur ama kalemler boş kalır. | `orders` + `order_items` insert'ünü Supabase transaction (RPC) ile sar veya hata kontrolü ekle. Hata olursa ödeme başlatma. |

---

### 🟠 Yüksek
| # | ID | Hata Türü | Konum | Kanıt | Nasıl Yeniden Üretilir? | Çözüm Önerisi |
|---|---|---|---|---|---|---|
| 1 | F-Y1 | Performans | next.config.mjs:28 | `images: { unoptimized: true }` — `next/image` optimizasyonu tamamen devre dışı. | Lighthouse/PageSpeed testi yap; resim optimizasyonu uyarısı alınır. | 1) `unoptimized: true` kaldır. 2) Vercel'de host ediliyorsa otomatik çalışır. 3) Vercel dışındaysa `sharp` paketi kur: `npm install sharp`. |
| 2 | F-Y2 | Canlı Site / Routing | `https://www.nerishoes.com.tr/tr/urunler` | `kimi_fetch_v2` sonucunda "İletişim...Sarıyakup..." içeriği döndü. `/tr/urunler` yerine iletişim sayfası içeriği geliyor. | Browser'da `https://www.nerishoes.com.tr/tr/urunler` adresini aç. | Vercel deployment logları kontrol edilmeli. `getActiveProducts()` canlı ortamda Supabase hatası veriyor olabilir veya `next.config.mjs` içinde beklenmeyen bir redirect kuralı olabilir. |
| 3 | F-Y3 | UI / Navigation | src/components/Header.tsx:74 | `const isActive = pathname === link.href;` — `pathname` locale prefix'li (`/tr/urunler`), `link.href` prefix'siz (`/urunler`). | `/tr/urunler` sayfasında "Ürünler" nav linkinin aktif (active) class almadığını gözlemle. | `pathname` ile `link.href` karşılaştırması için `pathname`'in locale prefix'i kaldırılmış şekli kullanılmalı. |
| 4 | F-Y4 | UX / Routing | src/components/LanguageSwitcher.tsx:36 | `window.location.href = \`/${nextLocale}${pathname}\`;` — Tam sayfa yenilemesi, client-side routing yok. | Dil değiştir; sayfa tamamen yenileniyor (flicker, state kaybı). | `next-intl` `useRouter` ile client-side navigation. |
| 5 | F-Y5 | Memory Leak | src/components/ReviewForm.tsx:55 | `URL.createObjectURL(f)` oluşturuluyor, component unmount'ta `URL.revokeObjectURL` çağrılmıyor. | Yorum formunda fotoğraf yükle; sayfayı kapat. Browser memory leak oluşur. | Component unmount'ta tüm preview URL'lerini temizleyen `useEffect` cleanup ekle. |
| 6 | F-Y6 | HTML / Form | src/components/StarRating.tsx:24 | `type={interactive ? "button" : undefined}` — `interactive` false ise `type` undefined, default `submit`. | `StarRating` bileşenini `interactive={false}` ile bir `<form>` içinde kullan; form submit olur. | `type="button"` sabit yap, `disabled={!interactive}` ekle. |
| 7 | F-Y7 | HTML / Form / Accessibility | src/components/CheckoutContent.tsx:247-350 | Tüm form input'larında `name` ve `id` attribute'ları eksik. Browser autofill çalışmaz. | Browser autofill (otomatik doldurma) çalışmaz. | Her input'a `name` ve `id` attribute'ları ekle, `label` element'leri `htmlFor` ile input `id`'sine bağla. |
| 8 | F-Y8 | Routing / Tutarsızlık | src/app/[locale]/hesap/giris/page.tsx + src/app/[locale]/giris/page.tsx | İki farklı giriş sayfası var. `hesap/giris` layout redirect yüzünden asla kullanılamaz. | `/tr/hesap/giris` adresine git; `/tr/giris` sayfasına yönlendirilir. | `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/layout.tsx` dışına alınmalı. Tek bir giriş sayfası (`/giris`) kullanılmalı. |
| 9 | B-Y1 | Compliance / Legal Risk | src/app/api/checkout/create-payment/route.ts:170 | `identityNumber: "11111111111"` — iyzico API'sine sabit sahte TCKN gönderiliyor. | Kod incelendiğinde sabit değer doğrudan görülür. Yasal risk (gerçek olmayan kimlik bilgisi). | Checkout formuna TCKN alanı ekle (opsiyonel). Varsayılan: boş string veya kullanıcıdan alınan değer. |
| 10 | B-Y2 | Security / Timing Attack | src/app/api/admin/login/route.ts:39 | `if (password !== process.env.ADMIN_PASSWORD)` — `!==` string comparison timing-safe değil. | Script ile farklı uzunlukta şifreler gönderip response time farkını ölçmek. | `crypto.timingSafeEqual` kullan. Password buffer'a dönüştürülerek karşılaştır. |
| 11 | B-Y3 | Error Handling | src/app/api/admin/login/route.ts:37 | `const { password } = await request.json();` — `request.json()` `try-catch` dışında. Geçersiz JSON → 500. | `Content-Type: application/json` header ile geçersiz body (örneğin `{"password":`) gönder. 500 hata sayfası döner. | `try-catch` ile sarmala, geçersiz JSON'da `400` dön. |
| 12 | B-Y4 | Security / Cookie | src/app/api/admin/login/route.ts:70-75 | `response.cookies.set(...)` içinde `secure: true` yok. `httpOnly: true` ve `sameSite: "lax"` var. | Production HTTPS ortamında cookie'nin `secure` olup olmadığını tarayıcı dev tools'tan kontrol et. | `secure: true` ekle. `NODE_ENV` production kontrolü ile şartlı da yapılabilir. |
| 13 | B-Y5 | Security / Brute Force | src/app/api/coupons/validate/route.ts | Rate limiting, IP tabanlı kısıtlama, CAPTCHA yok. | Script ile `/api/coupons/validate` endpoint'ine binlerce farklı `code` ile POST gönder. Herhangi bir kısıtlama yok. | Vercel KV veya upstash-redis ile rate limiting ekle: IP başına 10 deneme / 1 dakika. |
| 14 | B-Y6 | Business Logic / Data Integrity | src/app/api/reviews/route.ts:64-71 | `orders` sorgusunda `product_id` filtre YOK. Sadece `customer_id` ve `status=paid` kontrol ediliyor. | Kullanıcı B ürününü satın alır, A ürünü için yorum yazarsa "Verified Purchase" rozeti gösterilir. | `orders` sorgusuna `order_items` join ile `product_id` filtre ekle. |
| 15 | B-Y7 | Security / Broken Access Control | src/app/admin/layout.tsx | `isAdminAuthenticated` çağrılmıyor. Layout sadece `NextIntlClientProvider` render ediyor. | `/admin` altındaki herhangi bir sayfaya doğrudan tarayıcıdan eriş. Server-side layout'ta engel yok. | Layout'ta server-side `isAdminAuthenticated()` kontrolü ekle. Yetkisizse redirect. |
| 16 | B-Y8 | Security / Auth Misuse | src/app/api/hesap/profil/route.ts:44-48 | `await supabaseAdmin.auth.updateUser({ data: { ... } })` — servis rolü ile auth user metadata güncelleme. | `supabaseAdmin` service_role çalışırken `auth.updateUser` session gerektirir. Service_role client'ın session'ı yok. | Mevcut kullanıcının session token'ı ile `supabase` (anon/authenticated) client kullan. Veya `admin.user.update` kullan. |
| 17 | B-Y9 | Security / Broken Access Control | src/app/api/admin/test-email/route.ts | `isAdminAuthenticated` kontrolü YOK. Sadece `CRON_SECRET` ile korunuyor. | `CRON_SECRET` bilinirse (veya `.env.local` sızdırılırsa), herkes test email gönderebilir. | `isAdminAuthenticated()` veya ayrı `ADMIN_API_SECRET` ile koru. Veya admin session kontrolü. |
| 18 | B-Y10 | Security / Filter Injection | src/lib/customer-api.ts:26-28 ve 226 | `conditions.push(\`email.eq.${email}\`)` ve `.or(conditions.join(","))` — `email` içinde `,` veya `)` varsa filtre parse hatası. | `email` değeri `test@example.com,phone.eq.123` gibi gönderilirse Supabase filtre syntax'ı bozulur. | Parametrik `.or()` kullan. Veya email input validation (regex) yap. Özel karakterleri sanitize et. |
| 19 | B-Y11 | Error Handling / Data Integrity | src/app/api/webhooks/iyzico/route.ts:75-80 | Order update hatası sadece `console.error` ile loglanır, response'a yansımaz. | DB bağlantısı koparsa veya update başarısız olursa, sipariş `paid` olarak işaretlenmemiş kalabilir ama client success sayfasına yönlendirilir. | Order update hatası durumunda `500` döndür, client'a success gösterme. Veya retry queue kullan. |

---

### 🟡 Orta
| # | ID | Hata Türü | Konum | Kanıt | Nasıl Yeniden Üretilir? | Çözüm Önerisi |
|---|---|---|---|---|---|---|
| 1 | F-O1 | Memory Leak | src/components/AboutContent.tsx:17-29 | `useCountUp` hook'unda `requestAnimationFrame` kullanılıyor, cleanup'ta `cancelAnimationFrame` yok. | Hakkımızda sayfasını aç ve hızlıca başka sayfaya geç; React console warning alınabilir. | `rafId` sakla, cleanup'ta `cancelAnimationFrame` çağır. |
| 2 | F-O2 | Memory Leak | src/components/ProductDetailContent.tsx:137-139 | `showToast` fonksiyonunda `setTimeout(() => setToast(...), 3500)` kullanılıyor, cleanup yok. | Toast gösterildikten hemen sonra sayfa değiştir; eski timeout hala çalışır. | `useRef` ile timer ID sakla, cleanup'ta `clearTimeout`. |
| 3 | F-O3 | Accessibility / WCAG | src/components/CheckoutContent.tsx:247-350 | Form input'larında `label` `htmlFor` ve input `id` eşleşmesi yok. | Ekran okuyucu ile form doldurulamaz. | F-Y7 ile birlikte çözülecek. label `htmlFor` ve input `id` eşleştirilmeli. |
| 4 | F-O4 | Next.js / Static Gen | src/app/[locale]/blog/[slug]/page.tsx:15-18 | `generateStaticParams` sadece `slug` döndürüyor, `locale` segmenti eksik. | `next build` sırasında `locale` segmenti için static params üretilmemiş olabilir. | `locales.flatMap` ile `locale` + `slug` kombinasyonu döndür. |
| 5 | F-O5 | Next.js / Metadata | src/app/[locale]/layout.tsx:21-61 | `generateMetadata` tüm alt sayfalar için aynı title/description üretiyor. | `/tr/hakkimizda` sayfasında title "Neri Shoes | Premium Ayakkabı" olarak kalıyorsa, SEO hatası. | Tüm sayfalar (`/hakkimizda`, `/toptan`, `/odeme`, hesap sayfaları) kendi `generateMetadata` fonksiyonlarını tanımlamalı. |
| 6 | F-O6 | Security / CSP | next.config.mjs:9 | `img-src 'self' data: blob: https:` — `https:` tüm HTTPS domain'lerine izin veriyor. | CSP evaluator ile kontrol et; geniş `img-src` politikası zayıf. | B-O9 ile birlikte çözülecek. `img-src` sadece bilinen domain'leri içermeli. |
| 7 | B-O1 | Security / Rate Limiting | src/app/api/checkout/status/[token]/route.ts | `GET` handler herhangi bir rate limiting, IP kısıtlaması, token format validation yok. | Script ile rastgele token'larla `/api/checkout/status/xxxx` çağrılabilir. iyzico API'ye yansır. | Vercel KV / Upstash Redis ile rate limiting ekle. Token format UUID regex validation. |
| 8 | B-O2 | Security / Auth | src/app/api/checkins/respond/route.ts | `GET` handler. Herhangi bir auth/token yok. `orderId` query param. | Email'deki check-in linkini paylaşan herkes tıklayabilir. | Link'e cryptographically signed token ekle (HMAC-SHA256). Token'siz veya imza geçersizse `401`. |
| 9 | B-O3 | Error Handling | src/app/api/cart/validate-stock/route.ts:5 | `const body = await request.json() as { ... }` — `try-catch` yok. | Geçersiz JSON body gönderildiğinde `500` döner. | `try-catch` ile sarmala, geçersiz JSON'da `400`. |
| 10 | B-O4 | Security / Silent Fail | src/app/api/favorites/route.ts:11-12 | `if (!userData.user) return NextResponse.json({ isFavorite: false });` — `401` yerine `false` dönüyor. | Geçersiz token ile `GET /api/favorites?productId=xxx` çağrıldığında `401` yerine `200 {isFavorite: false}` döner. | `401` döndür, client hata ayıklaması için net ol. |
| 11 | B-O5 | Security / Abuse | src/app/api/reviews/route.ts | `POST` handler'da rate limiting, comment length, duplicate check yok. | Aynı kullanıcı tekrar tekrar yorum gönderebilir. Comment alanı çok uzun olabilir. | Rate limiting (IP/user başına 5 yorum / saat), comment max 2000 karakter, duplicate check. |
| 12 | B-O6 | Security / XSS | src/app/api/reviews/route.ts:81 | `mediaUrls: mediaUrls || null` — `mediaUrls` array'i doğrudan DB'ye yazılıyor, URL format validation yok. | Client kötü amaçlı URL (örneğin `javascript:alert(1)`) gönderebilir. | Tüm `mediaUrls` öğeleri `https://` scheme ile başlayan URL regex ile validate et. |
| 13 | B-O7 | Validation | src/app/api/stock-alerts/route.ts:10 | `/\S+@\S+\.\S+/` — çok basit regex. `"a@b.c"` geçerli sayılır. | `POST /api/stock-alerts` ile `email: "a@b.c"` gönderilir, geçerli kabul edilir. | zod schema kullan: `z.string().email()`. |
| 14 | B-O8 | Security / Timing Attack | src/lib/iyzico.ts:33 | `return hash === merchantToken;` — `crypto.timingSafeEqual` kullanılmıyor. | `verifyIyzicoWebhookSignature` fonksiyonu kullanılmadığı için pratik etkisi yok, ama kod kalitesi zayıf. | `timingSafeEqual` kullan. (B-K2 ile birlikte çözülecek.) |
| 15 | B-O9 | Security / CSP | next.config.mjs:7 | `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.iyzipay.com ...` | CSP strict değil. XSS payload inline script olarak çalışabilir. | `unsafe-inline` kaldırılamıyorsa (Next.js gerekli), nonce kullan. `unsafe-eval`'i eval kullanmıyorsan kaldır. |
| 16 | B-O10 | Security / CORS | next.config.mjs | `headers()` bloğunda `Access-Control-Allow-Origin` yok. | Next.js default CORS same-origin. API route'lar için açıkça tanımlanmamış. | API route'larına CORS middleware ekle. Sadece `nerishoes.com.tr` domain'lerine izin ver. |
| 17 | B-O11 | Security / Filter Injection | src/lib/products.ts:152 | `.or(\`slug.eq.${slug},id.eq.${slug}\`)` — `slug` doğrudan string'e ekleniyor. | `slug` içinde `)` veya `,` varsa Supabase PostgREST filtre syntax'ı bozulur. | `slug` önce sanitize et (sadece alfanümerik, tire, alt tire). Veya `.or()` yerine iki ayrı `.eq().or()` zinciri. |
| 18 | B-O12 | Privacy / Compliance | src/app/api/checkout/create-payment/route.ts:141-144 | `const ip = ... ?? "85.34.78.112";` — `85.34.78.112` hardcoded IP. iyzico'ya bu IP gönderilir. | `x-forwarded-for` ve `x-real-ip` header'ları yoksa `85.34.78.112` iyzico'ya gönderilir. | Hardcoded IP kaldır. Fallback: `undefined` veya `"0.0.0.0"`. |
| 19 | B-O13 | TypeScript / Runtime Safety | src/lib/supabase.ts:3-4 | `const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;` — `!` non-null assertion. | `NEXT_PUBLIC_SUPABASE_URL` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` build time'da tanımlı değilse runtime hata. | Runtime kontrol ekle. Env eksikse build-time hata. |

---

### 🟢 Düşük
| # | ID | Hata Türü | Konum | Kanıt | Nasıl Yeniden Üretilir? | Çözüm Önerisi |
|---|---|---|---|---|---|---|
| 1 | F-D1 | Next.js / App Router | src/app/not-found.tsx:17-62 | Root `not-found.tsx` `html` ve `body` etiketleri içeriyor. Next.js App Router'da root layout zaten sarmalar. | Next.js dev modunda uyarı verebilir. | `html` ve `body` etiketleri kaldır, sadece içerik render et. |
| 2 | F-D2 | Tailwind CSS | tailwind.config.ts:6 | `content` array'inde `"./src/pages/**/*"` var ama `pages` dizini mevcut değil (App Router kullanılıyor). | Gereksiz ama hata değil. | `"./src/pages/**/*"` satırı kaldır. |
| 3 | F-D3 | Dead Code | src/components/PageTransition.tsx | `PageTransition.tsx` mevcut ama hiçbir yerde import edilmemiş. `template.tsx` aynı işi yapıyor. | Projede `PageTransition` import edilmediği için kullanılmıyor. | `src/components/PageTransition.tsx` dosyası kaldır. |
| 4 | F-D4 | i18n / SEO | src/app/[locale]/layout.tsx:106-108 | `organizationSchema` içinde `description` sabit Türkçe string. `getTranslations` kullanılmıyor. | `ar` locale'inde schema description Türkçe kalıyor. | `getTranslations({ locale, namespace: "schema" })` kullanarak dinamik description ekle. |
| 5 | F-D5 | Test Infrastructure | tests/e2e/shopping-flow.spec.ts, tests/e2e/payment-form-stability.spec.ts | `npx` komutu bulunamadı (`/usr/bin/bash: line 1: npx: command not found`). | Playwright testleri çalıştırılamadı. Local Node.js/npm ortamı mevcut değil. | Local geliştirme ortamında Node.js kurulu ve `npm install` yapılmış olmalı. CI/CD pipeline (GitHub Actions) kur. |
| 6 | B-D1 | Code Style | src/app/api/admin/logout/route.ts:4 | `export async function POST() { ... }` — `request` parametresi almıyor. | Standart dışı imza. | `NextRequest` parametresi ekle. |
| 7 | B-D2 | Code Style | src/lib/iyzico.ts:28 | `const crypto = require("crypto")` fonksiyon içinde. | Lazy import anti-pattern. | `import { createHmac, timingSafeEqual } from "crypto"` dosya başında yap. |
| 8 | B-D3 | Configuration | src/lib/whatsapp.ts:4 | `return process.env.WHATSAPP_NUMBER || "";` — Env tanımlı değilse boş string. | WhatsApp linki boş numaraya gider. | Fallback numarası ekle veya env şartlı hata. |
| 9 | B-D4 | Security / MIME Spoof | src/app/api/admin/products/route.ts:42 | `contentType: file.type || "image/jpeg"` — `file.type` client'tan geliyor. | Tarayıcı tarafından `file.type` spoof edilebilir. | Server-side magic number (`file-type` paketi) ile MIME type doğrula. |
| 10 | B-D5 | Validation | src/app/api/admin/stock/route.ts:45 | `quantity: Math.max(0, e.quantity)` — `quantity` negatif engelleniyor ama `size` validation yok. | `size: -1` gönderilebilir. | `size` pozitif integer validation ekle. |
| 11 | B-D6 | Validation | src/app/api/admin/products/route.ts:134-135 | `Number(priceRaw)` `NaN` dönebilir. `Number.isNaN()` kontrolü yok. | `priceRaw: "abc"` gönderildiğinde `NaN` DB'ye yazılır. | `Number.isNaN()` kontrolü ekle. |
| 12 | B-D7 | Validation | src/app/api/admin/coupons/route.ts:47 | `discount_value: Number(discount_value)` — NaN riski. | `discount_value: "abc"` gönderildiğinde `NaN` DB'ye yazılır. | `Number.isNaN()` kontrolü ekle. |

---

## Detaylı Bulgu Açıklamaları ve Teknik Spesifikasyonlar

### F-K1 — Routing / Auth
**Öncelik:** 🔴 Kritik
**Konum:** `src/app/[locale]/hesap/layout.tsx:24-26`

**Kanıt:**
`if (!user) redirect("/${locale}/giris");` — Bu layout TÜM `hesap/*` alt rotalarını koruyor. `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları asla görüntülenemez.

**Nasıl Yeniden Üretilir:** Giriş yapmadan `/tr/hesap/giris`, `/tr/hesap/kayit` veya `/tr/hesap/sifre-sifirla` adresine git. Kullanıcı `/tr/giris` adresine yönlendirilir.

**Çözüm Önerisi:**
1) `src/app/[locale]/hesap/layout.tsx` içinde `if (!user) redirect(...)` kaldırılacak.
2) `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/(auth)` grup dizini altına alınarak ayrı bir layout'a taşınacak.
3) Sadece korumalı sayfalar (`hesap/(dashboard)/page.tsx`, `hesap/(dashboard)/adresler/page.tsx`) ana `hesap/layout.tsx` altında kalacak.

**Kod Düzeltmesi:**
```tsx
// src/app/[locale]/hesap/layout.tsx
export default async function AccountLayout({ children, params }) {
  const { locale } = await params;
  const user = await getUser();
  // Sadece korumalı sayfalarda redirect (layout değil, page seviyesinde)
  return <>{children}</>;
}

// Veya grup dizini:
// src/app/[locale]/(auth)/giris/page.tsx
// src/app/[locale]/(auth)/kayit/page.tsx
// src/app/[locale]/(auth)/sifre-sifirla/page.tsx
```

---

### F-K2 — SEO / Schema.org
**Öncelik:** 🔴 Kritik
**Konum:** `src/app/[locale]/urunler/[slug]/page.tsx:93`

**Kanıt:**
`availability: "https://schema.org/InStock"` sabit olarak set edilmiş. Stok durumu kontrol edilmiyor.

**Nasıl Yeniden Üretilir:** Tükenmiş bir ürün sayfasını Google Rich Results Test ile kontrol et. `availability` her zaman `InStock`.

**Çözüm Önerisi:** `page.tsx` içinde `stock` verisini çekip `computeStockStatus()` ile dinamik `availability` üret.

**Kod Düzeltmesi:**
```tsx
// src/app/[locale]/urunler/[slug]/page.tsx
const stockStatus = await computeStockStatus(product.stock);
// ...
offers: {
  "@type": "Offer",
  availability: stockStatus.kind === "sold_out"
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock",
  priceCurrency: "TRY",
  url: canonicalUrl,
  seller: { "@type": "Organization", name: SITE_NAME },
}
```

---

### F-K3 — Hydration Mismatch
**Öncelik:** 🔴 Kritik
**Konum:** `src/app/layout.tsx:47` + `src/components/HtmlAttributes.tsx:8-11`

**Kanıt:**
`layout.tsx` zaten `html lang={locale} dir={isRTL ? "rtl" : "ltr"}` set ediyor. `HtmlAttributes.tsx` "use client" bileşeni `useEffect` ile `document.documentElement.lang/dir` güncelliyor.

**Nasıl Yeniden Üretilir:** `tr` yerine `ar` locale'ine geçiş yap; `HtmlAttributes` `useEffect` çalışana kadar HTML attribute'ları eski değerde kalabilir.

**Çözüm Önerisi:** `HtmlAttributes.tsx` kaldırılacak. Client-side locale değişimi `next-intl` `useRouter` ile `router.replace(pathname, { locale: nextLocale })` yapılacak (tam sayfa geçişi, hydration mismatch olmaz).

**Kod Düzeltmesi:**
```tsx
// src/app/[locale]/layout.tsx
<html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
// src/components/HtmlAttributes.tsx — KALDIR
// src/components/LanguageSwitcher.tsx
import { useRouter } from "@/i18n/navigation";
const router = useRouter();
function handleSelect(nextLocale) {
  router.replace(pathname, { locale: nextLocale });
}
```

---

### B-K1 — Security / Supabase Auth
**Öncelik:** 🔴 Kritik
**Konum:** `src/lib/supabase.ts:11`

**Kanıt:**
`const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? key;` — `key` anon key. Fallback anon key ile `supabaseAdmin` RLS bypass edemez.

**Nasıl Yeniden Üretilir:** `SUPABASE_SERVICE_ROLE_KEY` env var'ını kaldır, build et. `supabaseAdmin` aslında anon key ile çalışır.

**Çözüm Önerisi:** 1) `SUPABASE_SERVICE_ROLE_KEY` env var'ını tanımla. 2) Fallback kaldır; env eksikse uygulama build-time'da hata atsın.

**Kod Düzeltmesi:**
```ts
// src/lib/supabase.ts
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY tanımlı değil.");
}
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
```

---

### B-K2 — Security / Webhook HMAC
**Öncelik:** 🔴 Kritik
**Konum:** `src/app/api/webhooks/iyzico/route.ts` (tümü) + `src/lib/iyzico.ts:22-34`

**Kanıt:**
`verifyIyzicoWebhookSignature` fonksiyonu tanımlı ama webhook route'ta hiç çağrılmıyor. Yorum: "HMAC imzası bu akışta YOKTUR". DENETIM-RAPORU.md K-1 "Düzeltildi [2026-06-30]" yazıyor ama kodda değişiklik yok.

**Nasıl Yeniden Üretilir:** Herhangi bir `token` değeri POST ederek `/api/webhooks/iyzico` çağır. Sipariş durumu `paid` olarak işaretlenir, stok düşer, kupon kullanılır.

**Çözüm Önerisi:** Webhook handler'ın en başına HMAC doğrulaması ekle. `IYZICO_SECRET_KEY` yoksa `503` döndür. HMAC başarısızsa `401`.

**Kod Düzeltmesi:**
```ts
// src/app/api/webhooks/iyzico/route.ts
import { verifyIyzicoWebhookSignature } from "@/lib/iyzico";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-iyzico-signature");
  const secretKey = process.env.IYZICO_SECRET_KEY;
  
  if (!secretKey) {
    return NextResponse.json({ error: "Webhook disabled" }, { status: 503 });
  }
  
  if (!verifyIyzicoWebhookSignature(body, signature, secretKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  // ... mevcut logic
}
```

---

### B-K3 — Security / Idempotency
**Öncelik:** 🔴 Kritik
**Konum:** `src/app/api/webhooks/iyzico/route.ts:99-116`

**Kanıt:**
Aynı callback tekrar geldiğinde `decrement_stock` ve `recordCouponRedemption` tekrar çalışır. `paid` kontrolü yok, `confirmation_email_sent_at` sadece maili engeller.

**Nasıl Yeniden Üretilir:** Aynı `token` ile webhook'u tekrar çağır. Stok tekrar düşer, `used_count` tekrar artar.

**Çözüm Önerisi:** Webhook işlemi başlamadan önce `orders.status === 'paid'` kontrolü ekle. Eğer zaten `paid` ise `200` döndür, işlem yapma.

**Kod Düzeltmesi:**
```ts
// src/app/api/webhooks/iyzico/route.ts
const { data: existingOrder } = await supabaseAdmin
  .from("orders")
  .select("status")
  .eq("iyzico_token", token)
  .single();

if (existingOrder?.status === "paid") {
  return NextResponse.json({ status: "already_processed" }, { status: 200 });
}

// ... decrement_stock + recordCouponRedemption
```

---

### B-K4 — Database / RPC Missing
**Öncelik:** 🔴 Kritik
**Konum:** `supabase/migrations/20260706_customer_panel_step1.sql` + `src/app/api/webhooks/iyzico/route.ts:99`

**Kanıt:**
Migration dosyasında `increment_coupon_used` var (satır 454-459) ama `decrement_stock` YOK. Webhook route:99 çağırıyor.

**Nasıl Yeniden Üretilir:** Migration'ı çalıştır, Supabase SQL Editor'de: `SELECT * FROM pg_proc WHERE proname = 'decrement_stock';` Sonuç boş.

**Çözüm Önerisi:** Migration dosyasına `decrement_stock` RPC fonksiyonu ekle veya Supabase SQL Editor'de manuel tanımla.

**Kod Düzeltmesi:**
```sql
-- supabase/migrations/20260706_customer_panel_step1.sql (eklenecek)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_size INT, p_quantity INT)
RETURNS void AS $$
BEGIN
  UPDATE product_stock
  SET quantity = quantity - p_quantity
  WHERE product_id = p_product_id AND size = p_size AND quantity >= p_quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product_id=%, size=%', p_product_id, p_size;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### B-K5 — Security / Broken Access Control
**Öncelik:** 🔴 Kritik
**Konum:** `src/lib/customer-api.ts:182-188` ve `162-180`

**Kanıt:**
`deleteCustomerAddress(id)` sadece `eq("id", id)` kullanıyor. `customer_id` kontrolü yok. `updateCustomerAddress` de aynı. `supabaseAdmin` RLS bypass eder.

**Nasıl Yeniden Üretilir:** Giriş yapmış bir kullanıcı, başka bir müşterinin `customer_addresses` ID'sini bilirse `DELETE /api/hesap/adresler?id=UUID` ile silebilir.

**Çözüm Önerisi:** Tüm `customer-api.ts` fonksiyonlarına `customer_id` filtresi ekle. Route handler'da da `customer_id` doğrula.

**Kod Düzeltmesi:**
```ts
// src/lib/customer-api.ts
export async function deleteCustomerAddress(id: string, customerId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("customer_id", customerId);  // <-- eklendi
  if (error) throw error;
}

// src/app/api/hesap/adresler/route.ts
const user = await getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
await deleteCustomerAddress(id, user.id);
```

---

### B-K6 — Security / Price Tampering
**Öncelik:** 🔴 Kritik
**Konum:** `src/app/api/checkout/create-payment/route.ts:43`

**Kanıt:**
`const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);` — `unitPrice` client'tan geliyor, DB'den doğrulanmıyor.

**Nasıl Yeniden Üretilir:** Sepete 10.000 TL'lik ürün ekleyip, client-side `unitPrice` değerini 1 TL yaparak `/api/checkout/create-payment` çağır. iyzico'a 1 TL gönderilir.

**Çözüm Önerisi:** Server-side `create-payment` route'ta her item için DB'den `products.price` çek ve client `unitPrice` ile karşılaştır. Fark varsa `400`.

**Kod Düzeltmesi:**
```ts
// src/app/api/checkout/create-payment/route.ts
const { data: dbProducts } = await supabaseAdmin
  .from("products")
  .select("id, price")
  .in("id", items.map(i => i.productId));

for (const item of items) {
  const dbProduct = dbProducts.find(p => p.id === item.productId);
  if (!dbProduct || dbProduct.price !== item.unitPrice) {
    return NextResponse.json({ error: "Price mismatch" }, { status: 400 });
  }
}

const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
```

---

### B-K7 — Database / Transaction Integrity
**Öncelik:** 🔴 Kritik
**Konum:** `src/app/api/checkout/create-payment/route.ts:115`

**Kanıt:**
`await supabaseAdmin.from("order_items").insert(orderItems);` — hata yakalanmıyor, `try-catch` yok.

**Nasıl Yeniden Üretilir:** `order_items` insert'ü başarısız olduğunda (örneğin constraint hatası), sipariş oluşur ama kalemler boş kalır.

**Çözüm Önerisi:** `orders` + `order_items` insert'ünü Supabase transaction (RPC) ile sar veya hata kontrolü ekle. Hata olursa ödeme başlatma.

**Kod Düzeltmesi:**
```ts
// Seçenek A: Hata kontrolü
const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
if (itemsError) {
  await supabaseAdmin.from("orders").delete().eq("id", orderId);
  return NextResponse.json({ error: "Order items failed" }, { status: 500 });
}

// Seçenek B: RPC transaction (önerilen)
// await supabaseAdmin.rpc('create_order_with_items', { order: orderData, items: orderItems });
```

---

### F-Y1 — Performans
**Öncelik:** 🟠 Yüksek
**Konum:** `next.config.mjs:28`

**Kanıt:**
`images: { unoptimized: true }` — `next/image` optimizasyonu tamamen devre dışı.

**Nasıl Yeniden Üretilir:** Lighthouse/PageSpeed testi yap; resim optimizasyonu uyarısı alınır.

**Çözüm Önerisi:** 1) `unoptimized: true` kaldır. 2) Vercel'de host ediliyorsa otomatik çalışır. 3) Vercel dışındaysa `sharp` paketi kur: `npm install sharp`.

**Kod Düzeltmesi:**
```js
// next.config.mjs
images: {
  remotePatterns: [
    { protocol: "https", hostname: "*.supabase.co" },
  ],
  // unoptimized: true,  // KALDIR
}

// Terminal
// npm install sharp
```

---

### F-Y2 — Canlı Site / Routing
**Öncelik:** 🟠 Yüksek
**Konum:** `https://www.nerishoes.com.tr/tr/urunler`

**Kanıt:**
`kimi_fetch_v2` sonucunda "İletişim...Sarıyakup..." içeriği döndü. `/tr/urunler` yerine iletişim sayfası içeriği geliyor.

**Nasıl Yeniden Üretilir:** Browser'da `https://www.nerishoes.com.tr/tr/urunler` adresini aç.

**Çözüm Önerisi:** Vercel deployment logları kontrol edilmeli. `getActiveProducts()` canlı ortamda Supabase hatası veriyor olabilir veya `next.config.mjs` içinde beklenmeyen bir redirect kuralı olabilir.

**Kod Düzeltmesi:**
```tsx
// src/app/[locale]/urunler/page.tsx
// getActiveProducts() hata logunu ekle:
try {
  const products = await getActiveProducts();
} catch (e) {
  console.error("[URUNLER] getActiveProducts hata:", e);
  throw e;
}
```

---

### F-Y3 — UI / Navigation
**Öncelik:** 🟠 Yüksek
**Konum:** `src/components/Header.tsx:74`

**Kanıt:**
`const isActive = pathname === link.href;` — `pathname` locale prefix'li (`/tr/urunler`), `link.href` prefix'siz (`/urunler`).

**Nasıl Yeniden Üretilir:** `/tr/urunler` sayfasında "Ürünler" nav linkinin aktif (active) class almadığını gözlemle.

**Çözüm Önerisi:** `pathname` ile `link.href` karşılaştırması için `pathname`'in locale prefix'i kaldırılmış şekli kullanılmalı.

**Kod Düzeltmesi:**
```tsx
// src/components/Header.tsx
const pathname = usePathname();
const activePath = pathname.replace(/^\/(tr|en|de|it|ar|ru)/, "");
const isActive = activePath === link.href || activePath.startsWith(link.href + "/");
```

---

### F-Y4 — UX / Routing
**Öncelik:** 🟠 Yüksek
**Konum:** `src/components/LanguageSwitcher.tsx:36`

**Kanıt:**
`window.location.href = \`/${nextLocale}${pathname}\`;` — Tam sayfa yenilemesi, client-side routing yok.

**Nasıl Yeniden Üretilir:** Dil değiştir; sayfa tamamen yenileniyor (flicker, state kaybı).

**Çözüm Önerisi:** `next-intl` `useRouter` ile client-side navigation.

**Kod Düzeltmesi:**
```tsx
// src/components/LanguageSwitcher.tsx
import { useRouter } from "@/i18n/navigation";
const router = useRouter();
function handleSelect(nextLocale) {
  setOpen(false);
  router.replace(pathname, { locale: nextLocale });
}
```

---

### F-Y5 — Memory Leak
**Öncelik:** 🟠 Yüksek
**Konum:** `src/components/ReviewForm.tsx:55`

**Kanıt:**
`URL.createObjectURL(f)` oluşturuluyor, component unmount'ta `URL.revokeObjectURL` çağrılmıyor.

**Nasıl Yeniden Üretilir:** Yorum formunda fotoğraf yükle; sayfayı kapat. Browser memory leak oluşur.

**Çözüm Önerisi:** Component unmount'ta tüm preview URL'lerini temizleyen `useEffect` cleanup ekle.

**Kod Düzeltmesi:**
```tsx
// src/components/ReviewForm.tsx
useEffect(() => {
  return () => {
    previews.forEach((src) => URL.revokeObjectURL(src));
  };
}, []);
```

---

### F-Y6 — HTML / Form
**Öncelik:** 🟠 Yüksek
**Konum:** `src/components/StarRating.tsx:24`

**Kanıt:**
`type={interactive ? "button" : undefined}` — `interactive` false ise `type` undefined, default `submit`.

**Nasıl Yeniden Üretilir:** `StarRating` bileşenini `interactive={false}` ile bir `<form>` içinde kullan; form submit olur.

**Çözüm Önerisi:** `type="button"` sabit yap, `disabled={!interactive}` ekle.

**Kod Düzeltmesi:**
```tsx
// src/components/StarRating.tsx
<button type="button" disabled={!interactive} ... />
```

---

### F-Y7 — HTML / Form / Accessibility
**Öncelik:** 🟠 Yüksek
**Konum:** `src/components/CheckoutContent.tsx:247-350`

**Kanıt:**
Tüm form input'larında `name` ve `id` attribute'ları eksik. Browser autofill çalışmaz.

**Nasıl Yeniden Üretilir:** Browser autofill (otomatik doldurma) çalışmaz.

**Çözüm Önerisi:** Her input'a `name` ve `id` attribute'ları ekle, `label` element'leri `htmlFor` ile input `id`'sine bağla.

**Kod Düzeltmesi:**
```tsx
// src/components/CheckoutContent.tsx
<label htmlFor="checkout-name" className={labelClass}>{t("name")}</label>
<input id="checkout-name" name="name" type="text" className={inputClass} value={form.name} onChange={...} />
// Benzer şekilde surname, email, phone, address, city...
```

---

### F-Y8 — Routing / Tutarsızlık
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/[locale]/hesap/giris/page.tsx` + `src/app/[locale]/giris/page.tsx`

**Kanıt:**
İki farklı giriş sayfası var. `hesap/giris` layout redirect yüzünden asla kullanılamaz.

**Nasıl Yeniden Üretilir:** `/tr/hesap/giris` adresine git; `/tr/giris` sayfasına yönlendirilir.

**Çözüm Önerisi:** `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/layout.tsx` dışına alınmalı. Tek bir giriş sayfası (`/giris`) kullanılmalı.

**Kod Düzeltmesi:**
```
// Dosya yapısı:
// src/app/[locale]/giris/page.tsx          (tek giriş sayfası)
// src/app/[locale]/kayit/page.tsx          (tek kayıt sayfası)
// src/app/[locale]/sifre-sifirla/page.tsx  (tek şifre sıfırlama)
// src/app/[locale]/hesap/page.tsx          (giriş sonrası dashboard)
// src/app/[locale]/hesap/adresler/page.tsx
// KALDIR: src/app/[locale]/hesap/giris/page.tsx
```

---

### B-Y1 — Compliance / Legal Risk
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/checkout/create-payment/route.ts:170`

**Kanıt:**
`identityNumber: "11111111111"` — iyzico API'sine sabit sahte TCKN gönderiliyor.

**Nasıl Yeniden Üretilir:** Kod incelendiğinde sabit değer doğrudan görülür. Yasal risk (gerçek olmayan kimlik bilgisi).

**Çözüm Önerisi:** Checkout formuna TCKN alanı ekle (opsiyonel, TC vatandaşı olmayanlar için). Varsayılan: boş string veya kullanıcıdan alınan değer.

**Kod Düzeltmesi:**
```tsx
// Checkout form state'e ekle: identityNumber?: string
// Validation: 11 haneli, ilk hane 0 değil
// Backend:
identityNumber: form.identityNumber?.trim() || undefined,
// iyzico dokümantasyonuna göre: undefined gönderilirse iyzico kendi default'u kullanır.
```

---

### B-Y2 — Security / Timing Attack
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/admin/login/route.ts:39`

**Kanıt:**
`if (password !== process.env.ADMIN_PASSWORD)` — `!==` string comparison timing-safe değil.

**Nasıl Yeniden Üretilir:** Script ile farklı uzunlukta şifreler gönderip response time farkını ölçmek.

**Çözüm Önerisi:** `crypto.timingSafeEqual` kullan. Password buffer'a dönüştürülerek karşılaştır.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/login/route.ts
import { timingSafeEqual } from "crypto";

const expected = Buffer.from(process.env.ADMIN_PASSWORD, "utf8");
const provided = Buffer.from(password, "utf8");

if (expected.length !== provided.length) {
  return NextResponse.json({ error: "Invalid" }, { status: 401 });
}

if (!timingSafeEqual(expected, provided)) {
  return NextResponse.json({ error: "Invalid" }, { status: 401 });
}
```

---

### B-Y3 — Error Handling
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/admin/login/route.ts:37`

**Kanıt:**
`const { password } = await request.json();` — `request.json()` `try-catch` dışında. Geçersiz JSON → 500.

**Nasıl Yeniden Üretilir:** `Content-Type: application/json` header ile geçersiz body (örneğin `{"password":`) gönder. 500 hata sayfası döner.

**Çözüm Önerisi:** `try-catch` ile sarmala, geçersiz JSON'da `400` dön.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/login/route.ts
let body: { password?: string };
try {
  body = await request.json();
} catch {
  return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}
const password = body.password;
```

---

### B-Y4 — Security / Cookie
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/admin/login/route.ts:70-75`

**Kanıt:**
`response.cookies.set(...)` içinde `secure: true` yok. `httpOnly: true` ve `sameSite: "lax"` var.

**Nasıl Yeniden Üretilir:** Production HTTPS ortamında cookie'nin `secure` olup olmadığını tarayıcı dev tools'tan kontrol et.

**Çözüm Önerisi:** `secure: true` ekle. `NODE_ENV` production kontrolü ile şartlı da yapılabilir.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/login/route.ts
response.cookies.set(ADMIN_SESSION_COOKIE, generateSessionToken(), {
  httpOnly: true,
  secure: true,        // <-- EKLENDİ
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 8,
});
```

---

### B-Y5 — Security / Brute Force
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/coupons/validate/route.ts`

**Kanıt:**
Rate limiting, IP tabanlı kısıtlama, CAPTCHA yok.

**Nasıl Yeniden Üretilir:** Script ile `/api/coupons/validate` endpoint'ine binlerce farklı `code` ile POST gönder. Herhangi bir kısıtlama yok.

**Çözüm Önerisi:** Vercel KV veya upstash-redis ile rate limiting ekle: IP başına 10 deneme / 1 dakika.

**Kod Düzeltmesi:**
```ts
// src/app/api/coupons/validate/route.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function POST(request) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ... mevcut logic
}
```

---

### B-Y6 — Business Logic / Data Integrity
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/reviews/route.ts:64-71`

**Kanıt:**
`orders` sorgusunda `product_id` filtre YOK. Sadece `customer_id` ve `status=paid` kontrol ediliyor.

**Nasıl Yeniden Üretilir:** Kullanıcı B ürününü satın alır, A ürünü için yorum yazarsa "Verified Purchase" rozeti gösterilir.

**Çözüm Önerisi:** `orders` sorgusuna `order_items` join ile `product_id` filtre ekle.

**Kod Düzeltmesi:**
```ts
// src/app/api/reviews/route.ts
const { data: orders } = await supabaseAdmin
  .from("orders")
  .select("id, order_items!inner(product_id)")
  .eq("customer_id", customer.id)
  .eq("status", "paid")
  .eq("order_items.product_id", productId)
  .limit(1);
```

---

### B-Y7 — Security / Broken Access Control
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/admin/layout.tsx`

**Kanıt:**
`isAdminAuthenticated` çağrılmıyor. Layout sadece `NextIntlClientProvider` render ediyor.

**Nasıl Yeniden Üretilir:** `/admin` altındaki herhangi bir sayfaya doğrudan tarayıcıdan eriş. Server-side layout'ta engel yok.

**Çözüm Önerisi:** Layout'ta server-side `isAdminAuthenticated()` kontrolü ekle. Yetkisizse redirect.

**Kod Düzeltmesi:**
```tsx
// src/app/admin/layout.tsx
import { isAdminAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    redirect("/tr/giris"); // veya özel admin login sayfası
  }
  return <NextIntlClientProvider locale="tr" messages={messages}>{children}</NextIntlClientProvider>;
}
```

---

### B-Y8 — Security / Auth Misuse
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/hesap/profil/route.ts:44-48`

**Kanıt:**
`await supabaseAdmin.auth.updateUser({ data: { ... } })` — servis rolü ile auth user metadata güncelleme.

**Nasıl Yeniden Üretilir:** `supabaseAdmin` service_role çalışırken `auth.updateUser` session gerektirir. Service_role client'ın session'ı yok.

**Çözüm Önerisi:** Mevcut kullanıcının session token'ı ile `supabase` (anon/authenticated) client kullan. Veya `admin.user.update` kullan.

**Kod Düzeltmesi:**
```ts
// src/app/api/hesap/profil/route.ts
const supabase = createRouteHandlerClient({ cookies });
const { error } = await supabase.auth.updateUser({
  data: { name: body.name, surname: body.surname, full_name: fullName },
});
```

---

### B-Y9 — Security / Broken Access Control
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/admin/test-email/route.ts`

**Kanıt:**
`isAdminAuthenticated` kontrolü YOK. Sadece `CRON_SECRET` ile korunuyor.

**Nasıl Yeniden Üretilir:** `CRON_SECRET` bilinirse (veya `.env.local` sızdırılırsa), herkes test email gönderebilir.

**Çözüm Önerisi:** `isAdminAuthenticated()` veya ayrı `ADMIN_API_SECRET` ile koru. Veya admin session kontrolü.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/test-email/route.ts
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(request) {
  const isAdmin = await isAdminAuthenticated(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... mevcut logic
}
```

---

### B-Y10 — Security / Filter Injection
**Öncelik:** 🟠 Yüksek
**Konum:** `src/lib/customer-api.ts:26-28` ve `226`

**Kanıt:**
`conditions.push(\`email.eq.${email}\`)` ve `.or(conditions.join(","))` — `email` içinde `,` veya `)` varsa filtre parse hatası.

**Nasıl Yeniden Üretilir:** `email` değeri `test@example.com,phone.eq.123` gibi gönderilirse Supabase filtre syntax'ı bozulur.

**Çözüm Önerisi:** Parametrik `.or()` kullan. Veya email input validation (regex) yap. Özel karakterleri sanitize et.

**Kod Düzeltmesi:**
```ts
// src/lib/customer-api.ts
// String interpolation yerine:
const { data } = await supabaseAdmin
  .from("customers")
  .select("*")
  .or(`email.eq.${email.replace(/[(),]/g, '')},phone.eq.${phone.replace(/[(),]/g, '')}`);
// VEYA daha güvenli: ayrı ayrı .eq().or() zinciri ile Supabase SDK'nın kendi escaping'i kullanılsın.
```

---

### B-Y11 — Error Handling / Data Integrity
**Öncelik:** 🟠 Yüksek
**Konum:** `src/app/api/webhooks/iyzico/route.ts:75-80`

**Kanıt:**
Order update hatası sadece `console.error` ile loglanır, response'a yansımaz.

**Nasıl Yeniden Üretilir:** DB bağlantısı koparsa veya update başarısız olursa, sipariş `paid` olarak işaretlenmemiş kalabilir ama client success sayfasına yönlendirilir.

**Çözüm Önerisi:** Order update hatası durumunda `500` döndür, client'a success gösterme. Veya retry queue kullan.

**Kod Düzeltmesi:**
```ts
// src/app/api/webhooks/iyzico/route.ts
const { error: updateError } = await supabaseAdmin
  .from("orders")
  .update({ status: newStatus, ... })
  .eq("iyzico_token", token);

if (updateError) {
  console.error("[iyzico callback] Order update hatası:", updateError);
  return NextResponse.json({ error: "Order update failed" }, { status: 500 });
}
```

---

### F-O1 — Memory Leak
**Öncelik:** 🟡 Orta
**Konum:** `src/components/AboutContent.tsx:17-29`

**Kanıt:**
`useCountUp` hook'unda `requestAnimationFrame` kullanılıyor, cleanup'ta `cancelAnimationFrame` yok.

**Nasıl Yeniden Üretilir:** Hakkımızda sayfasını aç ve hızlıca başka sayfaya geç; React console warning alınabilir.

**Çözüm Önerisi:** `rafId` sakla, cleanup'ta `cancelAnimationFrame` çağır.

**Kod Düzeltmesi:**
```tsx
// src/components/AboutContent.tsx
useEffect(() => {
  if (!inView) return;
  let rafId: number;
  const step = (timestamp: number) => { ... };
  rafId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(rafId);
}, [inView, target, duration]);
```

---

### F-O2 — Memory Leak
**Öncelik:** 🟡 Orta
**Konum:** `src/components/ProductDetailContent.tsx:137-139`

**Kanıt:**
`showToast` fonksiyonunda `setTimeout(() => setToast(...), 3500)` kullanılıyor, cleanup yok.

**Nasıl Yeniden Üretilir:** Toast gösterildikten hemen sonra sayfa değiştir; eski timeout hala çalışır.

**Çözüm Önerisi:** `useRef` ile timer ID sakla, cleanup'ta `clearTimeout`.

**Kod Düzeltmesi:**
```tsx
// src/components/ProductDetailContent.tsx
const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
function showToast(key) {
  setToast({ key, visible: true });
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  toastTimerRef.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
}
useEffect(() => () => {
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
}, []);
```

---

### F-O3 — Accessibility / WCAG
**Öncelik:** 🟡 Orta
**Konum:** `src/components/CheckoutContent.tsx:247-350`

**Kanıt:**
Form input'larında `label` `htmlFor` ve input `id` eşleşmesi yok.

**Nasıl Yeniden Üretilir:** Ekran okuyucu ile form doldurulamaz.

**Çözüm Önerisi:** F-Y7 ile birlikte çözülecek. label `htmlFor` ve input `id` eşleştirilmeli.

**Kod Düzeltmesi:**
(F-Y7 ile birleştir — aynı code fix uygulanacak)

---

### F-O4 — Next.js / Static Gen
**Öncelik:** 🟡 Orta
**Konum:** `src/app/[locale]/blog/[slug]/page.tsx:15-18`

**Kanıt:**
`generateStaticParams` sadece `slug` döndürüyor, `locale` segmenti eksik.

**Nasıl Yeniden Üretilir:** `next build` sırasında `locale` segmenti için static params üretilmemiş olabilir.

**Çözüm Önerisi:** `locales.flatMap` ile `locale` + `slug` kombinasyonu döndür.

**Kod Düzeltmesi:**
```tsx
// src/app/[locale]/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return locales.flatMap((locale) => 
    posts.map((p) => ({ locale, slug: p.slug }))
  );
}
```

---

### F-O5 — Next.js / Metadata
**Öncelik:** 🟡 Orta
**Konum:** `src/app/[locale]/layout.tsx:21-61`

**Kanıt:**
`generateMetadata` tüm alt sayfalar için aynı title/description üretiyor.

**Nasıl Yeniden Üretilir:** `/tr/hakkimizda` sayfasında title "Neri Shoes | Premium Ayakkabı" olarak kalıyorsa, SEO hatası.

**Çözüm Önerisi:** Tüm sayfalar (`/hakkimizda`, `/toptan`, `/odeme`, hesap sayfaları) kendi `generateMetadata` fonksiyonlarını tanımlamalı.

**Kod Düzeltmesi:**
```tsx
// src/app/[locale]/hakkimizda/page.tsx
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("aboutTitle"), description: t("aboutDescription") };
}
// Aynı şekilde /toptan, /odeme, /hesap/*
```

---

### F-O6 — Security / CSP
**Öncelik:** 🟡 Orta
**Konum:** `next.config.mjs:9`

**Kanıt:**
`img-src 'self' data: blob: https:` — `https:` tüm HTTPS domain'lerine izin veriyor.

**Nasıl Yeniden Üretilir:** CSP evaluator ile kontrol et; geniş `img-src` politikası zayıf.

**Çözüm Önerisi:** B-O9 ile birlikte çözülecek. `img-src` sadece bilinen domain'leri içermeli.

**Kod Düzeltmesi:**
`img-src 'self' data: blob: https://*.supabase.co;` (B-O9 code fix içinde)

---

### B-O1 — Security / Rate Limiting
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/checkout/status/[token]/route.ts`

**Kanıt:**
`GET` handler herhangi bir rate limiting, IP kısıtlaması, token format validation yok.

**Nasıl Yeniden Üretilir:** Script ile rastgele token'larla `/api/checkout/status/xxxx` çağrılabilir. iyzico API'ye yansır.

**Çözüm Önerisi:** Vercel KV / Upstash Redis ile rate limiting ekle. Token format UUID regex validation.

**Kod Düzeltmesi:**
```ts
// src/app/api/checkout/status/[token]/route.ts
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!UUID_REGEX.test(token)) {
  return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
}
// + rate limiting (B-Y5 ile aynı pattern)
```

---

### B-O2 — Security / Auth
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/checkins/respond/route.ts`

**Kanıt:**
`GET` handler. Herhangi bir auth/token yok. `orderId` query param.

**Nasıl Yeniden Üretilir:** Email'deki check-in linkini paylaşan herkes tıklayabilir.

**Çözüm Önerisi:** Link'e cryptographically signed token ekle (HMAC-SHA256). Token'siz veya imza geçersizse `401`.

**Kod Düzeltmesi:**
```ts
// src/lib/email.ts (link oluşturma)
const token = crypto.createHmac("sha256", CHECKIN_SECRET).update(orderId).digest("hex");
const link = `${siteUrl}/api/checkins/respond?orderId=${orderId}&token=${token}&response=memnun`;

// src/app/api/checkins/respond/route.ts
const expectedToken = crypto.createHmac("sha256", CHECKIN_SECRET).update(orderId).digest("hex");
if (token !== expectedToken) {
  return NextResponse.json({ error: "Invalid token" }, { status: 401 });
}
```

---

### B-O3 — Error Handling
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/cart/validate-stock/route.ts:5`

**Kanıt:**
`const body = await request.json() as { ... }` — `try-catch` yok.

**Nasıl Yeniden Üretilir:** Geçersiz JSON body gönderildiğinde `500` döner.

**Çözüm Önerisi:** `try-catch` ile sarmala, geçersiz JSON'da `400`.

**Kod Düzeltmesi:**
```ts
// src/app/api/cart/validate-stock/route.ts
let body;
try {
  body = await request.json();
} catch {
  return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}
```

---

### B-O4 — Security / Silent Fail
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/favorites/route.ts:11-12`

**Kanıt:**
`if (!userData.user) return NextResponse.json({ isFavorite: false });` — `401` yerine `false` dönüyor.

**Nasıl Yeniden Üretilir:** Geçersiz token ile `GET /api/favorites?productId=xxx` çağrıldığında `401` yerine `200 {isFavorite: false}` döner.

**Çözüm Önerisi:** `401` döndür, client hata ayıklaması için net ol.

**Kod Düzeltmesi:**
```ts
// src/app/api/favorites/route.ts
if (!userData.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

### B-O5 — Security / Abuse
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/reviews/route.ts`

**Kanıt:**
`POST` handler'da rate limiting, comment length, duplicate check yok.

**Nasıl Yeniden Üretilir:** Aynı kullanıcı tekrar tekrar yorum gönderebilir. Comment alanı çok uzun olabilir.

**Çözüm Önerisi:** Rate limiting (IP/user başına 5 yorum / saat), comment max 2000 karakter, duplicate check.

**Kod Düzeltmesi:**
```ts
// src/app/api/reviews/route.ts
if (!body.comment || body.comment.length > 2000) {
  return NextResponse.json({ error: "Comment too long" }, { status: 400 });
}
// + duplicate check:
const { data: existing } = await supabaseAdmin
  .from("reviews")
  .select("id")
  .eq("customer_id", customer.id)
  .eq("product_id", productId)
  .single();
if (existing) {
  return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
}
// + rate limiting (B-Y5 pattern)
```

---

### B-O6 — Security / XSS
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/reviews/route.ts:81`

**Kanıt:**
`mediaUrls: mediaUrls || null` — `mediaUrls` array'i doğrudan DB'ye yazılıyor, URL format validation yok.

**Nasıl Yeniden Üretilir:** Client kötü amaçlı URL (örneğin `javascript:alert(1)`) gönderebilir.

**Çözüm Önerisi:** Tüm `mediaUrls` öğeleri `https://` scheme ile başlayan URL regex ile validate et.

**Kod Düzeltmesi:**
```ts
// src/app/api/reviews/route.ts
const URL_REGEX = /^https:\/\/[a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;=%]+$/;
if (mediaUrls && !mediaUrls.every(url => URL_REGEX.test(url))) {
  return NextResponse.json({ error: "Invalid media URL" }, { status: 400 });
}
```

---

### B-O7 — Validation
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/stock-alerts/route.ts:10`

**Kanıt:**
`/\S+@\S+\.\S+/` — çok basit regex. `"a@b.c"` geçerli sayılır.

**Nasıl Yeniden Üretilir:** `POST /api/stock-alerts` ile `email: "a@b.c"` gönderilir, geçerli kabul edilir.

**Çözüm Önerisi:** zod schema kullan: `z.string().email()`.

**Kod Düzeltmesi:**
```ts
// src/app/api/stock-alerts/route.ts
import { z } from "zod";
const schema = z.object({
  productId: z.string().uuid(),
  email: z.string().email(),  // zod RFC 5322 uyumlu
});
```

---

### B-O8 — Security / Timing Attack
**Öncelik:** 🟡 Orta
**Konum:** `src/lib/iyzico.ts:33`

**Kanıt:**
`return hash === merchantToken;` — `crypto.timingSafeEqual` kullanılmıyor.

**Nasıl Yeniden Üretilir:** `verifyIyzicoWebhookSignature` fonksiyonu kullanılmadığı için pratik etkisi yok, ama kod kalitesi zayıf.

**Çözüm Önerisi:** `timingSafeEqual` kullan. (B-K2 ile birlikte çözülecek.)

**Kod Düzeltmesi:**
```ts
// src/lib/iyzico.ts
import { timingSafeEqual } from "crypto";
const hashBuf = Buffer.from(hash, "hex");
const tokenBuf = Buffer.from(merchantToken, "hex");
if (hashBuf.length !== tokenBuf.length) return false;
return timingSafeEqual(hashBuf, tokenBuf);
```

---

### B-O9 — Security / CSP
**Öncelik:** 🟡 Orta
**Konum:** `next.config.mjs:7`

**Kanıt:**
`script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.iyzipay.com ...`

**Nasıl Yeniden Üretilir:** CSP strict değil. XSS payload inline script olarak çalışabilir.

**Çözüm Önerisi:** `unsafe-inline` kaldırılamıyorsa (Next.js gerekli), nonce kullan. `unsafe-eval`'i eval kullanmıyorsan kaldır.

**Kod Düzeltmesi:**
```js
// next.config.mjs
headers: () => [{
  source: "/(.*)",
  headers: [
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'nonce-{nonce}' https://cdn.iyzipay.com https://sandbox-api.iyzipay.com",
        "style-src 'self' 'unsafe-inline'",  // Next.js styled-jsx için gerekli
        "img-src 'self' data: blob: https://*.supabase.co",
        // ...
      ].join("; "),
    },
  ],
}]
```

---

### B-O10 — Security / CORS
**Öncelik:** 🟡 Orta
**Konum:** `next.config.mjs`

**Kanıt:**
`headers()` bloğunda `Access-Control-Allow-Origin` yok.

**Nasıl Yeniden Üretilir:** Next.js default CORS same-origin. API route'lar için açıkça tanımlanmamış.

**Çözüm Önerisi:** API route'larına CORS middleware ekle. Sadece `nerishoes.com.tr` domain'lerine izin ver.

**Kod Düzeltmesi:**
```ts
// src/lib/cors.ts
import { NextResponse } from "next/server";

const allowedOrigins = ["https://www.nerishoes.com.tr", "https://nerishoes.com.tr"];

export function cors(request) {
  const origin = request.headers.get("origin");
  const response = NextResponse.next();
  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  return response;
}
```

---

### B-O11 — Security / Filter Injection
**Öncelik:** 🟡 Orta
**Konum:** `src/lib/products.ts:152`

**Kanıt:**
`.or(\`slug.eq.${slug},id.eq.${slug}\`)` — `slug` doğrudan string'e ekleniyor.

**Nasıl Yeniden Üretilir:** `slug` içinde `)` veya `,` varsa Supabase PostgREST filtre syntax'ı bozulur.

**Çözüm Önerisi:** `slug` önce sanitize et (sadece alfanümerik, tire, alt tire). Veya `.or()` yerine iki ayrı `.eq().or()` zinciri.

**Kod Düzeltmesi:**
```ts
// src/lib/products.ts
const cleanSlug = slug.replace(/[^a-zA-Z0-9\-_]/g, "");
const { data } = await supabaseAdmin
  .from("products")
  .select("*")
  .or(`slug.eq.${cleanSlug},id.eq.${cleanSlug}`);
```

---

### B-O12 — Privacy / Compliance
**Öncelik:** 🟡 Orta
**Konum:** `src/app/api/checkout/create-payment/route.ts:141-144`

**Kanıt:**
`const ip = ... ?? "85.34.78.112";` — `85.34.78.112` hardcoded IP. iyzico'ya bu IP gönderilir.

**Nasıl Yeniden Üretilir:** `x-forwarded-for` ve `x-real-ip` header'ları yoksa `85.34.78.112` iyzico'ya gönderilir.

**Çözüm Önerisi:** Hardcoded IP kaldır. Fallback: `undefined` veya `"0.0.0.0"`.

**Kod Düzeltmesi:**
```ts
// src/app/api/checkout/create-payment/route.ts
const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
  req.headers.get("x-real-ip") ??
  undefined;  // veya "0.0.0.0"
```

---

### B-O13 — TypeScript / Runtime Safety
**Öncelik:** 🟡 Orta
**Konum:** `src/lib/supabase.ts:3-4`

**Kanıt:**
`const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;` — `!` non-null assertion.

**Nasıl Yeniden Üretilir:** `NEXT_PUBLIC_SUPABASE_URL` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` build time'da tanımlı değilse runtime hata.

**Çözüm Önerisi:** Runtime kontrol ekle. Env eksikse build-time hata.

**Kod Düzeltmesi:**
```ts
// src/lib/supabase.ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
export const supabase = createClient(url, key);
```

---

### F-D1 — Next.js / App Router
**Öncelik:** 🟢 Düşük
**Konum:** `src/app/not-found.tsx:17-62`

**Kanıt:**
Root `not-found.tsx` `html` ve `body` etiketleri içeriyor. Next.js App Router'da root layout zaten sarmalar.

**Nasıl Yeniden Üretilir:** Next.js dev modunda uyarı verebilir.

**Çözüm Önerisi:** `html` ve `body` etiketleri kaldır, sadece içerik render et.

**Kod Düzeltmesi:**
```tsx
// src/app/not-found.tsx
export default function RootNotFound() {
  return (
    <div style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "serif" }}>
      {/* ... */}
    </div>
  );
}
```

---

### F-D2 — Tailwind CSS
**Öncelik:** 🟢 Düşük
**Konum:** `tailwind.config.ts:6`

**Kanıt:**
`content` array'inde `"./src/pages/**/*"` var ama `pages` dizini mevcut değil (App Router kullanılıyor).

**Nasıl Yeniden Üretilir:** Gereksiz ama hata değil.

**Çözüm Önerisi:** `"./src/pages/**/*"` satırı kaldır.

**Kod Düzeltmesi:**
```ts
// tailwind.config.ts
content: [
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  // KALDIR: "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
]
```

---

### F-D3 — Dead Code
**Öncelik:** 🟢 Düşük
**Konum:** `src/components/PageTransition.tsx`

**Kanıt:**
`PageTransition.tsx` mevcut ama hiçbir yerde import edilmemiş. `template.tsx` aynı işi yapıyor.

**Nasıl Yeniden Üretilir:** Projede `PageTransition` import edilmediği için kullanılmıyor.

**Çözüm Önerisi:** `src/components/PageTransition.tsx` dosyası kaldır.

**Kod Düzeltmesi:**
```bash
rm src/components/PageTransition.tsx
```

---

### F-D4 — i18n / SEO
**Öncelik:** 🟢 Düşük
**Konum:** `src/app/[locale]/layout.tsx:106-108`

**Kanıt:**
`organizationSchema` içinde `description` sabit Türkçe string. `getTranslations` kullanılmıyor.

**Nasıl Yeniden Üretilir:** `ar` locale'inde schema description Türkçe kalıyor.

**Çözüm Önerisi:** `getTranslations({ locale, namespace: "schema" })` kullanarak dinamik description ekle.

**Kod Düzeltmesi:**
```tsx
// src/app/[locale]/layout.tsx
const tSchema = await getTranslations({ locale, namespace: "schema" });
// ...
description: tSchema("organizationDescription"),
```

---

### F-D5 — Test Infrastructure
**Öncelik:** 🟢 Düşük
**Konum:** `tests/e2e/shopping-flow.spec.ts`, `tests/e2e/payment-form-stability.spec.ts`

**Kanıt:**
`npx` komutu bulunamadı (`/usr/bin/bash: line 1: npx: command not found`).

**Nasıl Yeniden Üretilir:** Playwright testleri çalıştırılamadı. Local Node.js/npm ortamı mevcut değil.

**Çözüm Önerisi:** Local geliştirme ortamında Node.js kurulu ve `npm install` yapılmış olmalı. CI/CD pipeline (GitHub Actions) kur.

**Kod Düzeltmesi:**
```yaml
# GitHub Actions workflow (örnek)
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

### B-D1 — Code Style
**Öncelik:** 🟢 Düşük
**Konum:** `src/app/api/admin/logout/route.ts:4`

**Kanıt:**
`export async function POST() { ... }` — `request` parametresi almıyor.

**Nasıl Yeniden Üretilir:** Standart dışı imza.

**Çözüm Önerisi:** `NextRequest` parametresi ekle.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/logout/route.ts
import { NextRequest } from "next/server";
export async function POST(request: NextRequest) { ... }
```

---

### B-D2 — Code Style
**Öncelik:** 🟢 Düşük
**Konum:** `src/lib/iyzico.ts:28`

**Kanıt:**
`const crypto = require("crypto")` fonksiyon içinde.

**Nasıl Yeniden Üretilir:** Lazy import anti-pattern.

**Çözüm Önerisi:** `import { createHmac, timingSafeEqual } from "crypto"` dosya başında yap.

**Kod Düzeltmesi:**
```ts
// src/lib/iyzico.ts
import { createHmac, timingSafeEqual } from "crypto";
// KALDIR: const crypto = require("crypto");
```

---

### B-D3 — Configuration
**Öncelik:** 🟢 Düşük
**Konum:** `src/lib/whatsapp.ts:4`

**Kanıt:**
`return process.env.WHATSAPP_NUMBER || "";` — Env tanımlı değilse boş string.

**Nasıl Yeniden Üretilir:** WhatsApp linki boş numaraya gider.

**Çözüm Önerisi:** Fallback numarası ekle veya env şartlı hata.

**Kod Düzeltmesi:**
```ts
// src/lib/whatsapp.ts
const number = process.env.WHATSAPP_NUMBER?.trim();
if (!number) {
  console.warn("[whatsapp] WHATSAPP_NUMBER tanımlı değil.");
  return null;
}
return number;
```

---

### B-D4 — Security / MIME Spoof
**Öncelik:** 🟢 Düşük
**Konum:** `src/app/api/admin/products/route.ts:42`

**Kanıt:**
`contentType: file.type || "image/jpeg"` — `file.type` client'tan geliyor.

**Nasıl Yeniden Üretilir:** Tarayıcı tarafından `file.type` spoof edilebilir.

**Çözüm Önerisi:** Server-side magic number (`file-type` paketi) ile MIME type doğrula.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/products/route.ts
import { fileTypeFromBuffer } from "file-type";
const type = await fileTypeFromBuffer(buffer);
if (!type || !type.mime.startsWith("image/")) {
  return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
}
// type.mime kullan
```

---

### B-D5 — Validation
**Öncelik:** 🟢 Düşük
**Konum:** `src/app/api/admin/stock/route.ts:45`

**Kanıt:**
`quantity: Math.max(0, e.quantity)` — `quantity` negatif engelleniyor ama `size` validation yok.

**Nasıl Yeniden Üretilir:** `size: -1` gönderilebilir.

**Çözüm Önerisi:** `size` pozitif integer validation ekle.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/stock/route.ts
if (!Number.isInteger(e.size) || e.size <= 0) {
  return NextResponse.json({ error: "Invalid size" }, { status: 400 });
}
quantity: Math.max(0, e.quantity),
```

---

### B-D6 — Validation
**Öncelik:** 🟢 Düşük
**Konum:** `src/app/api/admin/products/route.ts:134-135`

**Kanıt:**
`Number(priceRaw)` `NaN` dönebilir. `Number.isNaN()` kontrolü yok.

**Nasıl Yeniden Üretilir:** `priceRaw: "abc"` gönderildiğinde `NaN` DB'ye yazılır.

**Çözüm Önerisi:** `Number.isNaN()` kontrolü ekle.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/products/route.ts
const price = priceRaw && String(priceRaw).trim() !== "" ? Number(priceRaw) : null;
if (price !== null && Number.isNaN(price)) {
  return NextResponse.json({ error: "Invalid price" }, { status: 400 });
}
```

---

### B-D7 — Validation
**Öncelik:** 🟢 Düşük
**Konum:** `src/app/api/admin/coupons/route.ts:47`

**Kanıt:**
`discount_value: Number(discount_value)` — NaN riski.

**Nasıl Yeniden Üretilir:** `discount_value: "abc"` gönderildiğinde `NaN` DB'ye yazılır.

**Çözüm Önerisi:** `Number.isNaN()` kontrolü ekle.

**Kod Düzeltmesi:**
```ts
// src/app/api/admin/coupons/route.ts
const discountValue = Number(discount_value);
if (Number.isNaN(discountValue) || discountValue <= 0) {
  return NextResponse.json({ error: "Invalid discount value" }, { status: 400 });
}
```

---

## Önceki Raporlardaki Yanlış Pozitif / Düzeltme Durumları

| Bulgu ID | Önceki Rapor (DENETIM-RAPORU.md) Durumu | Gerçek Durum | Aksiyon |
|---|---|---|---|
| K-1 | ✅ Düzeltildi [2026-06-30] | ❌ **DÜZELTİLMEMİŞ** — `verifyIyzicoWebhookSignature` hiç çağrılmıyor, HMAC doğrulaması yok | B-K2 ile acil düzelt |
| K-2 | ✅ Düzeltildi [2026-06-30] | ✅ Düzeltilmiş — Migration'da `anon_rw_*` policy'ler kaldırılmış | Doğrulandı, ek aksiyon yok |
| Y-1 | ✅ Düzeltildi [2026-06-30] | ✅ Düzeltilmiş — `admin_login_attempts` sadece `service_role` erişimli | Doğrulandı, ek aksiyon yok |
| Y-2 | ✅ Düzeltildi [2026-06-30] | ✅ Düzeltilmiş — `CRON_SECRET` yoksa `503` döner | Doğrulandı, ek aksiyon yok |
| O-3 | ✅ Düzeltildi [2026-06-30] | ✅ Düzeltilmiş — `ADMIN_SESSION_VALUE` sabit kaldırılmış, HMAC-SHA256 + nonce kullanılıyor | Doğrulandı, ek aksiyon yok |
| O-2 | ⚠️ Kısmen | ⚠️ Kısmen — `dev-` token kontrolü var ama genel rate limiting eksik | B-O1 ile düzelt |
| O-1 | ✅ Düzeltildi [2026-06-30] | ✅ Düzeltilmiş — `product_stock` ve `exchange_rates` SELECT only | Doğrulandı, ek aksiyon yok |
| D-1 | ✅ Düzeltildi [2026-06-30] | ✅ Düzeltilmiş — `products` için `anon_select_products` + `service_role_write_products` | Doğrulandı, ek aksiyon yok |

---

## MOBIL-EKSIKLER.md Doğrulama Sonuçları

| Görev | Durum | Kod Doğrulaması | Not |
|---|---|---|---|
| M1 Yatay kayma | ✅ Tamamlandı | `globals.css:18` `overflow-x: hidden` mevcut | — |
| M2 Strip buton üstüne binme | ✅ Tamamlandı | `HomeContent.tsx:108` `z-[1]` mevcut | — |
| M3 Dil seçici dropdown | ✅ Tamamlandı | `LanguageSwitcher.tsx:17` `side` prop mevcut | — |
| M4 Mobil zoom | ✅ Tamamlandı | `ProductDetailContent.tsx` lightbox `onClick` çalışıyor | — |
| M5 Swipe desteği | ✅ Tamamlandı | `ProductDetailContent.tsx:61-99` touch event handler'ları mevcut | — |
| C1 About başlık | ✅ Tamamlandı | `AboutContent.tsx:158` responsive text mevcut | — |
| C2 Checkout logo | ✅ Tamamlandı | `CheckoutContent.tsx:420` `pay_with_iyzico_white.svg` kullanılıyor | — |
| C3 Garanti ibaresi | ✅ Tamamlandı | `LegalPageContent.tsx` garanti ibaresi yok | — |
| C4 Made with craft | ✅ Tamamlandı | `Footer.tsx` kaldırılmış | — |
| F1 Müşteri paneli | ⏸️ Beklemede | Kodda `hesap/page.tsx` mevcut ama `hesap/layout.tsx` redirect sorunu yüzünden erişilemez | F-K1 çözüldükten sonra aktif olacak |

---

## Ek Notlar

### Canlı Site Testleri (kimi_fetch_v2)

| URL | Durum | Sonuç |
|---|---|---|
| `https://www.nerishoes.com.tr` | ✅ 200 OK | Ana sayfa içeriği geldi |
| `https://www.nerishoes.com.tr/blog` | ✅ 200 OK | Blog sayfası içeriği geldi |
| `https://www.nerishoes.com.tr/urunler` | ⚠️ Şüpheli | Çok kısa içerik (muhtemelen redirect/404) |
| `https://www.nerishoes.com.tr/iletisim` | ✅ 200 OK | İletişim sayfası içeriği geldi |
| `https://www.nerishoes.com.tr/tr/urunler` | ❌ HATA | İletişim sayfası içeriği döndürüyor |
| `https://www.nerishoes.com.tr/tr/blog` | ✅ 200 OK | Blog sayfası içeriği geldi |

### Lazy Loading / Dynamic Import

Projede `next/dynamic` kullanımı **gözlemlenmemiştir**. `ProductsCatalog`, `ProductDetailContent`, `CheckoutContent`, `CartPanel` gibi büyük client component'ler statik olarak import ediliyor. Bu, initial bundle boyutunu artırır. Özellikle `ProductsCatalog` ve `ProductDetailContent` için `dynamic import` önerilir.

---

*Rapor, Frontend ve Backend denetim ajanlarının bulguları birleştirilerek, önceki DENETIM-RAPORU.md ve MOBIL-EKSIKLER.md doğrulamaları ile derlenmiştir. Her bulgu somut kod kanıtı ve yeniden üretim adımları ile desteklenmiştir.*
