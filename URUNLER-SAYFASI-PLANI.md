# Neri Shoes — Ürünler Sayfası İyileştirme Planı

Ekip tartışmasından (5 agent: UI Designer, UX Architect, UX Researcher, Brand Guardian, Frontend Developer, Accessibility Auditor) çıkan öneriler, uygulanacak iş planı olarak buraya derlendi.

**Kapsam:** Bu turda 1-6 (Düşük Efor) + 7-8 (Orta Efor, seçilmiş) uygulanacak. 9-10 sonraya, 11-14 (tartışmalı) şimdilik uygulanmayacak.

---

## UYGULANACAK MADDELER

### 🟢 Düşük Efor (1-6) — Tek Tur

| # | Madde | Dosya | Değişiklik |
|---|---|---|---|
| 1 | Sıralama satırı | ProductsCatalog.tsx | "Yeni / Fiyat ↑ / Fiyat ↓" filtre butonu satırı + useMemo sort() |
| 2 | sizes prop düzeltmesi | ProductCard.tsx:47 | `25vw` → `33vw` (performans hatası, lg breakpoint 3 sütun için) |
| 3 | Aktif filtre sayacı | ProductsCatalog.tsx | "X filtre aktif" küçük gösterge |
| 4 | line-clamp düzeltmesi | ProductCard.tsx:91 | `line-clamp-2` → `line-clamp-1` |
| 5 | Sold-out aria-label | ProductCard.tsx | Diyagonal şeride `aria-label={t("soldOut")}` veya sr-only span |
| 6 | WhatsApp aria-label | ProductCard.tsx | `aria-label={\`${product.name} için WhatsApp'tan Sor\`}` |

### 🟡 Orta Efor (7-8) — Seçilmiş

| # | Madde | Dosya | Değişiklik |
|---|---|---|---|
| 7 | Numara/stok önizlemesi | computeStockStatus + ProductCard.tsx | `availableSizes: ["37","38","40","42"]` hesapla, kartta küçük liste olarak göster, aria-label ile erişilebilir yap |
| 8 | Buton hiyerarşisi | ProductCard.tsx | WhatsApp (ana CTA, flex-1) + Detay (ikincil, sabit genişlik veya icon-only/soluk stil) — ayrı satırlara da bölünebilir |

---

## ŞİMDİ UYGULANMAYACAK (NOT OLARAK SAKLANACAK)

### 🟡 Orta Efor — Sonraya Bırakılan
- 9. Fiyat aralığı filtresi — ürün sayısı henüz bunu gerektirmiyor, ileride katalog büyürse değerlendirilir
- 10. aria-live="polite" grid region — erişilebilirlik iyileştirmesi, ayrı bir erişilebilirlik turunda ele alınabilir

### 🔴 Tartışmalı — Test/Karar Gerektiren
- 11. Grid 2 sütuna indirme — risk: daha az ürün görünürlüğü. Uzlaşma önerisi: 2/3 sütun toggle butonu (kullanıcı seçsin)
- 12. Kategori rozetini kaldırma — risk: filtre seçili değilken kategori bilgisi kaybolur
- 13. WhatsApp rengini marka paletine çekme — risk: tanıdıklık (affordance) kaybı, A/B test önerilir
- 14. shortDescription'ı tamamen kaldırma — risk: B2B müşteri materyal bilgisine ihtiyaç duyuyor, dönüşüm kaybı riski

---

## UYGULAMA SIRASI

1. **Tur 1:** Madde 1-6 (düşük efor, tek seferde, risk yok)
2. **Tur 2:** Madde 7 (numara/stok önizlemesi) — ayrı test gerektirir (stoklu/stoksuz/karışık senaryolar)
3. **Tur 3:** Madde 8 (buton hiyerarşisi) — görsel karar gerektirir, ekran görüntüsüyle onay alınmalı

Her tur kendi başına test edilip onaylanmadan sonraki tura geçilmeyecek (projedeki "küçük parçalara böl" prensibi).

## KALİTE KONTROL (HER TUR İÇİN)
- DEV-SERVER-SORUN-REHBERI.md'deki standart iş akışı (node process kontrolü, cache temizliği, build+dev test)
- Chrome/Playwright MCP ile gerçek test
- 6 dilde (özellikle yeni metin varsa) çeviri kontrolü
- Mevcut "OTOMATİK GIT COMMIT/PUSH" kuralına göre her tur sonunda otomatik commit+push

## SONRAKİ ADIM
Madde 11 (grid sütun sayısı) için önerilen "toggle butonu" çözümü ayrıca değerlendirilebilir — bu, hem Brand Guardian'ın (lüks algı) hem Frontend Developer'ın (içerik gösterimi) endişelerini çözen bir orta yol.
