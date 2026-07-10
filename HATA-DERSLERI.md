# Neri Shoes — Hata Dersleri

Bu dosya, production'da yaşanan gerçek hataların kök nedenlerini ve önleme kurallarını kaydeder.
Her ekleme: belirti → kök neden → çözüm → önleme kuralı.

---

## H-1 — supabaseAdmin Client Bundle Leak (2026-07-10)

### Belirti
Browser console'da:
```
Error: SUPABASE_SERVICE_ROLE_KEY env değişkeni tanımlı değil. supabaseAdmin çalışamaz.
```
React error #423 ile tüm sayfa beyazlaşıyor.

### Kök Neden
`supabase.ts` hem anon client (`supabase`) hem de admin client (`supabaseAdmin`) export ediyordu.
`supabase.ts` module yüklenirken (module-level) `SUPABASE_SERVICE_ROLE_KEY` yoksa `throw` atıyordu.

Client component'lar (`"use client"`) bu dosyayı import eden util dosyalarını (currency.ts, stock.ts, regional-prices.ts)
chain üzerinden import ettiği için Next.js bu modülü client JS bundle'ına dahil ediyordu.
Tarayıcıda `NEXT_PUBLIC_` olmayan env var'lar tanımsızdır → throw → React ağacı çöküyor.

Import zinciri (production'da):
```
CartPanel (client) → currency.ts → supabase.ts → THROW
ProductCard (client) → stock.ts → supabase.ts → THROW
ReviewForm (client) → supabase.ts → THROW (doğrudan)
```

### Çözüm
1. Saf (Supabase bağımlılığı olmayan) fonksiyonlar ayrı dosyalara taşındı:
   - `currency-utils.ts` — formatPrice, LOCALE_CURRENCY
   - `stock-utils.ts` — StockEntry, StockStatus, computeStockStatus
   - `regional-prices-utils.ts` — RegionalPrice, findRegionalPrice, formatRegionalPrice
2. Tüm client component'lar `*-utils.ts` dosyalarından import eder hale getirildi.
3. `ReviewForm`, `FavoriteButton`, `favoriler/page` doğrudan `supabase.ts` yerine `supabase-browser.ts` kullanır hale getirildi.
4. `auth-client.ts`, `customer-client.ts` → `supabase-browser.ts` kullanacak şekilde güncellendi.
5. `supabase-browser.ts` singleton pattern'a alındı (Multiple GoTrueClient uyarısı giderildi).

### Önleme Kuralları

**KURAL 1:** `supabase.ts` (supabaseAdmin içeren) hiçbir zaman client component tarafından import edilemez.
- `"use client"` direktifi olan her dosyada import'lar kontrol edilmeli.
- Test: `grep -r "from.*@/lib/supabase['\"]" src/components src/app --include="*.tsx"` → sonuç boş olmalı.

**KURAL 2:** Server-only logik ile client-safe logik aynı dosyada OLMAMALI.
- Saf fonksiyonlar (tür dönüşümü, format, hesaplama) → `*-utils.ts` → `"server-only"` veya hiç Supabase import yok.
- Supabase bağımlı fonksiyonlar → server component veya API route'larda.

**KURAL 3:** `SUPABASE_SERVICE_ROLE_KEY` ASLA `NEXT_PUBLIC_` önekiyle isimlendirilemez.
- Aksi halde key tarayıcıya sızar, tüm RLS bypass edilir.

**KURAL 4:** Yeni bir lib dosyası client component tarafından import edilecekse:
- İçeriğinde Supabase, fs, crypto, veya başka server-only import VAR MI kontrol et.
- Yoksa doğrudan import → build'de error değil ama runtime'da crash (sinsi bug).

**KURAL 5:** `supabase-browser.ts` singleton pattern korunmalı.
- Her `getSupabaseBrowserClient()` çağrısı aynı instance'ı döndürmeli.
- Aksi halde Multiple GoTrueClient instances → auth tutarsızlığı.

---

## H-2 — React Error #423 (H-1'in Cascade Sonucu)

H-1 ile aynı commit'te çözüldü. Module-level throw giderildiğinde bu hata da kaybolur.

---

## Genel Dersler

### Env Var Güvenlik Matrisi

| Değişken | `NEXT_PUBLIC_` olabilir mi? | Kullanım yeri |
|----------|----------------------------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | **ASLA HAYIR** | Sadece server/API |
| `SUPABASE_ANON_KEY` → NEXT_PUBLIC_ | Evet | Client + Server |
| `SUPABASE_URL` → NEXT_PUBLIC_ | Evet | Client + Server |
| `ADMIN_PASSWORD` | **ASLA HAYIR** | Sadece API route |
| `ADMIN_SESSION_SECRET` | **ASLA HAYIR** | Sadece server |
| `IYZICO_API_KEY` | **ASLA HAYIR** | Sadece API route |
| `RESEND_API_KEY` | **ASLA HAYIR** | Sadece API route |
| `CRON_SECRET` | **ASLA HAYIR** | Sadece cron/API |

### Vercel Env Var Checklist
Yeni env var eklenince:
1. `.env.local`'a ekle (local dev)
2. Vercel Dashboard → Settings → Environment Variables → ekle
3. `NEXT_PUBLIC_` ise: client-safe mi? Değilse öneki kaldır.
4. Re-deploy yap (env var değişikliği mevcut deployment'ı etkilemez).
