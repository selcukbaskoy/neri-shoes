# Neri Shoes — Tamamlama Planı (SEO, Güvenlik, Legal, Performans)

Site fonksiyonel olarak sağlam (i18n, Supabase, admin panel, lüks tasarım). Bu doküman, canlıya tam hazır olmak için kalan 6 alanı, öncelik sırasına göre ele alır.

---

## ÖNCELİK SIRASI

| # | Konu | Aciliyet | Tahmini Süre |
|---|------|----------|--------------|
| 1 | Legal sayfalar (KVKK/Gizlilik) | 🔴 Kritik — canlıya çıkmadan önce | 1 oturum |
| 2 | SEO temelleri (sitemap, robots, OG) | 🔴 Kritik — trafiksiz site işe yaramaz | 1 oturum |
| 3 | 404 sayfası | 🟡 Orta | 30 dk |
| 4 | Admin güvenliği (brute-force koruması) | 🟡 Orta | 1 oturum |
| 5 | Analytics kurulumu | 🟢 Düşük ama önemli | 30 dk |
| 6 | Performans/Lighthouse denetimi | 🟢 Düşük, sürekli iyileştirme | 1 oturum + takip |

---

## 1. LEGAL SAYFALAR (KVKK / Gizlilik Politikası)

**Neden kritik:** Türkiye'de KVKK (Kişisel Verilerin Korunması Kanunu) uyarınca, kişisel veri toplayan (iletişim formu, WhatsApp yönlendirmesi, admin sistemi) her site bir gizlilik/KVKK metni bulundurmak zorunda. Bu olmadan hem yasal risk var hem de bazı reklam platformları (Google Ads, Meta Ads) hesabı askıya alabilir.

**Yapılacaklar:**
- `/gizlilik-politikasi` (KVKK Aydınlatma Metni) sayfası — 6 dilde
- `/kullanim-sartlari` sayfası — 6 dilde
- Eğer çerez/analytics kullanılacaksa: `/cerez-politikasi` + site girişinde çerez onay banner'ı
- Footer'a bu sayfaların linkleri eklenmeli

**Not:** Bu sayfaların hukuki metnini bir avukata danışmadan tam güvenilir hale getirmek mümkün değil — ama başlangıç için şablon bir metin (sektör standardı) hazırlanabilir, ileride gözden geçirilir.

---

## 2. SEO TEMELLERİ

**Neden kritik:** Şu an Google'ın siteyi doğru indexleyip indexlemediği bilinmiyor. 28+ ürün × 6 dil = 168+ sayfa var ama bunların haritası (sitemap) güncel değilse Google bir kısmını hiç görmüyor olabilir.

**Yapılacaklar:**
- `sitemap.xml` — tüm ürün/blog/statik sayfaları, 6 dil için otomatik üreten dinamik route (`/sitemap.xml` Next.js route handler ile)
- `robots.txt` — admin panelin Google'a indexlenmemesi için (`/admin` disallow)
- Open Graph (OG) görselleri — her ürün sayfası sosyal medyada paylaşılınca düzgün önizleme göstermeli (görsel + başlık + açıklama)
- `generateMetadata` her sayfada eksiksiz mi kontrol edilmeli (ürünlerde vardı, diğer sayfalarda kontrol edilmeli)
- Google Search Console'a site kaydı + sitemap gönderimi (manuel adım, Claude Code yapamaz, sen yapacaksın)

---

## 3. 404 SAYFASI

**Neden önemli:** Silinen bir ürün linki paylaşılırsa veya yanlış URL girilirse, kullanıcı Next.js'in çirkin varsayılan hata sayfasını görmemeli.

**Yapılacaklar:**
- `src/app/[locale]/not-found.tsx` — markaya uygun, lüks-minimalist tasarımda 404 sayfası
- "Ana Sayfaya Dön" ve "Ürünleri Gör" butonları
- 6 dilde çevrilmiş mesaj

---

## 4. ADMIN GÜVENLİĞİ

**Neden önemli:** Şu an admin paneli tek bir şifre ile korunuyor. Sınırsız deneme hakkı varsa, kötü niyetli biri otomatik script ile şifreyi deneyebilir (brute-force).

**Yapılacaklar:**
- Belirli sayıda yanlış deneme sonrası geçici kilitleme (örn. 5 yanlış denemede 15 dakika engelleme)
- Şifre denemelerini loglama (kim, ne zaman, kaç kez denedi)
- (İleride düşünülebilir) Admin şifresini güçlendirme + iki adımlı doğrulama

---

## 5. ANALYTICS KURULUMU

**Neden önemli:** Şu an kaç kişi siteye giriyor, hangi ürüne bakıyor, nereden geliyor (Instagram, Google, direkt) hiç bilinmiyor. Bu veri olmadan hangi ürünün/dilin/sayfanın işe yaradığını ölçemiyoruz.

**Yapılacaklar:**
- Basit, KVKK-uyumlu bir analytics aracı seçilmeli:
  - **Google Analytics** (ücretsiz, en yaygın, ama çerez onayı gerektirir)
  - **Plausible/Umami** (gizlilik odaklı, çerez gerektirmez, daha basit, küçük bir ücret veya self-host)
- Seçilen araç koda entegre edilmeli
- Eğer Google Analytics seçilirse, çerez onay banner'ı (madde 1 ile bağlantılı) zorunlu hale gelir

---

## 6. PERFORMANS / LIGHTHOUSE DENETİMİ

**Neden önemli:** Yavaş açılan bir site, özellikle mobilde, müşteri kaybettirir. Şu an `next.config`'de `images: { unoptimized: true }` ayarı var — bu görsellerin optimize edilmeden (büyük boyutta) yüklenmesine sebep oluyor.

**Yapılacaklar:**
- Lighthouse denetimi çalıştırılıp mevcut skor (Performance/Accessibility/SEO/Best Practices) ölçülmeli
- `images: { unoptimized: true }` ayarının kaldırılıp kaldırılamayacağı değerlendirilmeli (Vercel'de bu ayarın neden açıldığı hatırlanmalı — muhtemelen Supabase Storage görselleri için domain whitelist gerekiyordu, bu çözülebilir)
- Büyük görsellerin sıkıştırılması (WebP formatına çevrilmesi)
- Gereksiz JavaScript/CSS yüklemelerinin tespiti

---

## UYGULAMA SIRASI ÖNERİSİ

1. Önce **Legal sayfalar** (1) — yasal risk en önemlisi
2. Sonra **SEO temelleri** (2) — Google Search Console kaydı için bu şart
3. **404 sayfası** (3) — hızlı, kolay kazanım
4. **Admin güvenliği** (4) — site büyüdükçe önemi artar
5. **Analytics** (5) — veri toplamaya ne kadar erken başlarsan o kadar iyi
6. **Performans** (6) — sürekli iyileştirilebilir, en sona bırakılabilir

---

## NOT

Bu plandaki her madde için ayrı, detaylı bir Claude Code promptu hazırlanacak — hepsini aynı anda değil, sırayla tek tek uygulayacağız ki her adımda build'in sağlam kaldığını doğrulayabilelim.
