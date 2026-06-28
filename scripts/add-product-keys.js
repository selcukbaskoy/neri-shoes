const fs = require("fs");
const path = require("path");

const messagesDir = path.join("C:\\Users\\selcu\\Desktop\\NeriSohes.com", "messages");

const newKeys = {
  tr: {
    breadcrumbHome: "Ana Sayfa",
    featuresTitle: "Özellikler",
    stylingTitle: "Nasıl Kombinlenir?",
    detailAskInfo: "Bu Model Hakkında Bilgi Al",
    detailAskWholesale: "Toptan Fiyat Listesi İçin",
    viewDetail: "Detayı Gör"
  },
  en: {
    breadcrumbHome: "Home",
    featuresTitle: "Features",
    stylingTitle: "How to Style?",
    detailAskInfo: "Get Info About This Model",
    detailAskWholesale: "For Wholesale Price List",
    viewDetail: "View Detail"
  },
  de: {
    breadcrumbHome: "Startseite",
    featuresTitle: "Eigenschaften",
    stylingTitle: "Wie kombinieren?",
    detailAskInfo: "Infos zu diesem Modell erhalten",
    detailAskWholesale: "Für Großhandelspreisliste",
    viewDetail: "Details ansehen"
  },
  it: {
    breadcrumbHome: "Home",
    featuresTitle: "Caratteristiche",
    stylingTitle: "Come abbinare?",
    detailAskInfo: "Ottieni informazioni su questo modello",
    detailAskWholesale: "Per il listino prezzi all'ingrosso",
    viewDetail: "Vedi dettagli"
  },
  ar: {
    breadcrumbHome: "الرئيسية",
    featuresTitle: "المميزات",
    stylingTitle: "كيفية التنسيق؟",
    detailAskInfo: "احصل على معلومات حول هذا الطراز",
    detailAskWholesale: "لقائمة أسعار الجملة",
    viewDetail: "عرض التفاصيل"
  },
  ru: {
    breadcrumbHome: "Главная",
    featuresTitle: "Характеристики",
    stylingTitle: "Как стилизовать?",
    detailAskInfo: "Узнать об этой модели",
    detailAskWholesale: "Для оптового прайс-листа",
    viewDetail: "Подробнее"
  }
};

for (const [lang, keys] of Object.entries(newKeys)) {
  const filePath = path.join(messagesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Add keys to products section (avoid duplicates from tr.json already updated)
  for (const [key, value] of Object.entries(keys)) {
    if (!data.products[key]) {
      data.products[key] = value;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`✓ ${lang}.json updated`);
}
