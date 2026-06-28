const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "4767-okceli-taban": {
    content: {
      tr: {
        shortDescription: "Yüksek ökçeli taban ve hakiki deri ile maskülen zarafet.",
        description: "Uzunluk ve duruş sana avantaj sağlar — 4767 Ökçeli Taban, birkaç santim fazlasıyla büyük fark yaratır. Hakiki dana derisi üst yüzey, yıllar geçtikçe daha güzel görünür; Neolit taban ise günlük kullanımın sert koşullarına dayanır. İş toplantısında, özel buluşmada veya resmi davette kimseyle karıştırılmazsın. Dar kesim lacivert pantolon ve beyaz gömlek ile kombinle, saatini takayı unutma. Bu model seni değil, sen bu modeli tamamlarsın.",
        features: ["Hakiki Dana Derisi","Yüksek Ökçeli Neolit Taban","Deri Astar","El Dikişi Detay","Bağcıklı Klasik Kapanma"],
        styling: ["Dar kesim lacivert takım + beyaz gömlek","Siyah slim pantolon + mock turtleneck","Antrasit chino + balıkçı yaka"]
      },
      en: {
        shortDescription: "Elevated heel and genuine leather — masculine elegance that stands tall.",
        description: "Height and posture give you the edge — 4767 Elevated Sole makes a big difference with just a few extra centimetres. The genuine calfskin upper looks better with age; the Neolite sole endures the rigours of daily wear. At a business meeting, a private dinner or a formal event, you will never be confused with anyone else. Pair with slim navy trousers and a white shirt — and don't forget your watch. This shoe doesn't complete you; you complete this shoe.",
        features: ["Genuine Calfskin Leather","Elevated Neolite Heel Sole","Leather Lining","Hand-Stitched Detail","Classic Lace-Up Closure"],
        styling: ["Slim navy suit + white shirt","Black slim trousers + mock turtleneck","Anthracite chinos + rollneck"]
      },
      de: {
        shortDescription: "Erhöhte Absatzsohle und Echtleder — maskuline Eleganz mit Statur.",
        description: "Körpergröße und Haltung verschaffen dir den Vorteil — die 4767 Absatzsohle macht durch einige Zentimeter mehr einen großen Unterschied. Das Obermaterial aus echtem Kalbsleder sieht mit den Jahren immer besser aus; die Neolite-Sohle hält dem täglichen Gebrauch stand. Bei Geschäftsmeetings, privaten Abendessen oder formellen Anlässen wirst du mit niemandem verwechselt. Kombiniere mit schmaler Marinehose und weißem Hemd — und vergiss die Uhr nicht.",
        features: ["Echtes Kalbsleder","Erhöhte Neolite-Absatzsohle","Lederfutter","Handgenähtes Detail","Klassische Schnürung"],
        styling: ["Schmaler Marineanzug + weißes Hemd","Schwarze Slim-Hose + Mock-Turtleneck","Anthrazit-Chino + Rollkragen"]
      },
      it: {
        shortDescription: "Suola rialzata e vera pelle — eleganza maschile che si fa notare.",
        description: "L'altezza e la postura ti danno un vantaggio — la 4767 Suola Rialzata fa una grande differenza con qualche centimetro in più. La tomaia in vera pelle di vitello migliora con gli anni; la suola Neolite resiste alle rigide condizioni dell'uso quotidiano. A un incontro di lavoro, una cena privata o un evento formale, non sarai mai confuso con nessun altro. Abbina a pantaloni slim navy e camicia bianca — e non dimenticare l'orologio.",
        features: ["Vera Pelle di Vitello","Suola Rialzata Neolite","Fodera in Pelle","Dettaglio Cucito a Mano","Chiusura Classica con Lacci"],
        styling: ["Abito slim navy + camicia bianca","Pantaloni slim neri + dolcevita","Chino antracite + collo alto"]
      },
      ar: {
        shortDescription: "نعل كعب مرتفع وجلد أصيل — أناقة رجولية تبرز طولك.",
        description: "الطول والوقفة يمنحانك ميزة — يصنع 4767 النعل المرتفع فارقاً كبيراً بسنتيمترات قليلة إضافية. الجزء العلوي من جلد العجل الأصيل يبدو أجمل مع مرور السنين؛ نعل نيوليت يتحمل قسوة الاستخدام اليومي. في اجتماعات العمل أو العشاء الخاص أو الحفلات الرسمية، لن يُخطئ أحد في التعرف عليك. الجمع مع بنطال بحري ضيق وقميص أبيض — ولا تنسَ ساعتك.",
        features: ["جلد عجل أصيل","نعل كعب نيوليت مرتفع","بطانة جلدية","تفصيل مخيط يدوياً","إغلاق كلاسيكي بأربطة"],
        styling: ["بدلة بحرية ضيقة + قميص أبيض","بنطال أسود ضيق + رقبة عالية","شينو رمادي داكن + رقبة لفافة"]
      },
      ru: {
        shortDescription: "Подошва с каблуком и натуральная кожа — мужская элегантность с ростом.",
        description: "Рост и осанка дают тебе преимущество — 4767 с каблуком делает большую разницу за счёт нескольких лишних сантиметров. Верх из натуральной телячьей кожи с годами выглядит лучше; подошва Neolite выдерживает ежедневную эксплуатацию. На деловой встрече, частном ужине или официальном мероприятии тебя ни с кем не спутают. Сочетай с зауженными брюками цвета морской волны и белой рубашкой — и не забудь часы.",
        features: ["Натуральная телячья кожа","Каблучная подошва Neolite","Кожаная подкладка","Ручная прострочка","Классическая шнуровка"],
        styling: ["Узкий синий костюм + белая рубашка","Чёрные зауженные брюки + водолазка","Антрацитовые чино + горлышко"]
      }
    },
    metaTitle: {
      tr: "4767 Ökçeli Taban Erkek Ayakkabı | Neri Shoes",
      en: "4767 Elevated Sole Men's Shoe | Neri Shoes",
      de: "4767 Absatzsohle Herren Schuh | Neri Shoes",
      it: "4767 Suola Rialzata Scarpa Uomo | Neri Shoes",
      ar: "4767 نعل مرتفع حذاء رجالي | Neri Shoes",
      ru: "4767 Каблучная подошва Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "4767 Ökçeli Taban — hakiki dana derisi ve yüksek Neolit taban. Klasik erkek ayakkabı, Neri Shoes resmi koleksiyonu.",
      en: "4767 Elevated Sole — genuine calfskin leather and high Neolite heel. Classic men's shoe from Neri Shoes official collection.",
      de: "4767 Absatzsohle — echtes Kalbsleder und hohe Neolite-Absatzsohle. Klassischer Herrenschuh, Neri Shoes offizielle Kollektion.",
      it: "4767 Suola Rialzata — vera pelle di vitello e tacco Neolite alto. Scarpa classica uomo, collezione ufficiale Neri Shoes.",
      ar: "4767 النعل المرتفع — جلد عجل أصيل وكعب نيوليت عالٍ. حذاء رجالي كلاسيكي من مجموعة Neri Shoes الرسمية.",
      ru: "4767 Каблучная подошва — натуральная телячья кожа и высокий каблук Neolite. Классические мужские туфли, официальная коллекция Neri Shoes."
    }
  },

  "4767-yarasa-kaucuk-eva-taban": {
    content: {
      tr: {
        shortDescription: "Yarasa tabanlı kauçuk ve EVA kombinasyonuyla gün boyu konfor.",
        description: "Zarif görünüş, yorulmayan adımlar — 4767 Yarasa Kauçuk EVA Taban, klasik tasarımı modern konforla buluşturur. Yarasa formlu özel kalıpla üretilen kauçuk-EVA kompozit taban, standart tabanların iki katı esneklik sunar. Resmi ortamlarda topuk sesini bastırır, uzun mesafe yürüyüşlerde ise baskı noktalarını eşit dağıtır. Slim pantolon ve önlü gömlek kombinasyonunda ofis şıklığını tanımlar. Klasik erkek gardırobunun temel taşı olmayı hak eden bir model.",
        features: ["Yarasa Formlu Kauçuk-EVA Kompozit Taban","Hakiki Deri Üst Yüzey","Baskı Dağıtıcı Ortopedik Astar","El Dikişi Burun Detayı","Antislip Alt Yüzey"],
        styling: ["Bej slim fit pantolon + beyaz gömlek + ceket","Koyu gri chino + siyah önlü gömlek","Lacivert takım + beyaz cep mendili"]
      },
      en: {
        shortDescription: "Bat-moulded rubber and EVA combination for all-day comfort in a classic silhouette.",
        description: "Elegant look, tireless steps — 4767 Bat Rubber EVA Sole brings classic design together with modern comfort. The bat-moulded rubber-EVA composite sole offers twice the flex of a standard sole. Silences heel noise in formal settings while evenly distributing pressure on long walks. Defines office sophistication in a slim trouser and button-front shirt combination. A model that earns its place as a cornerstone of the classic men's wardrobe.",
        features: ["Bat-Moulded Rubber-EVA Composite Sole","Genuine Leather Upper","Pressure-Distributing Orthopedic Lining","Hand-Stitched Toe Detail","Anti-Slip Outsole"],
        styling: ["Beige slim fit trousers + white shirt + blazer","Dark grey chinos + black button-front shirt","Navy suit + white pocket square"]
      },
      de: {
        shortDescription: "Fledermaus-Kautschuk-EVA-Kombination für ganztägigen Komfort im klassischen Stil.",
        description: "Eleganter Look, unermüdliche Schritte — die 4767 Fledermaussohle verbindet klassisches Design mit modernem Komfort. Die in Fledermausform gegossene Kautschuk-EVA-Kompositsohle bietet doppelte Flexibilität im Vergleich zu Standardsohlen. Dämpft Absatzgeräusche in formellen Umgebungen und verteilt den Druck gleichmäßig bei langen Spaziergängen. Definiert Büroeleganz in Kombination mit Slim-Hose und Knopfhemd.",
        features: ["Fledermaus-Kautschuk-EVA-Kompositsohle","Echtes Leder-Obermaterial","Druckverteilende Orthopädische Einlage","Handgenähtes Zehendetail","Antirutsch-Außensohle"],
        styling: ["Beige Slim-Fit-Hose + weißes Hemd + Blazer","Dunkelgraues Chino + schwarzes Knopfhemd","Marineanzug + weißes Einstecktuch"]
      },
      it: {
        shortDescription: "Combinazione suola a pipistrello in gomma ed EVA per il comfort tutto il giorno.",
        description: "Look elegante, passi instancabili — la 4767 Suola Pipistrello EVA unisce design classico con comfort moderno. La suola composita in gomma-EVA modellata a pipistrello offre il doppio della flessibilità di una suola standard. Silenzia il rumore del tacco negli ambienti formali distribuendo uniformemente la pressione nelle lunghe passeggiate. Definisce l'eleganza in ufficio abbinata a pantaloni slim e camicia con bottoni.",
        features: ["Suola Composita Pipistrello Gomma-EVA","Tomaia in Vera Pelle","Fodera Ortopedica Distribu-Pressione","Dettaglio Punta Cucito a Mano","Suola Antiscivolo"],
        styling: ["Pantaloni slim beige + camicia bianca + blazer","Chino grigio scuro + camicia nera con bottoni","Abito navy + fazzoletto da taschino bianco"]
      },
      ar: {
        shortDescription: "مزيج مطاط الخفاش و EVA لراحة طوال اليوم بسيلويت كلاسيكي.",
        description: "مظهر أنيق وخطوات لا تعرف التعب — يجمع 4767 نعل خفاش المطاط EVA بين التصميم الكلاسيكي والراحة العصرية. يوفر النعل المركّب من مطاط-EVA بشكل الخفاش ضعف مرونة النعل القياسي. يكتم صوت الكعب في البيئات الرسمية مع توزيع منتظم للضغط في المشي الطويل. يُعرّف أناقة المكتب مع بنطال ضيق وقميص بأزرار.",
        features: ["نعل مركّب مطاط-EVA بشكل الخفاش","جزء علوي من جلد أصيل","بطانة تقويمية موزّعة للضغط","تفصيل مقدمة مخيط يدوياً","نعل خارجي مقاوم للانزلاق"],
        styling: ["بنطال بيج ضيق + قميص أبيض + بليزر","شينو رمادي داكن + قميص أسود بأزرار","بدلة بحرية + منديل جيب أبيض"]
      },
      ru: {
        shortDescription: "Резина и EVA в форме летучей мыши для комфорта весь день в классическом силуэте.",
        description: "Элегантный вид, неутомимые шаги — 4767 с подошвой EVA из резины сочетает классический дизайн с современным комфортом. Композитная подошва из резины-EVA в форме летучей мыши предлагает вдвое большую гибкость по сравнению со стандартной. Заглушает звук каблука в официальной обстановке, равномерно распределяя нагрузку при длительной ходьбе. Задаёт стандарт офисной элегантности с зауженными брюками и рубашкой.",
        features: ["Резино-EVA подошва «летучая мышь»","Верх из натуральной кожи","Ортопедическая стелька с распределением давления","Ручная прострочка носка","Нескользящая подошва"],
        styling: ["Бежевые зауженные брюки + белая рубашка + пиджак","Тёмно-серые чино + чёрная рубашка","Синий костюм + белый нагрудный платок"]
      }
    },
    metaTitle: {
      tr: "4767 Yarasa Kauçuk EVA Erkek Ayakkabı | Neri Shoes",
      en: "4767 Bat Rubber EVA Men's Shoe | Neri Shoes",
      de: "4767 Fledermaus Kautschuk EVA Herrenschuh | Neri Shoes",
      it: "4767 Suola Pipistrello Gomma EVA Uomo | Neri Shoes",
      ar: "4767 نعل خفاش مطاط EVA حذاء رجالي | Neri Shoes",
      ru: "4767 Подошва Летучая мышь Резина EVA | Neri Shoes"
    },
    metaDescription: {
      tr: "4767 Yarasa Kauçuk EVA Taban — klasik deri ve EVA kompozit taban konforu. Neri Shoes erkek ayakkabı koleksiyonu.",
      en: "4767 Bat Rubber EVA Sole — classic leather upper and EVA composite sole comfort. Neri Shoes men's shoe collection.",
      de: "4767 Fledermaus-Kautschuk-EVA-Sohle — klassisches Leder-Obermaterial und EVA-Komfort. Neri Shoes Herrenschuh-Kollektion.",
      it: "4767 Suola Pipistrello Gomma EVA — tomaia classica in pelle e comfort della suola EVA composita. Collezione scarpe uomo Neri Shoes.",
      ar: "4767 نعل خفاش مطاط EVA — جزء علوي جلدي كلاسيكي وراحة نعل EVA مركّب. مجموعة أحذية رجالية Neri Shoes.",
      ru: "4767 Резиновая подошва EVA — классический кожаный верх и комфорт композитной подошвы EVA. Коллекция мужской обуви Neri Shoes."
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
