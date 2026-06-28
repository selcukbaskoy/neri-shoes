const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "b-01-dolar": {
    content: {
      tr: {
        shortDescription: "Tok taban, rahat şekil — günlük taşınabilirliğin premium versiyonu.",
        description: "Her günün ayakkabısı olacak — B-01 Dolar, günlük kullanımın tüm gereksinimlerini bir modelde toplar. Tok ve dayanıklı tabanı uzun mesafe yürüyüşlerde destek sağlarken, geniş fit yapısı ayaklarınıza nefes aldırır. Şehir hayatının hızıyla uyumlu, pratik bir model: markete giderken, parkta otururken, arkadaş buluşmasında hep doğru seçim. Chino ve polo kombinasyonuyla clean bir şehirli look, jean ve bomber jacket ile sportif bir stil sunar. Renk seçenekleriyle gardırobuna kolayca entegre olur.",
        features: ["Tok Kauçuk Alt Taban","Geniş Fit Erkek Kalıbı","Hava Sirkülasyonlu Üst Yüzey","Yastıklı İç Tabanlık","Kolay Temizlenen Materyal"],
        styling: ["Bej chino + lacivert polo gömlek","Slim jean + plain tişört + açık renk bomber","Eşofman altı + oversize kapüşonlu"]
      },
      en: {
        shortDescription: "Solid sole, relaxed fit — the premium version of everyday wearability.",
        description: "Destined to be your everyday shoe — B-01 Dolar packs all the demands of daily use into one model. Its solid, durable sole supports you on long walks while the wide fit gives your feet room to breathe. A practical model that keeps pace with city life: the right choice whether you're heading to the market, sitting in the park, or meeting friends. Chinos and a polo for a clean urban look, jeans and a bomber jacket for a sportier vibe. Available in colour options that slip effortlessly into any wardrobe.",
        features: ["Solid Rubber Outsole","Wide Fit Men's Last","Air-Circulation Upper","Cushioned Insole","Easy-Clean Material"],
        styling: ["Beige chinos + navy polo shirt","Slim jeans + plain tee + light bomber","Joggers + oversized hoodie"]
      },
      de: {
        shortDescription: "Robuste Sohle, entspannter Sitz — die Premium-Version der alltäglichen Tragbarkeit.",
        description: "Dein täglicher Begleiter — der B-01 Dolar vereint alle Anforderungen des täglichen Gebrauchs in einem Modell. Die robuste, langlebige Sohle unterstützt bei langen Spaziergängen, während der weite Sitz deinen Füßen Raum zum Atmen lässt. Ein praktisches Modell, das mit dem Tempo des Stadtlebens Schritt hält. Chino und Polo für einen cleanen urbanen Look, Jeans und Bomberjacke für einen sportlicheren Stil.",
        features: ["Robuste Gummiaußensohle","Weiter Sitz Herrenleisten","Luftzirkulierendes Obermaterial","Gepolsterte Einlegesohle","Leicht Zu Reinigendes Material"],
        styling: ["Beige Chino + Marine-Poloshirt","Slim Jeans + Einfaches T-Shirt + Heller Bomber","Jogginghose + Oversized Kapuzenpullover"]
      },
      it: {
        shortDescription: "Suola solida, vestibilità rilassata — la versione premium della calzabilità quotidiana.",
        description: "Destinato a diventare la tua scarpa di tutti i giorni — il B-01 Dolar racchiude tutte le esigenze dell'uso quotidiano in un unico modello. La suola solida e robusta ti supporta nelle lunghe passeggiate mentre la vestibilità ampia lascia respirare i piedi. Un modello pratico che stare al passo con la vita cittadina. Chino e polo per un look urbano pulito, jeans e bomber per uno stile più sportivo.",
        features: ["Suola Esterna in Gomma Solida","Forma Larga da Uomo","Tomaia con Circolazione d'Aria","Soletta Imbottita","Materiale Facile da Pulire"],
        styling: ["Chino beige + polo navy","Jeans slim + t-shirt semplice + bomber chiaro","Jogger + felpa oversize con cappuccio"]
      },
      ar: {
        shortDescription: "نعل صلب وقالب مريح — النسخة المميزة من القابلية اليومية للارتداء.",
        description: "مصمم ليكون حذاءك اليومي — يجمع B-01 Dolar جميع متطلبات الاستخدام اليومي في موديل واحد. نعله الصلب والمتين يدعمك في المشي الطويل بينما القالب الواسع يمنح قدميك مجالاً للتنفس. موديل عملي يواكب سرعة الحياة المدنية. شينو وبولو لإطلالة مدنية نظيفة، جينز وجاكيت بومبر لأسلوب أكثر رياضية.",
        features: ["نعل خارجي مطاطي صلب","قالب رجالي واسع","جزء علوي بتهوية هوائية","نعل داخلي مبطّن","مادة سهلة التنظيف"],
        styling: ["شينو بيج + بولو أزرق بحري","جينز ضيق + تيشرت سادة + بومبر فاتح","جوقر + هودي أوفر سايز"]
      },
      ru: {
        shortDescription: "Крепкая подошва, свободная посадка — премиальная версия повседневной носки.",
        description: "Создан быть твоей ежедневной обувью — B-01 Dolar объединяет все требования повседневной носки в одной модели. Крепкая прочная подошва поддерживает при длительных прогулках, а широкая посадка даёт ногам дышать. Практичная модель, которая идёт в ногу с темпом городской жизни. Чино и поло для чистого городского образа, джинсы и бомбер для спортивного стиля.",
        features: ["Крепкая резиновая подошва","Широкая мужская колодка","Верх с вентиляцией","Мягкая стелька","Легко очищаемый материал"],
        styling: ["Бежевые чино + рубашка-поло цвета морской волны","Зауженные джинсы + простая футболка + светлый бомбер","Джоггеры + оверсайз толстовка с капюшоном"]
      }
    },
    metaTitle: {
      tr: "B-01 Dolar Günlük Erkek Ayakkabı | Neri Shoes",
      en: "B-01 Dolar Casual Men's Shoe | Neri Shoes",
      de: "B-01 Dolar Alltagsschuh Herren | Neri Shoes",
      it: "B-01 Dolar Scarpa Casual Uomo | Neri Shoes",
      ar: "B-01 Dolar حذاء رجالي كاجوال | Neri Shoes",
      ru: "B-01 Dolar Повседневная мужская обувь | Neri Shoes"
    },
    metaDescription: {
      tr: "B-01 Dolar günlük erkek ayakkabı — tok kauçuk taban ve rahat fit. Neri Shoes şehir günlük koleksiyonu.",
      en: "B-01 Dolar casual men's shoe — solid rubber sole and relaxed fit. Neri Shoes everyday city collection.",
      de: "B-01 Dolar Alltagsschuh — robuste Gummisohle und weiter Sitz. Neri Shoes Stadt-Alltagskollektion.",
      it: "B-01 Dolar scarpa casual uomo — suola in gomma solida e vestibilità rilassata. Collezione città quotidiana Neri Shoes.",
      ar: "B-01 Dolar حذاء رجالي كاجوال — نعل مطاطي صلب وقالب مريح. مجموعة Neri Shoes اليومية للمدينة.",
      ru: "B-01 Dolar повседневная мужская обувь — крепкая резиновая подошва и свободная посадка. Городская коллекция Neri Shoes."
    }
  },

  "cbot1": {
    content: {
      tr: {
        shortDescription: "Elastik yan bantlı hakiki deri Chelsea bot — klasiğin özü.",
        description: "Siyahın tüm tonlarını içinde taşıyan bir chelsea — CBOT1, klasik İngiliz tasarımını Türk zanaat kalitesiyle sunuyor. Elastik yan bantlar, modele giymesi son derece kolay ve pratik bir özellik katarken ayağa da mükemmel oturum sağlar. Hakiki deri üst yüzey, zamanla daha soylu bir görünüm kazanır; her gün giyildikçe ayağına özel bir form alır. İnce paçalı siyah pantolon veya skinny jean üstüne, uzun bir kazak veya palto ile giyildiğinde ikonik bir siluet oluşturur. Dört mevsim sizi şık tutacak tek bir bot yatırımı.",
        features: ["Hakiki Dana Derisi","Elastik Yan Bantlar","Yüksek Kauçuk Taban","Deri İç Astar","Klasik Chelsea Kalıbı"],
        styling: ["Skinny siyah pantolon + uzun palto + beyaz tişört","Slim jean + oversize knit kazak","Siyah slim pantolon + turtleneck"]
      },
      en: {
        shortDescription: "Genuine leather Chelsea boot with elastic side panels — the essence of the classic.",
        description: "Carrying every shade of black within it — CBOT1 delivers the classic British design with Turkish craftsmanship quality. The elastic side panels make slipping the boot on effortlessly easy while providing a perfect fit around the foot. The genuine leather upper grows more distinguished with time, taking on a personalised form with every wear. Paired with slim black trousers or skinny jeans under a long sweater or overcoat, it creates an iconic silhouette. A single boot investment that keeps you sharp through all four seasons.",
        features: ["Genuine Calfskin Leather","Elastic Side Panels","High Rubber Sole","Leather Inner Lining","Classic Chelsea Last"],
        styling: ["Skinny black trousers + long overcoat + white tee","Slim jeans + oversized knit sweater","Black slim trousers + turtleneck"]
      },
      de: {
        shortDescription: "Echtes Leder Chelsea-Boot mit elastischen Seitenzügen — die Essenz des Klassikers.",
        description: "Alle Nuancen von Schwarz in sich tragend — CBOT1 präsentiert das klassische britische Design mit türkischer Handwerksqualität. Die elastischen Seitenzüge machen das Anziehen mühelos einfach und bieten gleichzeitig einen perfekten Sitz. Das echte Leder-Obermaterial gewinnt mit der Zeit an Noblesse und nimmt mit jedem Tragen eine personalisierte Form an. Mit Slim-Hose oder Skinny-Jeans unter einem langen Pullover oder Mantel entsteht eine ikonische Silhouette.",
        features: ["Echtes Kalbsleder","Elastische Seitenzüge","Hohe Gummisohle","Leder-Innenfutter","Klassischer Chelsea-Leisten"],
        styling: ["Skinny schwarze Hose + langer Mantel + weißes T-Shirt","Slim Jeans + Oversized Strickpullover","Schwarze Slim-Hose + Rollkragen"]
      },
      it: {
        shortDescription: "Stivale Chelsea in vera pelle con elastici laterali — l'essenza del classico.",
        description: "Portando tutte le sfumature del nero — CBOT1 offre il classico design britannico con la qualità dell'artigianato turco. Gli elastici laterali rendono l'infilaggio dello stivale semplicissimo fornendo al tempo stesso una vestibilità perfetta. La tomaia in vera pelle diventa più nobile col tempo, assumendo una forma personalizzata ad ogni utilizzo. Abbinato a pantaloni slim neri o jeans skinny sotto un maglione lungo o cappotto, crea una silhouette iconica.",
        features: ["Vera Pelle di Vitello","Elastici Laterali","Suola Alta in Gomma","Fodera Interna in Pelle","Forma Chelsea Classica"],
        styling: ["Pantaloni skinny neri + cappotto lungo + t-shirt bianca","Jeans slim + maglione oversize","Pantaloni slim neri + dolcevita"]
      },
      ar: {
        shortDescription: "بوت تشيلسي من جلد أصيل مع أشرطة جانبية مرنة — جوهر الكلاسيك.",
        description: "يحمل كل درجات اللون الأسود — يقدم CBOT1 التصميم البريطاني الكلاسيكي بجودة الحرفية التركية. الأشرطة الجانبية المرنة تجعل ارتداء البوت سهلاً للغاية مع توفير ملاءمة مثالية للقدم. يكتسب الجزء العلوي من الجلد الأصيل نبلاً مع مرور الوقت مشكّلاً شكلاً شخصياً مع كل استخدام. يخلق مع بنطال أسود ضيق أو جينز سكيني تحت كنزة طويلة أو بالطو سيلويت أيقونياً.",
        features: ["جلد عجل أصيل","أشرطة جانبية مرنة","نعل مطاطي مرتفع","بطانة داخلية جلدية","قالب تشيلسي كلاسيكي"],
        styling: ["بنطال أسود سكيني + بالطو طويل + تيشرت أبيض","جينز ضيق + كنزة محبوكة أوفر سايز","بنطال أسود ضيق + رقبة عالية"]
      },
      ru: {
        shortDescription: "Натуральная кожа Chelsea с эластичными вставками — квинтэссенция классики.",
        description: "Несущий все оттенки чёрного — CBOT1 представляет классический британский дизайн с качеством турецкого ремесла. Эластичные боковые вставки делают надевание сапога невероятно лёгким, обеспечивая идеальную посадку. Верх из натуральной кожи становится благороднее с течением времени, принимая персональную форму с каждой ноской. В сочетании с зауженными брюками или скинни джинсами под длинным свитером или пальто создаёт иконический силуэт.",
        features: ["Натуральная телячья кожа","Эластичные боковые вставки","Высокая резиновая подошва","Кожаная внутренняя подкладка","Классическая колодка Chelsea"],
        styling: ["Скинни чёрные брюки + длинное пальто + белая футболка","Зауженные джинсы + оверсайз вязаный свитер","Чёрные зауженные брюки + водолазка"]
      }
    },
    metaTitle: {
      tr: "CBOT1 Chelsea Bot Erkek Ayakkabı | Neri Shoes",
      en: "CBOT1 Chelsea Boot Men's Shoe | Neri Shoes",
      de: "CBOT1 Chelsea Boot Herrenschuh | Neri Shoes",
      it: "CBOT1 Chelsea Boot Scarpa Uomo | Neri Shoes",
      ar: "CBOT1 بوت تشيلسي حذاء رجالي | Neri Shoes",
      ru: "CBOT1 Chelsea Boot Мужская обувь | Neri Shoes"
    },
    metaDescription: {
      tr: "CBOT1 Chelsea Bot — hakiki deri ve elastik yan bantlar. Klasik İngiliz tasarımı, Neri Shoes kalitesiyle.",
      en: "CBOT1 Chelsea Boot — genuine leather and elastic side panels. Classic British design with Neri Shoes quality.",
      de: "CBOT1 Chelsea Boot — echtes Leder und elastische Seitenzüge. Klassisches britisches Design, Neri Shoes Qualität.",
      it: "CBOT1 Chelsea Boot — vera pelle ed elastici laterali. Design britannico classico con la qualità Neri Shoes.",
      ar: "CBOT1 بوت تشيلسي — جلد أصيل وأشرطة جانبية مرنة. تصميم بريطاني كلاسيكي بجودة Neri Shoes.",
      ru: "CBOT1 Chelsea Boot — натуральная кожа и эластичные боковые вставки. Классический британский дизайн с качеством Neri Shoes."
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
