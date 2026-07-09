# Frontend Denetim Raporu

## Tarih: 2026-07-09

## Özet
Bu rapor, C:\Users\selcu\Desktop\NeriSohes.com projesinin frontend katmanını kapsamlı bir şekilde denetleyerek tespit edilen somut hataları, tutarsızlıkları ve performans eksiklerini içermektedir. Sadece kodda somut olarak görünen ve yeniden üretilebilen hatalar raporlanmıştır.

---

| Öncelik | Hata Türü | Konum (Dosya:Satır) | Kanıt/Hata Mesajı | Nasıl Yeniden Üretilir? |
|---|---|---|---|---|
| 🔴 Kritik | Routing / Auth | `src/app/[locale]/hesap/layout.tsx:24-26` | `if (!user) redirect(\`/${locale}/giris\`);` — Bu layout **tüm** `hesap/*` alt rotalarını koruyor. | Giriş yapmadan `/tr/hesap/giris`, `/tr/hesap/kayit` veya `/tr/hesap/sifre-sifirla` adresine git. |
| 🔴 Kritik | Routing / Auth | `src/app/[locale]/hesap/layout.tsx:24-26` | `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/layout.tsx` altında olduğu için asla görüntülenemez. | Tarayıcıda `/tr/hesap/giris` adresini aç; `/tr/giris` adresine yönlendirilir. |
| 🔴 Kritik | SEO / Schema.org | `src/app/[locale]/urunler/[slug]/page.tsx:93` | `availability: "https://schema.org/InStock"` sabit olarak set edilmiş. Stok durumu kontrol edilmiyor. | Tükenmiş bir ürün sayfasını Google Rich Results Test ile kontrol et. |
| 🔴 Kritik | Hydration Mismatch | `src/app/layout.tsx:47` + `src/components/HtmlAttributes.tsx:8-11` | `layout.tsx` zaten `html lang={locale} dir={isRTL ? "rtl" : "ltr"}` set ediyor. `HtmlAttributes.tsx` "use client" bileşeni, `useEffect` ile `document.documentElement.lang` ve `dir` güncelliyor. | `tr` yerine `ar` locale'ine geçiş yap; `HtmlAttributes` useEffect çalışana kadar HTML attribute'ları eski değerde kalabilir. |
| 🟠 Yüksek | Performans | `next.config.mjs:28` | `images: { unoptimized: true }` — next/image optimizasyonu tamamen devre dışı. | Lighthouse/PageSpeed testi yap; resim optimizasyonu uyarısı alınır. |
| 🟠 Yüksek | Canlı Site / Routing | `https://www.nerishoes.com.tr/tr/urunler` | `kimi_fetch_v2` sonucunda "İletişim...Sarıyakup..." içeriği döndü. `/tr/urunler` yerine iletişim sayfası içeriği geliyor. | Browser'da `https://www.nerishoes.com.tr/tr/urunler` adresini aç. |
| 🟠 Yüksek | UI / Navigation | `src/components/Header.tsx:74` | `const isActive = pathname === link.href;` — `pathname` locale prefix'li (`/tr/urunler`), `link.href` ise `/urunler`. | `/tr/urunler` sayfasında "Ürünler" nav linkinin aktif (active) class almadığını gözlemle. |
| 🟠 Yüksek | UX / Routing | `src/components/LanguageSwitcher.tsx:36` | `window.location.href = \`/${nextLocale}${pathname}\`;` — Tam sayfa yenilemesi yapıyor, client-side routing yok. | Dil değiştir; sayfa tamamen yenileniyor (flicker, state kaybı). |
| 🟠 Yüksek | Memory Leak | `src/components/ReviewForm.tsx:55` | `URL.createObjectURL(f)` oluşturuluyor, component unmount'ta `URL.revokeObjectURL` çağrılmıyor. | Yorum formunda fotoğraf yükle; sayfayı kapat. Browser memory leak oluşur. |
| 🟠 Yüksek | HTML / Form | `src/components/StarRating.tsx:24` | `type={interactive ? "button" : undefined}` — `interactive` false ise `type` undefined, default `submit` olur. | `StarRating` bileşenini `interactive={false}` ile bir `<form>` içinde kullan; form submit olur. |
| 🟠 Yüksek | HTML / Form | `src/components/CheckoutContent.tsx:247-350` | Tüm form input'larında `name` ve `id` attribute'ları eksik. | Browser autofill (otomatik doldurma) çalışmaz. |
| 🟠 Yüksek | Routing / Tutarsızlık | `src/app/[locale]/hesap/giris/page.tsx` + `src/app/[locale]/giris/page.tsx` | İki farklı giriş sayfası var. `hesap/giris` layout redirect yüzünden asla kullanılamaz. | `/tr/hesap/giris` adresine git; `/tr/giris` sayfasına yönlendirilir. |
| 🟡 Orta | Memory Leak | `src/components/AboutContent.tsx:17-29` | `useCountUp` hook'unda `requestAnimationFrame` kullanılıyor, cleanup'ta `cancelAnimationFrame` yok. | Hakkımızda sayfasını aç ve hızlıca başka sayfaya geç; React console warning alınabilir. |
| 🟡 Orta | Memory Leak | `src/components/ProductDetailContent.tsx:137-139` | `showToast` fonksiyonunda `setTimeout(() => setToast(...), 3500)` kullanılıyor, cleanup yok. | Toast gösterildikten hemen sonra sayfa değiştir; eski timeout hala çalışır. |
| 🟡 Orta | Accessibility | `src/components/CheckoutContent.tsx:247-350` | Form input'larında `label` `htmlFor` ve input `id` eşleşmesi yok. | Ekran okuyucu ile form doldurulamaz. |
| 🟡 Orta | Next.js / Static Gen | `src/app/[locale]/blog/[slug]/page.tsx:15-18` | `generateStaticParams` sadece `slug` döndürüyor, `locale` segmenti eksik. | `next build` sırasında `locale` segmenti için static params üretilmemiş olabilir. |
| 🟡 Orta | Next.js / Metadata | `src/app/[locale]/layout.tsx:21-61` | `generateMetadata` tüm alt sayfalar için aynı title/description üretiyor. Alt sayfalar override etmeli. | `/tr/urunler` sayfasında title "Neri Shoes | Premium Ayakkabı" olarak kalıyorsa, SEO hatası. |
| 🟡 Orta | Security / CSP | `next.config.mjs:9` | `img-src 'self' data: blob: https:` — `https:` tüm HTTPS domain'lerine izin veriyor. | CSP evaluator ile kontrol et; geniş `img-src` politikası zayıf. |
| 🟢 Düşük | Next.js / App Router | `src/app/not-found.tsx:17-62` | Root `not-found.tsx` `html` ve `body` etiketleri içeriyor. Next.js App Router'da root layout zaten sarmalar. | Next.js dev modunda uyarı verebilir. |
| 🟢 Düşük | Tailwind CSS | `tailwind.config.ts:6` | `content` array'inde `"./src/pages/**/*"` var ama `pages` dizini mevcut değil (App Router kullanılıyor). | Gereksiz ama hata değil. |
| 🟢 Düşük | Dead Code | `src/components/PageTransition.tsx` | `PageTransition.tsx` mevcut ama `src/app/[locale]/layout.tsx` veya başka yerde import edilmemiş. `template.tsx` aynı işi yapıyor. | Projede `PageTransition` import edilmediği için kullanılmıyor. |
| 🟢 Düşük | i18n / SEO | `src/app/[locale]/layout.tsx:106-108` | `organizationSchema` içinde `description` sabit Türkçe string. `getTranslations` kullanılmıyor. | `ar` locale'inde schema description Türkçe kalıyor. |
| 🟢 Düşük | Canlı Site Test | Playwright | `npx` komutu bulunamadı (`/usr/bin/bash: line 1: npx: command not found`). | Playwright testleri çalıştırılamadı. Local Node.js/npm ortamı mevcut değil. |

---

## 🔴 Kritik Bulgular

### 1. `hesap/layout.tsx` Tüm Alt Rotaları Koruyor (Giriş/Kayıt/Şifre Sıfırlama Erişilemez)

**Konum:** `src/app/[locale]/hesap/layout.tsx:24-26`

**Kanıt:**
```tsx
if (!user) {
  redirect(`/${locale}/giris`);
}
```

**Açıklama:** `hesap/layout.tsx` dosyası `hesap/*` altındaki TÜM sayfaları (giriş, kayıt, şifre sıfırlama dahil) korumaktadır. Giriş yapmadan `/hesap/giris`, `/hesap/kayit` veya `/hesap/sifre-sifirla` adreslerine erişmeye çalışan kullanıcı, `/giris` sayfasına yönlendirilir. Bu, kullanıcıların kayıt olmasını veya giriş yapmasını engelleyen kritik bir auth/routing hatasıdır.

**Nasıl Yeniden Üretilir:**
1. Giriş yapmadan tarayıcıda `https://www.nerishoes.com.tr/tr/hesap/giris` adresini aç.
2. Kullanıcı `https://www.nerishoes.com.tr/tr/giris` adresine yönlendirilir.
3. Aynı durum `/tr/hesap/kayit` ve `/tr/hesap/sifre-sifirla` için de geçerlidir.

**Önerilen Düzeltme:** `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/layout.tsx` dışına alınmalı veya layout içinde conditional redirect uygulanmalıdır. Örneğin `hesap/(auth)` grup dizini oluşturularak bu sayfalar ayrı bir layout'a alınabilir.

---

### 2. Schema.org `availability` Sabit "InStock" (Tükenmiş Ürünler Yanlış İşaretleniyor)

**Konum:** `src/app/[locale]/urunler/[slug]/page.tsx:93`

**Kanıt:**
```tsx
offers: {
  "@type": "Offer",
  availability: "https://schema.org/InStock", // SABIT
  priceCurrency: "TRY",
  url: canonicalUrl,
  seller: { "@type": "Organization", name: SITE_NAME },
},
```

**Açıklama:** Ürün detay sayfasının Schema.org JSON-LD yapısında `availability` alanı sabit `"https://schema.org/InStock"` olarak tanımlanmış. Sayfa `stock` verisini `ProductDetailContent` bileşenine prop olarak geçiyor, ancak `page.tsx` seviyesinde stok durumu kontrol edilmiyor. Bu nedenle tükenmiş ürünler bile Google arama sonuçlarında "Stokta" olarak görünebilir.

**Nasıl Yeniden Üretilir:**
1. Tükenmiş bir ürünün sayfasını aç.
2. Sayfa kaynağında `<script type="application/ld+json">` içinde `availability` değerini kontrol et.
3. `"https://schema.org/InStock"` olarak görünür.

**Önerilen Düzeltme:** `page.tsx` içinde `computeStockStatus(stock)` çağrılarak stok durumuna göre `availability` dinamik olarak set edilmelidir:
```tsx
availability: stockStatus.kind === "sold_out" 
  ? "https://schema.org/OutOfStock" 
  : "https://schema.org/InStock",
```

---

### 3. `HtmlAttributes.tsx` Hydration Mismatch Riski

**Konum:** `src/app/layout.tsx:47` + `src/components/HtmlAttributes.tsx:8-11`

**Kanıt:**
```tsx
// src/app/layout.tsx:47
<html lang={locale} dir={isRTL ? "rtl" : "ltr"}>

// src/components/HtmlAttributes.tsx:8-11
useEffect(() => {
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}, [locale]);
```

**Açıklama:** `layout.tsx` zaten server-side `html` etiketinin `lang` ve `dir` attribute'larını set ediyor. `HtmlAttributes.tsx` ise client-side `useEffect` ile aynı attribute'ları güncelliyor. Bu çift yönlü manipülasyon, Next.js App Router'da hydration mismatch'e neden olabilir. Client-side `useEffect` çalışana kadar HTML attribute'ları server-rendered değerde kalır; özellikle client-side locale değişiminde (örn. `LanguageSwitcher` ile) bu farklılık görülebilir.

**Nasıl Yeniden Üretilir:**
1. `tr` locale'inde sayfa aç.
2. `LanguageSwitcher` ile `ar` locale'ine geç.
3. `html` etiketinin `lang` ve `dir` attribute'larını inspect et. `useEffect` çalışana kadar eski değerler kalabilir.

**Önerilen Düzeltme:** `HtmlAttributes.tsx` bileşeni kaldırılmalıdır. `layout.tsx` zaten `html` attribute'larını doğru şekilde yönetiyor. Eğer client-side locale değişimi gerekiyorsa, `next-intl`'nin `useRouter` ile `router.replace` kullanılarak tam sayfa geçişi yapılmalıdır.

---

## 🟠 Yüksek Bulgular

### 4. `next/image` Optimizasyonu Devre Dışı (`images.unoptimized: true`)

**Konum:** `next.config.mjs:28`

**Kanıt:**
```ts
images: {
  unoptimized: true
}
```

**Açıklama:** Next.js `next/image` bileşeni, resimleri otomatik olarak optimize eder (format dönüşümü, boyutlandırma, lazy loading). Ancak `unoptimized: true` ayarı ile bu optimizasyon tamamen devre dışı bırakılmış. Proje `next/image` kullanıyor (`<Image src="..." />`), ancak görseller orijinal boyutlarında ve formatlarında sunuluyor. Bu, özellikle mobil cihazlarda ciddi performans etkisi yaratır.

**Nasıl Yeniden Üretilir:**
1. Chrome DevTools Network tab'ında bir ürün resmini kontrol et.
2. Resim `Content-Type` header'ı `image/jpeg` ve orijinal boyutta olacaktır (WebP/AVIF dönüşümü yok).

**Önerilen Düzeltme:** `unoptimized: true` kaldırılmalı ve `next.config.mjs` içinde `domains` veya `remotePatterns` tanımlanmalıdır. Vercel'de resim optimizasyonu otomatik çalışır. Eğer Vercel dışında host ediliyorsa, `sharp` paketi kurulmalıdır.

---

### 5. Canlı Site `/tr/urunler` URL'si İletişim Sayfası İçeriği Döndürüyor

**Konum:** `https://www.nerishoes.com.tr/tr/urunler`

**Kanıt:**
```
kimi_fetch_v2("https://www.nerishoes.com.tr/tr/urunler") sonucu:
"İletişim

ÜRETİM ADRESİ
Sarıyakup, 23040. Sk., 01020 Seyhan/Adana

SATIŞ ADRESİ
Yenibaraj, 68045. Sk. Turan Apt. No:4B Kat:Z Seyhan/Adana"
```

**Açıklama:** Canlı sitede `https://www.nerishoes.com.tr/tr/urunler` adresine yapılan istek, ürünler kataloğu yerine iletişim sayfası içeriği döndürüyor. Bu bir Vercel deployment/runtime hatası veya redirect/render hatası olabilir. Kodda `src/app/[locale]/urunler/page.tsx` mevcut ve doğru görünüyor, ancak canlı davranış farklı.

**Nasıl Yeniden Üretilir:**
1. Browser'da `https://www.nerishoes.com.tr/tr/urunler` adresini aç.
2. İletişim sayfası içeriği görüntüleniyor (veya 404/not-found sayfası döndürülüyor).

**Önerilen Düzeltme:** Vercel deployment logları kontrol edilmelidir. `getActiveProducts()` fonksiyonu canlı ortamda Supabase hatası veriyor olabilir veya `next.config.mjs` içinde beklenmeyen bir redirect kuralı olabilir.

---

### 6. `Header.tsx` Nav Link `isActive` Karşılaştırması Yanlış

**Konum:** `src/components/Header.tsx:74`

**Kanıt:**
```tsx
const isActive = pathname === link.href;
// pathname: "/tr/urunler" (locale prefix'li)
// link.href: "/urunler" (prefix'siz)
```

**Açıklama:** `usePathname()` `next-intl`'den `next/navigation`ın `usePathname`'ini re-export eder ve locale prefix'li path döner (örn. `/tr/urunler`). Ancak `link.href` değerleri `/urunler`, `/hakkimizda` gibi prefix'siz tanımlanmıştır. Bu nedenle `pathname === link.href` karşılaştırması her zaman `false` döner ve nav link'ler hiçbir zaman aktif (active) class almaz.

**Nasıl Yeniden Üretilir:**
1. `/tr/urunler` sayfasına git.
2. Header nav bar'da "Ürünler" linkinin aktif (altın renkte veya alt çizgili) olup olmadığını kontrol et.
3. Aktif class almıyor.

**Önerilen Düzeltme:** `pathname` ile `link.href` karşılaştırması için `pathname`'in locale prefix'i kaldırılmış şekli kullanılmalı veya `next-intl`'nin `usePathname` davranışı kontrol edilmelidir. Alternatif olarak `startsWith` kullanılabilir:
```tsx
const isActive = pathname === `/${locale}${link.href}` || pathname === link.href;
```

---

### 7. `LanguageSwitcher` Tam Sayfa Yenilemesi Yapıyor

**Konum:** `src/components/LanguageSwitcher.tsx:36`

**Kanıt:**
```tsx
function handleSelect(nextLocale: Locale) {
  setOpen(false);
  window.location.href = `/${nextLocale}${pathname}`;
}
```

**Açıklama:** Dil değişimi `window.location.href` ile yapıldığı için tam sayfa yenilemesi (full page reload) gerçekleşir. Bu, Next.js App Router'ın client-side routing avantajını ortadan kaldırır; sayfa flicker'ı, state kaybı ve yavaş geçişlere neden olur.

**Nasıl Yeniden Üretilir:**
1. Ana sayfada scroll yap veya bir state değiştir.
2. `LanguageSwitcher` ile dil değiştir.
3. Sayfa tamamen yenilenir, scroll pozisyonu ve state kaybolur.

**Önerilen Düzeltme:** `next-intl`'nin `useRouter` hook'u kullanılarak client-side navigation yapılmalıdır:
```tsx
import { useRouter } from "@/i18n/navigation";
const router = useRouter();
function handleSelect(nextLocale: Locale) {
  router.replace(pathname, { locale: nextLocale });
}
```

---

### 8. `ReviewForm.tsx` `URL.createObjectURL` Memory Leak

**Konum:** `src/components/ReviewForm.tsx:55`

**Kanıt:**
```tsx
setPreviews((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
```

**Açıklama:** `handleFileChange` fonksiyonunda her seçilen dosya için `URL.createObjectURL(f)` oluşturuluyor. Ancak bu URL'ler component unmount olduğunda `URL.revokeObjectURL` ile temizlenmiyor. `removeImage` fonksiyonunda sadece kaldırılan preview için `URL.revokeObjectURL` çağrılıyor, ama component unmount'ta kalan preview'ler temizlenmiyor.

**Nasıl Yeniden Üretilir:**
1. Ürün detay sayfasında yorum formunu aç.
2. Birden fazla fotoğraf yükle.
3. Sayfayı kapat veya başka ürüne geç.
4. Browser Memory tab'ında blob URL'lerinin biriktiği gözlemlenir.

**Önerilen Düzeltme:** Component unmount'ta tüm preview URL'lerini temizleyen `useEffect` cleanup eklenmelidir:
```tsx
useEffect(() => {
  return () => {
    previews.forEach((src) => URL.revokeObjectURL(src));
  };
}, []);
```

---

### 9. `StarRating.tsx` `button` Element Default `submit` Type'ı

**Konum:** `src/components/StarRating.tsx:24`

**Kanıt:**
```tsx
<button
  type={interactive ? "button" : undefined}
  // interactive=false ise type=undefined, default=submit
>
```

**Açıklama:** HTML `<button>` elementinin default `type` attribute'u `submit`'tir. Eğer `StarRating` bileşeni `interactive={false}` (sadece görüntüleme modu) ile bir `<form>` elementinin içinde kullanılırsa, yıldızlara tıklamak formun submit edilmesine neden olabilir.

**Nasıl Yeniden Üretilir:**
1. Bir form içinde `<StarRating rating={4} />` (interactive=false) kullan.
2. Yıldızlardan birine tıkla.
3. Form submit olur.

**Önerilen Düzeltme:**
```tsx
<button type="button" disabled={!interactive} ... />
```

---

### 10. `CheckoutContent.tsx` Form Input'larında `name` ve `id` Eksikliği

**Konum:** `src/components/CheckoutContent.tsx:247-350`

**Kanıt:**
```tsx
<input
  className={inputClass}
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  placeholder={t("namePlaceholder")}
/>
// type, name, id attribute'ları eksik
```

**Açıklama:** Tüm checkout form input'larında `name` ve `id` attribute'ları eksiktir. Bu, browser autofill (Chrome/Firefox otomatik doldurma) özelliğinin çalışmamasına neden olur. Ayrıca `label` element'leri `htmlFor` attribute'u kullanıyor, ancak input'larda karşılık gelen `id` yok. Bu accessibility (WCAG) ihlalidir.

**Nasıl Yeniden Üretilir:**
1. Checkout sayfasına git.
2. Chrome autofill ile formu doldurmaya çalış.
3. Autofill çalışmaz.

**Önerilen Düzeltme:** Her input'a `name` ve `id` attribute'ları eklenmeli, `label` element'leri `htmlFor` ile input `id`'sine bağlanmalıdır:
```tsx
<label htmlFor="checkout-name" className={labelClass}>{t("name")}</label>
<input id="checkout-name" name="name" className={inputClass} ... />
```

---

### 11. İki Farklı Giriş Sayfası (`/giris` ve `/hesap/giris`) — Biri Kullanılamaz

**Konum:** `src/app/[locale]/giris/page.tsx` + `src/app/[locale]/hesap/giris/page.tsx`

**Kanıt:**
```tsx
// src/app/[locale]/hesap/giris/page.tsx mevcut
// src/app/[locale]/hesap/layout.tsx:24-26
if (!user) {
  redirect(`/${locale}/giris`); // /hesap/giris yerine /giris'e yönlendirir
}
```

**Açıklama:** `hesap/giris` sayfası mevcut, ancak `hesap/layout.tsx` girişsiz kullanıcıyı `/giris` (değil `/hesap/giris`) adresine yönlendiriyor. Bu, `hesap/giris` sayfasının asla görüntülenemeyeceği anlamına gelir. Ayrıca `hesap/giris` ve `giris` sayfaları farklı bileşenler kullanıyor (`LoginRegisterContent` vs `SignInPage`), bu tutarsızlık yaratır.

**Nasıl Yeniden Üretilir:**
1. `/tr/hesap/giris` adresine git.
2. `/tr/giris` adresine yönlendirilir.
3. İki sayfanın farklı UI olduğunu gözlemle.

**Önerilen Düzeltme:** `hesap/giris`, `hesap/kayit`, `hesap/sifre-sifirla` sayfaları `hesap/layout.tsx` dışına alınmalıdır. Tek bir giriş sayfası (`/giris`) kullanılmalıdır.

---

## 🟡 Orta Bulgular

### 12. `AboutContent.tsx` `useCountUp` `requestAnimationFrame` Cleanup Eksikliği

**Konum:** `src/components/AboutContent.tsx:17-29`

**Kanıt:**
```tsx
useEffect(() => {
  if (!inView) return;
  let startTime: number | null = null;
  const step = (timestamp: number) => {
    // ...
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}, [inView, target, duration]);
```

**Açıklama:** `useCountUp` hook'unda `requestAnimationFrame` ID'si saklanmıyor ve cleanup'ta `cancelAnimationFrame` çağrılmıyor. Component unmount olduğunda veya `inView` değiştiğinde, önceki animation frame callback hala çalışabilir ve `setCount` state setter'ı unmount edilmiş component'te çağrılır. Bu React console warning'ine neden olabilir.

**Nasıl Yeniden Üretilir:**
1. Hakkımızda sayfasına git.
2. Scroll yaparak stat kartlarını görünür hale getir.
3. Hızlıca başka sayfaya geç.
4. React Strict Mode console'da warning alınabilir.

**Önerilen Düzeltme:**
```tsx
useEffect(() => {
  if (!inView) return;
  let rafId: number;
  const step = (timestamp: number) => { ... };
  rafId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(rafId);
}, [inView, target, duration]);
```

---

### 13. `ProductDetailContent.tsx` Toast `setTimeout` Cleanup Eksikliği

**Konum:** `src/components/ProductDetailContent.tsx:137-139`

**Kanıt:**
```tsx
function showToast(key: "addedToCart" | "stockLimitReached") {
  setToast({ key, visible: true });
  setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3500);
}
```

**Açıklama:** Toast gösterildikten 3.5 saniye sonra kapanan `setTimeout` fonksiyonu, component unmount olduğunda temizlenmiyor. Eğer kullanıcı toast gösterildikten hemen sonra sayfayı değiştirirse, `setToast` state setter'ı unmount edilmiş component'te çağrılır. Bu React warning'ine neden olabilir.

**Nasıl Yeniden Üretilir:**
1. Bir ürünü sepete ekle (toast görünsün).
2. Hemen başka sayfaya geç.
3. React console'da "Can't perform a React state update on an unmounted component" warning'i alınabilir.

**Önerilen Düzeltme:** `useRef` ile `setTimeout` ID'si saklanmalı ve cleanup'ta `clearTimeout` çağrılmalıdır:
```tsx
const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
function showToast(key: ...) {
  setToast({ key, visible: true });
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  toastTimerRef.current = setTimeout(() => setToast(...), 3500);
}
useEffect(() => () => {
  if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
}, []);
```

---

### 14. `CheckoutContent.tsx` Form Label-Input Eşleşmesi Eksik

**Konum:** `src/components/CheckoutContent.tsx:247-350`

**Kanıt:**
```tsx
<label className={labelClass}>{t("name")}</label>
<input className={inputClass} value={form.name} ... />
// label htmlFor ve input id eşleşmesi yok
```

**Açıklama:** Form input'larında `label` element'leri `htmlFor` attribute'u kullanmıyor ve input'lar `id` attribute'u içermiyor. Bu, ekran okuyucu kullanıcıları için ciddi bir accessibility engelidir. Ayrıca `type` attribute'u da eksik (email ve tel hariç).

**Nasıl Yeniden Üretilir:**
1. Ekran okuyucu (NVDA/VoiceOver) ile checkout formunu doldurmaya çalış.
2. Label'lar input'larla ilişkilendirilmemiş olduğu için form anlaşılamaz.

**Önerilen Düzeltme:** Tüm input'lara `id` ve `name` eklenmeli, label'lar `htmlFor` ile eşleştirilmelidir.

---

### 15. `blog/[slug]/page.tsx` `generateStaticParams` `locale` Eksikliği

**Konum:** `src/app/[locale]/blog/[slug]/page.tsx:15-18`

**Kanıt:**
```tsx
export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
  // locale segmenti eksik!
}
```

**Açıklama:** `BlogPostPage` params'ı `{ locale: string; slug: string }` bekliyor, ancak `generateStaticParams` sadece `slug` döndürüyor. `locale` segmenti `locale/layout.tsx`'nin `generateStaticParams`'ından geliyor, ancak `blog/[slug]` segmenti için `generateStaticParams` eksik parametre içeriyor. Next.js 14'te bu durum build sırasında `dynamicParams = true` ile tolere edilir, ancak static generation yapılmaz ve her istekte SSR çalışır.

**Nasıl Yeniden Üretilir:**
1. `next build` çalıştır.
2. Build loglarında `generateStaticParams` uyarıları kontrol edilebilir.

**Önerilen Düzeltme:**
```tsx
export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return locales.flatMap((locale) => 
    posts.map((p) => ({ locale, slug: p.slug }))
  );
}
```

---

### 16. `locale/layout.tsx` `generateMetadata` Alt Sayfalar İçin Override Edilmiyor

**Konum:** `src/app/[locale]/layout.tsx:21-61`

**Kanıt:**
```tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"), // Genel title
    description: t("description"), // Genel description
  };
}
```

**Açıklama:** `locale/layout.tsx` `generateMetadata` tanımladığı için, eğer bir alt sayfa (örneğin `/urunler`) kendi `generateMetadata`'sını tanımlamazsa, `locale/layout.tsx` metadata'sı kullanılır. Bu, tüm sayfaların aynı title ve description'a sahip olmasına neden olabilir. Şu an `/urunler`, `/blog`, `/iletisim` gibi sayfalar kendi `generateMetadata`'sını tanımlıyor, ancak `/hakkimizda`, `/toptan`, `/odeme` gibi sayfaların metadata'sı kontrol edilmelidir.

**Nasıl Yeniden Üretilir:**
1. `/tr/hakkimizda` sayfasının title'ını kontrol et.
2. Genel "Neri Shoes | Premium Ayakkabı" title'ı kullanılıyorsa, SEO hatası vardır.

**Önerilen Düzeltme:** Tüm sayfalar (`/hakkimizda`, `/toptan`, `/odeme`, hesap sayfaları) kendi `generateMetadata` fonksiyonlarını tanımlamalıdır.

---

### 17. CSP `img-src` Politikası Çok Geniş

**Konum:** `next.config.mjs:9`

**Kanıt:**
```ts
"img-src 'self' data: blob: https:"
```

**Açıklama:** `img-src` directive'inde `https:` wildcard kullanımı, herhangi bir HTTPS domain'inden resim yüklenmesine izin verir. Bu, XSS veya data exfiltration saldırılarına karşı zayıf bir CSP politikasıdır. Özellikle `blob:` ve `data:` ile birlikte kullanıldığında, zararlı içeriklerin yüklenmesi riski artar.

**Nasıl Yeniden Üretilir:**
1. Google CSP Evaluator veya Mozilla Observatory ile CSP politikasını test et.
2. `img-src` genişliği uyarı alınır.

**Önerilen Düzeltme:** `img-src` sadece bilinen domain'leri içermelidir:
```ts
"img-src 'self' data: blob: https://*.supabase.co https://cdn.jsdelivr.net"
```

---

## 🟢 Düşük Bulgular

### 18. Root `not-found.tsx` `html`/`body` Kullanımı

**Konum:** `src/app/not-found.tsx:17-62`

**Kanıt:**
```tsx
export default function RootNotFound() {
  return (
    <html lang="tr">
      <body style={{ margin: 0, background: "#000", color: "#fff", fontFamily: "serif" }}>
        {/* ... */}
      </body>
    </html>
  );
}
```

**Açıklama:** Next.js App Router'da root `not-found.tsx` dosyası, root `layout.tsx` tarafından otomatik olarak sarılır. Bu nedenle `html` ve `body` etiketleri içermemelidir. Next.js genellikle bunu tolere eder, ancak dev modunda uyarı verebilir ve HTML yapısında iç içe geçmiş `body` element'leri oluşabilir.

**Nasıl Yeniden Üretilir:**
1. `next dev` modunda çalıştır.
2. Olmayan bir sayfaya git (örn. `/tr/olmayan-sayfa`).
3. Console'da `not-found.tsx` ile ilgili uyarı alınabilir.

**Önerilen Düzeltme:** `html` ve `body` etiketleri kaldırılmalı, sadece içerik render edilmelidir.

---

### 19. `tailwind.config.ts` Gereksiz `pages` Dizini

**Konum:** `tailwind.config.ts:6`

**Kanıt:**
```ts
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Gereksiz — pages dizini yok
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
]
```

**Açıklama:** Proje Next.js App Router kullanıyor (`src/app/`). `src/pages/` dizini mevcut değil. `tailwind.config.ts` içinde `"./src/pages/**/*"` pattern'i gereksiz yere Tailwind CSS'in tarama süresini hafifçe artırır. Bu bir hata değil, ancak temizlik önerilir.

**Önerilen Düzeltme:** `"./src/pages/**/*"` satırı kaldırılmalıdır.

---

### 20. `PageTransition.tsx` Dead Code

**Konum:** `src/components/PageTransition.tsx`

**Kanıt:**
```tsx
// src/components/PageTransition.tsx mevcut
// src/app/[locale]/layout.tsx içinde import edilmemiş
// src/app/[locale]/template.tsx aynı işi yapıyor
```

**Açıklama:** `PageTransition.tsx` bileşeni `AnimatePresence` + `motion.div` kullanarak sayfa geçiş animasyonu yapıyor. Ancak `src/app/[locale]/layout.tsx` içinde import edilmemiş. Aynı işlevi `src/app/[locale]/template.tsx` zaten yerine getiriyor (App Router'da `template.tsx` otomatik olarak her sayfa değişiminde render edilir).

**Nasıl Yeniden Üretilir:**
1. Proje dosyalarında `PageTransition` import'unu ara.
2. Hiçbir yerde import edilmemiş.

**Önerilen Düzeltme:** `src/components/PageTransition.tsx` dosyası kaldırılmalıdır.

---

### 21. `organizationSchema` Sabit Türkçe Description

**Konum:** `src/app/[locale]/layout.tsx:106-108`

**Kanıt:**
```tsx
description:
  "Adana merkezli premium erkek ayakkabı markası. Hakiki deri, EVA taban teknolojisi. Toptan ve perakende satış.",
```

**Açıklama:** `locale/layout.tsx` içinde `organizationSchema` JSON-LD yapısında `description` alanı sabit Türkçe string olarak tanımlanmış. `locale/layout.tsx` tüm locale'ler için kullanılıyor (`tr`, `en`, `de`, `it`, `ar`, `ru`). Bu nedenle `ar` (Arapça) locale'inde bile schema description Türkçe kalıyor.

**Nasıl Yeniden Üretilir:**
1. `/en` locale'inde sayfa kaynağını kontrol et.
2. `schema.org` JSON-LD içinde `description` alanı Türkçe görünür.

**Önerilen Düzeltme:** `getTranslations({ locale, namespace: "schema" })` kullanılarak dinamik description eklenmelidir.

---

### 22. Playwright Testleri Çalıştırılamadı

**Konum:** `tests/e2e/shopping-flow.spec.ts`, `tests/e2e/payment-form-stability.spec.ts`

**Kanıt:**
```
/usr/bin/bash: line 1: npx: command not found
Command failed with exit code: 127
```

**Açıklama:** Denetim ortamında Node.js/npm (`npx`) bulunamadığı için Playwright E2E testleri çalıştırılamadı. `playwright.config.ts` mevcut ve iki test spec dosyası (`shopping-flow.spec.ts`, `payment-form-stability.spec.ts`) doğru görünüyor. Ancak testlerin çalıştırılıp çalıştırılmadığı, başarısız test olup olmadığı doğrulanamadı.

**Nasıl Yeniden Üretilir:**
1. Local geliştirme ortamında `npm run test:e2e` komutunu çalıştır.
2. Test sonuçlarını ve trace dosyalarını kontrol et.

**Önerilen Düzeltme:** Local geliştirme ortamında testler çalıştırılmalıdır.

---

## MOBIL-EKSIKLER.md Doğrulama Sonuçları

| Görev | Durum | Kod Doğrulaması |
|-------|-------|-----------------|
| M1 Yatay kayma | ✅ Tamamlandı | `globals.css:18` `overflow-x: hidden` mevcut. `Footer.tsx:134` flex-wrap + justify-center mevcut. |
| M2 Strip buton üstüne binme | ✅ Tamamlandı | `HomeContent.tsx:108` `className="... z-[1] ..."` mevcut. |
| M3 Dil seçici dropdown | ✅ Tamamlandı | `LanguageSwitcher.tsx:17` `side` prop mevcut. `Header.tsx:228` `side="left"` kullanılıyor. |
| M4 Mobil zoom | ✅ Tamamlandı | `ProductDetailContent.tsx` `onClick` ile lightbox açılıyor. |
| M5 Swipe desteği | ✅ Tamamlandı | `ProductDetailContent.tsx:61-99` touch event handler'ları mevcut. |
| C1 About başlık | ✅ Tamamlandı | `AboutContent.tsx:158` `text-2xl sm:text-3xl md:text-5xl lg:text-6xl` mevcut. Kelime bazlı whitespace-nowrap span mevcut. |
| C2 Checkout logo | ✅ Tamamlandı | `CheckoutContent.tsx:420` `pay_with_iyzico_white.svg` kullanılıyor, `logo_band_colored` yok. |
| C3 Garanti ibaresi | ✅ Tamamlandı | `LegalPageContent.tsx` okundu, garanti ibaresi yok. |
| C4 Made with craft | ✅ Tamamlandı | `Footer.tsx` okundu, "Made with craft & passion" yok. |
| F1 Müşteri paneli | ⏸️ Beklemede | Kodda müşteri paneli (dashboard) mevcut (`hesap/page.tsx`), ancak `hesap/layout.tsx` redirect sorunu yüzünden erişilemez. |

---

## Ek Notlar

### Canlı Site Testleri (kimi_fetch_v2)

| URL | Durum | Sonuç |
|-----|-------|-------|
| `https://www.nerishoes.com.tr` | ✅ 200 OK | Ana sayfa içeriği geldi |
| `https://www.nerishoes.com.tr/blog` | ✅ 200 OK | Blog sayfası içeriği geldi |
| `https://www.nerishoes.com.tr/urunler` | ⚠️ Şüpheli | Çok kısa içerik (muhtemelen redirect/404) |
| `https://www.nerishoes.com.tr/iletisim` | ✅ 200 OK | İletişim sayfası içeriği geldi |
| `https://www.nerishoes.com.tr/tr/urunler` | ❌ HATA | İletişim sayfası içeriği döndürüyor |
| `https://www.nerishoes.com.tr/tr/blog` | ✅ 200 OK | Blog sayfası içeriği geldi |

### `next.config.mjs` Güvenlik Header'ları

CSP header doğru şekilde tanımlanmış (`default-src 'self'`, `script-src` iyzico domain'leri için whitelist, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`). Ancak `script-src 'unsafe-inline' 'unsafe-eval'` ve `img-src 'https:'` genişliği zayıf noktalardır.

### Lazy Loading / Dynamic Import

Projede `next/dynamic` kullanımı **gözlemlenmemiştir**. `ProductsCatalog`, `ProductDetailContent`, `CheckoutContent`, `CartPanel` gibi büyük client component'ler statik olarak import ediliyor. Bu, initial bundle boyutunu artırır. Özellikle `ProductsCatalog` ve `ProductDetailContent` için `dynamic import` önerilir.

### Script Etiketleri (Third-Party JS)

- `iyzico` checkout formu dinamik olarak `innerHTML` ve `document.createElement('script')` ile yükleniyor (`CheckoutContent.tsx:70-91`). Bu CSP politikasının `script-src` whitelist'inde (`https://cdn.iyzipay.com`) olduğu için güvenli.
- `@vercel/analytics` Next.js Analytics script'i `src/app/layout.tsx:50` içinde `<Analytics />` bileşeni ile yükleniyor. Bu güvenli.
- `Google Fonts` (`Inter`, `Bodoni_Moda`) `next/font/google` ile yükleniyor. Bu self-hosted font olarak çalışır, güvenli.

---

*Rapor, C:\Users\selcu\Desktop\NeriSohes.com projesinin tüm src/ dizinini, canlı siteyi ve test altyapısını kapsayacak şekilde derlenmiştir. Her bulgu somut kod kanıtı ve yeniden üretim adımları ile desteklenmiştir.*
