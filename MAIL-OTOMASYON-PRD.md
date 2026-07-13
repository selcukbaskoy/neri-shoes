# Neri Shoes — E-Posta Otomasyon PRD (Davranışsal Mail Akışları)

Amaç: Tamamen otomatik, ikna edici, spam'a düşmeyen, KVKK uyumlu davranışsal e-posta sistemi. Mevcut altyapı (Resend + Vercel Cron + Supabase + kupon + moderasyonlu yorum sistemi) ÜZERİNE inşa edilir — sıfırdan kurulum yok.

---

## MİMARİ KARARLAR (değerlendirme sonucu — gerekçeli)

| Konu | Karar | Reddedilen alternatif + neden |
|---|---|---|
| E-posta servisi | **Resend** (zaten kurulu, sipariş onayı çalışıyor) | cPanel SMTP → spam garantisi. Amazon SES + dedicated IP → düşük hacimde IP ısıtılamaz, ters teper |
| Kuyruk | **Supabase `email_queue` tablosu + Vercel Cron** (post-purchase check-in zaten bu modelde) | Redis/BullMQ → Vercel serverless'ta ekstra maliyet + karmaşıklık, bu hacimde gereksiz |
| Gönderici ayrımı | 2 kimlik: `siparis@nerishoes.com.tr` (transactional — mevcut) + `firsat@nerishoes.com.tr` (promotional) | 3+ adres → bu ölçekte gereksiz yönetim yükü |
| İtibar/iletilebilirlik | Resend domain doğrulama: **SPF + DKIM + DMARC** DNS kayıtları (Selçuk ekleyecek) | — |
| Sır yönetimi | Vercel Environment Variables (şifreli) | Vault/Secrets Manager → aşırı |
| Şablonlar | Kod içi React Email şablonları (600px, mobil, dark-mode uyumlu, büyük görsel odaklı) | AMP for Email → destek çok az, gereksiz |

## KVKK / GÜVEN TEMELİ (pazarlık edilemez)
1. **Double opt-in:** Kayıt sonrası "E-postanı onayla, %15 hoş geldin kodun aktifleşsin" — onaysız adrese promosyon GİTMEZ (transactional gider).
2. **Her promosyon mailinde:** "Abonelikten çık" + "Tercihlerimi yönet" linki. `unsubscribe_logs` tablosuna tarih damgalı kayıt (KVKK kanıtı).
3. **Frequency capping:** Kullanıcı başına günde en fazla 1 promosyon maili (transactional muaf). Kuyruk gönderim anında kontrol eder.
4. **Sunset policy:** 120 gün hiçbir maili açmayan kullanıcıya "son şans" maili → yine açmazsa promosyon listesinden otomatik çıkarma (iletilebilirliği korur).
5. **Bounce/complaint handling:** Resend webhook'ları → hard bounce veya spam şikayeti alan adrese bir daha gönderim YOK (`email_events` tablosu).

## VERİ MODELİ (eklenecek tablolar)
- `email_queue`: id, user/customer ref, flow_type, template_key, scheduled_at, status (pending/sent/cancelled/failed), cancel_key (örn. sepet-terk için cart hash), payload jsonb
- `email_events`: Resend webhook olayları — delivered / opened / clicked / bounced / complained / unsubscribed
- `unsubscribe_logs`: KVKK kanıt kaydı
- `user_email_preferences`: promosyon izni (opt-in durumu), son açma tarihi
- `product_affinity`: basit manuel eşleştirme matrisi v1 (kategori→tamamlayıcı kategori: klasik→kemer/deri bakım, spor→çorap/bakım sprey)
- Her mail linkinde **UTM**: `utm_source=email&utm_medium=[flow]&utm_campaign=[template_key]`

## AKIŞLAR (revize zamanlamalar — erkek ayakkabı perakendesine göre)

### Akış 1 — Hoş Geldin (tetik: kayıt)
- **0. dk:** Onay maili: "E-postanı onayla → %15 hoş geldin kodun aktifleşsin (24 saat geçerli)" + Beden/Kalıp Rehberi linki (önce değer, sonra satış)
- **+20 saat** (kod kullanılmadıysa): "Kodunun süresi doluyor" — tek hatırlatma. 48 değil 24 saat: erkek müşteri hızlı karar verir.
- Kupon: mevcut coupons sistemi ile tek kullanımlık dinamik kod.

### Akış 2 — Sepet Terk (tetik: sepete ürün +1 saat işlem yok; satın alma olursa kuyruk cancel_key ile ANINDA iptal)
- **+1 saat:** "Sepetin güvenle saklandı" — satış baskısı yok, yardımcı ton. Ödeme adımında mı kaldı bilgisi varsa "sorun mu yaşadın?" varyantı.
- **+24 saat:** Gerçek stok verisiyle FOMO: "Seçtiğin numarada son 2 adet" (product_stock'tan canlı).
- **+72 saat:** **Kargo bedava kodu** — indirim DEĞİL. Gerekçe: "beklersen indirim gelir" koşullandırması yaratmamak; erkek müşteride bedava kargo indirimden daha ikna edici.

### Akış 3 — Satın Alma Sonrası Değerlendirme (tetik: sipariş durumu "Teslim Edildi")
- Kategori bazlı süre: **spor/günlük +5 gün, klasik/bot +10 gün** (deri ayakkabı 1 günde değerlendirilemez).
- "Fotoğraflı değerlendir, %10 kupon kazan" → kupon, yorum **admin moderasyonundan geçtikten sonra** otomatik tanımlanır (mevcut yorum onay sistemi = fraud koruması).

### Akış 4 — Çapraz Satış (tetik: teslim +7 gün) — **AKSESUAR KAPISI**
- **Kapı kuralı:** Gönderim anında sistem kontrol eder: `aksesuar kategorisinde is_active=true ürün var mı?` **YOKSA mail atlanır (sessiz geçer), kuyruk hata vermez.** Selçuk aksesuar eklediği an akış kendiliğinden devreye girer — kod değişikliği gerekmez.
- İçerik: product_affinity matrisinden satın alınan kategoriye uygun tamamlayıcılar ("Oxford'una uyumlu kemerler").
- Sipariş onay mailine şimdiden hazır alan: aksesuar varsa "bakım setini ekle" bloğu görünür, yoksa görünmez (aynı kapı).

### Akış 5 — Geri Kazanım (tetik: son siparişten geçen süre; 90/180 değil — çok geç)
- **+30 gün:** Soft: "Siparişin nasıl gitti? Yeni sezona göz at" (satış baskısız)
- **+60 gün:** "Favorindeki/baktığın ürünün fiyatı düştü" (varsa gerçek veri; yoksa yeni sezon)
- **+90 gün:** Kişiye özel %15-20 kod
- **+120 gün:** Sunset son şans → açmazsa promosyon listesinden çıkar
- Not (v2): kategori bazlı frekans (spor alıcısına 30 gün mantıklı, klasik alıcısına 60'tan başla) — v1'de tek zamanlama, veri birikince ayrıştır.

## ŞABLON STANDARTLARI
600px, mobil öncelikli, dark-mode uyumlu (logo şeffaf PNG), tek büyük ürün görseli + tek net CTA, marka dili (siyah/altın, sade), "tek tıkla tamamla" kolaylık vurgusu. Türkçe (satış TR odaklı; çok dilli mail v2).

## UYGULAMA AŞAMALARI (her biri: gerçek ortam testi → kanıt → commit+push → otomatik deploy)
| # | İçerik | Not |
|---|---|---|
| 1 | Resend domain doğrulama: SPF/DKIM/DMARC DNS kayıtları + firsat@ gönderici | Selçuk DNS'e kayıt ekler (net talimat verilecek) |
| 2 | Şema: email_queue, email_events, unsubscribe_logs, user_email_preferences, product_affinity + RLS | Migration SQL hazırlanır, Selçuk onaylar |
| 3 | Kuyruk motoru: Vercel Cron (5 dk'da bir) → scheduled_at gelmiş pending mailleri işle; cancel mantığı; frequency cap; bounce/complaint kontrolü | Mevcut check-in cron'u genişletilir |
| 4 | Resend webhook endpoint → email_events | İmza doğrulamalı |
| 5 | Akış 1 (Welcome + double opt-in) | En yüksek getiri, önce bu |
| 6 | Akış 2 (Sepet terk + iptal mantığı) | İkinci en yüksek getiri |
| 7 | Akış 3 (Review) + kupon-moderasyon bağlantısı | Mevcut yorum sistemine bağlanır |
| 8 | Akış 4 (Cross-sell + AKSESUAR KAPISI) + Akış 5 (Win-back) | Kapı testi: aksesuar yokken mail GİTMEDİĞİ kanıtlanır |
| 9 | Tercih yönetimi sayfası (/hesap/eposta-tercihleri) + unsubscribe sayfası + sunset cron | KVKK tamamlanır |

## TEST KRİTERLERİ
- Gerçek test adresine her akıştan gerçek mail (spam'a düşmediği Gmail/Outlook'ta kanıtlanır)
- Sepet terk iptali: sepete ekle → satın al → kuyrukta cancelled kanıtı
- Aksesuar kapısı: aksesuar yokken cross-sell atlanır; test aksesuar ürünü eklenince gönderilir → kanıt sonrası test ürünü kaldırılır
- Frequency cap: aynı kullanıcıya aynı gün 2. promosyonun ertelendiği kanıtı
- Regresyon: sipariş onay maili + ödeme akışı bozulmaz

## SELÇUK'UN YAPACAKLARI
1. ~~Resend panelinde domain doğrulama başlat → verilecek SPF/DKIM/DMARC kayıtlarını cPanel DNS Zone Editor'e ekle~~ ✅ TAMAMLANDI (2026-07-12)
2. Migration SQL'lerini onayla (Run'a bas)
3. Test maillerini kendi kutunda doğrula (spam'da mı, tasarım nasıl)

---

## AŞAMA 1 TAMAMLANDI — 2026-07-12

**Resend Domain Doğrulama + DNS Kurulumu**

| Kayıt | Ad | Durum |
|---|---|---|
| DKIM | resend._domainkey.nerishoes.com.tr | verified ✅ |
| SPF MX | send.nerishoes.com.tr | verified ✅ |
| SPF TXT | send.nerishoes.com.tr | verified ✅ |
| DMARC | _dmarc.nerishoes.com.tr | eklendi ✅ |

- Resend domain ID: `927bac00-7f94-4caa-a4bb-9fb4b49bff98` — status: **verified**
- Gönderici kimlikler: `siparis@nerishoes.com.tr` (transactional) + `firsat@nerishoes.com.tr` (promotional)
- Test maili `firsat@nerishoes.com.tr` → `selcukbaskoy@gmail.com` gönderildi (Resend ID: `a30e045c-ca7a-4d78-b31d-8a378a07a175`)
- `src/lib/email.ts` güncellendi: `getPromotionalFrom()` export edildi
- `.env.local` güncellendi: `FROM_EMAIL` + `PROMOTIONAL_FROM_EMAIL` eklendi
- **Vercel'e de eklenmesi gereken env vars:** `FROM_EMAIL=siparis@nerishoes.com.tr` + `PROMOTIONAL_FROM_EMAIL=firsat@nerishoes.com.tr`

## AŞAMA 2-5 TAMAMLANDI

- Şema: `email_queue`, `email_events`, `unsubscribe_logs`, `user_email_preferences`, `product_affinity` tabloları Supabase'de doğrulandı (mevcut).
- Kuyruk motoru: `src/app/api/email-queue/process/route.ts` — `dispatchTemplate` + `isBlacklisted` + `hasHitDailyPromoCap` + `isPromotional` guard'ları çalışıyor.
- Resend webhook: `src/app/api/webhooks/iyzico/route.ts` içinde imza doğrulamalı (Svix formatı).
- Akış 1 (Welcome + double opt-in + %15 kupon) commit b3023da.

## AŞAMA 6 TAMAMLANDI — 2026-07-13

**Sepet Terk Akışı**
- `src/app/api/email/cart-abandon/route.ts` — checkout ödeme adımına geçildiğinde tetiklenir, önce eski `cart_abandon_{email}` kaydını iptal eder, sonra +1s/+24s/+72s kuyruğa yazar.
- `src/lib/email-templates.ts` — `cart_1h` (yardımcı ton), `cart_24h` (canlı stok verisiyle FOMO), `cart_72h` (ücretsiz kargo kuponu, `coupons` tablosuna otomatik insert) şablonları eklendi.
- `src/components/CheckoutContent.tsx` — ödeme adımına geçişte fire&forget fetch eklendi.
- `src/app/api/webhooks/iyzico/route.ts` — sipariş `paid` olunca `cart_abandon_{email}` kuyruğu ANINDA iptal ediliyor (PRD'nin "satın alma olursa iptal" kuralı).
- Doğrulama: `npx tsc --noEmit` temiz, `npx next build` başarılı, `shopping-flow.spec.ts` E2E testi geçti (regresyon yok), backend curl testiyle `email_queue`'ya 3 satır (cart_1h/24h/72h, doğru `cancel_key`) yazıldığı doğrulandı, test satırları temizlendi.
- Düzeltilen buglar: `CheckoutContent.tsx`'de yanlış alan adları (`it.name`→`it.productName`, `it.price`→`it.unitPrice`, tsc hatası veriyordu); `coupons_discount_value_check` (>0) constraint'i `discount_value: 0` ile ihlal ediliyordu → `1` yapıldı; webhook'ta cart_abandon iptali eksikti → eklendi.

## AŞAMA 7 TAMAMLANDI — 2026-07-13

**Review Akışı — mimari karar: mevcut check-in sistemi genişletildi (PRD'nin literal `review_5d`/`review_10d` kuyruk akışı yerine)**

Sebep: `post_purchase_checkins` tablosu + `src/app/api/checkins/process/route.ts` cron'u zaten çalışıyordu (direkt Resend ile "memnun musun?" maili gönderiyor). PRD'nin ayrı bir `review_5d`/`review_10d` kuyruk akışı kurmak, "delivered" sipariş durumu gibi henüz var olmayan bir tetikleyici mekanizması gerektirirdi. Kullanıcı onayıyla mevcut sistem genişletildi.

- `src/app/api/webhooks/iyzico/route.ts` — check-in zamanlaması artık kategori bazlı: `spor`/`gunluk` kategorisi +5 gün, diğerleri (varsayılan, klasik/deri) +10 gün. Önceden sabit +7 gündü.
- `src/app/api/admin/reviews/route.ts` — `issueReviewCoupon()` eklendi: fotoğraflı yorum admin tarafından onaylandığında (tek seferlik, `coupon_issued` bayrağıyla korunuyor) otomatik %10 tek kullanımlık kupon (`YORUM10-XXXXXX`) oluşturur ve `review_coupon_awarded` mailini kuyruğa yazar.
- `src/lib/email-templates.ts` — `review_5d`/`review_10d` stub case'leri kaldırıldı, yerine `review_coupon_awarded` şablonu + dispatcher case eklendi (marka temalı, kupon kodu gösterir, alışverişe git CTA).
- **Keşfedilen 2 mevcut production bug (bu oturumda bulundu, bu değişiklikle düzeltiliyor):**
  1. `product_reviews.admin_note` kolonu kodda kullanılıyordu ama DB'de yoktu → admin moderasyon paneli PUT endpoint'i kırıktı.
  2. `post_purchase_checkins.response`/`.review_invited` kolonları `checkins/respond` route'unda kullanılıyordu ama DB'de yoktu → "memnun musun?" yanıt linkleri kırıktı.
- **Migration hazır, ÇALIŞTIRILMADI:** `migrations/2026-07-13_asama7_review_akisi.sql` — 4 tane `add column if not exists` (destructive değil). Supabase SQL Editor'de manuel çalıştırılması gerekiyor (kural: migration SQL'i ben hazırlarım, Run'a kullanıcı basar).
- Doğrulama: `npx tsc --noEmit` temiz, `npx next build` başarılı, `shopping-flow.spec.ts` E2E regresyon testi geçti. Migration çalıştırılmadığı için uçtan uca DB testi (kupon/mail kuyruğu oluşumu) henüz yapılamadı — migration sonrası yapılacak.

**Sıradaki:** Aşama 8 (Cross-sell aksesuar kapısı + Win-back), Aşama 9 (tercih yönetimi sayfası + unsubscribe + sunset cron).
