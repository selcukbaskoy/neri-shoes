# Neri Shoes — Mobil Uyumluluk & Eksikler İş Planı

Bu dosya, canlı sitede (www.nerishoes.com.tr) tespit edilen mobil deneyim eksikleri ve diğer düzeltmeleri içerir. Her madde ayrı bir görev olarak, gerçek ortamda test edilerek çözülecek ve çözüldükçe Vercel'e otomatik deploy edilecek.

**Çalışma prensibi:** Mobil uyumluluk için özel bir ekip (mobile-first perspektifi) kurulacak. Her görev tamamlandığında gerçek ortamda (mobil viewport ile) test edilecek, doğrulanınca commit+push (otomatik Vercel deploy). Ekip yeni mobil eksik tespit ederse, bu dosyaya otomatik eklenecek — loop şeklinde sırayla çözülecek.

---

## KATEGORİ 1: MOBİL LAYOUT / KAYMA SORUNLARI (öncelikli)

### ✅ M1. Yatay kayma (horizontal scroll) sorunu — TAMAMLANDI (commit 6df887a)
Kök neden: Footer iyzico logosu (82px) viewport'u taşıyor + html/body'de overflow-x güvencesi yoktu.
- globals.css: html,body için overflow-x:hidden eklendi
- Footer.tsx: ödeme logoları flex-wrap + justify-center eklendi

### ✅ M2. Hero strip buton üzerine binme — TAMAMLANDI (commit b304f7a)
Kök neden: Strip (absolute bottom-20) DOM'da sonra geldiğinden Framer Motion transform stacking ile butonu örtüyordu.
- HomeContent.tsx: strip wrapper'a z-[1] eklendi (buton z-10 üzerinde kalıyor)

### ✅ M3. Dil seçici dropdown mobilde sola kayıyor — TAMAMLANDI (commit d8aeb95)
Kök neden: LanguageSwitcher dropdown right-0 ile açılıyor; hamburger menüde (sol tarafta) sol ekran dışına taşıyor.
- LanguageSwitcher.tsx: side prop (left|right, varsayılan right) eklendi
- Header.tsx: mobil menüde `<LanguageSwitcher side="left" />` ile çağrıldı

---

## KATEGORİ 2: MOBİL ETKİLEŞİM EKSİKLERİ

### ✅ M4. Ürün detay zoom — TAMAMLANDI (commit 6c1da05)
Tap → lightbox zaten çalışıyordu (mobil zoom karşılığı). Ayrıca M5 ile birlikte dokunmatik swipe eklendi.

### ✅ M5. Ürün görselleri swipe — TAMAMLANDI (commit 6c1da05)
- ProductDetailContent.tsx: ana görsel + lightbox için touch swipe desteği eklendi
- Sola/sağa kaydırma ile görsel değişiyor, swipe/tap ayırt ediliyor (lightbox yanlış kapanmıyor)

---

## KATEGORİ 3: İÇERİK DÜZELTMELERİ

### ✅ C1. "Biz Kimiz?" / Hakkımızda başlık taşması — TAMAMLANDI (commit d3c2a8c)
- AboutContent.tsx: text-3xl → text-2xl sm:text-3xl md:text-5xl lg:text-6xl
- Her kelime whitespace-nowrap span içinde; kelimeler arası boşluk span dışında — karakter bazlı animasyon ortadan kesmeden kelime sınırında satır kırar

### ✅ C2. Ödeme sayfası — tekrarlayan logo kaldırıldı — TAMAMLANDI (commit b73ea9b)
- CheckoutContent.tsx: Visa/Mastercard logo_band_colored kaldırıldı, sadece iyzico logosu kaldı

### ✅ C3. Mesafeli satış sözleşmesi — garanti ibaresi kaldırıldı — TAMAMLANDI (commit b73ea9b)
- "Ürünler 2 yıl yasal garanti kapsamındadır." cümlesi 6 dilde (tr/en/de/it/ar/ru) kaldırıldı

### ✅ C4. Footer "Made with craft & passion" — TAMAMLANDI (commit b73ea9b)
Kök neden: Footer.tsx'e hard-coded olarak eklenmişti (deploy öncesinde yoktu).
- Footer.tsx: `<span className="font-serif italic text-[#444]">Made with craft & passion</span>` tamamen kaldırıldı

---

## KATEGORİ 4: YENİ ÖZELLİK

### F1. Müşteri Paneli / Müşteri Yönetimi — BEKLEMEDE (şimdilik yapılmayacak)
Müşteri kaydı ve verilerinin tutulacağı bir müşteri paneli oluşturulmalı. Şu an misafir checkout var (customers tablosu telefon bazlı kayıt tutuyor) ama müşterinin giriş yapıp siparişlerini görebileceği bir alan gerekiyor.

---

## ÖZET

| Görev | Durum | Commit |
|-------|-------|--------|
| M1 Yatay kayma | ✅ | 6df887a |
| M2 Strip buton üstüne binme | ✅ | b304f7a |
| M3 Dil seçici dropdown | ✅ | d8aeb95 |
| M4 Mobil zoom | ✅ | 6c1da05 |
| M5 Swipe desteği | ✅ | 6c1da05 |
| C1 About başlık | ✅ | d3c2a8c |
| C2 Checkout logo | ✅ | b73ea9b |
| C3 Garanti ibaresi | ✅ | b73ea9b |
| C4 Made with craft | ✅ | b73ea9b |
| F1 Müşteri paneli | ⏸️ beklemede | — |
