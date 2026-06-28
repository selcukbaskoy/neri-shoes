const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "prestige-leather-suet": {
    content: {
      tr: {
        shortDescription: "Prestij seviyesinde süet — yumuşak dokunuş, güçlü izlenim.",
        description: "Süetin en üst hali — Prestige Leather Süet, sıradan süet modellerinden farklı olarak premium kalite standartlarında üretilir. Seçilmiş ince taneli nubuck süet, parmak darbelerine ve neme karşı işlenmiş özel kaplama sayesinde uzun ömürlüdür. Ayağa oturuşu yapısal olarak sağlamdır; günün sonunda da ilk giyildiği andaki formunu korur. Casual bir yemek davetinde veya rahat bir iş ortamında, slim pantolon ve katmanlı üst giysilerle mükemmel uyum sağlar. Süeti hafife alanlar bu modeli giyene kadar haksız kalır.",
        features: ["Premium Nubuck Süet","Nem Koruyucu Özel Kaplama","Yapısal Kalıp Desteği","Hafif Neolit Taban","Deri Astar"],
        styling: ["Koyu slim pantolon + knit kazak","Bej chino + açık renkli gömlek + ceket","Orta gri slim jean + koyu oversize tişört"]
      },
      en: {
        shortDescription: "Prestige-level suede — soft touch, powerful impression.",
        description: "The finest expression of suede — Prestige Leather Suede is manufactured to premium quality standards that set it apart from ordinary suede models. The selected fine-grain nubuck suede is long-lasting thanks to a specially treated coating that resists scuffs and moisture. Its structural fit is firm; it holds its shape at the end of the day just as it did when first put on. At a casual dinner or a relaxed work environment, it pairs perfectly with slim trousers and layered tops. Those who underestimate suede will be proved wrong the moment they wear this model.",
        features: ["Premium Nubuck Suede","Moisture-Resistant Special Coating","Structural Last Support","Lightweight Neolite Sole","Leather Lining"],
        styling: ["Dark slim trousers + knit sweater","Beige chinos + light shirt + blazer","Mid-grey slim jeans + dark oversized tee"]
      },
      de: {
        shortDescription: "Wildleder auf Prestige-Niveau — weiche Berührung, starker Eindruck.",
        description: "Der feinste Ausdruck von Wildleder — Prestige Leather Wildleder wird nach Premium-Qualitätsstandards gefertigt, die es von gewöhnlichen Wildleder-Modellen abheben. Das ausgewählte feinkörnige Nubuk-Wildleder ist langlebig dank einer speziell behandelten Beschichtung, die Kratzer und Feuchtigkeit widersteht. Seine strukturelle Passform ist fest; es behält seine Form am Ende des Tages genau wie beim ersten Anziehen.",
        features: ["Premium Nubuk-Wildleder","Feuchtigkeitsresistente Spezialschicht","Strukturelle Leisten-Unterstützung","Leichte Neolite-Sohle","Lederfutter"],
        styling: ["Dunkle Slim-Hose + Strickpullover","Beige Chino + helles Hemd + Blazer","Mittelgrauer Slim-Jeans + dunkles Oversized-T-Shirt"]
      },
      it: {
        shortDescription: "Camoscio a livello prestige — tocco morbido, impressione potente.",
        description: "La forma più fine del camoscio — il Prestige Leather Scamosciato è prodotto secondo standard di qualità premium che lo distinguono dai modelli scamosciati ordinari. Il camoscio nubuck a grana fine selezionato è durevole grazie a un rivestimento speciale resistente ai graffi e all'umidità. La sua vestibilità strutturale è solida; mantiene la sua forma alla fine della giornata proprio come quando è stato indossato per la prima volta.",
        features: ["Camoscio Nubuck Premium","Rivestimento Speciale Resistente all'Umidità","Supporto Forma Strutturale","Suola Neolite Leggera","Fodera in Pelle"],
        styling: ["Pantaloni slim scuri + maglione","Chino beige + camicia chiara + blazer","Jeans slim grigio medio + t-shirt oversize scura"]
      },
      ar: {
        shortDescription: "سويدي بمستوى المرموق — لمسة ناعمة وانطباع قوي.",
        description: "أرقى تعبير عن السويد — يُنتج Prestige Leather Suede وفق معايير جودة ممتازة تميزه عن موديلات السويد العادية. سويد النوباك ناعم الحبيبات المختار متين بفضل طلاء خاص معالج يقاوم الخدوش والرطوبة. قالبه الهيكلي صلب؛ يحتفظ بشكله في نهاية اليوم تماماً كما كان عند الارتداء للمرة الأولى.",
        features: ["سويدي نوباك ممتاز","طلاء خاص مقاوم للرطوبة","دعم قالب هيكلي","نعل نيوليت خفيف","بطانة جلدية"],
        styling: ["بنطال داكن ضيق + كنزة محبوكة","شينو بيج + قميص فاتح + بليزر","جينز رمادي متوسط ضيق + تيشرت داكن أوفر سايز"]
      },
      ru: {
        shortDescription: "Замша уровня престиж — мягкое прикосновение, мощное впечатление.",
        description: "Лучшее воплощение замши — Prestige Leather Замша производится по стандартам премиального качества, отличающим её от обычных замшевых моделей. Отборная мелкозернистая замша нубук долговечна благодаря специально обработанному покрытию, устойчивому к царапинам и влаге. Структурная посадка прочная; она сохраняет форму в конце дня так же, как при первом надевании.",
        features: ["Премиальная замша нубук","Специальное покрытие с защитой от влаги","Структурная поддержка колодки","Лёгкая подошва Neolite","Кожаная подкладка"],
        styling: ["Тёмные зауженные брюки + вязаный свитер","Бежевые чино + светлая рубашка + пиджак","Серые зауженные джинсы + тёмная оверсайз футболка"]
      }
    },
    metaTitle: {
      tr: "Prestige Leather Süet Erkek Ayakkabı | Neri Shoes",
      en: "Prestige Leather Suede Men's Shoe | Neri Shoes",
      de: "Prestige Leather Wildleder Herrenschuh | Neri Shoes",
      it: "Prestige Leather Scamosciato Scarpa Uomo | Neri Shoes",
      ar: "Prestige Leather Suede حذاء رجالي | Neri Shoes",
      ru: "Prestige Leather Замша Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Prestige Leather Süet — premium nubuck süet, nem koruyucu kaplama. Neri Shoes prestij erkek ayakkabı koleksiyonu.",
      en: "Prestige Leather Suede — premium nubuck suede, moisture-resistant coating. Neri Shoes prestige men's shoe collection.",
      de: "Prestige Leather Wildleder — Premium Nubuk-Wildleder, feuchtigkeitsresistente Schicht. Neri Shoes Prestige-Herrenschuhkollektion.",
      it: "Prestige Leather Scamosciato — camoscio nubuck premium, rivestimento resistente all'umidità. Collezione scarpe uomo prestige Neri Shoes.",
      ar: "Prestige Leather Suede — سويدي نوباك ممتاز وطلاء مقاوم للرطوبة. مجموعة أحذية رجالية مرموقة من Neri Shoes.",
      ru: "Prestige Leather Замша — премиальная замша нубук, покрытие с защитой от влаги. Престижная коллекция мужской обуви Neri Shoes."
    }
  },

  "soft-luxe-driver": {
    content: {
      tr: {
        shortDescription: "Yumuşak lüks deri driver loafer — ayağınıza sarılır, sizi taşır.",
        description: "Yumuşak deri sarılır, hafif kauçuk taşır — Soft Luxe Driver, klasik driving moccasin'in lüks bir yorumudur. Özel işlenmiş yumuşak nappa deri üst yapısı, ayak formuna göre şekillenir ve zamanla mükemmel bir oturum sağlar. Altında yer alan granül kauçuk nopalar, araç içinde, yat güvertesinde veya kaldırım taşlarında aynı kavrayışı sunar. Chino veya slim jean ile hafta sonu rahatı, keten pantolon ve önlü gömlek ile yazlık şıklık elde edilir. Bu ayakkabıyı giyenler çoğu günlük modeli geride bırakır.",
        features: ["Nappa Yumuşak Hakiki Deri","Granül Kauçuk Nopa Taban","Slip-On Driver Tasarımı","Tam Deri Astar","Lastikli Bilek Bantı"],
        styling: ["Slim bej keten pantolon + beyaz önlü gömlek + saat","Açık renkli chino + polo gömlek","Slim jean + keten önlü gömlek"]
      },
      en: {
        shortDescription: "Soft luxury leather driver loafer — it wraps your foot and carries you.",
        description: "Soft leather wraps, light rubber carries — Soft Luxe Driver is a luxury interpretation of the classic driving moccasin. The specially treated soft nappa leather upper moulds to the foot's shape and delivers a perfect fit over time. The granule rubber nubs underneath offer the same grip in the car, on a yacht deck or over cobblestones. Chinos or slim jeans for weekend ease, linen trousers and a button shirt for summer sophistication. Those who wear this shoe leave most casual models behind.",
        features: ["Nappa Soft Genuine Leather","Granule Rubber Nub Sole","Slip-On Driver Design","Full Leather Lining","Elastic Ankle Band"],
        styling: ["Slim beige linen trousers + white button shirt + watch","Light chinos + polo shirt","Slim jeans + linen button shirt"]
      },
      de: {
        shortDescription: "Soft-Luxus-Leder-Driver-Loafer — er umhüllt deinen Fuß und trägt dich.",
        description: "Weiches Leder umhüllt, leichter Gummi trägt — der Soft Luxe Driver ist eine Luxusinterpretation des klassischen Driving-Mokassins. Das speziell behandelte weiche Nappa-Leder-Obermaterial passt sich der Fußform an und bietet mit der Zeit eine perfekte Passform. Die darunter liegenden Granulat-Gummi-Noppen bieten denselben Grip im Auto, auf dem Yachtdeck oder auf Kopfsteinpflaster.",
        features: ["Nappa Weiches Echtleder","Granulat-Gummi-Noppen-Sohle","Slip-On Driver Design","Vollständiges Lederfutter","Elastisches Knöchelband"],
        styling: ["Slim beige Leinenhose + weißes Knopfhemd + Uhr","Helle Chinos + Poloshirt","Slim Jeans + Leinenknopfhemd"]
      },
      it: {
        shortDescription: "Mocassino driver in pelle morbida di lusso — abbraccia il piede e ti porta.",
        description: "La pelle morbida avvolge, la gomma leggera porta — il Soft Luxe Driver è un'interpretazione di lusso del classico mocassino da guida. La tomaia in pelle nappa morbida appositamente trattata si modella alla forma del piede e garantisce una vestibilità perfetta nel tempo. I nodi in gomma granulare offrono la stessa presa in auto, sul ponte di uno yacht o sui ciottoli.",
        features: ["Vera Pelle Nappa Morbida","Suola con Nodi in Gomma Granulare","Design Slip-On Driver","Fodera Completa in Pelle","Fascia Elastica alla Caviglia"],
        styling: ["Pantaloni slim beige di lino + camicia bianca con bottoni + orologio","Chino chiari + polo","Jeans slim + camicia di lino con bottoni"]
      },
      ar: {
        shortDescription: "لوفر درايفر من جلد فاخر ناعم — يلتف حول قدمك ويحملك.",
        description: "الجلد الناعم يلتف والمطاط الخفيف يحمل — Soft Luxe Driver تفسير فاخر للموكاسين القيادي الكلاسيكي. الجزء العلوي من جلد النابا الناعم المعالج خصيصاً يتشكّل وفق شكل القدم ويوفر ملاءمة مثالية مع الوقت. حبيبات المطاط السفلية تقدم نفس القبضة داخل السيارة أو على سطح اليخت أو على الحجارة.",
        features: ["جلد نابا أصيل ناعم","نعل بحبيبات مطاطية","تصميم سليب-أون درايفر","بطانة جلدية كاملة","شريط كاحل مطاطي"],
        styling: ["بنطال كتاني بيج ضيق + قميص أبيض بأزرار + ساعة","شينو فاتح + بولو","جينز ضيق + قميص كتاني بأزرار"]
      },
      ru: {
        shortDescription: "Мягкий люкс кожаный лоафер-драйвер — обнимает ногу и несёт тебя.",
        description: "Мягкая кожа обнимает, лёгкая резина несёт — Soft Luxe Driver — роскошная интерпретация классического мокасина для вождения. Верх из специально обработанной мягкой кожи наппа принимает форму стопы и со временем обеспечивает идеальную посадку. Гранулированные резиновые шипы снизу обеспечивают одинаковое сцепление в автомобиле, на палубе яхты или на брусчатке.",
        features: ["Мягкая натуральная кожа наппа","Подошва с резиновыми шипами","Конструкция Slip-On Driver","Полная кожаная подкладка","Эластичная манжета у щиколотки"],
        styling: ["Бежевые зауженные льняные брюки + белая рубашка на пуговицах + часы","Светлые чино + рубашка-поло","Зауженные джинсы + льняная рубашка на пуговицах"]
      }
    },
    metaTitle: {
      tr: "Soft Luxe Driver Günlük Erkek Ayakkabı | Neri Shoes",
      en: "Soft Luxe Driver Casual Men's Shoe | Neri Shoes",
      de: "Soft Luxe Driver Alltagsschuh Herren | Neri Shoes",
      it: "Soft Luxe Driver Scarpa Casual Uomo | Neri Shoes",
      ar: "Soft Luxe Driver حذاء رجالي كاجوال | Neri Shoes",
      ru: "Soft Luxe Driver Повседневная мужская обувь | Neri Shoes"
    },
    metaDescription: {
      tr: "Soft Luxe Driver — nappa yumuşak deri, granül kauçuk nopa taban driving loafer. Neri Shoes günlük lüks koleksiyonu.",
      en: "Soft Luxe Driver — nappa soft leather, granule rubber nub sole driving loafer. Neri Shoes everyday luxury collection.",
      de: "Soft Luxe Driver — Nappa-Weiches Leder, Granulat-Gummi-Noppen-Sohle Driving-Loafer. Neri Shoes Alltags-Luxuskollektion.",
      it: "Soft Luxe Driver — pelle nappa morbida, suola con nodi in gomma granulare driving loafer. Collezione lusso quotidiano Neri Shoes.",
      ar: "Soft Luxe Driver — جلد نابا ناعم ونعل بحبيبات مطاطية درايفر لوفر. مجموعة Neri Shoes اليومية الفاخرة.",
      ru: "Soft Luxe Driver — мягкая кожа наппа, подошва с резиновыми шипами, лоафер-драйвер. Коллекция повседневной роскоши Neri Shoes."
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
