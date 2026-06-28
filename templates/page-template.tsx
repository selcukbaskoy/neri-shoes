// =============================================================================
// YENİ SAYFA ŞABLONU (page-template.tsx)
// =============================================================================
// Bu dosya bir ŞABLONDUR, projede doğrudan çalışmaz. Yeni bir sayfa eklerken
// bu dosyayı kopyalayıp src/app/[locale]/<sayfa-adi>/page.tsx olarak kaydedin
// ve aşağıdaki adımları izleyin.
//
// ADIMLAR:
// 1. Bu dosyayı src/app/[locale]/<yeni-sayfa>/page.tsx olarak kopyalayın.
//    Örnek: src/app/[locale]/iletisim/page.tsx
//    -> URL şu şekilde olur: /tr/iletisim, /en/iletisim, /ar/iletisim ...
//    next-intl, [locale] segmentini otomatik yönetir; ayrı bir route
//    yazmanıza gerek yoktur.
//
// 2. Aşağıdaki "YOUR_NAMESPACE" değerini messages/*.json içindeki kendi
//    bölümünüzün adıyla değiştirin (örnek: "contact", "wholesale" gibi).
//    Bu isim, messages-template.json'da göstereceğiniz anahtarla eşleşmelidir.
//
// 3. messages/tr.json, en.json, de.json, it.json, ar.json, ru.json
//    dosyalarının HER BİRİNE bu namespace'i ve kullandığınız anahtarları
//    ekleyin. Bkz: templates/messages-template.json
//
// 4. Sayfa içinde TÜM görünür metinler t("anahtar") üzerinden gelmelidir.
//    Hardcode (sabit) Türkçe metin YAZMAYIN — aksi halde diğer dillerde de
//    Türkçe görünür.
// =============================================================================

import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function YourPageName({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // [locale] segmentinden gelen dil kodunu al (tr, en, de, it, ar, ru)
  const { locale } = await params;

  // Statik render sırasında doğru dilin kullanılmasını garanti eder.
  // Her sayfanın en üstünde bu satır olmalıdır.
  setRequestLocale(locale);

  // messages/*.json içindeki "YOUR_NAMESPACE" bölümünden çevirileri al.
  // Örnek: messages/tr.json -> { "yourNamespace": { "title": "Başlık", ... } }
  const t = await getTranslations("yourNamespace");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      {/* Başlık - t("title") -> messages/*.json içindeki yourNamespace.title */}
      <h1 className="section-title text-center">{t("title")}</h1>

      {/* Alt başlık / açıklama */}
      <p className="mt-2 text-center text-muted">{t("subtitle")}</p>

      {/* ---------------------------------------------------------------
          RTL (Arapça) UYUMLULUK NOTU:
          - Tailwind'de flex/grid düzenleri "dir=rtl" olduğunda otomatik
            olarak sağdan sola döner (flex-row mirror eder).
          - Eğer sola/sağa SABİT bir konumlandırma yapıyorsanız
            (örn. absolute left-0, ml-4, text-left), bunun yerine
            mantıksal (logical) sınıfları kullanın veya rtl:/ltr:
            önekleriyle ayrı stil tanımlayın:
              ml-4        -> ms-4   (margin-inline-start, dile göre döner)
              text-left   -> text-start
              absolute left-0  -> rtl:right-0 ltr:left-0 (gerekirse)
          - İkonlar/oklar gibi yön belirten görseller için:
              <ChevronIcon className="rtl:rotate-180" />
         --------------------------------------------------------------- */}
      <div className="mt-10 flex flex-col gap-6 md:flex-row">
        <div className="card flex-1 p-6">
          <h2 className="text-xl font-semibold text-accent">{t("sectionOneTitle")}</h2>
          <p className="mt-3 text-sm text-muted">{t("sectionOneText")}</p>
        </div>
        <div className="card flex-1 p-6">
          <h2 className="text-xl font-semibold text-accent">{t("sectionTwoTitle")}</h2>
          <p className="mt-3 text-sm text-muted">{t("sectionTwoText")}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// İSTEMCİ BİLEŞENİ (Client Component) GEREKİYORSA:
// -----------------------------------------------------------------------
// Yukarıdaki örnek bir Server Component'tir (en performanslı yöntem).
// Eğer useState/onClick gibi etkileşim gerekiyorsa, "use client" ekleyin
// ve çevirileri useTranslations() (next-intl, async DEĞİL) ile alın:
//
//   "use client";
//   import { useTranslations, useLocale } from "next-intl";
//
//   export default function MyClientPart() {
//     const t = useTranslations("yourNamespace");
//     const locale = useLocale(); // "tr" | "en" | "de" | "it" | "ar" | "ru"
//     return <button>{t("submit")}</button>;
//   }
//
// ÖNEMLİ: process.env.* değerlerini (örn. WHATSAPP_NUMBER) "use client"
// bileşenleri içinde DOĞRUDAN OKUMAYIN. Bu, sunucu/istemci arasında farklı
// değerler üretip "hydration mismatch" hatasına yol açar. Bunun yerine,
// değeri Server Component'te (page.tsx) okuyup prop olarak alt bileşene
// geçirin (bkz. src/lib/whatsapp.ts + ProductCard.tsx örneği).
// =============================================================================
