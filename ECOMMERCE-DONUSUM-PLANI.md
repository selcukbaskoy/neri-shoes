# Neri Shoes — E-Ticaret Dönüşüm Planı

Site şu ana kadar "tanıtım + WhatsApp'tan sipariş" mantığıyla çalışıyordu. Bu doküman, bireysel (perakende) müşteriler için **gerçek online satış** (sepet, stok, ödeme) altyapısına geçişi planlar. Toptan ve WhatsApp kanalı KALKMAYACAK, ikisi birlikte çalışacak.

---

## HEDEF

- Türkiye pazarı (dil desteğine gerek yok — sadece TR)
- Müşteri: ürün detayında numara (37, 38, 39...) seçer, sepete ekler, online kart ile öder
- Aynı ürün sayfasında WhatsApp'tan sipariş seçeneği DE kalır (müşteri tercih eder)
- Stok numara bazında takip edilir (örn: 40 numara 3 adet, 41 numara 0 adet — tükenmiş)
- Fiyat üstü çizili + indirimli fiyat ile satış baskısı (örn: ~~3000 TL~~ **1800 TL** — %40 indirim)
- Ödeme: iyzico

---

## MİMARİ KARARLAR

### 1. Veri Modeli Değişiklikleri (Supabase)

**products tablosuna eklenecek alanlar:**
```sql
alter table products add column price numeric(10,2);
alter table products add column compare_at_price numeric(10,2); -- üstü çizili eski fiyat
alter table products add column discount_percentage int; -- otomatik hesaplanabilir veya manuel
```

**Yeni tablo — stok (numara bazında):**
```sql
create table product_stock (
  id text primary key default gen_random_uuid()::text,
  product_id text references products(id) on delete cascade,
  size int not null, -- 37, 38, 39...
  quantity int not null default 0,
  created_at timestamp with time zone default now(),
  unique(product_id, size)
);
```

**Yeni tablo — siparişler:**
```sql
create table orders (
  id text primary key default gen_random_uuid()::text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address text not null,
  shipping_city text not null,
  total_amount numeric(10,2) not null,
  status text default 'pending', -- pending, paid, shipped, delivered, cancelled
  payment_provider text default 'iyzico',
  payment_reference text, -- iyzico'dan dönen transaction id
  created_at timestamp with time zone default now()
);

create table order_items (
  id text primary key default gen_random_uuid()::text,
  order_id text references orders(id) on delete cascade,
  product_id text references products(id),
  product_name text not null, -- sipariş anındaki adı (ürün sonra değişse bile kayıt bozulmasın)
  size int not null,
  quantity int not null,
  unit_price numeric(10,2) not null
);
```

**Müşteri kayıtları (opsiyonel, ileride hesap sistemi için temel):**
```sql
create table customers (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  phone text not null unique,
  email text,
  created_at timestamp with time zone default now()
);
```
Başlangıçta "misafir checkout" (üye olmadan sipariş) yeterli olabilir — müşteri kaydı, sipariş sırasında otomatik oluşturulur (telefon numarasına göre eşleştirilir). Üyelik/giriş sistemi bu aşamada ZORUNLU değil, ileride eklenebilir.

### 2. Frontend Mimarisi

**Sepet (Cart):**
- React Context veya Zustand ile client-side sepet state'i (sayfa yenilenince kaybolmaması için localStorage'a yedeklenir — ARTIFACT KISITLAMASI BURADA GEÇERLİ DEĞİL, bu gerçek bir Next.js sitesi, localStorage burada kullanılabilir)
- Sepet ikonu header'da (mevcut WhatsApp ikonunun yanına), içinde ürün sayısı rozeti
- Sepet sayfası: ürün listesi, numara, adet, toplam fiyat, "Ödemeye Geç" butonu

**Ürün Detay Sayfası Güncellemesi:**
- Numara seçici (37-46 arası, stok sıfır olan numaralar "Tükendi" şeklinde devre dışı görünür)
- Fiyat gösterimi: ~~3000 TL~~ **1800 TL** (%40 İndirim rozeti)
- "Sepete Ekle" butonu (birincil CTA, ProductCard ve detay sayfasında)
- "WhatsApp'tan Sor" butonu KALIR (ikincil seçenek, mevcut tasarım korunur)

**Checkout Akışı:**
1. Sepet sayfası → "Ödemeye Geç"
2. Teslimat bilgileri formu (ad, telefon, adres, şehir) — KVKK onay checkbox'ı (mevcut gizlilik politikası sayfasına link)
3. iyzico ödeme formu/yönlendirmesi
4. Ödeme başarılı → sipariş onay sayfası + customer/orders tablosuna kayıt
5. Stok otomatik düşürülür (product_stock.quantity -1)

**Admin Panel Eklentileri:**
- "Stok Yönetimi" sekmesi: her ürün için numara bazında stok girişi/güncelleme
- "Siparişler" sekmesi: gelen siparişleri listele, durum güncelle (hazırlanıyor/kargoya verildi/teslim edildi)
- Fiyat alanları ürün ekleme/düzenleme formuna eklenir (normal fiyat + indirimli fiyat)

### 3. Emil Kowalski Skill'i — Hangi Alanlarda Kullanılacak

- Sepete ekleme animasyonu (ürün kartından sepet ikonuna doğru "uçan" mikro-animasyon veya basit ama tatmin edici bir onay efekti)
- Numara seçici butonlarının hover/seçili durumu geçişleri
- Sepet sayısı rozetinin güncellenme animasyonu (sayı değişince küçük bir "pop")
- Checkout formundaki adım geçişleri (varsa multi-step ise)
- Tüm yeni etkileşimlerde: kısa süre (200ms civarı), useReducedMotion() desteği, doğal easing — mevcut standarda sadık kalınacak

### 4. iyzico Entegrasyonu

- iyzico'nun resmi Node.js SDK'sı (`iyzipay`) kullanılacak
- Test ortamı (sandbox) önce kurulacak, gerçek API anahtarları olmadan geliştirme yapılacak
- Ödeme formu: iyzico'nun "Checkout Form" (hosted, PCI-DSS uyumluluğu iyzico'da kalır, kart bilgisi bizim sunucumuza hiç dokunmaz) entegrasyonu kullanılacak — bu en güvenli ve en az sorumluluk gerektiren yöntem
- Webhook: iyzico ödeme sonucunu bize bildirdiğinde (callback URL), sipariş durumu güncellenir ve stok düşürülür

---

## KRİTİK KISITLAMA — MEVCUT YAPI KORUNACAK

Bu e-ticaret dönüşümü, mevcut sitenin ÜZERİNE eklenecek, var olan hiçbir şeyi BOZMAYACAK veya YERİNE GEÇMEYECEK:

- Mevcut 6 dilli ürün/blog sayfaları, tasarım dili (Bodoni Moda, gold tonlama, card gradient, badge stili) AYNEN kalacak
- Mevcut admin panel (ürün/blog yönetimi) bozulmayacak, sadece YENİ sekmeler (Stok, Siparişler) eklenecek
- Mevcut WhatsApp sipariş butonları, linkleri, akışı DOKUNULMAYACAK — "Sepete Ekle" bu butonun YANINA eklenecek, yerine geçmeyecek
- Mevcut Supabase tabloları (products, blog_posts, admin_login_attempts vb.) değiştirilmeyecek, sadece YENİ tablolar (product_stock, orders, order_items, customers) eklenecek ve products tablosuna YENİ kolonlar (price, compare_at_price, discount_percentage) eklenecek — mevcut kolonlar silinmeyecek/değiştirilmeyecek
- Mevcut çeviri pipeline'ı (translate.ts) bozulmayacak — yeni e-ticaret arayüzü (sepet, checkout) dil desteği gerektirmediği için bu pipeline'a dokunulmasına gerek yok, ama YANLIŞLIKLA bozulmamalı
- Mevcut routing yapısı ([locale] segmenti, next-intl middleware) değişmeyecek — sepet/checkout sayfaları [locale] DIŞINDA (admin paneli gibi, sadece Türkçe) yeni bir route grubu olarak eklenebilir VEYA [locale] içinde ama sadece TR içerik gösterecek şekilde eklenebilir, bu kararı Claude Code verecek ama her iki durumda da mevcut yapı bozulmamalı
- Her aşamada, değişiklik öncesi mevcut sitenin (ana sayfa, ürünler, blog, admin) ÇALIŞIR durumda olduğunu, değişiklik sonrası da AYNI ŞEKİLDE çalışır durumda kaldığını doğrulamak ZORUNLU



### Aşama 1 — Veri Modeli
Supabase'de yeni tabloları oluştur (products güncelleme, product_stock, orders, order_items, customers).

### Aşama 2 — Admin Panel: Fiyat ve Stok Yönetimi
Admin panelde ürünlere fiyat (+ indirimli fiyat) ve numara bazında stok girme imkanı eklenir. Bu aşamada henüz müşteri tarafında satış YOK, sadece veri girişi test edilir.

### Aşama 3 — Ürün Sayfasında Fiyat/Stok Gösterimi
Ürün detay sayfasında fiyat (üstü çizili + indirimli), numara seçici, stok durumu gösterilir. Henüz "Sepete Ekle" çalışmaz, sadece görsel.

### Aşama 4 — Sepet Sistemi (Frontend)
Sepete ekleme, sepet sayfası, miktar/numara değiştirme, toplam hesaplama. Henüz ödeme YOK.

### Aşama 5 — iyzico Sandbox Entegrasyonu
Test ortamında ödeme akışı kurulur, sahte kartlarla test edilir.

### Aşama 6 — Checkout + Sipariş Kaydı
Teslimat formu, ödeme sonrası sipariş/order_items kaydı, stok düşürme, admin panelde siparişlerin görünmesi.

### Aşama 7 — Gerçek (Production) iyzico Anahtarları
İyzico'dan gerçek mağaza onayı alındıktan sonra (bu adım Claude Code'un yapamayacağı, kullanıcının kendisinin iyzico'ya başvurup onay alması gereken bir adımdır) canlı anahtarlar devreye girer.

---

## ÖNEMLİ NOTLAR

- Her aşama kendi başına test edilip doğrulanmadan sonraki aşamaya geçilmeyecek (önceki deneyimlerimizde gördüğümüz gibi, büyük adımları tek seferde atmak hataya yol açıyor)
- iyzico'ya gerçek başvuru (şirket belgeleri, IBAN, sözleşme) kullanıcının kendisinin yapması gereken bir iştir — Claude Code sadece KOD entegrasyonunu yapar
- WhatsApp sipariş seçeneği hiçbir aşamada kaldırılmayacak, online ödeme EK bir seçenek olarak gelecek
- Dil desteği bu yeni e-ticaret katmanında YOK — tüm checkout/sepet/sipariş arayüzü sadece Türkçe olacak (mevcut 6 dilli ürün/blog sayfaları etkilenmez, onlar kalır)
- DEV-SERVER-SORUN-REHBERI.md ve diğer kalıcı kurallar (onay istemeden ilerleme, küçük parçalara bölme, gerçek tarayıcı testi) bu süreçte de geçerli
