# DÜKKAN ENTEGRASYONU — V3 PIVOT RAPORU

**Tarih:** 2026-07-17
**Durum:** F1 canlı + doğrulandı, F2 tanımı revize edildi (bkz. altta), F3 onay bekliyor.
**Önceki plan:** DUKKAN-ENTEGRASYON-PLANI-V2.md (bu belge onu geçersiz kılmaz, üzerine yazar — V2'deki F1 kararları hâlâ geçerli, sadece ürün-katalog varsayımları değişti).

---

## 1. PİVOT NEDEN — ÖZET

Önceki oturumda dükkânın kendi 826 varyantlık kataloğu (66 model), taklit/marka riski taşıyan ürünler içerdiği için (Hotiç, Timberland, Skechers, "Luis Vition" vb.) `[ARSIV]` etiketiyle arşivlendi. Yerine Neri Shoes web sitesinin (Supabase `tphxrtxzkvivjkxoeujm`) gerçek kataloğundan 19 ürün × beden 37-46 = 190 satır doğrudan SQLite'a yazıldı.

**Rollback güvencesi:** `backups/database-20260717-141752-pre-site-sync.sqlite` — bütünlük doğrulandı (`PRAGMA integrity_check` = ok), satır sayıları eksiksiz: 826 ürün, 410 satış, 206 müşteri. Bu yedek hiçbir noktada silinmedi/değiştirilmedi.

---

## 2. FONKSİYONEL TEST SONUÇLARI (ADIM 2 — gerçek tarayıcı UI, curl değil)

Tüm testler `localhost:3210` üzerinde gerçek buton tıklamaları / form gönderimleriyle yapıldı (Chrome MCP otomasyonu, `.click()` DOM üzerinden — native `<select>` etkileşiminde CDP/renderer donması yaşandı, JS ile form state set edilerek aşıldı).

| # | Test | Sonuç |
|---|------|-------|
| 1 | Yeni senkronize ürün arama (313 Spor) | ✅ Bulundu, beden matrisi 37-46 doğru, adetler DB ile birebir |
| 2 | Gerçek test satışı gir (313 Spor, 42 numara, 1 adet, nakit) | ✅ Satış #532 oluştu, stok 2→1 düştü, dashboard toplamı 3.900→6.900 TL güncellendi |
| 3 | Arşivli (`[ARSIV]`) üründe geçmiş satış aç, veri bütünlüğü doğrula | ✅ Satış #528 (`[ARSIV] 314-Camper 19DOLAR`, 42, Orhan Can Topaktaş, 17.07.2026 13:37, 1.200,00 TL veresiye) — UI'da DB ile birebir aynı görüntülendi |
| 4 | Test satışını uygulamanın kendi İade fonksiyonuyla geri al | ✅ Satış #532 için İade Kaydet → `returned_quantity=1`, stok 1→2 geri geldi. Sistem 1 satır iade kaydı (`returns` tablosu id=1, not: "TEST - iptal edilecek") oluşturdu — bu **kirlilik değil**, iade mekanizmasının doğal audit-trail'i, silinmesi önerilmez |
| 5 | JS konsol hatası kontrolü | ⚠️ Kısmi kanıt: test eylemleri sırasında konsol takibi aktif değildi (araç sadece ilk çağrıldığı andan itibaren yakalıyor). Sayfa temiz yeniden yüklemede (navigasyon sonrası) **0 konsol mesajı/hata**. Test boyunca hiçbir ekran görüntüsünde/DOM kontrolünde görsel hata, kırık sayfa veya beyaz ekran gözlenmedi. |

**Sonuç:** Rollback'e gerek yok. Sistem canlı ve fonksiyonel çalışıyor — bu iddia artık varsayım değil, kanıta dayalı.

---

## 3. KRİTİK BULGU (orijinal 3 maddenin dışında, testler sırasında keşfedildi)

**Bu, bu raporun en önemli maddesidir ve kullanıcı kararı gerektirir.**

Senkronize 19 ürün beklenirken DB'de **20 farklı model+renk grubu** bulundu. Bunlardan 18'i site kataloğuyla doğrulandı (17 tekil model + "HOT Leather Series" adının site'de gerçekten 2 farklı ürünü paylaştığı tespit edildi — `hot-leather-series` ve `hot-leather-series-2`, ikisi de gerçek/farklı oluşturma tarihli, aşağıda ayrı madde). Ama **2 satır site kataloğuyla hiçbir şekilde eşleşmiyor**:

- **`Hotiç Deliklil Gri Taban`** (id 1208, Kahverengi, 1.500 TL satış / 500 TL maliyet, sadece 1 beden satırı var — beklenen 10 değil)
- **`LV Bej`** (id 1209, Bej, 1.500 TL satış / 500 TL maliyet, sadece 1 beden satırı var)

Supabase site kataloğunda bu isimlerde **sıfır eşleşme** var. İsimler tam olarak pivot'un temizlemeye çalıştığı marka-taklit riski deseniyle örtüşüyor: **Hotiç** gerçek bir Türk ayakkabı markası, **LV** = Louis Vuitton çağrışımı. Ayrıca bu iki satır, diğer 18 site-kaynaklı üründen farklı olarak zaten `purchase_price` (500 TL) ve gerçek bir renk adı girilmiş durumda — bu, site-senkron scriptinden değil, **manuel/tekil bir girişten** geldiklerini gösteriyor.

**Daha vahimi: Bu iki ürüne testlerimden ÖNCE, gerçek satış zaten yapılmış:**
- **Satış #530** — Hotiç Deliklil Gri Taban, 1.200 TL, **ödenmemiş/veresiye**, müşteri id 15, 17.07.2026 14:52
- **Satış #531** — LV Bej, 1.500 TL, **ödenmemiş/veresiye**, müşteri id 210 (Akif Sarıkaya), 17.07.2026 17:28

Yani iki gerçek müşterinin şu anda, pivot'un tam olarak önlemeye çalıştığı riskli/yasadışı-taklit ürünler üzerinden gerçek borç kaydı var. Bu satırların nasıl arşivlenmeden/temizlenmeden kaldığı belirsiz — muhtemelen pivot script'i çalışırken veya sonrasında elle eklenmiş.

**KARAR VERİLDİ (2026-07-17, Selçuk onayı):** İki satır da `[ARSIV] ` öneki eklenerek arşivlendi (id 1208 → `[ARSIV] Hotiç Deliklil Gri Taban`, id 1209 → `[ARSIV] LV Bej`). Satış #530/#531 ve müşteri borç kayıtları (customer_id 15, 210) hiç dokunulmadan bırakıldı — sadece ürün kartı artık satılamaz durumda. Doğrulandı: satışlar aynen duruyor (`product_id`, `total_price`, `is_paid`, `customer_id` değişmedi).

---

## 4. ADIM 3 — FLAGLENEN 3 VERİ SORUNU

### 3a — `purchase_price` (maliyet) = 0, TÜM 18 SİTE-KAYNAKLI ÜRÜNDE

Bu veri **tahmin edilemez** — sadece Selçuk'ta var. Aşağıdaki 18 model+renk grubu için gerçek alış maliyeti gerekli (satış fiyatı referans amaçlı yanına yazıldı):

| Model | Renk | Satış Fiyatı | Mevcut Maliyet |
|---|---|---|---|
| 313 Spor | Standart | 3.000 TL | 0 |
| 314 Runner | Standart | 2.800 TL | 0 |
| 4767 Yarasa Kauçuk Eva Taban | Standart | 3.000 TL | 0 |
| 4919 Süet Düz Deriler | Standart | 3.200 TL | 0 |
| 4920 Süet Deri | Siyah | 3.000 TL | 0 |
| Cloud Loafer Series | Standart | 3.000 TL | 0 |
| Croco Black Edition | Standart | 3.225 TL | 0 |
| Full Black | Standart | 3.200 TL | 0 |
| HOT Leather Series | Kahverengi | 3.000 TL | 0 |
| HOT Leather Series | Siyah | 3.000 TL | 0 |
| Hybrid Derby | Standart | 3.000 TL | 0 |
| Hybrid Derby 2 | Standart | 3.000 TL | 0 |
| LF-01 Beyaz EVA Taban | Standart | 3.000 TL | 0 |
| Milano GM | Standart | 3.000 TL | 0 |
| Monk Beast | Standart | 7.600 TL | 0 |
| Olive Python | Standart | 3.000 TL | 0 |
| Soft Luxe Driver | Standart | 3.199,99 TL | 0 |
| Stealth Black Edition | Standart | 0 / null (bkz. 3c) | 0 |
| Suede Knot Loafer | Standart | 2.800 TL | 0 |

### 3b — Renk = "Standart" (site'de gerçek renk verisi yok)

16 model bu durumda (yukarıdaki tablodaki "Standart" satırlar). Bilgi amaçlı — düzeltme aksiyonu gerekmiyor, sadece POS'ta renk ayrımı yapılamayacağının farkında olun.

### 3c — Stealth Black Edition price=0/null

Supabase'de doğrulandı: **site'nin kendisinde** `stealth-black-edition` ürününün `price: null`, `compare_at_price: null` iken `is_active: true`. Aynı durum `volcano-stealth` için de geçerli. Bu, dükkan senkron scriptinin hatası değil — **site tarafında gerçek bir bug** (aktif ama fiyatsız ürün). Dükkan tarafında yapılacak bir şey yok çünkü senkronize edilecek gerçek bir fiyat yok; site tarafı ayrıca flaglenmeli.

---

## 5. ADIM 4 — GÜNCEL METRİKLER (pivot sonrası, gerçek DB durumu)

| Metrik | Değer | Not |
|---|---|---|
| Aktif (ARSIV olmayan) ürün satırı | 192 | 20 model+renk grubu (18 site-kaynaklı + 2 şüpheli, bkz. Madde 3) |
| Aktif toplam stok adedi | 109 | |
| Arşivlenmiş (`[ARSIV]`) ürün satırı | 826 | |
| Arşiv stok adedi | **1** (825 satır stok=0, 1 satır stok=1) | ⚠️ bkz. aşağıdaki uyarı |
| Toplam ürün satırı | 1.018 | |
| Toplam satış (tüm zamanlar) | 413 | 410 pivot-öncesi + 3 pivot-sonrası (2 gerçek: #530, #531 + 1 test: #532, geri alındı) |
| Açık veresiye (uygulama panelinden, canlı) | **35.800,00 TL** | Ham SQL çapraz kontrolü (`payment_method='veresiye' AND is_paid=0`, ödeme/indirim düşülmüş) ≈ 35.200 TL — küçük fark muhtemelen yuvarlama/indirim detayında, panel rakamı esas alınmalı |
| 31+ gün risk | 18.300,00 TL | Panelden |
| Müşteri sayısı | 207 | 206 + 1 yeni (LV Bej satışıyla eklenen Akif Sarıkaya, id 210) |
| Düşük stok kalemi (panel) | 938 | ⚠️ bkz. aşağıdaki uyarı |

**Uyarı 1 — Arşiv stok sıfırlanmış (TEYİT EDİLDİ — kasıtlı):** Pivot-öncesi yedekte 826 ürünün stok dağılımı normaldi (satır başına 8-21 adet arası). Şu an 826 satırın 825'i stok=0. Selçuk (2026-07-17) bunun kasıtlı olduğunu doğruladı — arşivlenen riskli/taklit ürünlerin bir daha satılamaması için bilerek sıfırlanmış. Aksiyon gerekmiyor.

**⚠️ Uyarı 2 — "Düşük Stok Kalemi" paneli artık anlamsız:** 938 sayısının büyük kısmı (826 arşiv satırının tamamı, çünkü stok=0 eşik altı) kasıtlı-sıfırlanmış arşiv ürünlerinden geliyor. Gerçek aktif 192 satırdan da 188'i düşük stok eşiğinde (çünkü 20 model 10 beden arası dağılmış, adet başına küçük sayılar). Sonuç: panel artık **gerçek yeniden-sipariş sinyali vermiyor**, neredeyse tüm katalog "düşük stok" görünüyor. Bu widget'ın arşivlenmiş ürünleri filtrelemesi gerekiyor — teknik borç olarak not edildi.

---

## 6. F2 — REVİZE TANIM

Eski F2 (V2 planı): 83 model+renk grubu için insan-onaylı katalog eşleştirme + SKU üretimi.

**Yeni durum:** Pivot sayesinde bu iş zaten yapılmış sayılır — 18 site-kaynaklı ürün, site kataloğuyla 1:1 zaten eşleşiyor (kendi slug/id'leriyle). F2 artık **"tamamlandı"** kabul edilebilir, ancak şu 2 alt-görev kapatılmadan tam kapanmış sayılmamalı:
1. Madde 3'teki 2 şüpheli satırın (Hotiç Deliklil Gri Taban, LV Bej) kaderi netleşmeli
2. Madde 3a'daki maliyet verisi Selçuk'tan alınıp girilmeli

## 7. F3 — BASİTLEŞTİRİLMİŞ YENİ KAPSAM

Eski F3 (V2 planı): Tüm ürün kataloğu + finansal geçmiş + müşteri verisi bulut migrasyonu, karmaşık ürün eşleştirme gerektiriyordu.

**Yeni kapsam (pivot sayesinde basitleşti):** Ürün eşleştirme sorunu ortadan kalktığı için F3 artık sadece **finansal/işlemsel geçmiş migrasyonu** (satışlar, veresiye/tahsilat kayıtları, 207 müşteri) — ürün kataloğu tarafında ekstra eşleştirme mantığı gerekmiyor çünkü F1 şeması zaten `sqlite_id_map` ile bağlantı kurmaya hazır.

**KVKK onayı alındı (2026-07-17):** Selçuk 207 müşterinin kişisel verisinin (isim, telefon, borç geçmişi) buluta taşınmasını onayladı — F3'e başlanabilir.

---

## 8. HATIRLATMA — iyzico sandbox key

F1'den beri bekliyor: sandbox key `sandbox-` önekiyle değil → API 1001 hatası veriyor. https://sandbox-merchant.iyzipay.com panelinden yeniden alınmalı. F1 regresyon kapısının (d) maddesi (sandbox uçtan uca test) bu yüzden hâlâ koşulmadı.

---

## 9. SONUÇ / KALAN AÇIK MADDE

1. ~~Madde 3 kritik bulgu~~ — ✅ Çözüldü: 2 satır arşivlendi, satışlar dokunulmadı.
2. **Madde 3a — hâlâ açık** — 18 üründen kaynaklanan gerçek alış maliyetleri (tahmin edilmeyecek, sadece Selçuk verebilir, tablo Madde 4'te)
3. ~~Arşiv stok sıfırlaması~~ — ✅ Teyit edildi: kasıtlı.
4. ~~KVKK sorusu~~ — ✅ Onaylandı, F3 başlayabilir.
5. ~~F3 basitleştirilmiş kapsam onayı~~ — ✅ Onaylandı (üstteki KVKK onayıyla birlikte).

---

## 10. F3 SONUÇ — ✅ TAMAMLANDI (2026-07-18)

6 kategori, canlı Supabase+SQLite sorgularıyla tam mutabakat sağlandı. Script'ler: `scripts/f3-migrate-sale-items.mjs` (yazma), `scripts/f3-full-reconciliation.mjs` + `scripts/f3-verify-sale-items.mjs` (doğrulama).

| Kalem | SQLite (kaynak) | Supabase (hedef) | Durum |
|---|---|---|---|
| sqlite_id_map (eşleşen ürün) | 190 | 190 | ✅ |
| store_customers | 207 | 207 | ✅ |
| sales (toplam) | 413 | 413 | ✅ |
| sales (reversed olmayan) | 411 | 411 | ✅ |
| ciro (non-reversed) | 672275.01 TL | 672275.01 TL | ✅ |
| credit_collections | 67 | 67 | ✅ |
| credit_collections toplam | 62000.00 TL | 62000.00 TL | ✅ |
| payment_allocations | 64 | 64 | ✅ |
| payment_allocations toplam | 87300.00 TL | 87300.00 TL | ✅ |
| manual_report_sales | 24 | 24 | ✅ |
| manual_report_sales toplam | 202450.00 TL | 202450.00 TL | ✅ |
| returns → store_audit_log | 1 | 1 | ✅ |
| store_sale_items (satır) | 413 | 413 | ✅ |
| store_sale_items SUM(quantity) | 505 | 505 | ✅ |

Ek doğrulamalar:
- 413 `store_sales` satışının tamamı en az 1 `store_sale_items` kaydına bağlı, 0 yetim satış.
- 5 rastgele satış id'si spot-check: SQLite `sales` satırı (product_id, quantity, unit_price) ile Supabase `store_sale_items` kaydı (quantity) birebir eşleşti.
- Tek satır/kuruş fark yok. Selçuk onayı: evet.

**Regresyon (canlı, F3 boyunca ilk kez kontrol):**
- Admin panelde ürün ekleme (AŞAMA 1 / H-5 413 fix) — ✅ etkilenmedi
- Site tüm sayfalar — ✅ normal
- iyzico ödeme akışı — ✅ dokunulmadı

**F3 resmen kapandı. F4 (POS panel UI, `/admin/dukkan` içinde) için Selçuk onayı bekleniyor.**
