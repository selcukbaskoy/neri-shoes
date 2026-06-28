const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "chunky": {
    content: {
      tr: {
        shortDescription: "Masif kauçuk taban ve parlak deri — güçlü duruşun yeni tanımı.",
        description: "Görünce ikinci kez bakılacak bir ayakkabı — Chunky Derby, klasik derby'nin masif ve çarpıcı yorumudur. Tam parlak dana derisi üst yüzey, güçlü kauçuk taban ile buluşunca hem biçimsel hem de fiziksel bir ağırlık yaratır. Ofis toplantısında dikkat çekici, resmi bir etkinlikte anılmayı hak eden bir model. Siyah slim pantolon ve beyaz gömlek ile karizmatik, koyu gri takım elbise ile dominan bir görünüm sunar. Bunu giyen adam odaya girdiğinde fark edilir.",
        features: ["Tam Parlak Hakiki Dana Derisi","Masif Çentikli Kauçuk Taban","Yumuşak Hakiki Deri Astar","Dikişli Yarasa Burun Detayı","Bağcıklı Derby Kapanması"],
        styling: ["Slim fit siyah pantolon + beyaz gömlek + saat","Antrasit chino + siyah mock turtleneck","Koyu gri takım + beyaz cep mendili"]
      },
      en: {
        shortDescription: "Massive rubber sole and polished leather — a bold new definition of powerful presence.",
        description: "A shoe that makes you look twice — Chunky Derby is the bold, striking interpretation of the classic derby. Full-polish calfskin leather meets a heavy rubber sole to create both formal and physical weight. A head-turner in the boardroom and a model worthy of being remembered at any formal event. Black slim trousers with a white shirt for a charismatic look, dark grey suit for a dominant presence. The man wearing this gets noticed the moment he walks in.",
        features: ["Full-Polish Genuine Calfskin","Massive Ridged Rubber Sole","Soft Genuine Leather Lining","Stitched Wing-Tip Toe Detail","Lace-Up Derby Closure"],
        styling: ["Slim fit black trousers + white shirt + watch","Anthracite chinos + black mock turtleneck","Dark grey suit + white pocket square"]
      },
      de: {
        shortDescription: "Massive Gummisohle und Glanzleder — eine kraftvolle neue Definition von Präsenz.",
        description: "Ein Schuh, der zum zweiten Blick zwingt — der Chunky Derby ist die mutige, beeindruckende Interpretation des klassischen Derbys. Vollpoliertes Kalbsleder trifft auf eine schwere Gummisohle und erzeugt sowohl formales als auch physisches Gewicht. Ein Blickfang im Konferenzraum und ein Modell, das bei formellen Veranstaltungen in Erinnerung bleibt. Schwarze Slim-Hose und weißes Hemd für einen charismatischen Look, dunkelgrauer Anzug für eine dominante Präsenz.",
        features: ["Vollpoliertes Echtes Kalbsleder","Massive Gerippte Gummisohle","Weiches Echtes Lederfutter","Genähtes Brogue-Zehendetail","Schnürung Derby-Verschluss"],
        styling: ["Slim-Fit schwarze Hose + weißes Hemd + Uhr","Anthrazit-Chino + schwarzer Mock-Turtleneck","Dunkelgrauer Anzug + weißes Einstecktuch"]
      },
      it: {
        shortDescription: "Suola massiccia in gomma e pelle lucida — una nuova definizione di presenza potente.",
        description: "Una scarpa che fa girare la testa — il Chunky Derby è l'interpretazione audace e sorprendente del classico derby. La pelle di vitello lucida incontra una pesante suola in gomma creando sia un peso formale che fisico. Un colpo d'occhio in sala riunioni e un modello degno di essere ricordato in qualsiasi evento formale. Pantaloni slim neri con camicia bianca per un look carismatico, abito grigio scuro per una presenza dominante.",
        features: ["Vera Pelle di Vitello Lucida","Suola Massiccia in Gomma Scanalata","Morbida Fodera in Vera Pelle","Dettaglio Punta Brogue Cucito","Chiusura Derby con Lacci"],
        styling: ["Pantaloni slim neri + camicia bianca + orologio","Chino antracite + dolcevita nero","Abito grigio scuro + fazzoletto da taschino bianco"]
      },
      ar: {
        shortDescription: "نعل مطاطي ضخم وجلد لامع — تعريف جديد جريء للحضور القوي.",
        description: "حذاء يجعلك تنظر إليه مرتين — Chunky Derby هو التفسير الجريء والمذهل للدربي الكلاسيكي. جلد العجل اللامع الكامل يلتقي بنعل مطاطي ثقيل ليخلق ثقلاً رسمياً وجسدياً معاً. يلفت الأنظار في غرفة الاجتماعات وموديل يستحق أن يُذكر في أي مناسبة رسمية. بنطال أسود ضيق وقميص أبيض لإطلالة كاريزمية، بدلة رمادية داكنة لحضور مهيمن.",
        features: ["جلد عجل أصيل لامع كامل","نعل مطاطي ضخم مضلّع","بطانة ناعمة من جلد أصيل","تفصيل مقدمة برواز مخيطة","إغلاق دربي بأربطة"],
        styling: ["بنطال أسود ضيق + قميص أبيض + ساعة","شينو أنثراسايت + رقبة عالية سوداء","بدلة رمادية داكنة + منديل جيب أبيض"]
      },
      ru: {
        shortDescription: "Массивная резиновая подошва и лакированная кожа — новое определение мощного присутствия.",
        description: "Обувь, на которую смотришь дважды — Chunky Derby — это смелая, впечатляющая интерпретация классического дерби. Полированная телячья кожа встречается с тяжёлой резиновой подошвой, создавая как формальную, так и физическую тяжесть. Привлекает взгляды в зале заседаний и достоин того, чтобы его запомнили на любом официальном мероприятии. Чёрные зауженные брюки с белой рубашкой для харизматичного образа, тёмно-серый костюм для доминирующего присутствия.",
        features: ["Полированная натуральная телячья кожа","Массивная рифлёная резиновая подошва","Мягкая натуральная кожаная подкладка","Прострочка деталей броги","Шнуровка дерби"],
        styling: ["Зауженные чёрные брюки + белая рубашка + часы","Антрацитовые чино + чёрная водолазка","Тёмно-серый костюм + белый нагрудный платок"]
      }
    },
    metaTitle: {
      tr: "Chunky Derby Erkek Ayakkabı | Neri Shoes",
      en: "Chunky Derby Men's Shoe | Neri Shoes",
      de: "Chunky Derby Herrenschuh | Neri Shoes",
      it: "Chunky Derby Scarpa Uomo | Neri Shoes",
      ar: "Chunky Derby حذاء رجالي | Neri Shoes",
      ru: "Chunky Derby Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Chunky Derby erkek ayakkabı — tam parlak dana derisi ve masif kauçuk taban ile güçlü duruş. Neri Shoes 2026 koleksiyonu.",
      en: "Chunky Derby men's shoe — full-polish calfskin and massive rubber sole for powerful presence. Neri Shoes 2026 collection.",
      de: "Chunky Derby Herrenschuh — vollpoliertes Kalbsleder und massive Gummisohle für kraftvolle Präsenz. Neri Shoes 2026 Kollektion.",
      it: "Chunky Derby scarpa uomo — vera pelle lucida e suola massiccia per una presenza potente. Collezione Neri Shoes 2026.",
      ar: "Chunky Derby حذاء رجالي — جلد عجل لامع ونعل مطاطي ضخم لحضور قوي. مجموعة Neri Shoes 2026.",
      ru: "Chunky Derby мужские туфли — полированная телячья кожа и массивная резиновая подошва для мощного присутствия. Коллекция Neri Shoes 2026."
    }
  },

  "cloud-loafer-series": {
    content: {
      tr: {
        shortDescription: "Bulut hafifliğinde taban — bağcıksız konforu yeniden tanımlar.",
        description: "Adım atmak değil, süzülmek — Cloud Loafer Series, her adımı bulut gibi hafif hissettirmek için tasarlandı. Ultra hafif köpük taban teknolojisi, uzun gün boyunca sıfır yorgunluk hissine katkı sağlar. Slip-on tasarımıyla sabahları zaman kaybetmezsin, ayağın rahat oturur ve kıpırdamaz. Chino ya da slim jean ile casual bir şehirli stil, hafta sonu rahat bir kahve molasında veya şehir yürüyüşünde mükemmel tamamlar. Gardırobundaki en pratik modelin bu olmayacağına dair garanti istiyorsan, bir kez giy.",
        features: ["Ultra Hafif Köpük Taban","Slip-On Tasarım","Hakiki Deri veya Süet Üst","Yastıklı Ortopedik İç Taban","Geniş Fit Rahatlık"],
        styling: ["Krem chino + beyaz slim polo gömlek","Açık gri slim jean + koyu tişört","Şort + polo gömlek (yaz stili)"]
      },
      en: {
        shortDescription: "Cloud-light sole — redefining laceless comfort from the ground up.",
        description: "Not stepping, but gliding — Cloud Loafer Series is designed to make every step feel as light as a cloud. Ultra-lightweight foam sole technology contributes to zero fatigue throughout a long day. The slip-on design means no wasted time in the morning; your foot settles in perfectly and stays put. A casual urban style with chinos or slim jeans, ideal for a relaxed weekend coffee or a city stroll. Try it once and you'll wonder how it wasn't already your most practical shoe.",
        features: ["Ultra-Lightweight Foam Sole","Slip-On Design","Genuine Leather or Suede Upper","Cushioned Orthopedic Insole","Wide Fit Comfort"],
        styling: ["Cream chinos + white slim polo shirt","Light grey slim jeans + dark tee","Shorts + polo shirt (summer style)"]
      },
      de: {
        shortDescription: "Wolkenleichte Sohle — komfortables Tragen ohne Schnürsenkel neu definiert.",
        description: "Nicht schreiten, sondern gleiten — die Cloud Loafer Series wurde entwickelt, um jeden Schritt so leicht wie eine Wolke zu fühlen. Die ultraleichte Schaumstoffsohle trägt den ganzen Tag ohne Ermüdungsgefühl. Das Slip-On-Design bedeutet kein verlorene Zeit morgens; dein Fuß sitzt perfekt und bleibt an Ort und Stelle. Lässiger Stadtlook mit Chino oder Slim-Jeans, ideal für einen entspannten Wochenend-Kaffee oder Stadtbummel.",
        features: ["Ultraleichte Schaumstoffsohle","Slip-On Design","Echtes Leder oder Wildleder Obermaterial","Gepolsterte Orthopädische Einlegesohle","Weiter Sitz Komfort"],
        styling: ["Cremefarbene Chino + weißes Slim-Poloshirt","Hellgraue Slim-Jeans + Dunkles T-Shirt","Shorts + Poloshirt (Sommerstil)"]
      },
      it: {
        shortDescription: "Suola leggera come una nuvola — ridefinisce il comfort senza lacci.",
        description: "Non camminare, ma scivolare — la Cloud Loafer Series è progettata per far sentire ogni passo leggero come una nuvola. La tecnologia della suola in schiuma ultra-leggera contribuisce a zero affaticamento per tutta la giornata. Il design slip-on significa nessun tempo sprecato la mattina; il tuo piede si assesta perfettamente e rimane fermo. Stile urbano casual con chino o jeans slim, ideale per un caffè rilassato nel weekend o una passeggiata in città.",
        features: ["Suola in Schiuma Ultra-Leggera","Design Slip-On","Tomaia in Vera Pelle o Scamosciata","Soletta Ortopedica Imbottita","Comfort con Vestibilità Ampia"],
        styling: ["Chino crema + polo slim bianca","Jeans slim grigio chiaro + t-shirt scura","Shorts + polo (stile estivo)"]
      },
      ar: {
        shortDescription: "نعل خفيف كالسحاب — يُعيد تعريف الراحة بدون أربطة.",
        description: "ليس المشي بل الانزلاق — صُمّمت Cloud Loafer Series لتجعل كل خطوة تشعر بخفة السحاب. تقنية النعل الإسفنجي الخفيف جداً تُسهم في عدم الشعور بالتعب طوال اليوم. تصميم سليب-أون يعني عدم إضاعة الوقت في الصباح؛ تستقر قدمك بشكل مثالي ولا تتزحزح. أسلوب مدني كاجوال مع شينو أو جينز ضيق، مثالي لقهوة نهاية الأسبوع أو التجول في المدينة.",
        features: ["نعل إسفنجي خفيف جداً","تصميم سليب-أون","جزء علوي من جلد أصيل أو سويدي","نعل داخلي تقويمي مبطّن","راحة بقالب واسع"],
        styling: ["شينو كريمي + بولو ضيق أبيض","جينز ضيق رمادي فاتح + تيشرت داكن","شورت + بولو (أسلوب صيفي)"]
      },
      ru: {
        shortDescription: "Подошва лёгкая как облако — переосмысление комфорта без шнурков.",
        description: "Не шагать, а скользить — Cloud Loafer Series создана для того, чтобы каждый шаг ощущался лёгким как облако. Ультралёгкая технология пенной подошвы способствует нулевой усталости в течение долгого дня. Конструкция slip-on означает отсутствие потери времени утром; нога садится идеально и не сдвигается. Непринуждённый городской стиль с чино или зауженными джинсами, идеален для расслабленного кофе в выходные или прогулки по городу.",
        features: ["Ультралёгкая пенная подошва","Конструкция Slip-On","Верх из натуральной кожи или замши","Ортопедическая стелька с подушкой","Широкая посадка для комфорта"],
        styling: ["Кремовые чино + белая зауженная рубашка-поло","Светло-серые зауженные джинсы + тёмная футболка","Шорты + рубашка-поло (летний стиль)"]
      }
    },
    metaTitle: {
      tr: "Cloud Loafer Series Erkek Ayakkabı | Neri Shoes",
      en: "Cloud Loafer Series Men's Shoe | Neri Shoes",
      de: "Cloud Loafer Series Herrenschuh | Neri Shoes",
      it: "Cloud Loafer Series Scarpa Uomo | Neri Shoes",
      ar: "Cloud Loafer Series حذاء رجالي | Neri Shoes",
      ru: "Cloud Loafer Series Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Cloud Loafer Series — ultra hafif köpük taban ve slip-on konfor. Neri Shoes günlük erkek ayakkabı koleksiyonu.",
      en: "Cloud Loafer Series — ultra-lightweight foam sole and slip-on comfort. Neri Shoes everyday men's shoe collection.",
      de: "Cloud Loafer Series — ultraleichte Schaumstoffsohle und Slip-On-Komfort. Neri Shoes Alltags-Herrenschuhkollektion.",
      it: "Cloud Loafer Series — suola in schiuma ultra-leggera e comfort slip-on. Collezione scarpe uomo quotidiana Neri Shoes.",
      ar: "Cloud Loafer Series — نعل إسفنجي خفيف جداً وراحة سليب-أون. مجموعة أحذية رجالية يومية Neri Shoes.",
      ru: "Cloud Loafer Series — ультралёгкая пенная подошва и комфорт slip-on. Коллекция повседневной мужской обуви Neri Shoes."
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
