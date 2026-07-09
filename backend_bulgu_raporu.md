# Backend/API Denetim Raporu

## Tarih: 2026-07-09

| Öncelik | Hata Türü | Konum (Dosya:Satır) | Kanıt/Hata Mesajı | Nasıl Yeniden Üretilir? |
|---|---|---|---|---|
| 🔴 Kritik | `supabaseAdmin` service_role fallback anon key | `src/lib/supabase.ts:11` | `const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? key;` | `SUPABASE_SERVICE_ROLE_KEY` env var'ını kaldır, build et. `supabaseAdmin` aslında anon key ile çalışır, RLS bypass edilemez. |
| 🔴 Kritik | iyzico webhook HMAC doğrulaması EKSİK | `src/app/api/webhooks/iyzico/route.ts` (tümü) | `verifyIyzicoWebhookSignature` fonksiyonu `src/lib/iyzico.ts:22-34` tanımlı ama webhook route'ta hiç çağrılmıyor. Yorum: "HMAC imzası bu akışta YOKTUR". | Herhangi bir `token` değeri POST ederek `/api/webhooks/iyzico` çağır. Sipariş durumu `paid` olarak işaretlenir, stok düşer, kupon kullanılır. |
| 🔴 Kritik | Webhook idempotency yok — stok/kupon tekrar işlenir | `src/app/api/webhooks/iyzico/route.ts:99-116` | Aynı callback tekrar geldiğinde `decrement_stock` ve `recordCouponRedemption` tekrar çalışır. `paid` kontrolü yok, `confirmation_email_sent_at` sadece maili engeller. | Aynı `token` ile webhook'u tekrar çağır. Stok tekrar düşer, `used_count` tekrar artar. |
| 🔴 Kritik | `decrement_stock` RPC tanımlı değil | `supabase/migrations/20260706_customer_panel_step1.sql` | Migration dosyasında `increment_coupon_used` var (satır 454-459) ama `decrement_stock` YOK. `src/app/api/webhooks/iyzico/route.ts:99` çağırıyor. | Migration'ı çalıştır, `decrement_stock` RPC'sini Supabase SQL Editor'de sorgula: `SELECT * FROM pg_proc WHERE proname = 'decrement_stock';` Sonuç boş. |
| 🔴 Kritik | Adres silme/güncelleme — sahip doğrulaması yok | `src/lib/customer-api.ts:182-188` ve `162-180` | `deleteCustomerAddress(id)` sadece `eq("id", id)` kullanıyor. `customer_id` kontrolü yok. `updateCustomerAddress` de aynı. `supabaseAdmin` RLS bypass eder. | Giriş yapmış bir kullanıcı, başka bir müşterinin `customer_addresses` ID'sini bilirse `DELETE /api/hesap/adresler?id=UUID` ile silebilir. |
| 🔴 Kritik | Checkout fiyat manipülasyonu | `src/app/api/checkout/create-payment/route.ts:43` | `const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);` — `unitPrice` client'tan geliyor, DB'den doğrulanmıyor. | Sepete 10.000 TL'lik ürün ekleyip, client-side `unitPrice` değerini 1 TL yaparak `/api/checkout/create-payment` çağır. iyzico'a 1 TL gönderilir. |
| 🔴 Kritik | `order_items` insert hata kontrolü yok | `src/app/api/checkout/create-payment/route.ts:115` | `await supabaseAdmin.from("order_items").insert(orderItems);` — hata yakalanmıyor, `await` ediliyor ama `try-catch` yok. | `order_items` insert'ü başarısız olduğunda (örneğin constraint hatası), sipariş oluşur ama kalemler boş kalır. Log yok. |
| 🟠 Yüksek | Sabit sahte TC kimlik numarası | `src/app/api/checkout/create-payment/route.ts:170` | `identityNumber: "11111111111",` — iyzico API'sine sabit sahte TCKN gönderiliyor. | Kod incelendiğinde sabit değer doğrudan görülür. Yasal risk (gerçek olmayan kimlik bilgisi). |
| 🟠 Yüksek | Admin login timing attack | `src/app/api/admin/login/route.ts:39` | `if (password !== process.env.ADMIN_PASSWORD)` — `!==` string comparison timing-safe değil. | Script ile farklı uzunlukta şifreler gönderip response time farkını ölçmek. Brute-force koruması var ama teorik zafiyet. |
| 🟠 Yüksek | Admin login body parse hatası yakalanmıyor | `src/app/api/admin/login/route.ts:37` | `const { password } = await request.json();` — `request.json()` `try-catch` dışında. Geçersiz JSON gönderilirse 500. | `Content-Type: application/json` header ile geçersiz body (örneğin `{"password":`) gönder. 500 hata sayfası döner. |
| 🟠 Yüksek | Admin cookie `secure` flag eksik | `src/app/api/admin/login/route.ts:70-75` | `response.cookies.set(...)` içinde `secure: true` yok. `httpOnly: true` ve `sameSite: "lax"` var. | Production HTTPS ortamında cookie'nin `secure` olup olmadığını tarayıcı dev tools'tan kontrol et. |
| 🟠 Yüksek | Kupon brute-force | `src/app/api/coupons/validate/route.ts` | Rate limiting, IP tabanlı kısıtlama, CAPTCHA yok. | Script ile `/api/coupons/validate` endpoint'ine binlerce farklı `code` ile POST gönder. Herhangi bir kısıtlama yok. |
| 🟠 Yüksek | Verified Purchase yanlış kontrol | `src/app/api/reviews/route.ts:64-71` | `orders` sorgusunda `product_id` filtre YOK. Sadece `customer_id` ve `status=paid` kontrol ediliyor. | Kullanıcı B ürününü satın alır, A ürünü için yorum yazarsa "Verified Purchase" rozeti gösterilir. |
| 🟠 Yüksek | Admin layout auth'suz | `src/app/admin/layout.tsx` | `isAdminAuthenticated` çağrılmıyor. Layout sadece `NextIntlClientProvider` render ediyor. | `/admin` altındaki herhangi bir sayfaya doğrudan tarayıcıdan eriş. Server-side layout'ta engel yok. |
| 🟠 Yüksek | `supabaseAdmin.auth.updateUser` servis rolü ile çağrılıyor | `src/app/api/hesap/profil/route.ts:44-48` | `await supabaseAdmin.auth.updateUser({ data: { ... } })` — servis rolü ile auth user metadata güncelleme. | `supabaseAdmin` service_role ile çalışırken `auth.updateUser` session gerektirir. Service_role client'ın session'ı yoksa beklenmedik hata veya yanlış kullanıcı güncellenebilir. |
| 🟠 Yüksek | `test-email` endpoint'i admin auth'suz | `src/app/api/admin/test-email/route.ts` | `isAdminAuthenticated` kontrolü YOK. Sadece `CRON_SECRET` ile korunuyor. | `CRON_SECRET` bilinirse (veya `.env.local` sızdırılırsa), herkes test email gönderebilir. |
| 🟠 Yüksek | Supabase `.or()` string interpolation | `src/lib/customer-api.ts:26-28` ve `226` | `conditions.push(\`email.eq.${email}\`)` ve `.or(conditions.join(","))` — `email` içinde `,` veya `)` varsa filtre parse hatası. | `email` değeri `test@example.com,phone.eq.123` gibi gönderilirse Supabase filtre syntax'ı bozulur. SQL injection değil, ama DoS veya bilgi sızıntısı. |
| 🟠 Yüksek | Webhook order update hatası sadece log | `src/app/api/webhooks/iyzico/route.ts:75-80` | `await supabaseAdmin.from("orders").update(...).eq("iyzico_token", token)` — hata sadece `console.error` ile loglanır, response'a yansımaz. | DB bağlantısı koparsa veya update başarısız olursa, sipariş `paid` olarak işaretlenmemiş kalabilir ama client success sayfasına yönlendirilir. |
| 🟡 Orta | `status/[token]` rate limiting yok | `src/app/api/checkout/status/[token]/route.ts` | `GET` handler herhangi bir rate limiting, IP kısıtlaması, token format validation yok. | Script ile rastgele token'larla `/api/checkout/status/xxxx` çağrılabilir. iyzico API'ye yansır. |
| 🟡 Orta | Check-in respond auth'suz | `src/app/api/checkins/respond/route.ts` | `GET` handler. Herhangi bir auth/token yok. `orderId` query param. | Email'deki check-in linkini (`/api/checkins/respond?orderId=UUID&response=memnun`) paylaşan herkes tıklayabilir. |
| 🟡 Orta | `validate-stock` body parse hatası | `src/app/api/cart/validate-stock/route.ts:5` | `const body = await request.json() as { ... }` — `try-catch` yok. | Geçersiz JSON body gönderildiğinde 500 döner. |
| 🟡 Orta | Favorites GET silent fail | `src/app/api/favorites/route.ts:11-12` | `if (!userData.user) return NextResponse.json({ isFavorite: false });` — 401 yerine false dönüyor. | Geçersiz token ile `GET /api/favorites?productId=xxx` çağrıldığında `401` yerine `200 {isFavorite: false}` döner. Auth hatası gizlenir. |
| 🟡 Orta | Review spam/rate limiting yok | `src/app/api/reviews/route.ts` | `POST` handler'da rate limiting, comment length, duplicate check yok. | Aynı kullanıcı tekrar tekrar yorum gönderebilir. Comment alanı çok uzun olabilir. |
| 🟡 Orta | Review mediaUrls URL validation yok | `src/app/api/reviews/route.ts:81` | `mediaUrls: mediaUrls || null` — `mediaUrls` array'i doğrudan DB'ye yazılıyor, URL format validation yok. | Client kötü amaçlı URL (örneğin `javascript:alert(1)`) gönderebilir. Frontend XSS'e açık olabilir. |
| 🟡 Orta | Stock alert email regex zayıf | `src/app/api/stock-alerts/route.ts:10` | `/\S+@\S+\.\S+/` — çok basit regex. `"a@b.c"` geçerli sayılır. | `POST /api/stock-alerts` ile `email: "a@b.c"` gönderilir, geçerli kabul edilir. |
| 🟡 Orta | HMAC `==` timing attack | `src/lib/iyzico.ts:33` | `return hash === merchantToken;` — `===` bile timing-safe değil. `crypto.timingSafeEqual` kullanılmıyor. | `verifyIyzicoWebhookSignature` fonksiyonu kullanılmadığı için pratik etkisi yok, ama kod kalitesi zayıf. |
| 🟡 Orta | CSP `unsafe-inline` / `unsafe-eval` | `next.config.mjs:7` | `script-src 'self' 'unsafe-inline' 'unsafe-eval' ...` | CSP strict değil. XSS payload `inline` script olarak çalışabilir. |
| 🟡 Orta | CORS politikası yok | `next.config.mjs` | `headers()` bloğunda `Access-Control-Allow-Origin` yok. | Next.js default CORS same-origin. Bu genelde güvenli, ama API route'lar için açıkça tanımlanmamış. |
| 🟡 Orta | `getProductBySlug` string interpolation | `src/lib/products.ts:152` | `.or(\`slug.eq.${slug},id.eq.${slug}\`)` — `slug` doğrudan string'e ekleniyor. | `slug` içinde `)` veya `,` varsa Supabase filtre parse hatası (örn. `slug=abc),id.eq.1`). DoS veya bilgi sızıntısı. |
| 🟡 Orta | Hardcoded fallback IP | `src/app/api/checkout/create-payment/route.ts:141-144` | `const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? ... ?? "85.34.78.112";` | `85.34.78.112` hardcoded IP. iyzico'ya bu IP gönderilir. Gizlilik ve doğruluk sorunu. |
| 🟡 Orta | `getProductBySlug` `.or` injection riski | `src/lib/products.ts:152` | Aynı yukarıdaki bulgu. | `slug` parametresinde özel karakterler test edilerek DoS veya unexpected data leak. |
| 🟡 Orta | `next.config.mjs` non-null assertion env | `src/lib/supabase.ts:3-4` | `const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;` — `!` non-null assertion. | `NEXT_PUBLIC_SUPABASE_URL` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` build time'da tanımlı değilse runtime hata. |
| 🟢 Düşük | `logout` parametresiz handler | `src/app/api/admin/logout/route.ts:4` | `export async function POST() { ... }` — Next.js App Router'da kabul edilir, ama `request` parametresi almıyor. | Standart dışı imza. |
| 🟢 Düşük | `require("crypto")` lazy import | `src/lib/iyzico.ts:28` | `const crypto = require("crypto")` fonksiyon içinde. | `import { createHmac } from "crypto"` üstte yapılmalı. |
| 🟢 Düşük | `process.env.WHATSAPP_NUMBER` fallback boş | `src/lib/whatsapp.ts:4` | `return process.env.WHATSAPP_NUMBER || "";` | Env tanımlı değilse boş string. WhatsApp linki boş numaraya gider. |
| 🟢 Düşük | Image upload `contentType` spoof | `src/app/api/admin/products/route.ts:42` | `contentType: file.type || "image/jpeg"` — `file.type` client'tan geliyor. | Tarayıcı tarafından `file.type` spoof edilebilir. Supabase Storage validation varsayımı. |
| 🟢 Düşük | `size` validation negatif | `src/app/api/admin/stock/route.ts:45` | `quantity: Math.max(0, e.quantity)` — `quantity` negatif engelleniyor ama `size` validation yok. | `size: -1` gönderilebilir. `

---

## 🔴 Kritik Bulgular (Açıklamalı)

### 1. `supabaseAdmin` Service Role Fallback Anon Key (`src/lib/supabase.ts:11`)

```ts
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? key;
export const supabaseAdmin = createClient(url, adminKey, {
  auth: { persistSession: false },
});
```

**Kanıt:** `key` değişkeni `NEXT_PUBLIC_SUPABASE_ANON_KEY` (satır 4). Eğer `SUPABASE_SERVICE_ROLE_KEY` tanımlı değilse, `supabaseAdmin` aslında anon key ile çalışır. Bu, migration'daki tüm `service_role` policy'lerinin (`service_role_all_customers`, `service_role_all_orders`, vb.) çalışmamasına neden olur. `supabaseAdmin` kullanan tüm admin API'leri, cron job'ları ve webhook'lar RLS tarafından engellenebilir.

**Nasıl Yeniden Üretilir:** `SUPABASE_SERVICE_ROLE_KEY` env var'ını kaldır. `supabaseAdmin.from("orders").select("*")` çağrısı `service_role` yerine `anon` rolü ile çalışır. Eğer `orders` tablosunda `anon` SELECT policy yoksa (ki migration'da yok), sorgu 403 döner.

---

### 2. iyzico Webhook HMAC Doğrulaması EKSİK (`src/app/api/webhooks/iyzico/route.ts`)

**Kanıt:** `src/lib/iyzico.ts` satır 22-34'te `verifyIyzicoWebhookSignature` fonksiyonu tanımlı ama `src/app/api/webhooks/iyzico/route.ts` içinde **hiç çağrılmıyor**. Yorumda açıkça: "HMAC imzası bu akışta YOKTUR." DENETIM-RAPORU.md K-1 "Düzeltildi [2026-06-30]" olarak işaretlenmiş ama kodda değişiklik yok.

**Nasıl Yeniden Üretilir:** `curl -X POST https://site.com/api/webhooks/iyzico -d "token=rastgele"` gönder. `iyzico` client'ı initialize edilebilirse (sandbox key'ler varsa), `checkoutForm.retrieve` çağrılır ve eğer iyzico API'sinden `success` dönerse (veya `token` geçersizse bile hata durumunda `failed` redirect olur), sipariş durumu değişir. Daha da basiti: geçerli bir `token` biliniyorsa, bu token POST edilerek sipariş `paid` yapılabilir.

---

### 3. Webhook Idempotency Yok — Stok/Kupon Tekrar İşlenir (`src/app/api/webhooks/iyzico/route.ts:99-116`)

**Kanıt:** `paid` bloğunda:
- `decrement_stock` RPC çağrısı (satır 99-104) — tekrar çalışırsa stok tekrar düşer.
- `recordCouponRedemption` + `increment_coupon_used` (satır 108-116) — tekrar çalışırsa kupon tekrar kullanılır, `used_count` tekrar artar.

Sadece `confirmation_email_sent_at` (satır 135) mail tekrarını engeller. Ama stok ve kupon tekrar işlenir. Bu, iyzico callback'inin network timeout veya retry nedeniyle tekrar gönderilmesi durumunda gerçekleşir.

**Nasıl Yeniden Üretilir:** Aynı `token` ile `/api/webhooks/iyzico` endpoint'ine iki kez POST gönder. `product_stock` tablosunda `quantity` iki kez düşer. `coupons.used_count` iki kez artar. `coupon_redemptions` tablosuna iki kayıt girer.

---

### 4. `decrement_stock` RPC Tanımlı Değil (`supabase/migrations/20260706_customer_panel_step1.sql`)

**Kanıt:** Migration dosyası satır 454-459'da `increment_coupon_used` var. `decrement_stock` YOK. `src/app/api/webhooks/iyzico/route.ts:99` `await supabaseAdmin.rpc("decrement_stock", ...)` çağırıyor.

**Nasıl Yeniden Üretilir:** Migration'ı çalıştır. Supabase SQL Editor'de: `SELECT proname FROM pg_proc WHERE proname = 'decrement_stock';` Sonuç boş. Webhook çağrıldığında `decrement_stock` RPC hatası verir, stok düşmez.

---

### 5. Adres Silme/Güncelleme — Sahip Doğrulaması Yok (`src/lib/customer-api.ts:182-188` ve `162-180`)

**Kanıt:**
```ts
export async function deleteCustomerAddress(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("customer_addresses")
    .delete()
    .eq("id", id);  // customer_id kontrolü YOK
}
```

`updateCustomerAddress` de aynı: `eq("id", id)` ama `customer_id` filtre yok. `supabaseAdmin` RLS bypass eder. `hesap/adresler/route.ts` DELETE handler'ında `id` query param'dan alınır, `customer_id` kontrolü yok.

**Nasıl Yeniden Üretilir:** Giriş yapmış bir kullanıcı, başka bir müşterinin `customer_addresses` ID'sini tahmin edip (veya başka şekilde öğrenip) `DELETE /api/hesap/adresler?id=BAŞKASININ_UUID` çağrısı yapar. Adres silinir.

---

### 6. Checkout Fiyat Manipülasyonu (`src/app/api/checkout/create-payment/route.ts:43`)

**Kanıt:**
```ts
const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
```

`items` array'i ve `unitPrice` client'tan geliyor. Veritabanından `products.price` çekilmiyor. `finalAmount` de client hesaplanan `totalAmount` üzerinden. Client `unitPrice` değerini manipüle edebilir.

**Nasıl Yeniden Üretilir:** Browser console'dan sepet item'ının `unitPrice` değerini `1` yap. `/api/checkout/create-payment` çağrısı yap. `price` 1 TL, `paidPrice` 1 TL olarak iyzico'a gönderilir. Sipariş veritabanına `totalAmount=1` kaydedilir.

---

### 7. `order_items` Insert Hata Kontrolü Yok (`src/app/api/checkout/create-payment/route.ts:115`)

**Kanıt:**
```ts
await supabaseAdmin.from("order_items").insert(orderItems);
```

Hata `try-catch` dışında. `orders` insert'ü başarılı olur ama `order_items` başarısız olursa (örneğin `product_id` foreign key constraint hatası), sipariş oluşur ama boş kalır. Müşteri ödeme yapar ama ürün yok.

**Nasıl Yeniden Üretilir:** Sepette olmayan bir `productId` gönder. `order_items` insert FK hatası verir, `orders` tablosunda sipariş oluşur ama `order_items` boş.

---

## 🟠 Yüksek Bulgular (Açıklamalı)

### 8. Sabit Sahte TCKN (`src/app/api/checkout/create-payment/route.ts:170`)

```ts
identityNumber: "11111111111",
```

iyzico API'si için `buyer.identityNumber` zorunlu alan. Sabit sahte değer gönderiliyor. Yasal risk (gerçek olmayan kimlik bilgisiyle ödeme başlatma). Müşteriden TCKN alınmalı veya uygun bir fallback kullanılmalı.

---

### 9. Admin Login Timing Attack (`src/app/api/admin/login/route.ts:39`)

```ts
if (password !== process.env.ADMIN_PASSWORD) {
```

`!==` JavaScript string comparison timing-safe değildir. Farklı uzunlukta şifreler gönderildiğinde response time farklı olabilir. Brute-force koruması (5 deneme / 15 dk) var, bu riski azaltır ama teorik zafiyet devam eder.

---

### 10. Admin Login Body Parse Hatası (`src/app/api/admin/login/route.ts:37`)

```ts
const { password } = await request.json();
```

`request.json()` `try-catch` dışında. Geçersiz JSON body gönderilirse `SyntaxError` atılır, Next.js 500 hata sayfası döner. Hassas bilgi sızdırma riski düşük (stack trace loglarda olabilir).

---

### 11. Admin Cookie `secure` Flag Eksik (`src/app/api/admin/login/route.ts:70-75`)

```ts
response.cookies.set(ADMIN_SESSION_COOKIE, generateSessionToken(), {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 8,
});
```

`secure: true` yok. Production HTTPS ortamında `secure` flag zorunlu olmalı. `httpOnly` ve `sameSite` iyi, ama `secure` olmadan MITM ortamında cookie çalınabilir.

---

### 12. Kupon Brute-Force (`src/app/api/coupons/validate/route.ts`)

Rate limiting, IP tabanlı kısıtlama, CAPTCHA veya exponential backoff yok. Kupon kodu tahminine (örn. `HOSGELDIN-XXXX`) veya kupon listeleme saldırısına açık.

---

### 13. Verified Purchase Yanlış Kontrol (`src/app/api/reviews/route.ts:64-71`)

```ts
const { data: orders } = await supabaseAdmin
  .from("orders")
  .select("id")
  .eq("customer_id", customer.id)
  .eq("status", "paid")
  .limit(1);
```

`product_id` filtre YOK. Kullanıcı herhangi bir ürünü satın almışsa, başka bir ürün için yorum yazdığında "Verified Purchase" rozeti gösterilir. Bu, yanlış ürün için doğrulanmış satın alım imajı yaratır.

---

### 14. Admin Layout Auth'suz (`src/app/admin/layout.tsx`)

```tsx
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // isAdminAuthenticated() YOK
  return (
    <NextIntlClientProvider locale="tr" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

Server-side layout'ta `isAdminAuthenticated` çağrılmıyor. Kullanıcı `/admin` altındaki sayfalara doğrudan erişebilir. Client-side auth kontrolü varsa bile, server-side rendering (SSR) sırasında hassas veriler sızdırılabilir veya sayfa yapısı görülebilir.

---

### 15. `supabaseAdmin.auth.updateUser` Servis Rolü İle Çağrı (`src/app/api/hesap/profil/route.ts:44-48`)

```ts
await supabaseAdmin.auth.updateUser({
  data: { name: body.name, surname: body.surname, full_name: fullName },
});
```

`supabaseAdmin` service_role key ile çalışır. `auth.updateUser` Supabase JS v2'de mevcut oturumdaki kullanıcıyı günceller. Service_role client'ın oturumu yoktur; bu çağrı muhtemelen hata verir veya beklenmedik şekilde çalışır. `try-catch` dışında (satır 44-48), bu çağrı başarısız olursa 500 döner.

---

### 16. `test-email` Endpoint Admin Auth'suz (`src/app/api/admin/test-email/route.ts`)

```ts
if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
```

`isAdminAuthenticated` kontrolü YOK. Sadece `CRON_SECRET` ile korunuyor. CRON_SECRET ve admin secret farklı değerler olabilir. Eğer CRON_SECRET sızdırılırsa (veya Vercel log'larından okunursa), herhangi biri test email gönderebilir.

---

### 17. Supabase `.or()` String Interpolation (`src/lib/customer-api.ts:26-28` ve `226`)

```ts
conditions.push(`email.eq.${email}`);
// ...
.or(conditions.join(","))
```

`email` ve `phone` doğrudan string interpolation ile `.or()` filtresine ekleniyor. `email` içinde `,` veya `)` karakteri varsa Supabase PostgREST filtre syntax'ı bozulur. SQL injection değil, ama:
- `email = "a,phone.eq.123")` gibi bir değer `or` parse hatası verebilir.
- DoS veya bilgi sızıntısı riski.

---

### 18. Webhook Order Update Hata Sadece Log (`src/app/api/webhooks/iyzico/route.ts:75-80`)

```ts
try {
  await supabaseAdmin.from("orders").update({ status: newStatus, ... }).eq("iyzico_token", token);
} catch (dbErr) {
  console.error("[iyzico callback] Order update hatası:", dbErr);
}
```

Order update başarısız olursa (örneğin DB bağlantı kopması), sipariş durumu `pending` kalabilir ama client success sayfasına yönlendirilir. `paid` sipariş stok düşürülür ama `orders.status` hâlâ `pending` olabilir. Tutarsızlık.

---

## 🟡 Orta Bulgular (Açıklamalı)

### 19. `status/[token]` Rate Limiting Yok (`src/app/api/checkout/status/[token]/route.ts`)

`GET` handler herhangi bir rate limiting, IP kısıtlaması veya token format validation (regex) yok. Rastgele UUID token'larla brute-force denenebilir. iyzico API'ye yansır ve rate limit uygulanabilir, ama uygulama katmanında koruma yok.

---

### 20. Check-in Respond Auth'suz (`src/app/api/checkins/respond/route.ts`)

`GET` handler. Herhangi bir auth/token yok. `orderId` query param. Email'deki check-in linki herkesle paylaşılabilir. Tıklayan herkes `memnun`/`memnun_degil` işaretleyebilir. `orderId` UUID olduğu için tahmin zor, ama link paylaşımı riski var.

---

### 21. `validate-stock` Body Parse Hatası (`src/app/api/cart/validate-stock/route.ts:5`)

```ts
const body = await request.json() as { items: Array<{ productId: string; size: number }> };
```

`request.json()` `try-catch` dışında. Geçersiz JSON body gönderildiğinde 500 döner.

---

### 22. Favorites GET Silent Fail (`src/app/api/favorites/route.ts:11-12`)

```ts
if (!userData.user) return NextResponse.json({ isFavorite: false });
```

Geçersiz token ile `GET` çağrıldığında `401` yerine `200 {isFavorite: false}` döner. Auth hatası gizlenir. Bu, client-side hata ayıklamayı zorlaştırır ve potansiyel güvenlik olaylarını maskeleyebilir.

---

### 23. Review Spam / Rate Limiting Yok (`src/app/api/reviews/route.ts`)

`POST` handler'da:
- Rate limiting yok.
- `comment` length validation yok (1 milyon karakter bile gönderilebilir).
- Aynı kullanıcı aynı ürüne tekrar tekrar yorum gönderebilir (duplicate check yok).

---

### 24. Review `mediaUrls` URL Validation Yok (`src/app/api/reviews/route.ts:81`)

```ts
media_urls: mediaUrls || null,
```

`mediaUrls` array'i doğrudan DB'ye yazılıyor. URL format validation (https:// scheme) yok. Kötü amaçlı URL (örneğin `javascript:alert(1)`) gönderilebilir. Frontend XSS'e açık olabilir.

---

### 25. Stock Alert Email Regex Zayıf (`src/app/api/stock-alerts/route.ts:10`)

```ts
if (!productId || !email || !/\S+@\S+\.\S+/.test(email)) {
```

Regex çok basit. `a@b.c` geçerli sayılır. RFC 5322'ye uygun değil. Email injection veya storage waste riski.

---

### 26. HMAC `===` Timing Attack (`src/lib/iyzico.ts:33`)

```ts
return hash === merchantToken;
```

`verifyIyzicoWebhookSignature` fonksiyonu `===` ile karşılaştırma yapıyor. `crypto.timingSafeEqual` kullanılmıyor. Fonksiyon zaten webhook route'ta kullanılmıyor (kritik bulgu 2), ama kod kalitesi zayıf.

---

### 27. CSP `unsafe-inline` / `unsafe-eval` (`next.config.mjs:7`)

```js
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.iyzipay.com ..."
```

`unsafe-inline` ve `unsafe-eval` CSP'de var. XSS payload'lar inline script olarak çalışabilir. `iyzipay.com` ve `sandbox-api.iyzipay.com` script-src'e izin veriliyor. iyzico CDN güvenliği tehlikeye girerse XSS vektörü oluşur.

---

### 28. CORS Politikası Yok (`next.config.mjs`)

`headers()` bloğunda `Access-Control-Allow-Origin` yok. Next.js default same-origin CORS kullanıyor. Bu genelde güvenli, ama API route'lar için açıkça tanımlanmamış. API route'larının CORS politikası belirsiz.

---

### 29. `getProductBySlug` String Interpolation (`src/lib/products.ts:152`)

```ts
.or(`slug.eq.${slug},id.eq.${slug}`)
```

`slug` doğrudan string interpolation ile `.or()` filtresine ekleniyor. `slug` içinde `)` veya `,` karakteri varsa Supabase PostgREST filtre syntax'ı bozulur. DoS veya bilgi sızıntısı riski.

---

### 30. Hardcoded Fallback IP (`src/app/api/checkout/create-payment/route.ts:141-144`)

```ts
const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
  req.headers.get("x-real-ip") ??
  "85.34.78.112";
```

`85.34.78.112` hardcoded IP. iyzico'ya bu IP gönderilir. Gizlilik ve doğruluk sorunu. `0.0.0.0` veya boş string tercih edilmeli.

---

### 31. `next.config.mjs` Non-Null Assertion Env (`src/lib/supabase.ts:3-4`)

```ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

`!` TypeScript non-null assertion. Runtime'da env var tanımlı değilse `undefined` string olarak geçer, Supabase client oluşturma hatası verir. Uygulama başlamaz veya runtime hata atar.

---

## 🟢 Düşük Bulgular (Açıklamalı)

### 32. `logout` Parametresiz Handler (`src/app/api/admin/logout/route.ts:4`)

```ts
export async function POST() { ... }
```

Next.js App Router'da `request` parametresi almak zorunlu değil, ama standart dışı. `NextRequest` tipi kullanılmıyor. Bu bir hata değil, ama tutarsızlık.

---

### 33. `require("crypto")` Lazy Import (`src/lib/iyzico.ts:28`)

```ts
const crypto = require("crypto") as typeof import("crypto");
```

Fonksiyon içinde lazy `require`. `import { createHmac } from "crypto"` dosya başında yapılmalı.

---

### 34. `WHATSAPP_NUMBER` Fallback Boş (`src/lib/whatsapp.ts:4`)

```ts
return process.env.WHATSAPP_NUMBER || "";
```

Env tanımlı değilse boş string. `src/app/api/checkins/respond/route.ts:57` hardcoded numara kullanıyor (`905443191977`), bu fonksiyon kullanılmıyor. Tutarsızlık.

---

### 35. Image Upload `contentType` Spoof (`src/app/api/admin/products/route.ts:42`)

```ts
const { error } = await supabase.storage
  .from("products")
  .upload(filename, buffer, { contentType: file.type || "image/jpeg" });
```

`file.type` client'tan geliyor. Tarayıcı tarafından spoof edilebilir. Supabase Storage tarafında MIME type validation varsayımı.

---

### 36. Admin Stock `size` Validation Yok (`src/app/api/admin/stock/route.ts:45`)

```ts
quantity: Math.max(0, e.quantity),
```

`quantity` negatif engelleniyor ama `size` validation yok. `size: -1` gönderilebilir. `product_stock` tablosunda `size` int olabilir, negatif beden anlamsız.

---

### 37. Admin Products `price` NaN Kontrolü Yok (`src/app/api/admin/products/route.ts:134-135`)

```ts
const price = priceRaw && String(priceRaw).trim() !== "" ? Number(priceRaw) : null;
```

`Number("abc")` `NaN` döner. `NaN` veritabanına gönderilebilir. `Number.isNaN()` kontrolü yok.

---

### 38. Admin Coupons `discount_value` NaN (`src/app/api/admin/coupons/route.ts:47`)

```ts
discount_value: Number(discount_value),
```

Aynı NaN riski. `Number.isNaN()` kontrolü yok.

---

## DENETIM-RAPORU.md Doğrulama Tablosu

| Bulgu ID | Durum | Kod Kanıtı | Not |
|---|---|---|---|
| K-1 | ❌ **DÜZELTİLMEMİŞ** | `src/app/api/webhooks/iyzico/route.ts` — HMAC kontrolü yok. `verifyIyzicoWebhookSignature` hiç çağrılmıyor. | Rapor "Düzeltildi [2026-06-30]" yazıyor ama kodda değişiklik yok. |
| K-2 | ✅ Düzeltilmiş | Migration'da `anon_rw_orders`, `anon_rw_customers`, `anon_rw_order_items` kaldırılmış. `orders` ve `order_items` tablolarında sadece `auth_select_own_*` ve `service_role_all_*` var. | `create-payment` route `supabaseAdmin` kullanıyor. |
| Y-1 | ✅ Düzeltilmiş | Migration'da `admin_login_attempts` için `service_role_all_login_attempts` var. `server_rw` (anon) kaldırılmış. | `src/app/api/admin/login/route.ts` `supabaseAdmin` kullanıyor. |
| Y-2 | ✅ Düzeltilmiş | `src/app/api/cron/translate-pending/route.ts:6-8` — `CRON_SECRET` yoksa `503` döner. `if (!secret) return 503`. | `checkins/process` de aynı desen. |
| O-3 | ✅ Düzeltilmiş | `src/lib/auth.ts` — HMAC-SHA256 + `timingSafeEqual` + random nonce. `ADMIN_SESSION_VALUE` sabit string kaldırılmış. | Token yapısı: `nonce.signature` |
| O-2 | ⚠️ Kısmen | `src/app/api/checkout/status/[token]/route.ts` — `dev-` token kontrolü var. Rate limiting yok. | Dev mode güvenliği var, ama genel rate limiting eksik. |
| O-1 | ✅ Düzeltilmiş | Migration'da `product_stock` ve `exchange_rates` için `anon_select_*` ve `service_role_all_*` var. Yazma sadece service_role. | |
| D-1 | ✅ Düzeltilmiş | Migration'da `products` için `anon_select_products` ve `service_role_write_products` var. `all_write` kaldırılmış. | |

---

## Çevre Değişkenleri (Env Vars) Durum Raporu

| Değişken | Kullanıldığı Yer | Zorunlu mu? | Fallback Var mı? | Risk |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase.ts`, `supabase-server.ts`, `supabase-browser.ts`, `middleware.ts` | ✅ Evet | ❌ Hayır (`!` non-null assertion) | **Kritik** — Runtime hata |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase.ts`, `supabase-server.ts`, `supabase-browser.ts`, `middleware.ts` | ✅ Evet | ❌ Hayır (`!` non-null assertion) | **Kritik** — Runtime hata |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase.ts` | ✅ Evet | ⚠️ `?? key` (anon key fallback) | **Kritik** — Fallback anon key, RLS bypass edilemez |
| `ADMIN_SESSION_SECRET` | `src/lib/auth.ts` | ✅ Evet | ❌ Hayır (throw Error) | Yüksek — Uygulama başlamaz |
| `ADMIN_PASSWORD` | `src/app/api/admin/login/route.ts` | ✅ Evet | ❌ Hayır (herhangi şifre kabul edilmez) | Orta — Login çalışmaz |
| `IYZICO_API_KEY` | `src/lib/iyzico.ts` | ✅ Evet | ❌ Hayır (throw Error) | Yüksek — Ödeme başlamaz |
| `IYZICO_SECRET_KEY` | `src/lib/iyzico.ts` | ✅ Evet | ❌ Hayır (throw Error) | Yüksek — Ödeme başlamaz |
| `IYZICO_BASE_URL` | `src/lib/iyzico.ts` | ❌ Hayır | ✅ `sandbox-api.iyzipay.com` veya `api.iyzipay.com` | Düşük |
| `CRON_SECRET` | `src/app/api/cron/translate-pending/route.ts`, `checkins/process`, `admin/test-email` | ✅ Evet | ⚠️ `503` döner (cron) veya `401` döner (test-email) | Orta — Cron çalışmaz |
| `RESEND_API_KEY` | `src/lib/email.ts` | ✅ Evet | ❌ Hayır (throw Error) | Yüksek — Email gönderilemez |
| `FROM_EMAIL` | `src/lib/email.ts` | ❌ Hayır | ✅ `info@nerishoes.com.tr` | Düşük |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/seo.ts`, `src/app/api/checkout/create-payment/route.ts`, `email.ts`, `checkins/respond.ts` | ❌ Hayır | ✅ `https://www.nerishoes.com.tr` | Düşük |
| `NODE_ENV` | `src/lib/iyzico.ts`, `create-payment`, `status/[token]`, `CheckoutContent.tsx` | ❌ Hayır | Next.js default | Düşük |
| `WHATSAPP_NUMBER` | `src/lib/whatsapp.ts` | ❌ Hayır | ✅ `boş string` | Düşük — Link boş kalır |

---

## Özet

- **🔴 Kritik: 7 bulgu** — Bunlardan 3'ü (K-1, idempotency, `decrement_stock` RPC) DENETIM-RAPORU.md'de "düzeltildi" olarak işaretlenmiş ama kodda gerçekten düzeltilmemiş.
- **🟠 Yüksek: 11 bulgu** — Admin auth, timing attack, brute-force, verified purchase, servis rolü misuse.
- **🟡 Orta: 13 bulgu** — Rate limiting, validation, CSP, string interpolation.
- **🟢 Düşük: 7 bulgu** — Stil, tutarsızlık, lazy import.

**Öncelikli aksiyonlar:**
1. `SUPABASE_SERVICE_ROLE_KEY` env var'ını tanımla ve `supabaseAdmin` fallback'ini kaldır.
2. iyzico webhook HMAC doğrulamasını zorunlu hale getir (K-1 gerçekten düzelt).
3. Webhook idempotency ekle (stok ve kupon tekrar işlenmesini engelle).
4. `decrement_stock` RPC fonksiyonunu migration'a ekle veya Supabase SQL Editor'de tanımla.
5. `updateCustomerAddress` ve `deleteCustomerAddress` içine `customer_id` doğrulaması ekle.
6. Checkout `create-payment` route'unda `unitPrice` değerini veritabanından doğrula.
7. `order_items` insert'ü hata kontrolü ile sarmala veya transaction kullan.
