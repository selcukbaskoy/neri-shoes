const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "hbrit-derby2": {
    content: {
      tr: {
        shortDescription: "İkinci nesil hibrit derby — klasikle sporu mükemmel dengede tutar.",
        description: "İki dünyanın en iyisi tek bir modelde — Hybrid Derby 2, klasik derby formunu spor konfort teknolojisiyle harmanlar. Resmi görüntü, spor tabanın konforu: bu denklemi çözmek isteyenler için üretildi. Gün içinde toplantıdan spor aktiviteye geçişlerde fazladan değişime gerek bırakmayan çok yönlü yapısıyla öne çıkar. İnce paçalı pantolon ve önlü gömlek ile klasik iş stili, chino ve polo ile gelişmiş casual look yaratır. Aktif yaşamı olanlara özel bir klasik.",
        features: ["Klasik Deri Üst + Spor EVA Alt Taban","Hibrit Yapı","Hafif Ağırlık","Yumuşak Deri Astar","Nefes Alabilir Yapı"],
        styling: ["Slim chino + beyaz gömlek, hafif açık yaka","Koyu jean + polo gömlek + denim ceket","Siyah pantolon + çizgili gömlek"]
      },
      en: {
        shortDescription: "Second-generation hybrid derby — holding classic and sport in perfect balance.",
        description: "The best of both worlds in a single model — Hybrid Derby 2 blends the classic derby silhouette with sport comfort technology. A formal look with the comfort of a sport sole: built for those who want to solve that equation. Its versatility means no wardrobe change needed when moving from a meeting to an active afternoon. Slim trousers and a button shirt for classic office style, chinos and a polo for an elevated casual look. A classic built for those who live actively.",
        features: ["Classic Leather Upper + Sport EVA Outsole","Hybrid Construction","Lightweight Build","Soft Leather Lining","Breathable Structure"],
        styling: ["Slim chinos + white shirt, open collar","Dark jeans + polo shirt + denim jacket","Black trousers + striped shirt"]
      },
      de: {
        shortDescription: "Zweite Generation Hybrid-Derby — hält Klassik und Sport in perfekter Balance.",
        description: "Das Beste aus beiden Welten in einem Modell — Hybrid Derby 2 verbindet die klassische Derby-Silhouette mit Sportkomfort-Technologie. Ein formelles Aussehen mit dem Komfort einer Sportsohle: gebaut für diejenigen, die diese Gleichung lösen möchten. Seine Vielseitigkeit bedeutet, keinen Kleiderwechsel zu benötigen, wenn man von einem Meeting zu einem aktiven Nachmittag wechselt.",
        features: ["Klassisches Leder-Obermaterial + Sport-EVA-Außensohle","Hybride Konstruktion","Leichtes Gewicht","Weiches Lederfutter","Atmungsaktive Struktur"],
        styling: ["Slim Chino + weißes Hemd, offener Kragen","Dunkle Jeans + Poloshirt + Denim-Jacke","Schwarze Hose + gestreiftes Hemd"]
      },
      it: {
        shortDescription: "Derby ibrido di seconda generazione — mantiene classico e sport in perfetto equilibrio.",
        description: "Il meglio di entrambi i mondi in un unico modello — il Hybrid Derby 2 fonde la silhouette del derby classico con la tecnologia del comfort sportivo. Un look formale con il comfort di una suola sportiva: costruito per chi vuole risolvere quell'equazione. La sua versatilità significa nessun cambio di guardaroba quando si passa da una riunione a un pomeriggio attivo.",
        features: ["Tomaia in Pelle Classica + Suola EVA Sportiva","Costruzione Ibrida","Peso Leggero","Fodera Morbida in Pelle","Struttura Traspirante"],
        styling: ["Chino slim + camicia bianca, colletto aperto","Jeans scuri + polo + giacca di jeans","Pantaloni neri + camicia a righe"]
      },
      ar: {
        shortDescription: "دربي هجين من الجيل الثاني — يحافظ على التوازن المثالي بين الكلاسيك والرياضة.",
        description: "أفضل ما في العالمين في موديل واحد — يمزج Hybrid Derby 2 بين سيلويت الدربي الكلاسيكي وتقنية الراحة الرياضية. مظهر رسمي مع راحة نعل رياضي: صُمّم لمن يريد حل تلك المعادلة. تعدديته تعني عدم الحاجة لتغيير الملابس عند الانتقال من اجتماع إلى نشاط بعد الظهر.",
        features: ["جزء علوي جلدي كلاسيكي + نعل EVA رياضي","بنية هجينة","وزن خفيف","بطانة جلدية ناعمة","بنية قابلة للتنفس"],
        styling: ["شينو ضيق + قميص أبيض، رقبة مفتوحة","جينز داكن + بولو + جاكيت جينز","بنطال أسود + قميص مقلم"]
      },
      ru: {
        shortDescription: "Гибридное дерби второго поколения — идеальный баланс классики и спорта.",
        description: "Лучшее из двух миров в одной модели — Hybrid Derby 2 сочетает классический силуэт дерби со спортивными технологиями комфорта. Официальный вид с комфортом спортивной подошвы: создан для тех, кто хочет решить это уравнение. Его универсальность означает отсутствие необходимости в смене гардероба при переходе от совещания к активному дню.",
        features: ["Классический кожаный верх + спортивная подошва EVA","Гибридная конструкция","Лёгкий вес","Мягкая кожаная подкладка","Дышащая структура"],
        styling: ["Зауженные чино + белая рубашка, открытый воротник","Тёмные джинсы + поло + джинсовая куртка","Чёрные брюки + полосатая рубашка"]
      }
    },
    metaTitle: {
      tr: "Hybrid Derby 2 Erkek Ayakkabı | Neri Shoes",
      en: "Hybrid Derby 2 Men's Shoe | Neri Shoes",
      de: "Hybrid Derby 2 Herrenschuh | Neri Shoes",
      it: "Hybrid Derby 2 Scarpa Uomo | Neri Shoes",
      ar: "Hybrid Derby 2 حذاء رجالي | Neri Shoes",
      ru: "Hybrid Derby 2 Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Hybrid Derby 2 — klasik deri üst ve EVA alt taban hibrit yapı. Neri Shoes premium erkek ayakkabı koleksiyonu.",
      en: "Hybrid Derby 2 — classic leather upper and EVA outsole hybrid build. Neri Shoes premium men's shoe collection.",
      de: "Hybrid Derby 2 — klassisches Leder-Obermaterial und EVA-Außensohle Hybridkonstruktion. Neri Shoes Premium-Kollektion.",
      it: "Hybrid Derby 2 — tomaia in pelle classica e costruzione ibrida con suola EVA. Collezione premium Neri Shoes.",
      ar: "Hybrid Derby 2 — جزء علوي جلدي كلاسيكي ونعل EVA بنية هجينة. مجموعة Neri Shoes المميزة.",
      ru: "Hybrid Derby 2 — классический кожаный верх и гибридная конструкция с подошвой EVA. Премиальная коллекция Neri Shoes."
    }
  },

  "hot-leather-series": {
    content: {
      tr: {
        shortDescription: "Hakiki derinin canlı renkleriyle dikkat çeken premium seri.",
        description: "Renk cesareti gerektirir — HOT Leather Series, hakiki derinin canlı ve derin tonal renklerini cesurca kullanır. Doğal deri boyama teknikleriyle elde edilen her renk, tonlar arasında geçişler ve derinlikler barındırır; fabrikasyon bir ton değil, yaşayan bir yüzey. Bu seri, stilini konuşturmak isteyenler için: hem şık hem de hafızalarda kalan bir model. Sade ve tek renkli üst giysiyle kombinlediğinde, bu ayakkabı kombininin tek yıldızı olur. Deri bakımı yapıldığında ömür boyu kullanılabilecek bir yatırım.",
        features: ["Hakiki Dana Derisi","Doğal Boyama Tekniği","Canlı Ton Renk Seçenekleri","Deri İç Astar","Tok Kauçuk Taban"],
        styling: ["Sade beyaz veya gri pantolon + renksiz tişört","Koyu jean + plain krem kazak","Bej chino + beyaz gömlek (renk odağı ayakkabı)"]
      },
      en: {
        shortDescription: "Premium series that commands attention with vivid genuine leather tones.",
        description: "Colour takes courage — HOT Leather Series boldly uses the vivid, deep tonal hues that genuine leather can carry. Each colour achieved through natural leather dyeing holds gradients and depths between tones; not a manufactured flat shade, but a living surface. This series is for those who want their style to do the talking: a model that is both elegant and unforgettable. Paired with a plain, single-colour top, this shoe becomes the sole star of the outfit. With proper leather care, a lifetime investment.",
        features: ["Genuine Calfskin Leather","Natural Dyeing Technique","Vivid Tonal Colour Options","Leather Inner Lining","Solid Rubber Outsole"],
        styling: ["Plain white or grey trousers + neutral tee","Dark jeans + plain cream sweater","Beige chinos + white shirt (shoe as colour focus)"]
      },
      de: {
        shortDescription: "Premium-Serie, die mit lebendigen Echtleder-Tönen Aufmerksamkeit erregt.",
        description: "Farbe erfordert Mut — die HOT Leather Series verwendet mutig die lebendigen, tiefen Töne, die Echtleder tragen kann. Jede durch natürliche Lederfärbung erzielte Farbe enthält Verläufe und Tiefen zwischen den Tönen; kein flacher Farbton, sondern eine lebende Oberfläche. Diese Serie ist für diejenigen, die ihren Stil zum Sprechen bringen möchten: ein Modell, das elegant und unvergesslich ist.",
        features: ["Echtes Kalbsleder","Natürliche Färbetechnik","Lebendige Ton-Farboptionen","Leder-Innenfutter","Robuste Gummiaußensohle"],
        styling: ["Schlichtes weißes oder graues Hose + neutrales T-Shirt","Dunkle Jeans + schlichter Cremepullover","Beige Chino + weißes Hemd (Schuh als Farbfokus)"]
      },
      it: {
        shortDescription: "Serie premium che cattura l'attenzione con vivaci tonalità di vera pelle.",
        description: "Il colore richiede coraggio — la HOT Leather Series utilizza audacemente le tonalità vivaci e profonde che la vera pelle può portare. Ogni colore ottenuto attraverso la tintura naturale del cuoio contiene sfumature e profondità tra le tonalità; non una tinta piatta, ma una superficie vivente. Questa serie è per chi vuole che il proprio stile parli da solo: un modello elegante e indimenticabile.",
        features: ["Vera Pelle di Vitello","Tecnica di Tintura Naturale","Opzioni di Colore Tonale Vivace","Fodera Interna in Pelle","Suola Esterna in Gomma Solida"],
        styling: ["Pantaloni bianchi o grigi semplici + t-shirt neutra","Jeans scuri + maglione crema semplice","Chino beige + camicia bianca (scarpa come focus cromatico)"]
      },
      ar: {
        shortDescription: "سلسلة مميزة تلفت الأنظار بألوان جلد أصيل حيوية.",
        description: "اللون يتطلب شجاعة — تستخدم HOT Leather Series بجرأة الألوان الحيوية والعميقة التي يمكن للجلد الأصيل حملها. كل لون يُحقق من خلال تقنيات الصباغة الطبيعية يحمل تدرجات وأعماق بين الأنماط؛ ليس تناً مسطحاً بل سطح حيّ. هذه السلسلة لمن يريد أن يتكلم أسلوبه نيابةً عنه: موديل أنيق لا يُنسى.",
        features: ["جلد عجل أصيل","تقنية صباغة طبيعية","خيارات ألوان تدرجية حيوية","بطانة داخلية جلدية","نعل خارجي مطاطي صلب"],
        styling: ["بنطال أبيض أو رمادي سادة + تيشرت محايد","جينز داكن + كنزة كريمية سادة","شينو بيج + قميص أبيض (الحذاء كبؤرة اللون)"]
      },
      ru: {
        shortDescription: "Премиальная серия, привлекающая внимание яркими тонами натуральной кожи.",
        description: "Цвет требует смелости — HOT Leather Series смело использует яркие и глубокие тональные оттенки натуральной кожи. Каждый цвет, достигаемый техникой натурального окрашивания, несёт переходы и глубину между тонами — не плоский оттенок, а живая поверхность. Эта серия для тех, кто хочет, чтобы стиль говорил сам за себя: модель элегантная и незабываемая.",
        features: ["Натуральная телячья кожа","Техника натурального окрашивания","Яркие тональные цветовые опции","Кожаная внутренняя подкладка","Крепкая резиновая подошва"],
        styling: ["Простые белые или серые брюки + нейтральная футболка","Тёмные джинсы + простой кремовый свитер","Бежевые чино + белая рубашка (обувь как цветовой акцент)"]
      }
    },
    metaTitle: {
      tr: "HOT Leather Series Erkek Ayakkabı | Neri Shoes",
      en: "HOT Leather Series Men's Shoe | Neri Shoes",
      de: "HOT Leather Series Herrenschuh | Neri Shoes",
      it: "HOT Leather Series Scarpa Uomo | Neri Shoes",
      ar: "HOT Leather Series حذاء رجالي | Neri Shoes",
      ru: "HOT Leather Series Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "HOT Leather Series — canlı renk hakiki dana derisi, doğal boyama teknikleri. Neri Shoes premium koleksiyonu.",
      en: "HOT Leather Series — vivid-colour genuine calfskin, natural dyeing techniques. Neri Shoes premium collection.",
      de: "HOT Leather Series — lebendiges Echtleder, natürliche Färbetechniken. Neri Shoes Premium-Kollektion.",
      it: "HOT Leather Series — vera pelle vivace, tecniche di tintura naturale. Collezione premium Neri Shoes.",
      ar: "HOT Leather Series — جلد عجل أصيل بألوان حيوية وتقنيات صباغة طبيعية. مجموعة Neri Shoes المميزة.",
      ru: "HOT Leather Series — яркая натуральная телячья кожа, техники натурального окрашивания. Премиальная коллекция Neri Shoes."
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
