# Neri Shoes — Güvenlik Denetim Raporu

**Tarih:** 2026-06-30  
**Kapsam:** nerishoes.com.tr (Next.js 14 / Supabase / iyzico)  
**Yöntem:** Statik kod analizi, RLS/politika sorgusu, git geçmişi tarama, npm audit  
**Kullanılan Skill'ler:** `testing-for-broken-access-control`, `implementing-api-key-security-controls`, `detecting-broken-object-property-level-authorization`  
**Sınır:** Salt okunur / savunma amaçlı — canlı sisteme saldırı testi yapılmadı

---

## ÖZET

| Önem | Adet |
|---|---|
| 🔴 KRİTİK | 2 |
| 🟠 YÜKSEK | 3 |
| 🟡 ORTA | 4 |
| 🟢 DÜŞÜK | 3 |

---

## 🔴 KRİTİK BULGULAR

### K-1 — iyzico Webhook İmza Doğrulaması Devre Dışı ✅ Düzeltildi [2026-06-30]

**Dosya:** `src/app/api/webhooks/iyzico/route.ts:21-31`  
**Risk:** Finansal dolandırıcılık — herhangi bir saldırgan `POST /api/webhooks/iyzico` endpoint'ine sahte istek göndererek herhangi bir siparişi `status=paid` yapabilir.

```ts
// Mevcut kod — HMAC kontrolü sadece 3 koşul EŞ ZAMANLI sağlanırsa çalışır:
if (secretKey && merchantToken && iyziReferenceCode) { ... }
// IYZICO_SECRET_KEY .env.local'da BOŞ → koşul false → imza hiç kontrol edilmiyor
```

**Neden kritik:** `IYZICO_SECRET_KEY` şu an `.env.local`'da boş bırakılmış. Bu durumda herkes geçerli bir `token` bilerek sipariş durumunu `paid` olarak işaretleyebilir.  
**Çözüm:**
1. iyzico sandbox'tan gerçek API ve secret key al, `.env.local`'a ekle.
2. `IYZICO_SECRET_KEY` yoksa webhook'u `503 Service Unavailable` döndürecek şekilde guard ekle:
```ts
if (!secretKey) return NextResponse.json({ error: "webhook disabled" }, { status: 503 });
```
3. İmza doğrulamasını `if` bloğundan çıkar, zorunlu hale getir.

---

### K-2 — Orders / Customers / Order Items: Anon Key ile Tam Okuma+Yazma ✅ Düzeltildi [2026-06-30]

**Tablo:** `orders`, `customers`, `order_items`  
**RLS Policy:** `anon_rw_orders`, `anon_rw_customers`, `anon_rw_order_items` — hepsi `cmd: ALL, qual: true`  
**Risk:** Supabase anon key `NEXT_PUBLIC_SUPABASE_ANON_KEY` olarak kaynak kodda görünür ve client bundle'a gömülür. Bu key'i bilen herkes doğrudan Supabase REST API'ye bağlanıp:
- Tüm siparişleri, müşteri isim/e-posta/telefon/adres bilgilerini okuyabilir (KVKK ihlali)
- Sipariş durumlarını değiştirebilir, order_item ekleyebilir/silebilir

**Çözüm:** Bu tablolarda anon key'e hiçbir izin verilmemeli. Tüm erişim server-side API route'ları üzerinden `supabaseAdmin` (service_role) ile yapılmalı:
```sql
-- Mevcut permissive policy'leri kaldır:
drop policy "anon_rw_orders" on orders;
drop policy "anon_rw_customers" on customers;
drop policy "anon_rw_order_items" on order_items;
-- Yeni policy yok = anon hiçbir şey yapamaz, service_role bypass eder
```
Ardından `create-payment/route.ts`, `webhooks/iyzico/route.ts` içindeki `supabase` import'larını `supabaseAdmin` olarak güncelle.

---

## 🟠 YÜKSEK BULGULAR

### Y-1 — admin_login_attempts: Anon Key ile Manipülasyon ✅ Düzeltildi [2026-06-30]

**Tablo:** `admin_login_attempts`  
**Policy:** `server_rw` — `anon` role, `ALL, qual: true`  
**Risk:** Anon key ile doğrudan bu tabloya erişen saldırgan kendi IP'si için lockout kaydını silebilir → brute-force koruması bypass edilir. Aynı zamanda tüm IP adresleri okunabilir (privacy ihlali).

```bash
# Saldırı senaryosu (anon key ile):
curl -X DELETE "https://[proje].supabase.co/rest/v1/admin_login_attempts?ip_address=eq.X.X.X.X" \
  -H "apikey: ANON_KEY" -H "Authorization: Bearer ANON_KEY"
# → lockout temizlendi, brute-force serbest
```

**Çözüm:** Policy'yi kaldır, sadece service_role erişimi bırak. Route'ta `supabaseAdmin` kullan.

---

### Y-2 — Cron Endpoint Kimliksiz Erişime Açık ✅ Düzeltildi [2026-06-30]

**Dosya:** `src/app/api/cron/translate-pending/route.ts:6-10`  
**Risk:** `CRON_SECRET` env değişkeni `.env.local`'da tanımlı değil. Bu durumda `GET /api/cron/translate-pending` kimlik doğrulamasız erişilebilir:
```ts
const secret = process.env.CRON_SECRET;
if (secret) { /* kontrol sadece key varsa */ }
// key yoksa → kontrol atlanır → herkes erişebilir
```
Saldırgan bu endpoint'i tekrar tekrar çağırarak API çevirisi maliyeti oluşturabilir (Anthropic API ücreti) veya çeviri kuyruğunu manipüle edebilir.

**Çözüm:** `.env.local`'a `CRON_SECRET=<güçlü_random_string>` ekle. Vercel'de cron job'ı bu key ile çağıracak şekilde yapılandır.

---

### Y-3 — Next.js Yüksek Önem Dereceli Güvenlik Açığı ⚠️ Bekliyor [major upgrade — staging testi gerekli]

**Paket:** `next@14.2.35`  
**CVE:** GHSA-h25m-26qc-wcjf  
**Başlık:** HTTP request deserialization → DoS when using insecure React Server Components  
**CVSS:** 7.5 (Yüksek)  
**Kapsam:** `>=13.0.0 <15.0.8`

**Çözüm:** `next` paketini en az `15.5.10` sürümüne yükselt. Bu breaking change içerebilir; staging ortamında test et:
```bash
npm install next@latest
```

---

## 🟡 ORTA BULGULAR

### O-1 — product_stock ve exchange_rates: Anon Yazma ✅ Düzeltildi [2026-06-30]

**Tablolar:** `product_stock`, `exchange_rates`  
**Policy:** ALL for anon  
**Risk:** Anon key ile stok miktarları sıfırlanabilir veya döviz kurları manipüle edilebilir.

**Çözüm:** `anon_rw_product_stock` ve `anon_rw_exchange_rates` policy'lerini `SELECT` only'e indirge; yazma sadece service_role üzerinden yapılsın.

---

### O-2 — Checkout Status Endpoint: Kimlik Doğrulamasız ✅ Düzeltildi [2026-06-30]

**Dosya:** `src/app/api/checkout/status/[token]/route.ts`  
**Risk:** `GET /api/checkout/status/[token]` herhangi biri tarafından çağrılabilir. Token UUID formatında olduğu için rastgele tahmin riski düşük, ancak token değeri biliniyorsa `paymentStatus`, `paymentId`, `paidPrice` gibi ödeme bilgileri sızar.

**Çözüm:** En azından `devMode` token kontrolüne (satır 10) bir güvenlik flag'i ekle; production'da dev token'larını kapat. Uzun vadede bu endpoint'e rate limiting uygula.

---

### O-3 — Admin Cookie: İmzasız ve Sabit Değer ✅ Düzeltildi [2026-06-30]

**Dosya:** `src/lib/auth.ts:3`  
```ts
export const ADMIN_SESSION_VALUE = "authenticated";
```
**Risk:** Oturum cookie'si `neri_admin_session=authenticated` sabit string. `httpOnly: true` ve `sameSite: lax` ile korunuyor, ancak kriptografik imza yok. Herhangi bir yöntemle cookie değeri öğrenilirse veya başka subdomain üzerinden set edilebilirse bypass edilebilir.

**Çözüm:** `crypto.randomBytes(32).toString('hex')` ile rastgele üretilmiş token kullan. Token'ı DB'de (veya Redis'te) saklayıp validate et; ya da `iron-session` / `next-auth` gibi signed session kütüphanesi kullan.

---

### O-4 — innerHTML ile iyzico HTML Enjeksiyonu ✅ Düzeltildi [2026-06-30]

**Dosya:** `src/components/CheckoutContent.tsx:105`  
```ts
container.innerHTML = data.checkoutFormContent;
```
**Risk:** iyzico'nun döndürdüğü HTML/script içeriği doğrudan DOM'a yazılıyor. iyzico güvenilir kaynak, ancak:
- iyzico CDN güvenliği tehlikeye girerse XSS vektörü
- Content Security Policy (CSP) başlıkları yoksa etkisi artar

**Çözüm:** `next.config.mjs`'e sıkı CSP başlıkları ekle. Sadece `iyzipay.com` ve `sandbox-api.iyzipay.com` domain'lerini script-src'e izin ver.

---

## 🟢 DÜŞÜK BULGULAR

### D-1 — products Tablosu: Anon ile İçerik Yazma ✅ Düzeltildi [2026-06-30]

**Policy:** `all_write` for `{public}` role  
**Risk:** Anon key ile ürün açıklamaları, fiyatları değiştirilebilir. Admin route auth kontrolü bu riski azaltıyor ama DB seviyesinde korumasız.  
**Çözüm:** `all_write` policy'sini kaldır, sadece service_role ile yazılsın.

---

### D-2 — npm Moderate Güvenlik Açıkları (5 adet) ⚠️ Bekliyor [next@15 major upgrade gerektirir]

| Paket | Açıklık | Fix |
|---|---|---|
| `next` | DoS via Image Optimizer remotePatterns | `next@>=15.5.10` |
| `next` | HTTP request smuggling in rewrites | `next@>=15.5.13` |
| `next` | Unbounded next/image disk cache | `next@>=15.5.14` |
| `iyzipay` | postman-request → qs DoS | `iyzipay@2.0.67` (downgrade) |
| `uuid` <11.1.1 | Buffer bounds check eksik | `iyzipay@2.0.67` |

---

### D-3 — .agents/ Klasörü İlk Commit'te Mevcut ✅ Düzeltildi [2026-06-30]

**Bulgu:** `git show 376a553` çıktısında `.agents/skills/blog-*` dosyaları ilk commit'e dahil olmuş. Bu dosyalar content/SEO skill'leridir, gizli bilgi içermiyor. Ancak skills klasörü repo'yu gereksiz şişiriyor.  
**Çözüm:** `git rm --cached .agents/ -r && git commit -m "chore: remove .agents from tracking"` ile git tracking'inden çıkar; `.gitignore`'a eklendi ✓

---

## DOĞRULANAN OLUMLU BULGULAR

| Kontrol | Durum |
|---|---|
| `.env.local` hiçbir zaman commit edilmemiş | ✓ |
| Git geçmişinde gizli anahtar yok | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` asla NEXT_PUBLIC_ değil | ✓ |
| Admin login: IP bazlı rate limit (5 deneme / 15 dk) | ✓ |
| iyzico secret key sunucu taraflı, client'a sızmıyor | ✓ |
| `blog_posts` RLS: draft'lar public'e kapalı | ✓ |
| Admin route'larının tamamında `isAdminAuthenticated()` kontrolü | ✓ |
| SQL injection: Tüm DB sorguları Supabase SDK parametrik `.eq()` — inject riski yok | ✓ |
| `JsonLd.tsx dangerouslySetInnerHTML`: `JSON.stringify` ile kaçırılmış, XSS riski minimal | ✓ |

---

## ÖNCELİKLİ YAPILMASI GEREKENLER

1. **[KRİTİK — Hemen]** iyzico sandbox key'lerini al, `.env.local`'a ekle; webhook imzasını zorunlu hale getir
2. **[KRİTİK — Bu hafta]** `orders`, `customers`, `order_items` tablolarındaki anon_rw policy'leri kaldır; bu route'larda `supabaseAdmin` kullan
3. **[YÜKSEK — Bu hafta]** `admin_login_attempts` anon policy kaldır; route'ta `supabaseAdmin` kullan
4. **[YÜKSEK — Bu hafta]** `CRON_SECRET` env değişkeni ekle, cron endpoint'ini güvenli hale getir
5. **[YÜKSEK — Planlı]** `next` paketini 15.x'e yükselt (staging'de test et)
6. **[ORTA — Bu hafta]** `product_stock`, `exchange_rates` policy'lerini sadece SELECT'e indirge
7. **[ORTA — Bu ay]** Admin session'ı imzalı/rastgele token ile değiştir
8. **[ORTA — Bu ay]** CSP başlıkları ekle (`next.config.mjs`'e `headers()` bloğu)
9. **[DÜŞÜK — Bu ay]** `products.all_write` policy kaldır
10. **[DÜŞÜK — Planlı]** `.agents/` git tracking'inden çıkar
