# Neri Shoes — Blog İçerik Üretim Planı (20 Yazı)

Blog altyapısı (Supabase, admin panel, çeviri pipeline, claude-blog skill) zaten kuruldu ve çalışıyor. Bu doküman, o altyapı üzerine **20 adet gerçek, yayına hazır blog yazısı** üretmek için izlenecek yolu tanımlar.

---

## AMAÇ

Sadece metin değil, her yazı şu standartta olmalı:
- SEO uyumlu (anahtar kelime, meta açıklama, başlık hiyerarşisi)
- Görsel açıdan zengin (her yazıda en az 1 kapak + makale içinde 2-4 görsel)
- İçerikle birebir uyumlu görseller (rastgele/jenerik stok fotoğraf DEĞİL — yazı "deri bakımı" ise deri bakım görseli, "kombin önerisi" ise kombin görseli)
- Var olan tasarım skillerini (Impeccable, Taste Skill, Emil'in animasyon skill'i) kullanarak şık, "AI slop" olmayan bir sunum
- 6 dilde (tr/en/de/it/ar/ru) okunabilir

---

## İÇERİK KONULARI (Taslak — 20 Başlık)

Aşağıdaki kategorilerden dengeli bir dağılım hedeflenir. Kesin başlıklar Claude Code tarafından SEO araştırmasıyla netleştirilebilir, bu sadece yön vermek içindir.

### Bakım & Kalite (5 yazı)
1. Erkek deri ayakkabı bakımı: kışlık modeller için temel kurallar
2. Deri ayakkabı nasıl parlatılır — adım adım rehber
3. Süet ayakkabı bakımı: yapılması ve yapılmaması gerekenler
4. Ayakkabınızın ömrünü uzatan 7 alışkanlık
5. Yağmurlu havada deri ayakkabı koruması

### Stil & Kombin (5 yazı)
6. Klasik derby ayakkabı hangi kıyafetlerle kombinlenir
7. Chelsea boot ile 5 farklı stil önerisi
8. İş hayatında doğru ayakkabı seçimi
9. Loafer ayakkabı: rahatlık ve şıklığı birleştirme sanatı
10. Sneaker ile klasik kombinler: rahat ama şık olmak

### Üretim & Marka Hikayesi (4 yazı)
11. Neri Shoes'ta bir ayakkabı nasıl üretilir
12. Hakiki deri ile sentetik deri arasındaki fark
13. Adana'nın ayakkabıcılık kültürü ve Neri Shoes'un yeri
14. EVA taban mı, kauçuk taban mı? Teknoloji karşılaştırması

### Satın Alma Rehberi (3 yazı)
15. Doğru ayakkabı numarası nasıl seçilir
16. Toptan ayakkabı alımında dikkat edilmesi gerekenler
17. Hediye için erkek ayakkabı seçim rehberi

### Mevsimsel/Trend (3 yazı)
18. 2026 erkek ayakkabı trendleri
19. Kış sezonu için en uygun ayakkabı modelleri
20. Yaz sezonunda nefes alabilir ayakkabı seçimi

---

## GÖRSEL STRATEJİSİ

### Görsel Kaynağı
- Web'den içerik temalı görsel arama yapılacak (image_search benzeri bir araç veya web search ile)
- ÖNCELİK: Neri Shoes'un kendi ürün görselleri (mevcut 28 ürün fotoğrafı havuzu) — eğer yazı konusu bir ürün tipiyle (derby, loafer, chelsea boot) örtüşüyorsa kendi görsellerimiz kullanılmalı
- İKİNCİL: Telifsiz/kullanımı serbest stok görsel kaynakları (Unsplash, Pexels gibi) — sadece kendi ürün görseli o konuyu karşılamıyorsa

### Görsel-İçerik Uyumu Kuralı
- Her görsel, bulunduğu paragrafın konusunu DOĞRUDAN yansıtmalı
- Örnek: "Süet ayakkabı bakımı" yazısında süet fırçalama görseli; genel/ilgisiz bir ayakkabı görseli KULLANILMAMALI
- Kapak görseli: yazının ana temasını özetleyen, dikkat çekici ama markaya (siyah/altın, lüks minimalist) uygun olmalı

### Görsel Sayısı (yazı başına)
- 1 kapak görseli (zorunlu)
- 2-4 makale içi görsel (konuya göre değişir, zorlama değil — gerçekten anlam katıyorsa eklenir)

---

## TASARIM STANDARDI (Mevcut Skillerden Faydalanma)

Blog yazıları sitenin genel lüks-minimalist diline uymalı:
- Başlıklar: font-serif (Bodoni Moda, sitede zaten kullanılıyor)
- Gold-divider öğeleri (sitede zaten var, blog sayfalarında da kullanılmalı)
- Impeccable skill ile her yazı sayfası `/impeccable audit` veya `/impeccable polish` denetiminden geçirilmeli — "AI slop" kalıplarından (gereksiz gradyan, klişe ikonlar, tutarsız boşluklar) arındırılmalı
- Emil'in animasyon skill'i ile sayfa içi görsellerin/bölümlerin giriş animasyonları (scroll'da fade-up vb.) markaya uygun, doğal hissettirilmeli
- Taste Skill ile genel "ton" kontrolü yapılabilir (editorial/minimal tarzda)

---

## ÇOK DİLLİLİK

- Her yazı Türkçe yazılır, mevcut çeviri pipeline'ı (translate.ts, MyMemory tabanlı) ile otomatik 6 dile çevrilir
- Görseller dil bağımsızdır (aynı görsel her dilde kullanılır), ama görsel İÇİNDEKİ herhangi bir metin (varsa) olmamalı veya dile özel olmalı
- SEO meta (başlık/açıklama) her dil için ayrı optimize edilmeli — düz çeviri değil, mümkünse o dile özgü anahtar kelime mantığı (claude-blog skill'inin sağladığı SEO araştırma özelliği burada kullanılabilir)

---

## İŞ YÜKÜ YÖNETİMİ — BÖLEREK İLERLEME

20 yazı + her biri için görsel araştırma + tasarım denetimi + çeviri, tek seferde işlem yapılırsa (geçmişte ürün çevirilerinde olduğu gibi) **token/zaman aşımı riski** taşır.

**Strateji:** Claude Code'a yazılar gruplar halinde (örn. 4 yazı bir grupta) verdirilecek:
- Grup 1: yazı 1-4
- Grup 2: yazı 5-8
- Grup 3: yazı 9-12
- Grup 4: yazı 13-16
- Grup 5: yazı 17-20

Her grup bittiğinde: kaydet, doğrula (build hatasız, görseller doğru, çeviri tamamlandı), sonra bir sonraki gruba geç. Claude Code kendi başına "bu çok büyük, bölmem gerekiyor" derse buna saygı gösterilecek — zorla tek seferde yaptırılmayacak.

---

## KALİTE KONTROL LİSTESİ (Her Yazı İçin)

- [ ] Başlık SEO uyumlu ve ilgi çekici
- [ ] İçerik en az 400-600 kelime (Türkçe), gerçek değer sunan, kopyala-yapıştır hissi vermeyen
- [ ] Kapak görseli + 2-4 makale içi görsel, hepsi konuyla doğrudan uyumlu
- [ ] Meta başlık + meta açıklama dolu
- [ ] 6 dilde içerik mevcut (otomatik çeviri tamamlanmış)
- [ ] Tasarım: font-serif başlıklar, gold-divider, mevcut site diliyle tutarlı
- [ ] Admin panelde "Taslak" olarak görünüyor, yayına hazır
- [ ] Impeccable audit'ten geçmiş (anti-pattern yok)

---

## NOT

Yazılar admin panelde **TASLAK** olarak kaydedilecek. Hiçbiri otomatik yayınlanmayacak — son onay ve "Yayınla" butonuna basma işlemi sana ait. Bu, içerik kalitesini gözden geçirme şansı verir.

---

## ÇALIŞMA TARZI — ARA ONAY İSTENMEYECEK

Bu iş baştan sona, kullanıcıdan ara onay istenmeden yürütülecek. Kurallar:

- Her grup (4 yazı) bittiğinde "devam edeyim mi?" diye SORULMAYACAK — otomatik olarak sıradaki gruba geçilecek
- 20 yazının TAMAMI bitene kadar durulmayacak
- Bir grupta token/zaman limiti riski varsa, kullanıcıya sormadan kendi kararıyla daha küçük parçaya bölünüp devam edilecek (bu bir "duraksama" değil, otomatik bir karar olarak işlenecek)
- Teknik bir hata (build hatası, çeviri API hatası, görsel bulunamaması) çıkarsa, kullanıcıya sormadan ÇÖZÜLECEK ve devam edilecek — sadece çözülemeyen, gerçekten engelleyici bir sorun varsa kullanıcıya bildirilecek
- Her grup tamamlandığında kısa bir ilerleme notu düşülebilir (örn. "Grup 2 tamamlandı, Grup 3'e geçiliyor") ama bu bir onay talebi DEĞİL, sadece bilgilendirmedir — yanıt beklenmeden devam edilir

## BİTİŞ KRİTERİ

20 yazının HEPSİ tamamlanıp şu testler yapılmadan "bitti" denmeyecek:

1. `npm run build` hatasız tamamlanmalı
2. Admin panelde 20 yazının TAMAMI taslak olarak görünmeli
3. Her yazının kapak görseli + makale içi görselleri gerçekten yüklenmiş olmalı (kırık link kontrolü yapılmalı)
4. Her yazının 6 dilde (tr/en/de/it/ar/ru) içeriğinin dolu olduğu doğrulanmalı (boş/fallback kontrolü)
5. /blog listesi sayfasında 20 yazının (taslak olsa da admin görünümünde) doğru sıralandığı kontrol edilmeli
6. Rastgele seçilen 3-4 yazının detay sayfası (/blog/[slug]) tarayıcıda/dev server'da gerçekten açılıp görsel+metin+tasarımın doğru göründüğü doğrulanmalı

Bu testlerin TÜMÜ geçtikten sonra kullanıcıya şu şekilde bildirilecek: **"Hazır, kontrol edebilirsin."** — bu cümle söylenmeden önce iş bitmiş sayılmaz.
