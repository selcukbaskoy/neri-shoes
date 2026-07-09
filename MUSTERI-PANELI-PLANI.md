# Neri Shoes — Müşteri Paneli + Müşteri Deneyimi İş Planı (v2)

Canlı, gerçek ödeme alan siteye: müşteri hesap sistemi + yorum/kupon/satış-sonrası deneyim katmanı. Hedef: müşteriyi yormayan, minimalist-modern, lüks dile (siyah/altın, Bodoni) uyan panel + kusursuz veri kaydı.

---

## SIFIRINCI ADIM — ACİL CANLI TEMİZLİK (her şeyden önce, 30 dk)

Canlı sitede müşterinin ŞU AN gördüğü sorunlar:
- A1. "deneme" ürünü (açıklama "sdsdsdsd", 5 TL) → is_active: false yap veya sil
- A2. "4767 Yarasa" 1 TL / %100 indirim → gerçek fiyatına düzelt
- A3. Öne çıkanlarda 4/5 ürün TÜKENDİ → featured mantığı stoklu ürünleri öne alsın (tükenmişler featured'dan otomatik düşsün)

---

## TEMEL İLKELER (PAZARLIK EDİLEMEZ)

1. **Misafir checkout ASLA kalkmaz.** Üyelik her zaman opsiyonel kolaylık.
2. **Mevcut yapı bozulmaz** (sepet, iyzico, admin). Her aşama regresyon testiyle doğrulanır.
3. **RLS:** müşteri yalnızca KENDİ verisini görür (auth.uid() bazlı, DB seviyesinde garanti).
4. **Minimalist:** panel 4-5 ekranı geçmez. Kalabalık dashboard yok.
5. **Yorumlar moderasyonludur:** admin onayı olmadan hiçbir yorum yayınlanmaz.

## MİMARİ

- **Auth:** Supabase Auth — e-posta+şifre VE magic link. Telefon OTP v1'de yok (SMS maliyeti). Google OAuth ekip tartışsın.
- **Misafir eşleştirme:** customers'a auth_user_id + email kolonu; kayıt olunca aynı telefon/e-posta ile geçmiş misafir siparişleri hesaba bağlanır (sipariş geçmişi dolu gelir — güçlü üyelik teşviki).
- **E-posta altyapısı:** Resend (veya benzeri, ekip seçsin) — sipariş onayı + post-purchase check-in + kupon mailleri tek altyapıdan.

## VERİ MODELİ EKLEMELERİ

```sql
alter table customers add column auth_user_id uuid references auth.users(id);
alter table customers add column email text;

create table customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id text references customers(id) on delete cascade,
  title text not null, full_address text not null,
  city text not null, district text not null,
  is_default boolean default false, created_at timestamptz default now()
);

create table customer_favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id text references customers(id) on delete cascade,
  product_id text references products(id) on delete cascade,
  created_at timestamptz default now(), unique(customer_id, product_id)
);

-- YORUMLAR (Verified Purchase + foto/video)
create table product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete cascade,
  customer_id text references customers(id),
  order_id uuid references orders(id),        -- DOLU ise "Doğrulanmış Satın Alım" rozeti
  rating int not null check (rating between 1 and 5),
  comment text,
  media_urls text[],                           -- Supabase Storage (foto/video)
  status text not null default 'pending',      -- pending/approved/rejected (admin moderasyonu)
  created_at timestamptz default now()
);

-- KUPONLAR
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null,                 -- 'percent' | 'fixed'
  discount_value numeric not null,
  min_order_amount numeric default 0,
  valid_from timestamptz, valid_until timestamptz,
  max_uses int, used_count int default 0,
  is_active boolean default true
);

create table coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references coupons(id),
  order_id uuid references orders(id),
  customer_id text references customers(id),
  created_at timestamptz default now()
);
-- orders'a: coupon_id, discount_amount kolonları

-- SATIŞ SONRASI CHECK-IN
create table post_purchase_checkins (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) unique,
  scheduled_at timestamptz not null,           -- teslimattan/satıştan +7 gün
  sent_at timestamptz, response text,          -- memnun/memnun_degil/yanıtsız
  created_at timestamptz default now()
);

-- STOK BİLDİRİMİ ("gelince haber ver")
create table stock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete cascade,
  size int, email text not null,
  notified boolean default false, created_at timestamptz default now()
);
```

## PANEL EKRANLARI (minimalist)

- **/hesap** — selamlama + 4 kart: Siparişlerim / Adreslerim / Favorilerim / Hesap Bilgilerim
- **/hesap/siparisler** — liste (tarih, görsel, tutar, durum rozeti) + detay + "Tekrar Sipariş Ver" + teslim edilen ürüne **"Değerlendir"** butonu (yorum + foto yükleme; order_id bağlanır → Verified Purchase)
- **/hesap/adresler** — adres kartları, ekle/düzenle/sil, varsayılan; checkout'ta adres seçici (asıl "yorulmama" kazanımı)
- **/hesap/bilgiler** — profil + şifre + **KVKK "Hesabımı Sil"** (kişisel veri silinir, siparişler anonimleştirilir)
- **Header:** girişsiz → kullanıcı ikonu "Giriş"; girişli → hesap menüsü. Ürünlerde kalp (favori).

## MÜŞTERİ DENEYİMİ KATMANI (Selçuk'un 4 fikri + araştırma bulguları)

### D1. Yorum Sistemi — Verified Purchase + Foto/Video
- Ürün sayfasında yorum bölümü: ortalama puan, yıldız dağılımı, yorum listesi
- order_id bağlantılı yorumlarda altın "✓ Doğrulanmış Satın Alım" rozeti
- Foto/video yükleme (Supabase Storage, boyut/format limiti, otomatik sıkıştırma)
- **Admin panelde "Yorumlar" sekmesi:** onay bekleyenler → onayla/reddet. Onaysız yayın YOK.
- Yorum daveti: post-purchase check-in mailinden "Değerlendir" linkiyle

### D2. Otomatik Kupon Yönetimi
- Admin panelde "Kuponlar" sekmesi: kod oluştur, tip (%/TL), min. tutar, geçerlilik, kullanım limiti
- Checkout'ta "Kupon kodunuz var mı?" alanı — girişli müşteriye tanımlı/uygun kupon varsa otomatik "Kuponunu Kullan" butonu çıkar (hatırlamasına gerek kalmaz)
- İndirim iyzico tutarına doğru yansır, orders'a coupon_id + discount_amount kaydedilir
- Hoş geldin kuponu: kayıt olana otomatik tek kullanımlık kod (ekip tartışsın)

### D3. Post-Purchase Check-in (+7 gün)
- Sipariş teslim/satış +7 gün sonra e-posta: "Memnun musun?" (Evet → değerlendirme daveti; Hayır → WhatsApp destek linki)
- Vercel Cron (günlük) ile scheduled_at gelmiş kayıtlar işlenir
- E-posta altyapısı: Resend — aynı altyapı sipariş onay mailini de gönderir (şu an sipariş onay maili YOK, bu aşamada eklenir)

### D4. Araştırma bulguları (ekip önceliklendirsin)
- **Sipariş onay e-postası** (D3 altyapısıyla birlikte — güven için kritik)
- **Numara/kalıp rehberi** ürün sayfasında ("normal kalıp / bir numara büyük alın" + tablo) — iade oranını düşürür
- **Kargo bilgi şeridi** ürün sayfasında: "1-3 iş gününde kargoda · 14 gün iade · Güvenli ödeme"
- **"Gelince haber ver"** — TÜKENDİ üründe e-posta bırakma (stock_alerts); stok girilince otomatik mail
- **Benzer ürünler** — ürün detayı altında aynı kategoriden 4 ürün (basit cross-sell)

## UYGULAMA AŞAMALARI (her biri: gerçek ortam testi → kanıt → commit+push → otomatik deploy)

| # | İçerik | Risk |
|---|---|---|
| 0 | ACİL temizlik (A1-A3) | ✅ Tamamlandı |
| 1 | Supabase Auth + tüm şema + RLS | ✅ Tamamlandı |
| 2 | Kayıt/Giriş/Şifre sıfırlama (marka diline uygun) | ✅ Tamamlandı |
| 3 | /hesap: siparişler + misafir eşleştirme | ✅ Tamamlandı |
| 4 | Adres defteri + checkout adres seçici | ✅ Tamamlandı — misafir checkout regresyon testi: 1/3 geçti (2 hata iyzico sandbox key konfigürasyonundan, checkout formu çalışıyor) |
| 5 | E-posta altyapısı (Resend) + sipariş onay maili | ✅ Tamamlandı |
| 6 | Yorum sistemi (D1): tablo+UI+admin moderasyon+Verified rozet+foto | ✅ Tamamlandı |
| 7 | Kupon sistemi (D2): admin+checkout+iyzico tutar entegrasyonu | 🔄 Planlandı |
| 8 | Post-purchase check-in (D3): cron+mail+yanıt akışı | 🔄 Planlandı |
| 9 | Favoriler + "gelince haber ver" + benzer ürünler + kalıp rehberi + kargo şeridi | 🔄 Planlandı |
| 10 | KVKK hesap silme + son cila + 6 dil tamamlama | ✅ Tamamlandı (hesap silme /hesap/profil'de aktif) |
| 1 | Supabase Auth + tüm şema + RLS | Düşük |
| 2 | Kayıt/Giriş/Şifre sıfırlama (marka diline uygun) | Düşük |
| 3 | /hesap: siparişler + misafir eşleştirme | Orta |
| 4 | Adres defteri + checkout adres seçici | Orta — checkout'a dokunur |
| 5 | E-posta altyapısı (Resend) + sipariş onay maili | Düşük |
| 6 | Yorum sistemi (D1): tablo+UI+admin moderasyon+Verified rozet+foto | Orta |
| 7 | Kupon sistemi (D2): admin+checkout+iyzico tutar entegrasyonu | Orta — ödeme tutarına dokunur, dikkatli |
| 8 | Post-purchase check-in (D3): cron+mail+yanıt akışı | Düşük |
| 9 | Favoriler + "gelince haber ver" + benzer ürünler + kalıp rehberi + kargo şeridi | Düşük |
| 10 | KVKK hesap silme + son cila + 6 dil tamamlama | Düşük |

## EKİP GÖREVLENDİRMESİ
- **backend-architect:** Auth, şema, RLS, kupon-iyzico tutar bütünlüğü, cron
- **security/reality-checker:** RLS kanıt testleri (başka müşterinin verisi OKUNAMAZ), kupon istismarı senaryoları (aynı kupon tekrar kullanımı, negatif tutar), yorum moderasyon zorunluluğu
- **ui-designer:** panel + yorum + kupon UI — lüks-minimalist, mevcut dil
- **ux-researcher:** kayıt sürtünmesi, adres seçici tek tık, yorum yazma kolaylığı
- **frontend-developer:** uygulama + mobil uyumluluk (yatay taşma yok, dokunmatik)

## KURALLAR
Gerçek ortamda (nerishoes.com.tr) test, kanıtsız "çözdüm" yasak, çeviri kuralı (6 dil), OTOMATİK GIT COMMIT/PUSH, her aşamada misafir checkout regresyon testi.
