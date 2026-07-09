# RENK VARYASYON SİSTEMİ — PLANLAMA DOKÜMANI

> **Durum:** Plan hazır — Selçuk onayı bekleniyor. Bu doküman yalnızca planlamadır; **hiçbir dosya veya veritabanı değiştirilmemiştir.** Uygulama, onaydan sonra ayrı oturum(lar)da yapılacaktır.
> **Tarih:** 2026-07-07
> **Yöntem:** Otomatik multi-agent ekip tartışması — Reality Checker, Backend Architect, Database Optimizer, UX Researcher, UI Designer, Frontend Developer. Tüm ajanlar aynı keşif verisiyle beslendi; kod/DB değiştirmeleri devre dışı bırakıldı.

---

## 0. TL;DR (Yönetici Özeti)

- **Teknik karar OYBİRLİĞİ: Yol B (Bağlantılı Ürünler / Product Family).** Yol A (tam varyasyon) canlı ödeme yoluna dokunduğu için reddedildi.
- **Kritik keşif: Bugün sitede gerçek renk ailesi neredeyse YOK.** 29 üründen hiçbiri "aynı model, farklı renk" ikilisi değil. En yakın eşleşmeler (4767 Ökçeli/Yarasa, Prestige Bot/Süet, Hybrid Derby 1/2) **renk değil**, taban/malzeme/tip farkı.
- **Değer ne zaman geliyor:** Onaylı bekleyen **dükkan migrasyonu** (`DUKKAN-ENTEGRASYON-PLANI.md`) siteye ~83 ürün = model+renk grubu getirecek; ~17 modelin birden fazla rengi olacak. Renk seçici asıl o zaman anlam kazanır.
- **Zamanlama Selçuk'un kararı:** Yol B altyapısı bugün de kurulabilir (düşük risk, additive), ama görünür faydası dükkan migrasyonuyla gelir. Reality Checker "şimdi hiçbir şey gönderme, migrasyonla birlikte kur" diyor; azınlık görüşü aşağıda.
- **Ödeme/stok/sepet/sipariş katmanlarına risk: SIFIR.** Yol B sadece `products` tablosuna 3 nullable kolon ekler ve ürün sayfasına renk butonları koyar.

---

## AŞAMA 1 — KEŞİF BULGULARI (gerçek veriden)

### 1.1 Mevcut ürün yapısı (Supabase, `neri-shoes` projesi — canlı)

- **29 ürün**, 190 `product_stock` satırı, 64 gerçek sipariş, 62 `order_items` satırı.
- `products` şeması: `id, slug, name (TEXT), category, images[], image, price, compare_at_price, discount_percentage, sku, is_active, featured, content (JSONB, dil-başına), meta_* (JSONB)`. **Renk veya aile kavramı hiçbir yerde yok.**
- `content` JSONB şekli: `{ locale: { shortDescription, description, features[], styling[] } }` — renk alanı içermiyor.
- `product_stock (product_id, size INT, quantity)` — **stok yalnızca NUMARA bazlı.** Renk boyutu yok.
- Sepet (`CartItem`, localStorage `neri_cart_v1`) anahtarı: `productId + size`.
- `order_items (product_id, product_name, size, quantity, unit_price)`; ödeme onayında webhook `decrement_stock(product_id, size, qty)` RPC'sini çağırır.
- Ürün detay sayfası SSG (`generateStaticParams` tüm ürünler × 6 dil). Her ürünün kendi `slug`'ı, kendi `images[]` galerisi, kendi SEO metası var.

### 1.2 Renk ailesi tespiti — SOMUT SONUÇ

İsim/SKU benzerliğiyle tüm 29 ürün tarandı. **Gerçek "aynı model farklı renk" ikilisi bulunamadı.** En yakın gruplar ve neden renk ailesi OLMADIKLARI:

| Yakın grup | Ürünler | Neden renk ailesi DEĞİL |
|---|---|---|
| 4767 | `4767-okceli-taban`, `4767-yarasa-kaucuk-eva-taban` | Aynı kalıp, **farklı taban** (ökçeli vs yarasa kauçuk eva) — renk değil |
| Prestige Leather | `prestige-leather-bot`, `prestige-leather-suet` | **Farklı tip/malzeme** (bot vs süet) — renk değil |
| Hybrid Derby | `hybrid-derby`, `hbrit-derby2` | Model iterasyonu (1 vs 2) — renk değil |
| "Black" temalı | `croco-black-edition`, `stealth-black-edition`, `full-black` | Farklı modeller, tesadüfen hepsi siyah |

- **SKU durumu:** 29 üründen yalnızca **2**'sinde SKU dolu (`313` = `NS-313-SPR`, `stability-test-shoe` = E2E test). Yani SKU bugün eşleştirme anahtarı olarak kullanılamaz.
- **Görsel setleri:** Her ürünün kendi bağımsız görsel seti var (image_count 1–6). Renkler ayrı ürün olduğundan görsel çakışması yok.

### 1.3 Dükkan migrasyonuyla bağlantı (kritik)

`DUKKAN-ENTEGRASYON-PLANI.md` (onaylı, uygulama bekliyor) şunu **zaten kararlaştırmış**:

- Fiziksel dükkan: **66 model / 83 model+renk grubu** → siteye **~83 ürün** olarak gelecek; her ürün = model+renk, stok = numara.
- Deterministik SKU şeması: **`NS-{MODEL}-{RENK}`** — hem site hem dükkan kayıtlarına yazılacak.
- Yani dükkan planı **"her renk = kendi ürün satırı, stok = numara"** modelini benimsiyor. Bu tam olarak **Yol B'nin şeklidir.**
- **`NS-{MODEL}-{RENK}` SKU'sunun `{MODEL}` segmenti, hazır bir renk-ailesi anahtarıdır.** İki ayrı gruplama şeması icat etmeye gerek yok.

> **Sonuç:** Yol A'yı seçmek, zaten onaylanmış dükkan migrasyon tasarımıyla **çelişir** ve o planı da yeniden açmayı gerektirir. Yol B ise mevcut kararlarla **hizalıdır.**

---

## AŞAMA 2 — EKİP TARTIŞMASI

### 2.1 İki ana yol

**Yol A — Tam Varyasyon Sistemi.** Tek ürün kaydı + renk boyutu; `product_stock` → `(product_id, color, size)`, sepet/`order_items`/`decrement_stock`/iyzico basketItems hepsi renk taşır. Mevcut ayrı ürünler tek satıra birleştirilir + geçmiş veriler backfill edilir.

**Yol B — Bağlantılı Ürünler (Product Family).** Her renk ayrı ürün olarak KALIR. `products`'a `color_family` + `color_name` + `color_hex` eklenir. Ürün sayfası, aynı `color_family`'deki kardeş ürünlere giden renk butonları (swatch) gösterir; tıklayınca o rengin kendi sayfasına geçilir. Stok/sepet/ödeme/sipariş **hiç değişmez**.

### 2.2 Ekip görüşleri (özet)

**🔴 Reality Checker — Yol A'ya somut canlı-sistem senaryolarıyla saldırı:**
1. **Yanlış renge stok düşümü:** `decrement_stock` sadece product+size ile çalışıyor. Renk boyutu eklenince cart, webhook ve RPC **atomik** güncellenmeli; biri kaçarsa siyah ayakkabı siparişi sessizce kahverengi stoğunu düşürür — gerçek parayla, gerçek müşteriye karşı oversell.
2. **Geçmiş 64 siparişin `order_items`'ında renk yok** → kalıcı belirsizlik; iade/raporlama bozulur; backfill = tahmin.
3. **Migrasyon sırasında uçuştaki sepetler:** localStorage'daki `productId`'ler geçersizleşir → iyzico basketItem/tutar uyuşmazlığı → ödeme iyzico'da başarılı ama sipariş kaydedilemez.
4. **Webhook idempotency:** Şema değişimi ortasında tekrarlanan webhook eski anahtarı hedefler → çift düşüm veya sessiz no-op.
   **Verdict:** *"Yol A'yı ASLA (tarif edildiği gibi) yapma. Bugün 0–3 sahte aile için en yüksek blast-radius kodu olan ödeme yolunu yeniden mimarlemek gerekçesiz. Yol B'yi dükkan migrasyon takvimine bağla."*

**🟦 Backend Architect:** Yol A ödeme/webhook/stok yoluna "severe" blast radius, kırılgan rollback, geçmiş sipariş backfill zorunluluğu. Yol B "purely additive", rollback trivial (nullable kolonları düşür). Kardeş çekimi `getProductBySlug` içinde tek hafif sorgu (`WHERE color_family=$1 AND is_active`). **Öneri: Yol B, 3 fazlı geri-alınabilir rollout, her fazdan sonra misafir checkout + ödeme regresyon kontrolü.**

**🟩 Database Optimizer:** Yol B additive, küçük tablolarda kilitlemesiz. `color_family` **SKU `{MODEL}` segmentinden** türetilmeli → dükkan importu aynı anahtarı kullanır, ikinci gruplama şeması olmaz. `color_name` **JSONB (dil-başına)** olmalı: enum yanlış (her yeni renk DDL ister), TEXT 6 dile yetmez, JSONB mevcut `content` konvansiyonuyla aynı. Partial index önerisi. Yol A: `product_stock` PK/uniqueness değişimi, RPC imza değişimi, ~190 satır re-key, URL/SEO kırılması. **Öneri: Yol B.**

**🟨 UX Researcher:** Sayfa-arası geçiş (B), prefetch ile in-page swap'tan (A) **pratikte daha hızlı**; doğru mental model ("şimdi Taba Oxford'a bakıyorum"), doğru back-button davranışı, paylaşılabilir/deep-link URL (bu kitle WhatsApp'ta link paylaşıyor), galeri doğal reset. **Öneri: Yol B.** Çoğu modelin tek rengi olduğu için "ince duplicate URL" endişesi abartılı; renk-başına indekslenebilir URL gerçek SEO avantajı.

**🟧 UI Designer:** Lüks ayakkabıda hex daire deri/süet dokusunu düzleştirir → **hibrit: küçük ürün-görseli thumbnail** (56×56, `rounded-lg`), `color_hex` sadece placeholder + aria; aktif renk gold ring (`ring-2 ring-[--accent]` + gold glow, mevcut beden seçiciyle tutarlı) + küçük gold check (renk-körü için renkten bağımsız işaret); tek renkte kontrol tamamen gizli; tükenen kardeş `opacity-50` + çapraz çizgi ama tıklanabilir; RTL logical props.

**🟪 Frontend Developer:** `getColorFamily(family, excludeId)` → hafif `ColorSibling[]`; server sayfada çağrılıp `ProductDetailContent`'e prop. Yeni `ColorSwatches.tsx` client bileşeni, `@/i18n/navigation` `Link` ile kardeş slug'a. SSG uyarısı: kardeş listesi build-time; sonradan renk eklenince ISR (`revalidate`) veya rebuild gerek. Efor: sorgu+sayfa **M**, bileşen **S**, tip+i18n **S**. Riskler: (1) slug ile gez, `next/link` kullanma; (2) galeri/beden state'ini `product.id`'ye bağla ki gezerken eski görsel/numara kalmasın.

### 2.3 EKİP KARARI

> **Seçilen yol: YOL B (Bağlantılı Ürünler).** 6 ajanın 6'sı da hemfikir.

**Gerekçe:** Canlı ödeme/stok/sepet/sipariş yoluna sıfır dokunuş; additive + geri-alınabilir; dükkan migrasyonunun `NS-{MODEL}-{RENK}` SKU anahtarıyla doğal hizalı; UX/SEO açısından üstün; lüks-minimalist dile uygun swatch tasarımı mümkün. Risk **işlemsel değil, sunumsal.**

### 2.4 AZINLIK / ÇEKİNCE GÖRÜŞÜ (kayda geçer)

- **Reality Checker'ın zamanlama çekincesi:** "Yol B'yi bile BUGÜN gönderme — 0–3 sahte aile var, gösterecek renk yok. Dükkan migrasyonu ~17 gerçek aileyi getirene kadar beklet." Bu bir *teknik* itiraz değil (Yol B tasarımını onaylıyor), *zamanlama* itirazı. → **Aşağıdaki "Açık Sorular" S1'de Selçuk'a bırakıldı.**
- **Önemli uyarı:** Mevcut "yakın gruplar" (4767, Prestige, Hybrid Derby) renk DEĞİL. Bunları renk ailesi diye eşlemek **yanlış olur** (kullanıcı "renk" butonuna basıp süet yerine bot görür). Eşleme yapılırsa yalnızca **gerçek renk kardeşleri** kullanılmalı.

### 2.5 Üçüncü (hibrit) yol — değerlendirildi

**Yol C — "B altyapısı, A hissi":** Yol B'nin ayrı-ürün yapısını koru, ama swatch'lar Next.js client navigation + `prefetch` + paylaşılan layout ile geçiş yapsın; header/çerçeve sabit kalır, sadece galeri/içerik değişir → müşteri "tek sayfada renk değişti" hisseder ama altta B çalışır. **Bu zaten önerilen Yol B'nin uygulama detayıdır** (UX Researcher'ın tarif ettiği), ayrı bir mimari değil. Ek risk getirmeden A'nın "akıcılık" avantajını verir. → Yol B uygulamasına dahil edildi (bkz. Faz 3).

---

## AŞAMA 3 — SEÇİLEN YOLUN (YOL B) TAM TASARIMI

### 3.1 Şema değişikliği — DRAFT SQL (⚠️ ÇALIŞTIRILMAZ)

```sql
-- ============================================================
-- TASLAK — ÇALIŞTIRILMADI. Onaydan sonra service_role ile uygulanacak.
-- Yol B: products'a additive renk gruplama. Yıkıcı işlem YOK.
-- ============================================================

-- 1) Additive kolonlar (hepsi nullable → PG17'de tablo yeniden yazımı yok)
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_family TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_name   JSONB;   -- {"tr":"Siyah","en":"Black","de":"Schwarz","it":"Nero","ar":"أسود","ru":"Чёрный"}
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_hex    TEXT;

-- Opsiyonel hex format guard (NOT VALID → tarama kilidi olmadan sonradan validate)
-- ALTER TABLE products ADD CONSTRAINT chk_color_hex
--   CHECK (color_hex ~* '^#[0-9a-f]{6}$') NOT VALID;

-- 2) "Aktif kardeşleri color_family ile getir" için partial composite index
--    CONCURRENTLY = tablo kilidi yok (transaction dışında çalıştır)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_color_family_active
  ON products (color_family)
  WHERE is_active AND color_family IS NOT NULL;

-- 3) (İLERİDE, dükkan migrasyonunda) SKU'dan aile türetme: NS-{MODEL}-{RENK} -> NS-{MODEL}
--    Bugün 29 üründen yalnız 2'sinde SKU var → bugün otomatik seed YAPILMAZ.
--    Önce DRY-RUN SELECT ile incele, sonra guard'lı UPDATE:
-- SELECT id, sku, regexp_replace(sku,'^(NS-[^-]+)-.*$','\1') AS derived_family
-- FROM products WHERE sku ~ '^NS-[^-]+-.+$';

-- GERİ ALMA (down):
--   DROP INDEX CONCURRENTLY IF EXISTS idx_products_color_family_active;
--   ALTER TABLE products DROP COLUMN IF EXISTS color_hex;
--   ALTER TABLE products DROP COLUMN IF EXISTS color_name;
--   ALTER TABLE products DROP COLUMN IF EXISTS color_family;
```

**Dokunulmayanlar (kanıtlı sıfır-risk):** `product_stock`, `order_items`, `orders`, `decrement_stock` RPC, sepet, iyzico akışı, webhook. RLS aynı kalır (anon SELECT, yazma service_role).

### 3.2 Veri modeli kararları

- `color_family TEXT` (nullable): grup kimliği. Kardeş yalnızca **iki satır aynı değeri paylaşınca** oluşur. Tek renk → NULL (veya kendine özel, farketmez). Kaynak: bugün admin'den elle; migrasyonda SKU `{MODEL}` segmentinden.
- `color_name JSONB` (nullable): dil-başına renk adı. Mevcut `content`/`meta_*` JSONB konvansiyonuyla uyumlu → frontend locale-key erişimi değişmez.
- `color_hex TEXT` (nullable): swatch fallback rengi + erişilebilirlik. Görsel thumbnail birincil, hex ikincil.

### 3.3 Backend / veri erişimi

- `src/lib/products.ts` → yeni **`getColorFamily(family: string, excludeId: string): Promise<ColorSibling[]>`**
  - Sorgu: `SELECT id, slug, name, color_name, color_hex, images FROM products WHERE color_family = $1 AND is_active` (+ `product_stock` üzerinden `inStock` boolean: herhangi bir numarada qty>0).
  - Hafif projeksiyon; tam `Product` döndürmez.
- `mapRow`/`toRow`: yeni 3 alanı opsiyonel olarak eşle (yoksa `undefined` → mevcut satırlar ve çağıranlar bozulmaz).
- Server sayfa `urunler/[slug]/page.tsx`: `getProductBySlug` sonrası → `product.colorFamily ? await getColorFamily(product.colorFamily, product.id) : []`; sonucu `ProductDetailContent`'e `siblings` prop olarak geçir.
- **SSG/ISR notu:** Kardeş listesi build-time'da sabitlenir. Sonradan yeni renk eklenince mevcut kardeş sayfalarda görünmesi için ISR (`export const revalidate = 3600`) veya yeniden build gerekir. → Kabul edilen tradeoff, "Açık Sorular" S4.

### 3.4 Müşteri tarafı UI — Renk Seçici (UI Designer + UX)

- **Yeni bileşen:** `src/components/ColorSwatches.tsx` (client). Props: `siblings`, `currentSlug`, `label`.
- **Swatch stili — HİBRİT:** birincil = **56×56px ürün görseli thumbnail**, `rounded-lg`, `object-cover`, 1px `#333` border. `color_hex` yalnızca yükleme placeholder'ı + `aria`. Aktif rengin `color_name`'i sadece aktif swatch **altında** caption olarak.
- **Durumlar:**
  - Varsayılan: border `#333`.
  - Hover: border `#555`→gold, `scale-[1.04]`, 150ms.
  - **Aktif (mevcut renk):** `ring-2 ring-[--accent] ring-offset-2 ring-offset-[#0a0a0a]` + `shadow-[0_0_8px_rgba(255,208,0,0.3)]` (beden seçiciyle tutarlı) + sağ-üst 10px gold check (renkten bağımsız işaret).
  - Tükenen kardeş: `opacity-50` + çapraz ince çizgi, yine tıklanabilir `Link`; caption'a localize "Tükendi".
- **Yerleşim:** başlık/fiyat altında, **beden seçicinin hemen üstünde** ("Renk" → "Beden" seçim hunisi). Section label: `text-xs tracking-wide` uppercase, localize.
- **Sayı durumları:** 1 renk → kontrol tamamen gizli (yalnız disabled tek nokta gösterme). 2–3 → düz flex satır. >6 → detay sayfada `flex-wrap`, katalog kartında `overflow-x-auto` + kenar fade.
- **Katalog kartı (opsiyonel, Faz 4):** yalnızca çok-renkli modellerde, max ~4 + "+N" overflow. Tek renkli kartlarda hiç gösterilmez.
- **Navigasyon:** her swatch `@/i18n/navigation` `Link` → `/urunler/{siblingSlug}`. **ASLA `next/link` değil** (locale prefix bozulur). `prefetch` ile "anlık" his (Yol C).
- **Erişilebilirlik/RTL:** `aria-label={color_name}` (+ "current"/"tükendi"), `aria-current`, `focus-visible:ring-2`; açık renk swatch'lar (beyaz/bej) `#0a0a0a` zeminde erimesin diye daima 1px `#333` border; satır logical `flex` (Arapça'da otomatik ters).

### 3.5 Admin paneli UI (`AdminPanel.tsx` ürün modalı)

- Ürün modalının **"basic" accordion**'una ek alanlar:
  - **Renk Ailesi** (`color_family`): metin girişi + mevcut ailelerden datalist/öneri (yanlış yazımı azaltır). Boş bırakılabilir (tek renk).
  - **Renk Adı** (`color_name`): TR girişi zorunlu değil; girilirse `check-translations` mantığıyla diğer 5 dile çeviri (veya elle). Basit v1: sadece TR + otomatik çeviri pipeline.
  - **Renk Kodu** (`color_hex`): renk seçici input (`<input type="color">`) + hex metin.
- `products` API route (PUT/POST) `toRow`/`mapRow` üzerinden yeni alanları yazar/okur — mevcut CRUD akışına additive.
- Admin'de küçük bir "Aile önizleme" satırı: aynı `color_family`'deki diğer ürünlerin adları listelenir (yanlış eşlemeyi erken yakalar).

### 3.6 6 Dil gereksinimleri

- `messages/tr.json` → `"products": { "colorLabel": "Renk", "colorOutOfStock": "Tükendi", ... }`; sonra **`node scripts/check-translations.js`** ile 6 dile backfill (CLAUDE.md kuralı).
- `color_name` JSONB dil-başına: admin'de TR girilir, `process-translations` pipeline'ı (mevcut) diğer dilleri doldurabilir; eksikse TR fallback.
- RTL (ar): swatch satırı ve caption logical props ile doğru hizalanır.

---

## AŞAMA 4 — ADIM ADIM UYGULAMA (küçük, geri-alınabilir, gerçek-ortam testli)

> Her faz bağımsız revert edilebilir. **Her fazdan sonra regresyon kontrolü:** nerishoes.com.tr'de misafir checkout + gerçek/sandbox ödeme akışı doğrulanır (aşağıda 4.x geri-alma bölümü).

### Faz 0 — Şema (additive) · Risk: 🟢 Düşük
- 3 nullable kolon + partial index (`CONCURRENTLY`, transaction dışında). Backfill YOK.
- Supabase TS tiplerini yeniden üret.
- **Regresyon:** misafir checkout + ödeme; ürün listeleme/detay bozulmadı mı.
- **Geri alma:** kolonları + index'i düşür (veri kaybı yok, hiçbir satır kullanmıyordu).

### Faz 1 — Tip + veri katmanı · Risk: 🟢 Düşük
- `types.ts`: `Product`'a `colorFamily?`, `colorName?`, `colorHex?`; yeni `ColorSibling` arayüzü.
- `products.ts`: `mapRow`/`toRow` 3 alanı ekler; `getColorFamily()` eklenir (henüz UI'da kullanılmaz).
- **Regresyon:** build geçiyor mu (`tsc`), checkout + ödeme, admin ürün kaydet/düzenle (yeni alanlar boşken).
- **Geri alma:** commit revert; DB'ye dokunmaz.

### Faz 2 — Admin renk alanları · Risk: 🟢 Düşük
- Ürün modalına `color_family` / `color_name` / `color_hex` girişleri + aile önizleme.
- **Bu fazda 1–2 ürüne test amaçlı gerçek renk kardeşi tanımlanır** (varsa; yoksa geçici test ürünleriyle).
- **Regresyon:** ürün kaydet/düzenle, checkout + ödeme (hem gruplu hem grupsuz üründe).
- **Geri alma:** commit revert; girilen `color_*` değerleri zararsız kalır (UI okumazsa görünmez).

### Faz 3 — Müşteri renk seçici (asıl özellik) · Risk: 🟡 Orta (yalnız sunum)
- `ColorSwatches.tsx` + server sayfada `getColorFamily` çağrısı + `ProductDetailContent`'e prop.
- Galeri/beden state'i `product.id`'ye bağlanır (gezerken stale kalmasın).
- `prefetch`'li Link, ISR `revalidate`.
- i18n keyleri + `check-translations`.
- **Regresyon:** (a) gruplu üründe swatch görünüyor, tıklayınca kardeş sayfaya geçiyor, galeri/beden sıfırlanıyor; (b) tek-renk üründe kontrol hiç yok; (c) tükenen kardeş dim ama tıklanır; (d) 6 dil + RTL; (e) **checkout + ödeme her iki üründe.**
- **Geri alma:** `ColorSwatches` render'ını kaldır / feature'ı `color_family` varlığına bağlı tut; sayfa eski haline döner.

### Faz 4 — (Opsiyonel) Katalog kartı swatch'ları · Risk: 🟡 Orta
- `ProductCard.tsx`'e çok-renkli modeller için mini swatch + "+N".
- **Regresyon:** liste performansı, mobil, RTL, checkout + ödeme.
- **Geri alma:** kart swatch bloğunu kaldır.

> **Dükkan migrasyonu geldiğinde:** `color_family` SKU `{MODEL}` segmentinden otomatik seed edilir (3.1'deki guard'lı UPDATE, önce DRY-RUN). Renk seçici o anda ~17 gerçek ailede kendiliğinden aktifleşir — ek kod gerekmez.

---

## AŞAMA 5 — MEVCUT ÜRÜNLERİN AİLELERE EŞLEŞTİRME STRATEJİSİ

**Somut bulgu: Bugünkü 29 üründe gerçek renk ailesi YOK.** Dolayısıyla:

- **Faz 0–1'de hiçbir ürüne `color_family` atanmaz** (hepsi NULL kalır). Renk seçici hiçbir üründe görünmez — bu doğru davranıştır, sistem sessizce hazır bekler.
- Yakın gruplar (4767 Ökçeli/Yarasa, Prestige Bot/Süet, Hybrid Derby 1/2) **renk ailesi olarak eşlenMEZ** — bunlar taban/malzeme/tip farkı; renk butonuna basan müşteriyi yanıltır. (İleride istenirse bunlar *ayrı* bir "ilgili ürünler" ilişkisiyle bağlanabilir — bu planın kapsamı dışında.)
- **Gerçek eşleme iki kaynaktan gelir:**
  1. **Elle (bugün):** Selçuk yeni bir modelin ikinci rengini eklerse, admin'de ikisine de aynı `color_family` (örn. `runner-314`) + `color_name`/`color_hex` girer.
  2. **Dükkan migrasyonu (asıl):** 83 model+renk grubu, insan-onaylı eşleme ekranından geçerken `NS-{MODEL}-{RENK}` SKU üretilir; `color_family = NS-{MODEL}` otomatik türetilir. ~17 model çok-renkli aile olur.
- **İki gruplama şeması olmaması için:** elle girilen `color_family` değerleri de mümkünse `NS-{MODEL}` formatına yaklaştırılmalı (migrasyonla çakışmasın). → "Açık Sorular" S3.

---

## AŞAMA 6 — REGRESYON TESTLERİ (her fazda)

Mevcut Playwright altyapısı (`tests/e2e/shopping-flow.spec.ts`) + manuel:

1. **Misafir checkout + ödeme akışı** (kritik): sepete ekle → /tr/odeme → create-payment → iyzico/devMode → webhook → `decrement_stock` → sipariş "paid". **Her fazdan sonra zorunlu.**
2. **Ürün listeleme + detay:** 29 ürün, 6 dil, tek-renk üründe swatch YOK.
3. **Renk seçici (Faz 3+):** gruplu üründe geçiş, galeri/beden reset, tükenen kardeş, RTL (ar), `next/link` sızıntısı yok.
4. **Admin:** ürün kaydet/düzenle (renk alanlı ve alansız), aile önizleme.
5. **Build/tip:** `tsc` + `next build` temiz; `check-translations` eksik key bırakmıyor.
6. **Geri alma provası:** Faz 0 down script'i (index + kolon drop) staging'de denenir.

---

## AŞAMA 7 — SELÇUK'UN KARAR VERMESİ GEREKEN AÇIK SORULAR

| # | Soru | Seçenekler / Not |
|---|---|---|
| **S1** | **Zamanlama:** Yol B altyapısını **şimdi mi** kuralım, yoksa **dükkan migrasyonuyla birlikte mi**? | Bugün gösterecek gerçek renk ailesi yok. (a) *Şimdi kur, boş bekle* — migrasyon gelince kendiliğinden aktif (düşük risk, ama bugün görünür fayda yok). (b) *Bekle* — Reality Checker'ın önerisi; efor migrasyona bağlanır. **Öneri: (a) Faz 0–2'yi şimdi yap** (sessiz altyapı), Faz 3 UI'yı migrasyon veya ilk gerçek renk kardeşi eklendiğinde aç. |
| **S2** | **`color_name` çeviri derinliği:** 6 dile tam çeviri mi, tek string mi? | JSONB her ikisini destekler. v1 için TR + otomatik çeviri pipeline yeterli; sonradan genişletilebilir. |
| **S3** | **`color_family` anahtar formatı:** elle girişte serbest metin mi, `NS-{MODEL}` disiplini mi? | Migrasyonla çakışmaması için `NS-{MODEL}` disiplini önerilir (admin datalist yardımcı olur). |
| **S4** | **SEO / canonical politikası:** her renk kendi indekslenebilir URL'i (self-canonical) mi, yoksa tek master canonical mi? | UX Researcher self-canonical öneriyor (renk-başına long-tail + görsel indeksleme). Sitemap'i etkiler. |
| **S5** | **Katalog kartı swatch'ları (Faz 4):** istiyor musun? | Opsiyonel; liste görünümünü zenginleştirir ama kart karmaşasını artırır. Faz 3 sonrası ayrı değerlendirilebilir. |
| **S6** | **v1 kapsamı:** "bu renk X numarada yok ama başka renkte var" gibi çapraz-renk stok bilgisi v1'de OLMAYACAK — kabul? | Yol B'de her renk bağımsız stoklu; çapraz-renk mantığı kapsam dışı. |

---

## RAPOR

**Keşif:** Canlı Supabase + kod incelendi. 29 ürün, stok yalnız numara bazlı, renk kavramı hiç yok. **Kritik: bugün gerçek renk ailesi yok** (yakın gruplar taban/malzeme/tip farkı). Dükkan migrasyon planı zaten "her renk = ayrı ürün, SKU `NS-{MODEL}-{RENK}`" modelini benimsemiş — Yol B ile birebir hizalı.

**Tartışma:** 6 ajanlı ekip. **Oybirliği: Yol B.** Yol A, canlı ödeme yoluna somut felaket senaryoları (yanlış renge stok düşümü, geçmiş sipariş belirsizliği, uçuştaki sepetler, webhook idempotency) nedeniyle reddedildi. Azınlık görüşü teknik değil, zamanlama: "migrasyona kadar UI'yı beklet."

**Plan:** `products`'a 3 nullable kolon (`color_family`, `color_name` JSONB, `color_hex`) + partial index; ürün sayfasında kardeş ürünlere Link'li hibrit görsel-swatch seçici; admin'de renk alanları. Stok/sepet/ödeme/sipariş/RPC **hiç değişmez.** 4 fazlı (0→4), her faz geri-alınabilir, her fazdan sonra misafir checkout + ödeme regresyonu.

**Plan hazır, onayını bekliyorum.** Karar bekleyen ana sorular: S1 (zamanlama) ve S4 (SEO canonical). Onaydan sonra kodlamaya ayrı oturumda başlanır.
