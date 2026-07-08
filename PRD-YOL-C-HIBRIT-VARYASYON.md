# ÜRÜN GEREKSİNİMLERİ DÖKÜMANI (PRD) — YOL C (HİBRİT VARYASYON MİMARİSİ)

**Doküman Durumu:** Onaylı ve uygulanmış (Faz 0-3) + Planlanmış (Faz 4)  
**Tarih:** 2026-07-08

---

## 1. Amaç ve Kapsam

Bu PRD'nin amacı, Neri Shoes e-ticaret sitesinde katalog kalabalığını önlemek, dükkanı sade tutmak ve lüks segment kullanıcı deneyimi sağlamaktır. Sistem arka planda bağımsız ürün kayıtlarını korurken, ön yüzde aynı `color_family` değerine sahip ürünleri tek bir hiyerarşide birleştirecektir.

**Kritik prensip:** Canlı ödeme, sepet, stok ve sipariş katmanlarına (Yol B) dokunulmadan, ön yüzde müşteriye tamamen tek ürün içinde renk ve beden seçimi (Yol A) deneyimi yaşatmak.

---

## 2. Kullanıcı Deneyimi (UX/UI) Akışı

### 2.1 Katalog / Listeleme Sayfası (`/urunler` & Ana Sayfa)

Aynı `color_family`'ye sahip olan ürünlerden yalnızca 1 tanesi (vitrin/ana ürün) listelenecektir. Dükkanda aynı modelin farklı renkleri mükerrer kartlar olarak görünmeyecektir.

- `color_family` alanı dolu olan ürünler → aile başına 1 temsilci listelenir.
- `color_family` alanı `NULL` olan bağımsız tekil ürünler → aynen listelenmeye devam eder.

*(Faz 4 — katalog filtreleme katmanı; henüz uygulanmadı.)*

### 2.2 Ürün Detay Sayfası (`/urunler/[slug]`)

Müşteri detay sayfasına girdiğinde:

1. Fiyatın altında ve beden seçicinin üstünde **"Renk"** seçim alanı görünür.
2. Her bir renk, o modelin ilgili rengine ait küçük bir **görsel thumbnail (56×56px)** olarak sergilenir.
3. Müşteri farklı bir renk thumbnail'ine tıkladığında, sayfa **tamamen yeniden yüklenmez** (full page reload olmaz); Next.js `prefetch` ve client navigation sayesinde galeri görselleri, ürün açıklaması, fiyat ve beden stokları anlık ve akıcı bir şekilde güncellenir.
4. **State Reset:** Renk değiştirildiğinde, seçilmiş olan eski beden temizlenir (`selectedSize` → `null`), böylece yanlış beden sipariş edilmesinin önüne geçilir.

---

## 3. Teknik Mimari ve Veri Akışı

### 3.1 Arka Uç (Yol B — Güvenli, Değişmez)

| Katman | Davranış |
|--------|----------|
| `products` tablosu | Her renk = kendi ürün satırı. 3 nullable kolon: `color_family`, `color_name` (JSONB), `color_hex` (TEXT). |
| `product_stock` | Stok yalnızca `product_id + size` bazlı. Renk boyutu yok. |
| Sepet (`localStorage`) | Anahtar: `productId + size`. Değişmez. |
| `order_items` | `product_id`, `product_name`, `size`, `quantity`. Renk alanı yok. |
| `decrement_stock` RPC | `product_id + size` ile çalışır. Değişmez. |
| iyzico ödeme | `basketItems` mevcut şekliyle. Değişmez. |

### 3.2 Ön Uç (Yol C — Hibrit Deneyim)

```
Katalog listeleme (Faz 4)
  ↓  color_family dolu olanları distinct/grupla → 1 temsilci
Ürün Detay (Faz 3)
  ↓  getProductBySlug(slug)
  ↓  if product.colorFamily → getColorFamily(family, excludeId)
  ↓  ProductDetailContent ← siblings prop
  ↓  ColorSwatches.tsx (client)
  ↓  Link prefetch → kardeş slug'a client navigation
  ↓  product.id değiştiğinde galeri + selectedSize reset
```

---

## 4. Uygulanan Aşamalar

### Faz 0 — Şema (Additive) ✅
- `products` tablosuna 3 nullable kolon eklendi: `color_family`, `color_name`, `color_hex`.
- `CONCURRENTLY` partial index: `idx_products_color_family_active`.
- Geri alınabilir: kolonlar drop edilebilir, veri kaybı yok.

### Faz 1 — Veri Katmanı ✅
- `Product` arayüzüne `colorFamily?`, `colorName?`, `colorHex?` eklendi.
- `ColorSibling` arayüzü tanımlandı.
- `mapRow` / `toRow` 3 alanı güvenli şekilde destekliyor.
- `getColorFamily(family, excludeId)` fonksiyonu eklendi (`product_stock` join + `inStock` boolean).

### Faz 2 — Admin Paneli ✅
- Ürün modalına "Temel Bilgiler" accordion'una eklendi:
  - `color_family` input + `<datalist>` (mevcut aileler önerisi)
  - `color_name` (TR) input
  - `color_hex` `<input type="color">` + hex text
  - Aile Önizleme (aynı ailedeki diğer ürünlerin isimleri)
- API route (`PUT`/`POST`) renk alanlarını veritabanına yazıyor.

### Faz 3 — Müşteri UI (Renk Seçici) ✅
- `ColorSwatches.tsx` client bileşeni oluşturuldu.
- Konum: başlık/fiyat altı, beden seçici üstü.
- Hibrit swatch: 56×56px ürün görseli thumbnail, `rounded-lg`, `object-cover`.
- Aktif renk: `ring-2 ring-[--accent]` + gold check işareti.
- Tükenen kardeş: `opacity-50` + çapraz çizgi, tıklanabilir.
- Navigasyon: `@/i18n/navigation` `Link` + `prefetch={true}`.
- State reset: `product.id` değiştiğinde `activeImg` ve `selectedSize` sıfırlanır.
- i18n: `colorLabel` ("Renk"), `colorOutOfStock` ("Tükendi") — 6 dile backfill.

---

## 5. Planlanan Aşamalar

### Faz 4 — Katalog Filtreleme (Mükerrer Ürünleri Gizleme) ⏳

**Hedef:** Ana sayfa ve `/urunler` listeleme sayfalarında aynı `color_family`'ye sahip ürünlerden yalnızca 1 tanesi gösterilsin.

**Yaklaşım:**
- `getActiveProducts()` veya `getFeaturedProducts()` içinde `color_family` dolu olan ürünler için gruplama/distinct mantığı.
- Öneri: Her `color_family` için `created_at` en eski veya `featured=true` olan ürün temsilci olarak seçilir.
- `color_family` = `NULL` olan ürünler aynen listelenir.

**Tradeoff:** SSR/SSG'de kardeş ürünler build-time'da filtrelenir; sonradan yeni renk eklenince ISR/rebuild gerekir.

---

## 6. Güvenlik ve Regresyon (Blast Radius)

| Katman | Risk | Durum |
|--------|------|-------|
| Ödeme yolu (iyzico, webhook, RPC) | SIFIR | `orders`, `order_items`, `decrement_stock` değişmedi. |
| Sepet mekanizması | SIFIR | `localStorage` cart key `productId + size` aynı. |
| Stok yönetimi | SIFIR | `product_stock` şeması değişmedi. |
| Admin CRUD | DÜŞÜK | Sadece additive alanlar; mevcut akış bozulmadı. |
| Ön yüz build | DÜŞÜK | `tsc --noEmit` ve `next build` hatasız. |
| SEO / URL | ORTA | Her renk kendi `slug` + `canonical` URL'ini korur. Sitemap Faz 4'te etkilenebilir. |

---

## 7. Geri Alma (Rollback) Prosedürleri

### Faz 0-3 Geri Alma (Kod)
```bash
git revert b621d95  # Faz 3
git revert 705ace8  # Faz 0-2
```

### Faz 0 Geri Alma (Veritabanı)
```sql
DROP INDEX CONCURRENTLY IF EXISTS idx_products_color_family_active;
ALTER TABLE products DROP COLUMN IF EXISTS color_hex;
ALTER TABLE products DROP COLUMN IF EXISTS color_name;
ALTER TABLE products DROP COLUMN IF EXISTS color_family;
```

---

## 8. Açık Sorular (Karar Bekleyen)

| # | Soru | Seçenekler |
|---|------|-----------|
| S1 | **Faz 4 zamanlaması:** Katalog filtreleme şimdi mi, dükkan migrasyonuyla mı? | Şimdi = katalog sadeleşir ama 0 gerçek aile var. Bekle = migrasyonla birlikte anlam kazanır. |
| S4 | **SEO canonical:** Her renk kendi URL'ini mi korur, yoksa tek master canonical mı? | Mevcut: her renk self-canonical. Değişiklik yok. |
| S5 | **Katalog kartı swatch'ları:** ProductCard'ta mini swatch gösterilsin mi? | Opsiyonel; Faz 4'te değerlendirilebilir. |

---

## 9. Karar Kaydı

- **Teknik karar:** Yol B (Bağlantılı Ürünler) + ön yüzde Yol A hissi = **Yol C (Hibrit)**.
- **Oybirliği:** 6 ajanın 6'sı Yol B'yi onayladı; Yol A canlı ödeme yoluna dokunduğu için reddedildi.
- **Zamanlama:** Faz 0-3 altyapı + UI şimdi kuruldu; görünür fayda dükkan migrasyonu veya ilk gerçek renk kardeşi eklendiğinde aktifleşecek.

---

> *Bu doküman Neri Shoes Renk Varyasyon Sistemi'nin teknik ve ürün gereksinimleri kaynağıdır. Kodlama ve mimari kararlar bu PRD'ye göre alınmalıdır.*
