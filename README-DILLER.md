# Neri Shoes — Çoklu Dil (i18n) Rehberi

Bu doküman, projeye yeni bir sayfa veya metin eklerken **6 dilin (tr, en, de,
it, ar, ru) hepsinin doğru çalışmasını** garanti etmek için izlenecek adımları
açıklar. Buradaki kurallara uyulduğu sürece "yabancı dilde Türkçe metin
görünmesi" gibi sorunlar bir daha yaşanmaz.

---

## 1. Genel Yapı

- Diller: **tr (varsayılan), en, de, it, ar (RTL), ru**
- Yapılandırma: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/middleware.ts`
- Çeviri dosyaları: `messages/tr.json`, `messages/en.json`, `messages/de.json`,
  `messages/it.json`, `messages/ar.json`, `messages/ru.json`
- Tüm sayfalar `src/app/[locale]/...` altında yer alır. `[locale]` segmenti
  otomatik olarak `tr | en | de | it | ar | ru` değerlerinden birini alır.
- **Kalıcı güvenlik ağı**: `src/i18n/request.ts` içinde bir "deep merge
  fallback" mekanizması vardır. Aktif dilde bir anahtar eksikse otomatik
  olarak Türkçe (varsayılan dil) karşılığı kullanılır ve terminalde
  `[next-intl] Eksik çeviri anahtarı: "..."` uyarısı basılır. Yani eksik
  anahtar sayfayı KIRMAZ, ama uyarıyı görüp anahtarı tamamlamanız gerekir.

---

## 2. Yeni Bir Sayfa Eklerken Adım Adım

### Adım 1 — Şablonu kopyalayın
`templates/page-template.tsx` dosyasını `src/app/[locale]/<sayfa-adi>/page.tsx`
olarak kopyalayın. Örnek:

```
templates/page-template.tsx  ->  src/app/[locale]/kampanya/page.tsx
```

Bu otomatik olarak şu URL'leri oluşturur:
`/tr/kampanya`, `/en/kampanya`, `/de/kampanya`, `/it/kampanya`, `/ar/kampanya`,
`/ru/kampanya`.

### Adım 2 — Namespace seçin
Şablondaki `"yourNamespace"` ifadesini, sayfanıza uygun bir isimle değiştirin
(örnek: `"campaign"`). Bu isim, `messages/*.json` dosyalarındaki üst seviye
anahtarla aynı olmalıdır.

```ts
const t = await getTranslations("campaign");
```

### Adım 3 — messages/*.json dosyalarını güncelleyin
`templates/messages-template.json` içindeki `yourNamespace` bloğunu kopyalayıp,
**6 dosyanın HER BİRİNE** (tr, en, de, it, ar, ru) ekleyin. Anahtar isimleri
(örn. `title`, `subtitle`, `sectionOneTitle`) sayfanızdaki `t("...")`
çağrılarıyla birebir eşleşmelidir.

> ⚠️ Çeviri kalitesi Google Translate seviyesinde yeterlidir, ama **6 dosyada
> da aynı anahtarlar bulunmalıdır**. Bir dilde unutursanız, otomatik fallback
> sayesinde Türkçe metin görünür (sayfa kırılmaz) ama terminalde uyarı
> basılır — bu uyarıyı görürseniz eksik anahtarı tamamlayın.

### Adım 4 — useTranslations / getTranslations kullanın
- **Server Component** (varsayılan, `async function Page(...)`):
  ```ts
  import { getTranslations, setRequestLocale } from "next-intl/server";
  const t = await getTranslations("campaign");
  ```
- **Client Component** (`"use client"` ile başlayan dosyalar, useState/onClick
  içerenler):
  ```ts
  import { useTranslations, useLocale } from "next-intl";
  const t = useTranslations("campaign");
  const locale = useLocale();
  ```

**KURAL:** Sayfada görünen hiçbir metin doğrudan Türkçe (veya başka bir dilde)
sabit yazılmamalı. Her metin `t("anahtarAdi")` üzerinden gelmelidir.

### Adım 5 — Header/Footer navigasyonuna eklemek isterseniz
`messages/*.json` içindeki `nav` bölümüne yeni bir anahtar ekleyin (6 dilde),
ve `src/components/Header.tsx` / `Footer.tsx` içindeki link listesine
`t("nav.kampanya")` gibi bir referans ekleyin.

---

## 3. RTL (Arapça) Kontrolü

Arapça (`ar`) seçildiğinde `<html dir="rtl">` otomatik olarak ayarlanır
(`src/components/HtmlAttributes.tsx`, client-side `useEffect` ile). Bunun
ötesinde:

- **Flexbox / Grid**: `flex`, `flex-row`, `grid` gibi sınıflar `dir="rtl"`
  olduğunda Tailwind/CSS tarafından otomatik olarak sağdan sola döner. Ekstra
  bir şey yapmanıza gerek yoktur.
- **Yön belirten sabit sınıflar**: `ml-4`, `mr-4`, `text-left`, `text-right`,
  `left-0`, `right-0` gibi sınıflar RTL'de OTOMATİK dönmez. Mümkünse Tailwind'in
  "logical" sınıflarını kullanın: `ms-4` (margin-inline-start), `me-4`
  (margin-inline-end), `text-start`, `text-end`. Bunlar `dir` özniteliğine göre
  otomatik yön değiştirir.
- **Zorunlu sabit konumlandırma** (örn. dropdown'ın her zaman ekranın belirli
  bir köşesinde kalması gerekiyorsa), `rtl:` ve `ltr:` ön ekleriyle ayrı stil
  tanımlayın:
  ```tsx
  <div className="absolute ltr:right-0 rtl:left-0">...</div>
  ```
- **Yön belirten ikonlar** (ok, chevron vb.): `className="rtl:rotate-180"`
  ekleyerek görsel olarak doğru yöne çevirin.

### RTL'i test etme
1. `npm run dev` çalıştırın.
2. Tarayıcıda `http://localhost:3000/ar/<sayfa>` adresine gidin.
3. Geliştirici araçlarında `<html>` etiketinin `dir="rtl"` olduğunu doğrulayın.
4. Sayfayı görsel olarak kontrol edin: metin sağa hizalı, gezinme/menü
   öğelerinin sırası ters, ikonlar/oklar mantıklı yönde olmalı.
5. Header'daki dil seçiciyi kullanarak `tr -> ar -> tr` geçişlerini deneyin;
   her geçişte `dir` ve metinlerin doğru güncellendiğini kontrol edin.

---

## 4. process.env Kullanımı ve Hydration Uyarıları

`process.env.WHATSAPP_NUMBER` gibi `.env.local` değerleri **sadece sunucu
tarafında** (Server Component, `page.tsx`, `layout.tsx`) okunabilir. Eğer bu
değeri `"use client"` bir bileşen içinde doğrudan okursanız, sunucuda ve
istemcide farklı sonuçlar üretir ve "Prop `href` did not match" gibi
**hydration mismatch** hatalarına yol açar.

**Doğru yöntem**: Değeri Server Component'te okuyun (`getWhatsAppNumber()`,
bkz. `src/lib/whatsapp.ts`), sonucu prop olarak Client Component'e geçirin.
Örnek: `src/app/[locale]/urunler/page.tsx` -> `ProductsCatalog` ->
`ProductCard` zinciri.

---

## 5. Test Etme

Her yeni sayfa için:

1. `npm run dev` çalıştırın.
2. `http://localhost:3000/tr/<sayfa>`, `/en/<sayfa>`, `/de/<sayfa>`,
   `/it/<sayfa>`, `/ar/<sayfa>`, `/ru/<sayfa>` adreslerinin hepsini açın.
3. Her dilde:
   - Tüm metinlerin o dilde göründüğünü kontrol edin (Türkçe metin kalmamalı).
   - Tarayıcı konsolunda `[next-intl]` ile başlayan hata/uyarı olmadığını
     kontrol edin (varsa eksik anahtar göstergesidir).
   - `ar` için `dir="rtl"` ve düzenin sağdan sola doğru çalıştığını kontrol
     edin.
4. `npm run build` çalıştırarak prod build'in hatasız tamamlandığını
   doğrulayın.

---

## 6. Sık Yapılan Hatalar

| Hata | Çözüm |
|---|---|
| Sabit Türkçe metin yazmak (`<h1>Hoş Geldiniz</h1>`) | `t("welcomeTitle")` kullanın, `messages/*.json`'a 6 dilde ekleyin |
| Sadece `tr.json`'a anahtar eklemek | Aynı anahtarı **6 dosyaya da** ekleyin |
| `"use client"` içinde `process.env.X` okumak | Değeri Server Component'te okuyup prop olarak geçirin |
| RTL'de bozulan sabit `left-0`/`ml-4` gibi sınıflar | `ms-*`/`me-*`/`text-start` veya `rtl:`/`ltr:` önekleri kullanın |
| Yeni namespace eklerken sadece bazı alt-anahtarları yazmak | `templates/messages-template.json`'daki tüm alt-anahtarları 6 dilde de tamamlayın |
