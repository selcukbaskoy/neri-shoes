# DÜKKAN ENTEGRASYON PLANI

**Tarih:** 2026-07-07
**Durum:** ONAY BEKLİYOR — hiçbir adım uygulanmadı; kod/migration/dosya değişikliği yapılmadı.
**Hazırlayan:** 4 uzman perspektifli ekip tartışması (Backend Architect, Database Optimizer, Güvenlik/Reality Checker, Frontend + Dükkan Operasyonu) + moderatör sentezi.
**Hedef:** Fiziksel dükkan sistemini (C:\Nerishoes) nerishoes.com.tr ile entegre edip dükkan + online mağazayı TEK panelden yönetmek. Canlı e-ticaret akışı (ürün görüntüleme, sepet, iyzico ödeme, webhook, stok düşümü) HİÇBİR aşamada bozulmayacak.

---

## 1. KEŞİF BULGULARI (gerçek inceleme — tahmin değil)

### 1.1 Sistem A — Canlı site (Next.js 14 + Supabase, Vercel)

- Şema: `products` (29 satır), `product_stock` (190 satır, `UNIQUE(product_id, size)`), `orders` (63), `order_items`, `blog_posts`, `exchange_rates`, `regional_prices` + müşteri paneli tabloları (Supabase Auth, adres defteri, `product_reviews`/`coupons`/`wishlists` hazır).
- Stok düşümü: iyzico webhook → `decrement_stock(p_product_id, p_size, p_qty)` RPC. **Bu zincir dokunulmazdır.**
- RLS: `products`/`product_stock` anon SELECT açık; `orders` vb. sadece service_role; tüm yazma API route + `supabaseAdmin`.
- Admin: `/admin`, HMAC-imzalı session cookie, **tek admin, rol kavramı yok**. `AdminPanel.tsx` 61KB'lık tek client component (monolit — içine modül gömmek uygun değil).

### 1.2 Sistem B — Dükkan uygulaması (C:\Nerishoes, lokal Windows)

- Node.js + Express + SQLite (WAL, `synchronous=FULL`), Vanilla JS tek sayfalık SPA, VBS/BAT ile başlatma, `HOST=127.0.0.1:3210`. **Kimlik doğrulama yok**; tek koruma stok-dışı satışta `ADMIN_PIN` (env, **default "1234"**, düz metin karşılaştırma — `src/routes/sales.js:50`).
- Şema: `products` (**her satır bir varyant**: model_name + color + size; `purchase_price` = maliyet, hassas), `sales` (nakit/pos/veresiye, is_paid, amount_paid, promised_pay_at, sale_unreachable, is_reversed), `customers` (credit_limit, "Perakende Musteri" walk-in), `returns`, `credit_collections` + `payment_allocations` (FIFO tahsilat), `manual_report_sales` (stok-dışı/"Antigraviti" satış — stok düşmeden ciroya yazılır).
- **Gerçek veri (SQLite'tan doğrulandı):** 814 varyant = **66 model, 83 model+renk grubu**; toplam stok **1.564 adet** (numara aralığı 36–48); 366 satış (364 geçerli), ciro **594.025,01 TL**; 190 müşteri; 60 tahsilat / 57 allocation; 24 stok-dışı satış; 0 iade. DB 458KB, son yazım 04.07.2026 — aktif kullanımda.
- Yedekleme: 10 dk'da bir otomatik SQLite kopyası + açılış/kapanış yedekleri (`backups/`).

### 1.3 Çatışma noktaları (yan yana karşılaştırma)

| Konu | Dükkan (SQLite) | Site (Supabase) | Çatışma |
|---|---|---|---|
| Ürün tanımı | Varyant = satır (model+renk+numara) | Ürün (model+renk) + `product_stock` (numara) | Kardinalite: 814 varyant ↔ 29 ürün; 83 grup → ~83 site ürünü olur |
| Maliyet | `purchase_price` üründe | Yok | `products` anon SELECT açık → kolon eklenirse maliyet internete sızar |
| Stok | `products.quantity` (varyantta) | `product_stock.quantity` (ürün×numara) | Tek havuza indirgeme gerekir |
| Satış | `sales` + veresiye/FIFO/iade/geri alma | `orders` + iyzico yaşam döngüsü | İki farklı domain; tek tabloya sıkıştırılamaz |
| Müşteri | Veresiye müşterisi (ad+telefon+limit) | Supabase Auth kullanıcısı | Farklı kavramlar — birleştirilmez, ileride opsiyonel eşlenir |
| Ödeme | nakit / pos / veresiye | iyzico | Ortak nokta yok |
| Çalışma modu | Offline-first | Bulut | Kesinti stratejisi gerekir |

### 1.4 Yanlış çıkan varsayımlar (doğrulama sonucu)

1. **"SKU alanı zaten var, kullanılır"** → Sitede 29 üründen sadece **2**'sinde SKU dolu. Eşleştirme SKU'ya değil, insan onaylı model+renk eşlemesine dayanmalı; SKU'lar bu süreçte **üretilecek**.
2. **"Atölye-mağaza stok transferi modülü var"** → Kodda YOK. `WORKSHOP_UNITS` referansları eski monolitik app.js'ten kalma ölü koddur; ne endpoint ne UI mevcut. Plan bu özelliği "taşınacak" değil, istenirse "yeni yapılacak" olarak ele alır.
3. **"iyzico sandbox ile regresyon koşarız"** → Sandbox key şu an GEÇERSİZ (open_items kaydı). Regresyon kapısının tam çalışması için ön koşul.
4. **"is_paid=0 → açık borç"** → SQLite'ta nakit/pos satışlarda da `is_paid=0`; bayrak yalnız veresiyede anlamlı. Naif sorgu 516K "açık borç" gösterir; **gerçek açık veresiye 34.400 TL** (22 açık satış). Migrasyon doğrulaması bu düzeltilmiş formülü kullanmalı.

---

## 2. EKİP KARARLARI — 7 KRİTİK SORUNUN CEVABI

### Karar 1 — Stok: TEK HAVUZ (oybirliği)

Tek doğruluk kaynağı Supabase `product_stock`. Dükkan satışı da online satış da aynı stoktan düşer — aksi halde dükkanda satılan son çift sitede "stokta" görünür ve satılamayacak sipariş alınır.

- Kanal bilgisi **ürüne değil harekete** yazılır: yeni `stock_movements` defter (ledger) tablosu (`reason`: online_sale / store_sale / return / adjustment / migration_seed).
- `product_stock`'a location/kanal SATIRI **eklenmez** — `UNIQUE(product_id,size)` kısıtını ve `decrement_stock`'u kırar (DB optimizer'ın en sert itirazı, kabul edildi).
- Dükkan-özel ürünler: sitede görünmesin isteniyorsa `is_active=false` yeterli (mevcut sorgular zaten filtreliyor). *Azınlık görüşü (Backend Architect):* `products.channel` enum (`online/store/both`) daha açık model; gün 1 gerekli değil, katalog büyürse eklenebilir — additive olduğu için sonradan eklemek risksiz.
- Eşzamanlılık (son teki aynı anda iki kanal satarsa): atomik `UPDATE ... SET quantity = quantity - $1 WHERE ... AND quantity >= $1 RETURNING *` deseni (asla read-then-write) + ikinci savunma hattı `CHECK (quantity >= 0)`.

### Karar 2 — SQLite: TAM MİGRASYON, çift yönlü senkron RED (oybirliği)

- İki DB + sync = kronik tutarsızlık. Somut senaryo: internet kesikken dükkanda son çift satıldı, aynı dakika sitede de satıldı → sync sonrası iki satış, bir ürün; hangisinin iptal edileceğini sync çözemez.
- **Offline gerçeği:** "İnternet yoksa satış yok" Türkiye koşullarında kabul edilemez (oybirliği). Çözüm: POS istemcisinde **IndexedDB outbox kuyruğu** — kesintide satış lokale `pending` yazılır (idempotency key ile), bağlantı gelince sırayla işlenir; çakışmada (negatif stok) insan onayı. **Kapsam sınırı:** offline'da yalnız nakit/POS satış; veresiye satış ve tahsilat offline KAPALI (limit kontrolü + FIFO bayat veriyle yanlış sonuç üretir — "internet gelince deneyin").
- SQLite geçiş sonrası **salt-okunur arşiv** olur, silinmez. Çift-yazma dönemi (iki sisteme paralel satış girme) KESİNLİKLE yok — drift garanti eder.

### Karar 3 — Panel: AYNI CODEBASE, AYRI ROTA (oybirliği; rota adı açık soru)

- Ayrı uygulama RED: ikinci auth + ikinci deploy + ikinci güvenlik yüzeyi.
- Mevcut `AdminPanel.tsx` (61KB monolit) İÇİNE sekme gömme RED: bakım imkânsızlaşır, POS'un "sıfır gecikme" ihtiyacıyla admin panelin ağır state'i çakışır.
- **Karar:** Next.js içinde ayrı rota grubu (`/pos` önerilir; alternatif `/admin/dukkan`) — ayrı bundle (code splitting), kasa PC'sinde tam ekran/kiosk kullanım, aynı HMAC session auth, üst navigasyonda Admin ↔ POS tek tık.
- **Türkçe tek dil:** POS i18n'e girmez (admin gibi middleware muafiyeti; `messages/` dosyalarına dokunulmaz). Hardcoded Türkçe.

### Karar 4 — POS akışı ve Antigraviti

- **Hızlı Satış:** sayfa açılınca arama kutusu fokuslu → model yaz → ilk 5 sonuç → numara matrisi (hücrelerde stok adedi, 0 olan soluk) → 3 büyük ödeme butonu (nakit/POS/veresiye) → Enter=kaydet. Hedef: **4 tık / ~8-10 sn** — mevcut lokal app'ten hızlı.
- **Tek kalem v1, çoklu kaleme hazır veri modeli:** 366 satışın tamamı tek kalem girilmiş; UI v1 tek kalem kalır ama şema baştan başlık+satır (`store_sales` + `store_sale_items`) tasarlanır, çoklu satır UI v2.
- **Satış RPC:** `store_sell(...)` — stok kontrolü + düşüm + satış kaydı tek transaction. Mevcut `decrement_stock`'u ÇAĞIRMAZ ve DEĞİŞTİRMEZ; kendi atomik UPDATE'ini yapar. Hareket defteri `product_stock` üzerine AFTER UPDATE **trigger** ile otomatik yazılır → webhook yolu ve RPC imzası hiç değişmez (sıfır dokunuş).
- **Geri alma / iade:** `store_reverse_sale(sale_id)` (stok iadesi + is_reversed) ve iade akışı SQLite'taki mantıkla birebir.
- **Antigraviti (stok-dışı satış):** POS'ta **ayrı, amber renkli buton** (checkbox değil — yanlışlıkla açık kalma riski), açıklama alanı zorunlu, kaydetmeden önce "Bu satış stoktan düşmeyecek" uyarısı, raporlarda kalıcı "Stok Dışı" rozeti + gün sonunda ayrı toplam satırı.
  - **Yetkilendirme — güvenlik kararı:** `ADMIN_PIN` default "1234" düz metin modeli buluta TAŞINMAZ (4 haneli PIN internete açık ortamda saniyeler içinde brute-force edilir). Yerine: **owner rolü + sunucu tarafı yetki kontrolü + append-only audit log** (kim, ne zaman, tutar; UPDATE/DELETE trigger ile engelli). *Frontend'in "PIN modalını kas hafızası için koru" görüşü:* UX'te onay modalı kalır; istenirse kullanıcı-bazlı hash'li PIN "hız tümseği" olarak eklenebilir ama tek güvenlik katmanı olamaz.
- **Veresiye ekranı — birebir korunacaklar (kas hafızası):** açık veresiye tablo düzeni (Gün/Müşteri/Kalan Borç), **FIFO önizlemeli tahsilat modalı** (tutar girilince hangi satışların kapanacağı listelenir — güven veren özellik, asla kaldırılmaz), "Ulaşılamıyor" işareti + isim yanı `*`, promosyon/hediye kapanışı, "Ne Zaman Ödeyecek" tarihi. **İyileşecekler:** 190 müşteri için select yerine anlık filtreli arama (telefon son 4 hane dahil), müşteri borç geçmişi drawer'ı, geciken vade kırmızı vurgusu.

### Karar 5 — Veri geçişi (SKU stratejisi dahil)

- **Katalog eşleme insan onaylı olacak** — otomatik fuzzy-match RED (yanlış eşleşme canlı sitede yanlış stok gösterir). 83 model+renk grubu bir eşleştirme ekranı/CSV ile tek tek "mevcut site ürünü mü / yeni ürün mü" onayından geçer.
- SKU üretilir: deterministik `NS-{MODEL}-{RENK}` formatı; hem site hem dükkan kayıtlarına yazılır → kalıcı eşleme anahtarı.
- `sqlite_id_map(sqlite_product_id → supabase_product_id, size)` ara tablosu — geçmiş satışların FK çevirisi için şart.
- **Geçmiş satışlar `orders`'a KARIŞTIRILMAZ** (iyzico raporlaması bozulur): `store_sales`'e `legacy=true` ile taşınır. Açık veresiye bakiyeleri (34.400 TL, 22 satış) MUTLAKA taşınır — tahsilat operasyonu canlı.
- Stok upsert'inde çakışma (aynı product_id+size sitede zaten doluysa): otomatik TOPLANMAZ, elle onay listesine düşer.
- **Sayısal mutabakat (iki tarafta eşit olmalı, göz kontrolü yetmez):** toplam stok = 1.564; ciro = 594.025,01 TL; açık veresiye = 34.400 TL (düzeltilmiş formülle); müşteri = 190; `SUM(allocations) = SUM(collections)` tutarlılığı.
- Geçiş "dondurulmuş an"da yapılır: dükkan kapalıyken/satış girilmeyen dilimde snapshot → taşı → doğrula → aç. Dükkan bu sırada satış yaptıysa delta ayrı export edilip idempotent şekilde tekrar uygulanır.

### Karar 6 — Güvenlik ve roller

- **`purchase_price` (maliyet): AYRI TABLO ŞART** (`product_costs`), `products`'a kolon ASLA. Gerekçe: PostgreSQL RLS kolon maskeleme yapmaz; `products` anon SELECT açıkken eklenen her kolon `?select=*` ile internete açılır. `product_costs`: RLS enable + **hiçbir policy yok** (default deny) → yalnız service_role okur. Kanıt testi CI'a girer: anon key ile `GET /rest/v1/product_costs?select=*` → boş/401 dönmeli.
- Tüm `store_*` tabloları aynı desende: RLS enable, policy yok, erişim yalnız API route + `supabaseAdmin` (mevcut `orders` deseni).
- **KVKK (190 veresiye müşterisi — ad+telefon+borç):** buluta taşıma aydınlatma/VERBİS yükümlülüğü doğurabilir; UI'da telefon maskeli gösterim (05XX***XX), borç kapanınca X ay sonra anonimleştirme politikası, Supabase bölge kontrolü. **Selçuk'un teyidi gerekli** (açık soru #5).
- **Rol modeli:** bugün tek kullanıcı. Kasiyer/personel girecekse: maliyet, toplam ciro/raporlar ve site yönetimi görmemeli; yalnız satış girer + stok görür.
  - *Öneri (moderatör + backend):* mevcut HMAC session'a `role: owner|staff` alanı eklemek — en küçük değişiklik; tüm store yazmaları zaten service_role'lü API route'lardan geçtiği için rol kontrolü API katmanında yapılır, müşteri auth havuzuna karışmaz.
  - *Azınlık görüşü (güvenlik):* Supabase Auth + `app_metadata.role` custom claim daha standart; ancak personel ve site müşterileri aynı auth havuzunu paylaşır — `TO authenticated` yazılan tek yanlış policy her kayıtlı MÜŞTERİYE personel verisi açar. Bu yol seçilirse "authenticated ≠ yetkili" ilkesi her policy'de zorunlu.
- POS internete açılıyor: rate limit + mevcut `admin_login_attempts` deseni POS girişine de uygulanır.
- Yeni RLS policy eklerken hatırlatma: policy'ler OR'lanır → risk "yanlışlıkla erişim AÇMAK"tır. Her migration sonrası anon sızıntı taraması tekrarlanır.

### Karar 7 — Canlıyı bozmama ve regresyon kapıları

- **Değişmez sözleşme (hiçbir aşamada dokunulmaz):** `products`/`product_stock`/`orders` mevcut kolonları ve kısıtları, `decrement_stock` imzası ve gövdesi, webhook HMAC doğrulaması, anon RLS politikaları, sepet/create-payment akışı.
- **Tüm şema değişiklikleri additive** (yalnız yeni tablo + trigger) → yapısal olarak canlıyı kıramaz; rollback = DROP.
- **Her faz sonu zorunlu regresyon seti:**
  (a) Playwright `shopping-flow.spec.ts` yeşil;
  (b) HMAC imzalı sahte webhook simülasyonu → DB'den stok düşümü doğrulanır;
  (c) anon key sızıntı taraması — tüm tablolara `select=*` (özellikle `product_costs`, `store_*`);
  (d) iyzico sandbox uçtan uca 1 sipariş — **ön koşul: geçersiz sandbox key yenilenmeli**, bugün (d) koşulamaz.
  "Build geçti" tek başına ASLA yeterli sayılmaz.

---

## 3. HEDEF MİMARİ

### 3.1 Bileşenler

```
┌────────────────────────── Vercel (Next.js 14) ──────────────────────────┐
│  /[locale]/*  → canlı site (DEĞİŞMEZ)                                    │
│  /admin       → mevcut panel + rol kontrolü + birleşik gün sonu raporu   │
│  /pos         → YENİ: kasa ekranı (TR tek dil, kiosk, PWA + outbox)      │
│  /api/pos/*   → YENİ: satış, iade, veresiye, tahsilat (supabaseAdmin)    │
│  /api/checkout, /api/webhooks/iyzico → DEĞİŞMEZ                          │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
┌────────────────────────── Supabase (tek kaynak) ─────────────────────────┐
│ MEVCUT (dokunulmaz): products, product_stock, orders, order_items, ...   │
│ YENİ: store_customers, store_sales, store_sale_items,                    │
│       credit_collections, payment_allocations, manual_store_sales,       │
│       product_costs, stock_movements, sqlite_id_map, store_audit_log     │
│ YENİ RPC: store_sell, store_reverse_sale, allocate_collection (FIFO)     │
│ YENİ TRIGGER: product_stock AFTER UPDATE → stock_movements               │
└──────────────────────────────────────────────────────────────────────────┘

C:\Nerishoes (SQLite) → geçiş sonrası SALT-OKUNUR ARŞİV (silinmez)
```

### 3.2 Şema taslağı (SQL — PLANA YAZILDI, ÇALIŞTIRILMAYACAK)

```sql
-- Maliyet: products'tan AYRI, default-deny
CREATE TABLE product_costs (
  product_id bigint REFERENCES products(id),
  size text,
  purchase_price numeric(10,2) NOT NULL,
  effective_from timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, size, effective_from)
);
ALTER TABLE product_costs ENABLE ROW LEVEL SECURITY;  -- policy YOK = yalnız service_role

-- Stok hareket defteri (trigger doldurur; decrement_stock'a sıfır dokunuş)
CREATE TABLE stock_movements (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL,
  size text NOT NULL,
  delta int NOT NULL,
  reason text NOT NULL,          -- 'online_sale'|'store_sale'|'return'|'adjustment'|'migration_seed'
  channel text NOT NULL DEFAULT 'online',
  ref_id bigint,
  created_at timestamptz DEFAULT now()
);

-- Dükkan müşterisi (Supabase Auth'tan AYRI; ileride opsiyonel auth_user_id eşlemesi)
CREATE TABLE store_customers (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  phone text,
  credit_limit numeric(10,2) NOT NULL DEFAULT 0,
  is_blocked boolean NOT NULL DEFAULT false,   -- 'Ulaşılamıyor' blokajı
  sqlite_id int,                                -- göç izi
  created_at timestamptz DEFAULT now()
);

-- Satış: başlık + satır (v1 tek satır girer, model çoklu satıra hazır)
CREATE TABLE store_sales (
  id bigserial PRIMARY KEY,
  customer_id bigint REFERENCES store_customers(id),
  payment_method text NOT NULL CHECK (payment_method IN ('nakit','pos','veresiye')),
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_price numeric(10,2) NOT NULL,
  note text,
  is_paid boolean NOT NULL DEFAULT false,       -- yalnız veresiyede anlamlı
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  paid_at timestamptz,
  promised_pay_at date,
  sale_unreachable boolean NOT NULL DEFAULT false,
  is_reversed boolean NOT NULL DEFAULT false,
  reversed_at timestamptz,
  correction_note text,
  is_legacy boolean NOT NULL DEFAULT false,     -- SQLite'tan taşınan geçmiş
  sold_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE store_sale_items (
  id bigserial PRIMARY KEY,
  sale_id bigint NOT NULL REFERENCES store_sales(id),
  product_id bigint REFERENCES products(id),
  size text,
  quantity int NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  returned_quantity int NOT NULL DEFAULT 0
);

-- FIFO veresiye tahsilat (SQLite modeli birebir)
CREATE TABLE credit_collections (
  id bigserial PRIMARY KEY,
  customer_id bigint NOT NULL REFERENCES store_customers(id),
  amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'nakit',  -- 'promosyon_hediye' dahil
  collected_at timestamptz NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE payment_allocations (
  id bigserial PRIMARY KEY,
  collection_id bigint NOT NULL REFERENCES credit_collections(id),
  sale_id bigint NOT NULL REFERENCES store_sales(id),
  amount numeric(10,2) NOT NULL
);

-- Stok-dışı satış (Antigraviti) — stok düşümü yok, ciroya yazılır
CREATE TABLE manual_store_sales (
  id bigserial PRIMARY KEY,
  customer_id bigint REFERENCES store_customers(id),
  sale_date date NOT NULL,
  product_description text NOT NULL,
  quantity int NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('nakit','pos')),
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  note text,
  created_by text NOT NULL,                     -- inkar edilemezlik
  created_at timestamptz DEFAULT now()
);

-- Append-only audit (UPDATE/DELETE trigger ile engellenir)
CREATE TABLE store_audit_log (
  id bigserial PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,       -- 'manual_sale'|'reverse_sale'|'collection_delete'|...
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Göç eşleme tablosu
CREATE TABLE sqlite_id_map (
  sqlite_product_id int PRIMARY KEY,
  supabase_product_id bigint NOT NULL,
  size text NOT NULL
);

-- Tümü: ENABLE ROW LEVEL SECURITY + policy YOK (yalnız service_role)
-- İndeksler: store_sales(customer_id), store_sales(product_id via items),
--   store_sales(sold_at DESC), payment_allocations(collection_id),
--   stock_movements(product_id, created_at DESC),
--   partial: store_sales(customer_id) WHERE payment_method='veresiye' AND is_paid=false
-- CHECK (quantity >= 0) product_stock'a eklenir (mevcut veride negatif yok — güvenli, additive)
-- Materialized view GEREKSİZ (veri hacmi yüzlerce satır) — plain view/UNION ALL rapor için yeter
```

### 3.3 POS teknik formu

Next.js route (`/pos`) + **PWA** (manifest + service worker + IndexedDB outbox). Mevcut lokal Express uygulamasını Supabase'e bağlamak REDDEDİLDİ: auth'suz lokal app'e bulut yazma yetkisi vermek güvenlik açığı; iki codebase bakımı kalıcılaşır.

---

## 4. UYGULAMA AŞAMALARI (küçük, geri alınabilir, her biri regresyon kapılı)

| # | Aşama | İçerik | Risk | Regresyon kapısı | Geri alma |
|---|---|---|---|---|---|
| 0 | Ön koşullar | SQLite soğuk yedek (`wal_checkpoint(FULL)` + kopya, ayrıca `backups/` mevcut); iyzico sandbox key yenile; baz regresyon koşusu (E2E + anon sızıntı taraması) — "yeşil başlangıç" kanıtı | Düşük | Baz setin kendisi | Yok (salt hazırlık) |
| 1 | Şema (additive) | §3.2'deki yeni tablolar + indeksler + RLS(default-deny) + audit trigger'ları. Mevcut tablolara dokunuş YOK | Düşük | E2E + anon taraması (yeni tablolar boş dönmeli) | `DROP TABLE` down-script'leri |
| 2 | Stok defteri trigger'ı | `product_stock` AFTER UPDATE → `stock_movements`; `CHECK (quantity>=0)` | **Orta** (canlı tabloya trigger) | E2E + webhook simülasyonu → stok düştü VE hareket yazıldı; hata halinde trigger'ın satış akışını bloke etmediği doğrulanır | `DROP TRIGGER`, `DROP CONSTRAINT` |
| 3 | Rol altyapısı | HMAC session'a `role` alanı (owner/staff); API route'larda yetki kontrolü; admin UI'da koşullu görünürlük | Düşük-Orta | Admin login/logout smoke; staff hesabıyla maliyet/rapor erişim RED testi | Kod revert (şema etkisi yok) |
| 4 | Katalog göçü (dry-run → gerçek) | 83 grup CSV/ekran ile İNSAN ONAYLI eşleme; SKU üretimi; `products` upsert (dükkan-özel → `is_active=false`); `product_stock` merge (çakışan satır elle onay); `product_costs` doldurma; `sqlite_id_map` | **Orta** (`product_stock` satırlarına yazılıyor) | Önce `product_stock_backup_YYYYMMDD` snapshot; sayısal mutabakat: stok=1.564; site smoke + E2E; anon ile `product_costs` sızıntı testi | Snapshot'tan restore + map'li satırları DELETE (script idempotent, tekrar koşulabilir) |
| 5 | Geçmiş veri göçü | 190 müşteri → `store_customers`; 366 satış → `store_sales(is_legacy=true)` + items; 60 tahsilat + 57 allocation; 24 stok-dışı → `manual_store_sales`. STOK DEĞİŞMEZ | Düşük (izole tablolar) | Mutabakat: ciro=594.025,01; açık veresiye=34.400; SUM(alloc)=SUM(coll); müşteri=190 | Yeni tabloları TRUNCATE (canlıya etkisi sıfır) |
| 6 | POS ekranı + RPC'ler | `/pos` (TR, kiosk, PWA); `store_sell`/`store_reverse_sale` RPC; Antigraviti (amber buton + owner onayı + audit); offline outbox (yalnız nakit/pos) | **Orta** | Eşzamanlı satış testi: site + POS aynı varyantın son adedini alır → biri reddedilmeli; E2E; offline kuyruk senaryosu | Rota kaldırılır; RPC'ler DROP; canlı akış etkilenmez |
| 7 | Veresiye + raporlar | Tahsilat ekranı (FIFO önizleme modalı birebir), `allocate_collection` RPC, "Ulaşılamıyor" blokajı; birleşik gün sonu raporu (dükkan nakit/POS/veresiye kırılımı + online + toplam; kritik stok; stok-dışı ayrı satır) | Düşük-Orta | Tahsilat FIFO birim senaryoları (1000+500+1200'e 1700 dağıtımı = eski davranış); rapor toplamları legacy mutabakatıyla eşleşir | UI/RPC kaldırılır |
| 8 | Kuru çalışma + kesin geçiş | 1-2 gün test verisiyle prova (10 satış + 2 tahsilat + 1 iade); hafta sonu/kapalı gün: delta göçü → Pazartesi POS TEK kayıt kaynağı; eski app kısayolu kalkar, 2-4 hafta SALT-OKUNUR kalır; ilk hafta her gün sonu karşılaştırmalı kontrol | **Yüksek (operasyonel)** | Gün sonu otomatik mutabakat raporu (ilk hafta zorunlu); delta export idempotent | Acil durumda: POS kapatılır, eski lokal app yeniden açılır (SQLite hâlâ yerinde), aradaki POS satışları CSV ile geri işlenir |
| 9 | Emeklilik | SQLite arşivlenir (salt-okunur, silinmez); lokal app kaldırılır; dokümantasyon + memory güncellenir | Düşük | Son mutabakat | Arşivden her zaman dönülebilir |

**Sıralama kuralı:** Bir aşamanın kapısı yeşil olmadan sonraki başlamaz. 4-5 arası ve 8 öncesi Selçuk onayı alınır.

---

## 5. VERİ GEÇİŞ STRATEJİSİ (özet akış)

1. **Yedek olmadan hiçbir şey başlamaz:** `PRAGMA wal_checkpoint(FULL)` → `database.sqlite` soğuk kopyası (tarihli) + mevcut `backups/` klasörünün ayrıca harici kopyası.
2. Dry-run: SQLite → CSV export → 83 grup eşleme ekranı → Selçuk onayı → staging doğrulaması.
3. Gerçek koşu (dondurulmuş anda): katalog → stok → maliyet → müşteri → satış → tahsilat sırasıyla; her adımda kontrol toplamı.
4. Delta yakalama: göç T anından sonra dükkanda satış girildiyse ayrı export + idempotent tekrar uygulama. En güvenlisi kapalı günde göç.
5. Göç script'i idempotent yazılır (tekrar koşmak çift kayıt üretmez — `sqlite_id_map` üzerinden).

---

## 6. SELÇUK'UN KARAR VERMESİ GEREKEN AÇIK SORULAR

1. **Dükkan-özel ürünler** sitede tamamen görünmez mi kalsın (`is_active=false` yeterli), yoksa ileride "yalnız mağazada" rozeti ister misin? (İkincisi `products.channel` kolonunu gerektirir — sonradan eklenebilir.)
2. **Rol modeli:** Şimdilik tek kullanıcı (owner) mı, kasiyer rolü hemen mi gereksin? Kasiyer gerekiyorsa: HMAC session + rol (öneri) mi, Supabase Auth custom claims mi?
3. **Antigraviti onayı:** PIN tamamen kalksın + owner onayı/audit yeter mi, yoksa kullanıcı-bazlı hash'li PIN "hız tümseği" olarak kalsın mı?
4. **POS rota adı:** `/pos` (öneri) mi `/admin/dukkan` mı?
5. **KVKK:** Veresiye müşterilerine (190 kişi) veri işleme aydınlatması geçmişte yapıldı mı? Buluta taşıma öncesi hukuki durum teyidi + telefon maskeli gösterim yeterli mi?
6. **Geçmiş satışların kapsamı:** 366 satışın tamamı mı taşınsın (öneri: evet — hacim küçük, rapor sürekliliği değerli), yoksa yalnız açık veresiye + özet mi?
7. **Offline sınırı onayı:** Kesintide yalnız nakit/POS satış kuyruğa; veresiye satış + tahsilat offline kapalı — kabul mü?
8. **Geçiş günü:** Dükkanın kapalı/sakin olduğu gün hangisi? (Göç o güne planlanacak.)
9. **iyzico sandbox key:** Regresyon kapısının (d) maddesi için yenilenmesi ön koşul — ne zaman halledilsin? (Aşama 0'ın parçası.)
10. **Atölye-mağaza transferi:** Kodda olmayan bu özellik gerçekten isteniyor mu? İsteniyorsa ayrı bir mini-faz olarak (stock_movements `reason='transfer'` + basit UI) plana eklenir — mevcut plana dahil DEĞİL.

---

## 7. AZINLIK GÖRÜŞLERİ KAYDI

- **Backend Architect:** `products.channel` enum'u gün 1'den eklensin (kabul edilmedi; `is_active=false` + gerekirse sonradan additive ekleme tercih edildi).
- **Güvenlik:** Personel rolleri için Supabase Auth custom claims (kabul şartlı: müşteri auth havuzuyla karışma riski nedeniyle varsayılan öneri HMAC+rol; Selçuk'un kararına bırakıldı — açık soru #2).
- **Frontend:** ADMIN_PIN modalı birebir korunsun (kısmen kabul: onay modalı kalır, düz metin "1234" PIN güvenlik katmanı olarak kalamaz).

---

*Bu doküman yalnızca plandır. Hiçbir SQL çalıştırılmadı, hiçbir dosya/şema değiştirilmedi. Uygulama, Selçuk'un onayıyla Aşama 0'dan başlar.*
