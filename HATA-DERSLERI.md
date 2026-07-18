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

## H-3 — Dükkan (C:\Nerishoes) Site-Sync Pivotu: Doğrulanmamış Ürün Satırları + Arşiv Stok Sıfırlaması (2026-07-17)

### Belirti
Önceki oturumda dükkanın 826 varyantlık (marka-taklit riski taşıyan) kataloğu `[ARSIV]` etiketiyle arşivlendi, yerine Neri Shoes sitesinden 19 ürün × 10 beden = 190 satır senkronize edildi. Bu oturumda doğrulama yapılırken:
1. Beklenen 19 yerine 20 model+renk grubu bulundu.
2. 2 satır (`Hotiç Deliklil Gri Taban`, `LV Bej`) site kataloğunda **hiç yok** — marka-taklit isim deseni taşıyorlar (pivot'un tam olarak temizlemeye çalıştığı risk), zaten `purchase_price`/gerçek renk girilmiş (diğer 18 site-kaynaklı üründe `purchase_price=0`) → manuel/farklı bir yoldan eklendikleri anlaşılıyor.
3. Bu 2 satıra testler başlamadan ÖNCE gerçek satış zaten yapılmıştı (satış #530, #531 — 2 gerçek müşteri, veresiye, toplam 2.700 TL borç).
4. Arşivlenen 826 satırın 825'inde stok miktarı sıfırlanmış (yedekte normal 8-21 adet aralığındaydı) — pivot script'i sadece isim etiketlemekle kalmamış, stok alanını da sıfırlamış.

### Kök Neden
Pivot işlemi (isim arşivleme + site senkronu) önceki oturumda tek seferde, bu oturumdaki gibi satır-satır doğrulama yapılmadan uygulanmış. 2 rogue satırın nereden geldiği bu oturumda tespit edilemedi (script dışı elle giriş izlenimi var).

### Çözüm / Durum
Düzeltme yapılmadı — kanıt toplanıp `DUKKAN-ENTEGRASYON-PLANI-V3-PIVOT.md`'de Selçuk'a raporlandı, karar bekleniyor (rogue satırları arşivle mi, satışları olduğu gibi mi bırak).

### Önleme Kuralı
- **Toplu veri pivotu (arşivleme, senkron, migration) sonrası satır sayısı beklenenle eşleşmiyorsa ("19 değil 20"), asla "yaklaşık doğru" diyip geçme — her fazla/eksik satırı tek tek kaynağıyla (site DB, dış kayıt) çapraz doğrula.**
- Toplu stok/veri değişikliği yapan her script, yan etkilerini (stok sıfırlama gibi) açıkça loglamalı/dokümante etmeli — aksi halde sonraki oturumda "bu kasıtlı mıydı" sorusu cevapsız kalıyor.
- `purchase_price`, `maliyet` gibi sadece işletme sahibinin bilebileceği veriler **asla tahmin edilmez** — 0 veya boşsa doğrudan sorulur.
- Dashboard'daki agregat sayılar (ör. "Düşük Stok Kalemi") arşivlenmiş/pasif kayıtları filtrelemiyorsa anlamını yitirebilir — yeni bir "arşiv" durumu eklenen her sistemde, mevcut agregat widget'ların bu durumu es geçip geçmediği kontrol edilmeli.

---

## H-4 — ECOMMERCE-DONUSUM-PLANI.md + MUSTERI-PANELI-PLANI.md Markdown Bozulması (2026-07-17)

### Belirti
İki plan dosyası çalışma dizininde (commit edilmemiş) bozulmuş halde bulundu: `---` → `\---`, `alt_çizgili_isimler` → `alt\_çizgili\_isimler` (bazı yerlerde `\\\\\\\\_` gibi katmanlı escape), `-` madde işaretleri → `*`. Klasik "markdown AST round-trip" imzası (remark/unified/mdast-util-to-markdown gibi bir kütüphanenin varsayılan stringify çıktısı) — GitHub-flavored markdown yazımını CommonMark'ın escape kurallarına göre yeniden yazan bir formatlayıcı/araç.

### Kök Neden
Hangi araç olduğu bu oturumda tespit edilemedi — repo kökünde `.prettierrc`, `.markdownlint*`, `.vscode/settings.json` yok, yani proje-içi bir format-on-save kaynağı değil. Şüpheliler: editör tarafında global bir markdown formatter eklentisi, ya da dosyayı okuyup geri yazan bir MCP/araç zinciri (ör. bir markdown-to-AST işlem yapan otomasyon). Kanıt kaybolmadan (dosyalar hâlâ commit edilmemişken) yakalanmış olması şans.

### Çözüm
`git checkout <son sağlam commit> -- <dosya>` ile geri alındı (bozukluk hiç commitlenmemişti, working tree'de kaldı — diff sıfıra döndü).

### Önleme Kuralı
- **`.md` dosyalarını düzenlerken satır satır Edit kullan, dosyayı tamamen okuyup formatlayıp geri yazan (Write ile tam üzerine yazan) bir akıştan kaçın** — AST round-trip formatlayıcılar sessizce escape/bullet stilini değiştirir.
- Bir markdown dosyasında beklenmedik `\---`, `\_` gibi ters eğik çizgili escape'ler görülürse, hemen düzeltmeye çalışma — önce `git diff` ile hangi satırların/aralığın etkilendiğini gör, kaynağı (hangi tool/hook) not et.
- Commit edilmemiş dosya bozulmaları git geçmişinden ucuza geri alınabilir — bu yüzden sık `git status`/`git diff` kontrolü (özellikle uzun oturumlarda) erken yakalamayı sağlar.

---

## H-5 — Admin Ürün Ekleme: Vercel Payload Limiti 413 (2026-07-18)

### Belirti
Admin panelde ürün eklerken "Ürün eklenemedi. Tekrar deneyin." — jenerik, sebepsiz hata. Supabase loglarında (postgres/api) HİÇBİR iz yok.

### Kök Neden (canlı `fetch` ile kanıtlandı)
`/api/admin/products` POST/PUT, görselleri `FormData` içinde binary olarak sunucuya (Vercel Serverless Function) gönderiyordu. Vercel'in function body sert limiti ~4.5MB — bu limit Next.js route config ile değiştirilemez (Hobby/Pro). Client-side kontrol (`AdminPanel.tsx` `MAX_FILE_SIZE = 5MB`) bu gerçek limitin ÜZERİNDEYDİ, üstelik sadece TEK dosya bazında kontrol ediyordu (birden fazla görselin toplamı hiç kontrol edilmiyordu).
Kanıt: aynı isteğe 3MB gövde → 201, 6MB gövde → `413 FUNCTION_PAYLOAD_TOO_LARGE`. İstek Vercel platform katmanında reddedildiği için Next.js route handler'a hiç girmiyor — Supabase log'larında iz bırakmaması bununla tutarlı.

### Çözüm
`handleImageSelect` içinde seçilen her görsel sunucuya gitmeden ÖNCE tarayıcıda canvas ile sıkıştırılıyor (max 2000px kenar, JPEG q=0.82) ve gerçek platform limitinin altında güvenli bir eşiğe (`SAFE_UPLOAD_LIMIT = 4MB`) indiriliyor. Ayrıca `handleProductSubmit`'te gönderim öncesi TÜM yeni görsellerin toplam boyutu ayrıca kontrol ediliyor (tek tek limiti geçmeseler bile toplamda platform limitini aşabilirler).

### Önleme Kuralı
- **Client-side dosya boyutu limiti, hedef platformun GERÇEK sert limitinin altında olmalı** — "makul görünen" bir sayı (5MB) yeterli değil, asıl deployment hedefinin (Vercel/Cloudflare/vb.) request body limiti araştırılıp ona göre güvenlik payı bırakılmalı.
- **Çoklu dosya yüklemede TEK TEK boyut kontrolü yetmez — TOPLAM boyut da kontrol edilmeli**, özellikle hepsi tek bir `FormData`/istekte birleşiyorsa.
- Sunucu tarafında hiç iz bırakmayan, jenerik "işlem başarısız" hataları görülünce önce platform katmanını (Vercel/CDN/proxy limitleri) şüpheli listeye al — DB/RLS/trigger araştırmasından ÖNCE, çünkü istek DB'ye hiç ulaşmamış olabilir.

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

### Dosya Hijyeni
Alakasız/bayat rapor dosyaları commit edilmeden temizlenmeli — DOGRULAMA-RAPORU.md örneği (2026-07-13 tarihli, iptal edilmiş migration'dan bahsediyordu, 2026-07-18'de fark edilip silindi).

### Vercel Env Var Checklist
Yeni env var eklenince:
1. `.env.local`'a ekle (local dev)
2. Vercel Dashboard → Settings → Environment Variables → ekle
3. `NEXT_PUBLIC_` ise: client-safe mi? Değilse öneki kaldır.
4. Re-deploy yap (env var değişikliği mevcut deployment'ı etkilemez).
