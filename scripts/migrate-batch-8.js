const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "hybrid-derby": {
    content: {
      tr: {
        shortDescription: "Ofisten sokağa kesintisiz taşıyan hibrit derby tasarımı.",
        description: "Sabah 9'dan gece 9'a tek model — Hybrid Derby, gün içindeki her geçişi kolaylaştırır. Klasik deri üst yapısı, resmi toplantılarda profesyonel bir görünüm sağlarken; gelişmiş EVA taban, uzun gün yürüyüşlerinde destekler. İki karakteri aynı anda taşıyan bu model, ofis ve sosyal hayat arasında gidip gelenlerin favorisi. Slim pantolon ve düğmeli gömlek ile ofis standardını yakalar, chino ve kazak ile gündelik zarafet sunar. Modern erkeğin modern çözümü.",
        features: ["Hakiki Deri Üst Yüzey","Enerji Yansıtıcı EVA Ara Taban","Klasik Derby Tasarımı","Hafif Kauçuk Dış Taban","Nefes Alabilir Tekstil Astar"],
        styling: ["Slim fit lacivert pantolon + beyaz gömlek","Orta gri chino + açık mavi gömlek","Bej chino + koyu polo gömlek"]
      },
      en: {
        shortDescription: "Hybrid derby design that carries you seamlessly from office to street.",
        description: "One model from 9 AM to 9 PM — Hybrid Derby smooths every transition in your day. The classic leather upper delivers a professional appearance in formal meetings while the advanced EVA midsole supports you through long days on foot. Carrying two characters at once, this model is a favourite for those who move between office and social life. Slim trousers and a button shirt hit the office standard; chinos and a sweater offer everyday elegance. The modern solution for the modern man.",
        features: ["Genuine Leather Upper","Energy-Return EVA Midsole","Classic Derby Design","Lightweight Rubber Outsole","Breathable Textile Lining"],
        styling: ["Slim fit navy trousers + white shirt","Mid-grey chinos + light blue shirt","Beige chinos + dark polo shirt"]
      },
      de: {
        shortDescription: "Hybrid-Derby-Design, das nahtlos vom Büro auf die Straße trägt.",
        description: "Ein Modell von 9 bis 21 Uhr — der Hybrid Derby erleichtert jeden Übergang im Alltag. Das klassische Leder-Obermaterial sorgt bei formellen Meetings für ein professionelles Erscheinungsbild, während die fortschrittliche EVA-Zwischensohle bei langen Gehwegen unterstützt. Dieses Modell, das zwei Charaktere gleichzeitig trägt, ist ein Favorit für alle, die zwischen Büro und Sozialleben pendeln.",
        features: ["Echtes Leder-Obermaterial","Energie-Rückgabe EVA-Zwischensohle","Klassisches Derby-Design","Leichte Gummiaußensohle","Atmungsaktives Textilfutter"],
        styling: ["Slim-Fit Marine-Hose + weißes Hemd","Mittelgrauer Chino + hellblaues Hemd","Beige Chino + dunkles Poloshirt"]
      },
      it: {
        shortDescription: "Design derby ibrido che ti porta senza interruzioni dall'ufficio alla strada.",
        description: "Un modello dalle 9 alle 21 — il Hybrid Derby semplifica ogni transizione della giornata. La tomaia in pelle classica garantisce un aspetto professionale nelle riunioni formali mentre la suola intermedia EVA avanzata ti supporta durante le lunghe giornate a piedi. Portando due caratteri allo stesso tempo, è il preferito di chi si muove tra ufficio e vita sociale.",
        features: ["Tomaia in Vera Pelle","Intersuola EVA a Ritorno di Energia","Design Derby Classico","Suola Esterna Leggera in Gomma","Fodera Tessile Traspirante"],
        styling: ["Pantaloni slim navy + camicia bianca","Chino grigio medio + camicia azzurra","Chino beige + polo scura"]
      },
      ar: {
        shortDescription: "تصميم دربي هجين يحملك بسلاسة من المكتب إلى الشارع.",
        description: "موديل واحد من الصباح حتى المساء — يُسهّل Hybrid Derby كل انتقال في يومك. الجزء العلوي الجلدي الكلاسيكي يوفر مظهراً احترافياً في الاجتماعات الرسمية بينما الوسيط EVA المتقدم يدعمك خلال الأيام الطويلة مشياً. يحمل شخصيتين في آن واحد، وهو المفضل لمن يتنقل بين المكتب والحياة الاجتماعية.",
        features: ["جزء علوي من جلد أصيل","وسيط EVA بعودة الطاقة","تصميم دربي كلاسيكي","نعل خارجي مطاطي خفيف","بطانة نسيجية قابلة للتنفس"],
        styling: ["بنطال بحري ضيق + قميص أبيض","شينو رمادي متوسط + قميص أزرق فاتح","شينو بيج + بولو داكن"]
      },
      ru: {
        shortDescription: "Гибридный дерби, несущий тебя без остановок от офиса до улицы.",
        description: "Одна модель с 9 утра до 9 вечера — Hybrid Derby упрощает каждый переход в твоём дне. Классический кожаный верх обеспечивает профессиональный вид на официальных встречах, а продвинутая промежуточная подошва EVA поддерживает при длительной ходьбе. Неся два характера одновременно, эта модель — любимица тех, кто курсирует между офисом и социальной жизнью.",
        features: ["Верх из натуральной кожи","Промежуточная подошва EVA с возвратом энергии","Классический дизайн дерби","Лёгкая резиновая подошва","Дышащая текстильная подкладка"],
        styling: ["Зауженные брюки цвета морской волны + белая рубашка","Серые чино + светло-голубая рубашка","Бежевые чино + тёмная рубашка-поло"]
      }
    },
    metaTitle: {
      tr: "Hybrid Derby Erkek Ayakkabı | Neri Shoes",
      en: "Hybrid Derby Men's Shoe | Neri Shoes",
      de: "Hybrid Derby Herrenschuh | Neri Shoes",
      it: "Hybrid Derby Scarpa Uomo | Neri Shoes",
      ar: "Hybrid Derby حذاء رجالي | Neri Shoes",
      ru: "Hybrid Derby Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Hybrid Derby erkek ayakkabı — hakiki deri ve EVA taban, ofisten sokağa hibrit konfor. Neri Shoes koleksiyonu.",
      en: "Hybrid Derby men's shoe — genuine leather upper and EVA sole, hybrid comfort from office to street. Neri Shoes collection.",
      de: "Hybrid Derby Herrenschuh — echtes Leder und EVA-Sohle, hybrider Komfort vom Büro zur Straße. Neri Shoes Kollektion.",
      it: "Hybrid Derby scarpa uomo — tomaia in vera pelle e suola EVA, comfort ibrido dall'ufficio alla strada. Collezione Neri Shoes.",
      ar: "Hybrid Derby حذاء رجالي — جزء علوي جلدي ونعل EVA، راحة هجينة من المكتب إلى الشارع. مجموعة Neri Shoes.",
      ru: "Hybrid Derby мужские туфли — кожаный верх и подошва EVA, гибридный комфорт от офиса до улицы. Коллекция Neri Shoes."
    }
  },

  "lf-03-eva-taban": {
    content: {
      tr: {
        shortDescription: "Özel LF-03 EVA taban teknolojisiyle adım başı enerji geri kazanımı.",
        description: "Her adım enerji geri kazanır — LF-03 EVA Taban, spor ayakkabı teknolojisinin üst segmentine kendi geliştirdiğimiz taban formülüyle giriyor. LF-03 tabanlık sistemi, koşu sırasındaki darbe enerjisini emerek bir sonraki adıma aktarır; bu, maraton koşucularına bile tanıdık gelecek bir his. Nefes alabilir mesh üst yapı, yoğun aktivite sırasında ısı ve nemi dışarı atar. Koşu antrenmanlarından günlük aktif kullanıma kadar geniş bir performans aralığı sunar. Ayakkabının senin için ne kadar çalıştığını ilk adımda anlarsın.",
        features: ["LF-03 Enerji Geri Kazanımlı EVA Taban","Mesh Nefes Alabilir Üst","Dinamik Destek Orta Taban","Kaymaz Kauçuk Dış Taban","Çıkarılabilir Ortopedik Tabanlık"],
        styling: ["Spor şort + sıkı fit tişört + çorap","Track pantolon + spor hoodie","Slim jogger + cropped sweatshirt"]
      },
      en: {
        shortDescription: "Energy return with every step via our exclusive LF-03 EVA sole technology.",
        description: "Every step gives back energy — LF-03 EVA Sole enters the upper segment of sport footwear with our own developed sole formula. The LF-03 insole system absorbs impact energy during a run and transfers it to the next step — a feeling even marathon runners will recognise. The breathable mesh upper expels heat and moisture during intense activity. Offers a wide performance range from running training to daily active use. You'll understand how hard this shoe works for you from the very first step.",
        features: ["LF-03 Energy-Return EVA Sole","Breathable Mesh Upper","Dynamic Support Midsole","Non-Slip Rubber Outsole","Removable Orthopedic Insole"],
        styling: ["Sport shorts + fitted tee + socks","Track pants + sport hoodie","Slim joggers + cropped sweatshirt"]
      },
      de: {
        shortDescription: "Energierückgabe bei jedem Schritt durch unsere exklusive LF-03 EVA-Sohlentechnologie.",
        description: "Jeder Schritt gibt Energie zurück — die LF-03 EVA-Sohle tritt mit unserer eigenentwickelten Sohlenformel in das obere Segment des Sportschuhs ein. Das LF-03 Einlegesohlen-System absorbiert Aufprallenergie beim Laufen und überträgt sie auf den nächsten Schritt — ein Gefühl, das auch Marathonläufer kennen werden. Das atmungsaktive Mesh-Obermaterial leitet Wärme und Feuchtigkeit bei intensiver Aktivität ab.",
        features: ["LF-03 Energie-Rückgabe EVA-Sohle","Atmungsaktives Mesh-Obermaterial","Dynamische Stütz-Zwischensohle","Rutschfeste Gummiaußensohle","Herausnehmbare Orthopädische Einlegesohle"],
        styling: ["Sportshorts + eng anliegendes T-Shirt + Socken","Trainingshose + Sport-Hoodie","Slim Jogger + Crop-Sweatshirt"]
      },
      it: {
        shortDescription: "Ritorno di energia ad ogni passo con la nostra esclusiva tecnologia suola EVA LF-03.",
        description: "Ogni passo restituisce energia — la LF-03 EVA Sole entra nel segmento superiore delle scarpe sportive con la nostra formula suola sviluppata internamente. Il sistema di soletta LF-03 assorbe l'energia d'impatto durante la corsa e la trasferisce al passo successivo — una sensazione che anche i maratoneti riconosceranno. La tomaia in mesh traspirante espelle calore e umidità durante l'attività intensa.",
        features: ["Suola EVA LF-03 a Ritorno di Energia","Tomaia in Mesh Traspirante","Intersuola a Supporto Dinamico","Suola Esterna in Gomma Antiscivolo","Soletta Ortopedica Removibile"],
        styling: ["Pantaloncini sportivi + t-shirt attillata + calzini","Pantaloni da tuta + felpa sportiva","Jogger slim + felpa corta"]
      },
      ar: {
        shortDescription: "استعادة الطاقة مع كل خطوة بتقنية نعل LF-03 EVA الحصرية.",
        description: "كل خطوة تعيد الطاقة — يدخل LF-03 EVA Sole الشريحة العليا من الأحذية الرياضية بصيغة النعل التي طوّرناها بأنفسنا. نظام النعل الداخلي LF-03 يمتص طاقة الصدمة أثناء الجري وينقلها إلى الخطوة التالية — إحساس يألفه حتى عدّاؤو الماراثون. الجزء العلوي الشبكي القابل للتنفس يطرد الحرارة والرطوبة أثناء النشاط المكثف.",
        features: ["نعل EVA LF-03 باسترداد الطاقة","جزء علوي شبكي قابل للتنفس","وسيط داعم ديناميكي","نعل خارجي مطاطي مقاوم للانزلاق","نعل داخلي تقويمي قابل للإزالة"],
        styling: ["شورت رياضي + تيشرت محكم + جوارب","بنطال تدريب + هودي رياضي","جوقر ضيق + سويتشيرت مقصوص"]
      },
      ru: {
        shortDescription: "Возврат энергии с каждым шагом благодаря эксклюзивной технологии подошвы LF-03 EVA.",
        description: "Каждый шаг возвращает энергию — LF-03 EVA входит в верхний сегмент спортивной обуви с собственной разработанной формулой подошвы. Система стельки LF-03 поглощает энергию удара при беге и передаёт её следующему шагу — ощущение, знакомое даже марафонцам. Дышащий сетчатый верх отводит тепло и влагу при интенсивной активности.",
        features: ["Подошва EVA LF-03 с возвратом энергии","Дышащий сетчатый верх","Динамическая поддерживающая промежуточная подошва","Нескользящая резиновая подошва","Съёмная ортопедическая стелька"],
        styling: ["Спортивные шорты + облегающая футболка + носки","Спортивные штаны + спортивная толстовка","Зауженные джоггеры + укороченный свитшот"]
      }
    },
    metaTitle: {
      tr: "LF-03 EVA Taban Erkek Spor Ayakkabı | Neri Shoes",
      en: "LF-03 EVA Sole Men's Sport Shoe | Neri Shoes",
      de: "LF-03 EVA Sohle Herren Sportschuh | Neri Shoes",
      it: "LF-03 Suola EVA Scarpa Sportiva Uomo | Neri Shoes",
      ar: "LF-03 نعل EVA حذاء رياضي رجالي | Neri Shoes",
      ru: "LF-03 Подошва EVA Мужские спортивные кроссовки | Neri Shoes"
    },
    metaDescription: {
      tr: "LF-03 EVA Taban spor ayakkabı — enerji geri kazanımlı EVA sistem ve mesh üst. Neri Shoes spor koleksiyonu.",
      en: "LF-03 EVA Sole sport shoe — energy-return EVA system and mesh upper. Neri Shoes sport collection.",
      de: "LF-03 EVA Sohle Sportschuh — Energie-Rückgabe EVA-System und Mesh-Obermaterial. Neri Shoes Sportkollektion.",
      it: "LF-03 Suola EVA scarpa sportiva — sistema EVA a ritorno di energia e tomaia in mesh. Collezione sport Neri Shoes.",
      ar: "LF-03 نعل EVA حذاء رياضي — نظام EVA باسترداد الطاقة وجزء علوي شبكي. مجموعة Neri Shoes الرياضية.",
      ru: "LF-03 подошва EVA спортивная обувь — система EVA с возвратом энергии и сетчатый верх. Спортивная коллекция Neri Shoes."
    }
  }
};

const converted = products.map(p => {
  const t = TRANSLATIONS[p.id];
  if (!t) return p;
  const { shortDescription, description, features, styling, metaTitle, metaDescription, ...rest } = p;
  return { ...rest, content: t.content, metaTitle: t.metaTitle, metaDescription: t.metaDescription };
});

fs.writeFileSync(dataPath, JSON.stringify(converted, null, 2), 'utf-8');
const done = converted.filter(p => p.content).map(p => p.id);
const pending = converted.filter(p => !p.content).map(p => p.id);
console.log('DONE (' + done.length + '):', done.join(', '));
console.log('PENDING (' + pending.length + '):', pending.join(', '));
