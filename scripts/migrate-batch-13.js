const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "stealth-black-edition": {
    content: {
      tr: {
        shortDescription: "Tam siyah stealth sneaker — görünmez güç, hissedilen konfor.",
        description: "Dikkat çekmeden etkileme sanatı — Stealth Black Edition, tüm dikkat çekici detayları siyahın derinliğinde saklayan bir sneaker. Siyah mesh üzere siyah kaplama, siyah taban üzerinde siyah nopa — her detay var ama gizli. Bu all-black sneaker yakın bakıldığında kompleks, uzaktan ise sade görünür; bu karşıtlık onu özel kılan şeydir. Slim siyah jean ve hoodie ile koyu tonlarda güçlü bir şehirli look oluşturur. Koleksiyonundaki renk cümbüşünün yanında bu modelin siyahlığı dengeleyici olur.",
        features: ["Siyah Mesh + Siyah Kaplama","All-Black Komponent Tasarım","Hafif EVA Ara Taban","Siyah Kaymaz Dış Taban","Gizli Yansıtıcı Detaylar"],
        styling: ["Slim siyah jean + koyu hoodie + siyah çorap","Siyah jogger + oversized siyah tişört","Koyu gri chino + siyah zip-up"]
      },
      en: {
        shortDescription: "Full-black stealth sneaker — invisible power, tangible comfort.",
        description: "The art of impressing without drawing attention — Stealth Black Edition conceals all its striking details within the depth of black. Black mesh under black overlay, black nubs on a black sole — every detail exists, but hidden. This all-black sneaker appears complex up close and simple from afar; that contradiction is what makes it special. A powerful urban look in dark tones with slim black jeans and a hoodie. Alongside the colour riot in your collection, the blackness of this model becomes the balancing force.",
        features: ["Black Mesh + Black Overlay","All-Black Component Design","Lightweight EVA Midsole","Black Non-Slip Outsole","Hidden Reflective Details"],
        styling: ["Slim black jeans + dark hoodie + black socks","Black joggers + oversized black tee","Dark grey chinos + black zip-up"]
      },
      de: {
        shortDescription: "Vollschwarzer Stealth-Sneaker — unsichtbare Kraft, spürbarer Komfort.",
        description: "Die Kunst zu beeindrucken, ohne aufzufallen — die Stealth Black Edition verbirgt alle auffälligen Details in der Tiefe von Schwarz. Schwarzes Mesh unter schwarzem Overlay, schwarze Noppen auf einer schwarzen Sohle — jedes Detail existiert, aber versteckt. Dieser All-Black-Sneaker wirkt aus der Nähe komplex und aus der Ferne schlicht; dieser Widerspruch macht ihn besonders.",
        features: ["Schwarzes Mesh + Schwarzes Overlay","All-Black Komponentendesign","Leichte EVA-Zwischensohle","Schwarze Rutschfeste Außensohle","Versteckte Reflektierende Details"],
        styling: ["Schlanke schwarze Jeans + dunkler Hoodie + schwarze Socken","Schwarze Jogginghose + Oversized schwarzes T-Shirt","Dunkelgraues Chino + schwarzer Zip-up"]
      },
      it: {
        shortDescription: "Sneaker stealth total black — potenza invisibile, comfort tangibile.",
        description: "L'arte di impressionare senza attirare l'attenzione — la Stealth Black Edition nasconde tutti i dettagli sorprendenti nella profondità del nero. Mesh nero sotto overlay nero, nodi neri su una suola nera — ogni dettaglio esiste, ma nascosto. Questa sneaker total black appare complessa da vicino e semplice da lontano; quella contraddizione la rende speciale.",
        features: ["Mesh Nero + Overlay Nero","Design Componenti Total Black","Intersuola EVA Leggera","Suola Esterna Nera Antiscivolo","Dettagli Riflettenti Nascosti"],
        styling: ["Jeans slim neri + felpa scura + calzini neri","Jogger neri + t-shirt nera oversize","Chino grigio scuro + zip-up nero"]
      },
      ar: {
        shortDescription: "سنيكر ستيلث أسود كامل — قوة غير مرئية وراحة محسوسة.",
        description: "فن الإثارة دون لفت الانتباه — تخفي Stealth Black Edition جميع تفاصيلها اللافتة في أعماق اللون الأسود. شبكة سوداء تحت طبقة سوداء، حبيبات سوداء على نعل أسود — كل تفصيل موجود لكنه مخفي. هذا السنيكر الأسود الكامل يبدو معقداً عن قرب وبسيطاً من بعيد؛ هذا التناقض هو ما يجعله مميزاً.",
        features: ["شبكة سوداء + طبقة سوداء","تصميم مكونات توتال بلاك","وسيط EVA خفيف","نعل خارجي أسود مقاوم للانزلاق","تفاصيل عاكسة مخفية"],
        styling: ["جينز أسود ضيق + هودي داكن + جوارب سوداء","جوقر أسود + تيشرت أسود أوفر سايز","شينو رمادي داكن + زيب-أب أسود"]
      },
      ru: {
        shortDescription: "Полностью чёрные кроссовки stealth — невидимая сила, ощутимый комфорт.",
        description: "Искусство впечатлять, не привлекая внимания — Stealth Black Edition скрывает все броские детали в глубине чёрного. Чёрная сетка под чёрным покрытием, чёрные шипы на чёрной подошве — каждая деталь существует, но скрыта. Эти кроссовки total black кажутся сложными вблизи и простыми издалека; это противоречие делает их особенными.",
        features: ["Чёрная сетка + Чёрное покрытие","Дизайн компонентов total black","Лёгкая промежуточная подошва EVA","Чёрная нескользящая подошва","Скрытые светоотражающие детали"],
        styling: ["Зауженные чёрные джинсы + тёмная толстовка + чёрные носки","Чёрные джоггеры + оверсайз чёрная футболка","Тёмно-серые чино + чёрная толстовка на молнии"]
      }
    },
    metaTitle: {
      tr: "Stealth Black Edition Erkek Spor Ayakkabı | Neri Shoes",
      en: "Stealth Black Edition Men's Sport Shoe | Neri Shoes",
      de: "Stealth Black Edition Herren Sportschuh | Neri Shoes",
      it: "Stealth Black Edition Scarpa Sportiva Uomo | Neri Shoes",
      ar: "Stealth Black Edition حذاء رياضي رجالي | Neri Shoes",
      ru: "Stealth Black Edition Мужские спортивные кроссовки | Neri Shoes"
    },
    metaDescription: {
      tr: "Stealth Black Edition — all-black mesh spor ayakkabı, hafif EVA taban. Neri Shoes spor koleksiyonu.",
      en: "Stealth Black Edition — all-black mesh sport shoe, lightweight EVA sole. Neri Shoes sport collection.",
      de: "Stealth Black Edition — All-Black Mesh Sportschuh, leichte EVA-Sohle. Neri Shoes Sportkollektion.",
      it: "Stealth Black Edition — scarpa sportiva mesh total black, suola EVA leggera. Collezione sport Neri Shoes.",
      ar: "Stealth Black Edition — حذاء رياضي شبكي أسود كامل ونعل EVA خفيف. مجموعة Neri Shoes الرياضية.",
      ru: "Stealth Black Edition — кроссовки total black из сетки, лёгкая подошва EVA. Спортивная коллекция Neri Shoes."
    }
  },

  "suede-knot-loafer": {
    content: {
      tr: {
        shortDescription: "Süet düğüm detaylı loafer — günlük şıklığın en rafine yorumu.",
        description: "Bir düğüm, binlerce yıllık tarih taşır — Suede Knot Loafer, klasik bit loafer'ın ikonik topunu bugüne taşır ve yumuşak süetle yeniden yorumlar. El işçiliğiyle yerleştirilen süet düğüm, modelin imzası ve tartışmasız ayırt edici özelliğidir. Ultra hafif kauçuk taban, uzun yürüyüşlerde ve sert kaldırım taşlarında destekler. Chino ve polo gömlek ile Akdeniz tarzı bir şıklık, slim jean ve beyaz gömlek ile casual-chic bir tarz elde edilir. Bu ayakkabı, o özel bir şeyin olduğunu söyleyen modele sahip olmak için doğru fırsattır.",
        features: ["Hakiki Süet Üst Yüzey","El İşçiliği Süet Düğüm Detayı","Slip-On Konfor","Hafif Kauçuk Alt Taban","Deri Astar"],
        styling: ["Slim krem chino + lacivert polo gömlek + saat","Slim jean + beyaz önlü gömlek + hafif ceket","Bej linen pantolon + beyaz tişört"]
      },
      en: {
        shortDescription: "Suede knot-detail loafer — the most refined interpretation of everyday elegance.",
        description: "A knot carries thousands of years of history — Suede Knot Loafer brings the iconic tassel of the classic bit loafer into the present, reimagined in soft suede. The hand-crafted suede knot is the model's signature and its undisputed distinguishing feature. An ultra-light rubber sole supports on long walks and hard paving. Chinos and a polo shirt for Mediterranean-style sophistication, slim jeans and a white shirt for a casual-chic look. This shoe is the right opportunity to own a model that says something special is going on.",
        features: ["Genuine Suede Upper","Hand-Crafted Suede Knot Detail","Slip-On Comfort","Lightweight Rubber Outsole","Leather Lining"],
        styling: ["Slim cream chinos + navy polo shirt + watch","Slim jeans + white button shirt + light jacket","Beige linen trousers + white tee"]
      },
      de: {
        shortDescription: "Wildleder-Knoten-Loafer — die raffinierteste Interpretation alltäglicher Eleganz.",
        description: "Ein Knoten trägt tausende Jahre Geschichte — der Suede Knot Loafer bringt die ikonische Quaste des klassischen Bit-Loafers in die Gegenwart, neu interpretiert in weichem Wildleder. Der handgefertigte Wildleder-Knoten ist die Unterschrift des Modells und sein unbestrittenes Unterscheidungsmerkmal. Eine ultraleichte Gummisohle unterstützt bei langen Spaziergängen und hartem Pflaster.",
        features: ["Echtes Wildleder-Obermaterial","Handgefertigtes Wildleder-Knoten-Detail","Slip-On Komfort","Leichte Gummiaußensohle","Lederfutter"],
        styling: ["Slim cremefarbene Chino + Marine-Poloshirt + Uhr","Slim Jeans + weißes Knopfhemd + leichte Jacke","Beige Leinenhose + weißes T-Shirt"]
      },
      it: {
        shortDescription: "Loafer scamosciato con dettaglio nodo — l'interpretazione più raffinata dell'eleganza quotidiana.",
        description: "Un nodo porta migliaia di anni di storia — il Suede Knot Loafer porta l'iconica nappa del classico bit loafer nel presente, reinterpretata in camoscio morbido. Il nodo in camoscio lavorato a mano è la firma del modello e la sua incontestabile caratteristica distintiva. Una suola in gomma ultra-leggera supporta nelle lunghe passeggiate e sui selciati duri.",
        features: ["Tomaia in Vera Pelle Scamosciata","Dettaglio Nodo in Camoscio Lavorato a Mano","Comfort Slip-On","Suola Esterna in Gomma Leggera","Fodera in Pelle"],
        styling: ["Chino slim crema + polo navy + orologio","Jeans slim + camicia bianca con bottoni + giacca leggera","Pantaloni di lino beige + t-shirt bianca"]
      },
      ar: {
        shortDescription: "لوفر سويدي بتفصيل عقدة — أكثر التفسيرات رقياً للأناقة اليومية.",
        description: "عقدة تحمل آلاف السنين من التاريخ — يجلب Suede Knot Loafer شرابة اللوفر الكلاسيكية الأيقونية إلى الحاضر، مُعاد تفسيرها بسويد ناعم. العقدة السويدية المصنوعة يدوياً هي توقيع الموديل وميزته المميزة التي لا جدال فيها. نعل مطاطي خفيف الوزن يدعم في المشي الطويل والأرصفة الصلبة.",
        features: ["جزء علوي من سويدي أصيل","تفصيل عقدة سويدية مصنوعة يدوياً","راحة سليب-أون","نعل خارجي مطاطي خفيف","بطانة جلدية"],
        styling: ["شينو كريمي ضيق + بولو أزرق بحري + ساعة","جينز ضيق + قميص أبيض بأزرار + جاكيت خفيف","بنطال كتاني بيج + تيشرت أبيض"]
      },
      ru: {
        shortDescription: "Замшевый лоафер с узлом — самая изысканная интерпретация повседневной элегантности.",
        description: "Узел несёт тысячи лет истории — Suede Knot Loafer переносит иконический помпон классического бит-лоафера в настоящее, переосмысленный в мягкой замше. Замшевый узел ручной работы — подпись модели и её бесспорная отличительная черта. Ультралёгкая резиновая подошва поддерживает при длительных прогулках и по твёрдым покрытиям.",
        features: ["Верх из натуральной замши","Деталь замшевого узла ручной работы","Комфорт Slip-On","Лёгкая резиновая подошва","Кожаная подкладка"],
        styling: ["Кремовые зауженные чино + рубашка-поло цвета морской волны + часы","Зауженные джинсы + белая рубашка на пуговицах + лёгкий пиджак","Бежевые льняные брюки + белая футболка"]
      }
    },
    metaTitle: {
      tr: "Suede Knot Loafer Erkek Ayakkabı | Neri Shoes",
      en: "Suede Knot Loafer Men's Shoe | Neri Shoes",
      de: "Suede Knot Loafer Herrenschuh | Neri Shoes",
      it: "Suede Knot Loafer Scarpa Uomo | Neri Shoes",
      ar: "Suede Knot Loafer حذاء رجالي | Neri Shoes",
      ru: "Suede Knot Loafer Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Suede Knot Loafer — hakiki süet ve el işçiliği düğüm detaylı loafer. Neri Shoes günlük koleksiyonu.",
      en: "Suede Knot Loafer — genuine suede and hand-crafted knot detail loafer. Neri Shoes everyday collection.",
      de: "Suede Knot Loafer — echtes Wildleder und handgefertigtes Knoten-Detail Loafer. Neri Shoes Alltagskollektion.",
      it: "Suede Knot Loafer — vera pelle scamosciata e loafer con dettaglio nodo lavorato a mano. Collezione quotidiana Neri Shoes.",
      ar: "Suede Knot Loafer — سويدي أصيل ولوفر بتفصيل عقدة مصنوعة يدوياً. مجموعة Neri Shoes اليومية.",
      ru: "Suede Knot Loafer — натуральная замша и лоафер с деталью узла ручной работы. Коллекция Neri Shoes для повседневной носки."
    }
  },

  "volcano-stealth": {
    content: {
      tr: {
        shortDescription: "Volkanik kauçuk taban ve stealth profil — spor ayakkabıda yeni çubuk.",
        description: "Volkan patlamaz, yürür — Volcano Stealth, adındaki gücü her adıma aktarır. Yüksek profilli volkanik yapıdan ilham alınan alt taban, olağanüstü kavrayış ve darbe emme kapasitesiyle diğer spor modellerin önüne geçer. Stealth tasarım felsefesiyle üst yüzey minimal tutulmuş, ancak taban enerji dolu; görsel dengenin tam tersi bir enerji hissi yaratır. Şehir koşusundan trail yürüyüşe, spor salonundan şehir içi kullanıma kadar çalışır. Bu tabana sahip olduğunda diğer spor ayakkabıların tabanına bakış açın değişir.",
        features: ["Volkan İlhamlı Yüksek Profil Kauçuk Taban","Stealth Minimal Üst Yüzey","Trail-Ready Kavrayış Noktaları","Hafif EVA Ara Taban","Nefes Alabilir Mesh Üst"],
        styling: ["Tech fleece pantolon + spor tişört","Trail şort + uzun kollu sıkı fit","Track suit + beyaz çorap + spor çanta"]
      },
      en: {
        shortDescription: "Volcanic rubber sole and stealth profile — a new benchmark in sport footwear.",
        description: "The volcano doesn't explode — it walks. Volcano Stealth transfers the power in its name to every step. The outsole, inspired by high-profile volcanic structures, leads other sport models with extraordinary grip and impact absorption. The upper is kept minimal through a stealth design philosophy, yet the sole is full of energy — creating a sensation that is the opposite of what the eye suggests. Works from city running to trail walking, from the gym to everyday urban use. Once you have this sole underfoot, your perspective on every other sport shoe changes.",
        features: ["Volcano-Inspired High-Profile Rubber Sole","Stealth Minimal Upper","Trail-Ready Grip Points","Lightweight EVA Midsole","Breathable Mesh Upper"],
        styling: ["Tech fleece joggers + sport tee","Trail shorts + long-sleeve fitted top","Track suit + white socks + sport bag"]
      },
      de: {
        shortDescription: "Vulkanische Gummisohle und Stealth-Profil — ein neuer Maßstab im Sportschuh.",
        description: "Der Vulkan explodiert nicht — er geht. Volcano Stealth überträgt die Kraft in seinem Namen auf jeden Schritt. Die von Hochprofil-Vulkanstrukturen inspirierte Außensohle führt andere Sportmodelle mit außergewöhnlichem Grip und Stoßdämpfung an. Das Obermaterial wird durch eine Stealth-Designphilosophie minimal gehalten, während die Sohle energiegeladen ist.",
        features: ["Vulkan-Inspirierte Hochprofil-Gummisohle","Stealth Minimales Obermaterial","Trail-Bereite Griffpunkte","Leichte EVA-Zwischensohle","Atmungsaktives Mesh-Obermaterial"],
        styling: ["Tech-Fleece-Hose + Sport-T-Shirt","Trail-Shorts + Langärmliges eng anliegendes Oberteil","Trainingsanzug + weiße Socken + Sporttasche"]
      },
      it: {
        shortDescription: "Suola in gomma vulcanica e profilo stealth — un nuovo punto di riferimento nella calzatura sportiva.",
        description: "Il vulcano non esplode — cammina. Volcano Stealth trasferisce la potenza del suo nome ad ogni passo. La suola esterna, ispirata alle strutture vulcaniche ad alto profilo, supera gli altri modelli sportivi con una presa e un'ammortizzazione straordinarie. La tomaia è mantenuta minimale attraverso una filosofia di design stealth, mentre la suola è piena di energia.",
        features: ["Suola in Gomma ad Alto Profilo Ispirata al Vulcano","Tomaia Stealth Minimale","Punti di Presa Pronti per il Trail","Intersuola EVA Leggera","Tomaia in Mesh Traspirante"],
        styling: ["Pantaloni tech fleece + t-shirt sportiva","Pantaloncini trail + top a maniche lunghe attillato","Tuta + calzini bianchi + borsa sportiva"]
      },
      ar: {
        shortDescription: "نعل مطاطي بركاني وملف ستيلث — معيار جديد في الأحذية الرياضية.",
        description: "البركان لا ينفجر — يمشي. ينقل Volcano Stealth القوة الموجودة في اسمه إلى كل خطوة. النعل الخارجي المستوحى من التركيبات البركانية عالية الملف يتفوق على الموديلات الرياضية الأخرى بقدرة قبض واستيعاب صدمات استثنائية. الجزء العلوي بسيط بفلسفة التصميم الخفي، لكن النعل مليء بالطاقة.",
        features: ["نعل مطاطي عالي الملف مستوحى من البركان","جزء علوي ستيلث بسيط","نقاط قبض جاهزة للتراك","وسيط EVA خفيف","جزء علوي شبكي قابل للتنفس"],
        styling: ["بنطال تيك فليس + تيشرت رياضي","شورت تراك + قميص طويل الأكمام محكم","بدلة رياضية + جوارب بيضاء + حقيبة رياضية"]
      },
      ru: {
        shortDescription: "Вулканическая резиновая подошва и стелс-профиль — новый эталон в спортивной обуви.",
        description: "Вулкан не взрывается — он ходит. Volcano Stealth передаёт силу своего названия каждому шагу. Подошва, вдохновлённая высокопрофильными вулканическими структурами, превосходит другие спортивные модели исключительным сцеплением и амортизацией. Верх выдержан в минимализме через стелс-философию дизайна, но подошва полна энергии.",
        features: ["Высокопрофильная резиновая подошва в духе вулкана","Минималистичный стелс-верх","Точки сцепления для трейла","Лёгкая промежуточная подошва EVA","Дышащий сетчатый верх"],
        styling: ["Джоггеры tech fleece + спортивная футболка","Шорты для трейла + облегающий лонгслив","Спортивный костюм + белые носки + спортивная сумка"]
      }
    },
    metaTitle: {
      tr: "Volcano Stealth Erkek Spor Ayakkabı | Neri Shoes",
      en: "Volcano Stealth Men's Sport Shoe | Neri Shoes",
      de: "Volcano Stealth Herren Sportschuh | Neri Shoes",
      it: "Volcano Stealth Scarpa Sportiva Uomo | Neri Shoes",
      ar: "Volcano Stealth حذاء رياضي رجالي | Neri Shoes",
      ru: "Volcano Stealth Мужские спортивные кроссовки | Neri Shoes"
    },
    metaDescription: {
      tr: "Volcano Stealth — volkan ilhamlı kauçuk taban, minimal stealth tasarım spor ayakkabı. Neri Shoes koleksiyonu.",
      en: "Volcano Stealth — volcano-inspired rubber sole, minimal stealth design sport shoe. Neri Shoes collection.",
      de: "Volcano Stealth — vulkan-inspirierte Gummisohle, minimales Stealth-Design Sportschuh. Neri Shoes Kollektion.",
      it: "Volcano Stealth — suola in gomma ispirata al vulcano, scarpa sportiva design stealth minimale. Collezione Neri Shoes.",
      ar: "Volcano Stealth — نعل مطاطي مستوحى من البركان وحذاء رياضي بتصميم ستيلث بسيط. مجموعة Neri Shoes.",
      ru: "Volcano Stealth — резиновая подошва в духе вулкана, кроссовки с минималистичным стелс-дизайном. Коллекция Neri Shoes."
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
