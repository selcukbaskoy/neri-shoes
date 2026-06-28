const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "4919-suet-duz-deriler": {
    content: {
      tr: {
        shortDescription: "Düz kesim süet deri — minimalist maskülenliğin saf hali.",
        description: "Az söyleyen, çok anlatan bir tasarım — 4919 Süet Düz Deriler, gereksiz detaylardan arındırılmış saf süet güzelliğini sunar. İnce taneli doğal süet yüzey, her ışıkta farklı bir derinlik kazanır ve dokunuşu ipek gibi hissettir. Gündelik şıklık arayanlar için mükemmel bir gün boyu modeli; ofisten akşam yemeğine geçerken forma sokmadan taşır. Koyu renk pantolon ve katmanlı bir üst giysiyle şık, açık renk pantolon ve basic tişörtle rahat bir kombin oluşturur. Doğru süet bakımıyla bu ayakkabı senin imzan olur.",
        features: ["İnce Taneli Hakiki Süet","Düz Kesim Klasik Form","Hafif Kauçuk Alt Taban","Nefes Alabilir Tekstil Astar","Bağcıksız Slip-on Seçenek"],
        styling: ["Siyah slim pantolon + beyaz oversize tişört","Koyu kahve chino + krem balıkçı yaka kazak","Açık gri jean + beyaz oxford gömlek"]
      },
      en: {
        shortDescription: "Flat-cut suede leather — pure minimalist masculinity.",
        description: "Says little, means everything — 4919 Flat Suede Leather offers pure suede beauty stripped of unnecessary detail. The fine-grain natural suede surface catches different depths in every light and feels like silk to the touch. The perfect all-day model for those seeking everyday elegance; transitions effortlessly from office to dinner without losing shape. Dark trousers with layered tops for a sharp look, light trousers with a basic tee for relaxed ease. With proper suede care, this shoe becomes your signature.",
        features: ["Fine-Grain Genuine Suede","Flat-Cut Classic Form","Lightweight Rubber Outsole","Breathable Textile Lining","Laceless Slip-On Option"],
        styling: ["Black slim trousers + white oversized tee","Dark brown chinos + cream rollneck sweater","Light grey jeans + white oxford shirt"]
      },
      de: {
        shortDescription: "Flachschnitt-Wildleder — reine minimalistische Männlichkeit.",
        description: "Sagt wenig, bedeutet alles — die 4919 Flach-Wildleder-Schuhe bieten pure Wildleder-Schönheit ohne unnötige Details. Die feinkörnige natürliche Wildleder-Oberfläche gewinnt in jedem Licht eine andere Tiefe und fühlt sich seidig an. Das perfekte Ganztages-Modell für alle, die alltägliche Eleganz suchen; wechselt mühelos vom Büro zum Abendessen. Dunkle Hosen mit schichtenartigem Oberteil für einen smarten Look, helle Hosen mit einem Basic-Shirt für entspannte Lässigkeit.",
        features: ["Feinkörniges Echtes Wildleder","Flachschnitt Klassische Form","Leichte Gummiaußensohle","Atmungsaktives Textilfutter","Schnürlose Slip-On Option"],
        styling: ["Schwarze Slim-Hose + weißes Oversized-T-Shirt","Dunkelbraunes Chino + cremefarbener Rollkragenpullover","Hellgraue Jeans + weißes Oxford-Hemd"]
      },
      it: {
        shortDescription: "Pelle scamosciata taglio piatto — mascolinità minimalista pura.",
        description: "Dice poco, significa tutto — il 4919 Pelle Scamosciata Piatta offre la bellezza pura del camoscio senza dettagli superflui. La superficie in camoscio naturale a grana fine acquisisce una profondità diversa in ogni luce e al tatto sembra seta. Il modello perfetto per tutto il giorno per chi cerca l'eleganza quotidiana; passa dall'ufficio alla cena senza perdere forma. Pantaloni scuri con strati sopra per un look elegante, pantaloni chiari con una t-shirt per la comodità rilassata.",
        features: ["Vera Pelle Scamosciata a Grana Fine","Forma Classica Taglio Piatto","Suola Esterna Leggera in Gomma","Fodera Tessile Traspirante","Opzione Slip-On Senza Lacci"],
        styling: ["Pantaloni slim neri + t-shirt oversize bianca","Chino marrone scuro + maglione dolcevita crema","Jeans grigio chiaro + camicia oxford bianca"]
      },
      ar: {
        shortDescription: "جلد سويدي قطع مسطح — رجولة مينيماليست خالصة.",
        description: "يقول القليل ويعني الكثير — يقدم 4919 الجلد السويدي المسطح جمال السويد الخالص مجرداً من التفاصيل غير الضرورية. تكتسب السطح الطبيعي السويدي ناعم الحبيبات عمقاً مختلفاً في كل ضوء ويلمس كالحرير. النموذج المثالي ليوم كامل لمن يبحث عن الأناقة اليومية؛ ينتقل من المكتب إلى العشاء دون فقدان شكله. البنطال الداكن مع طبقات الأعلى لإطلالة أنيقة، والبنطال الفاتح مع تيشرت بيسك للراحة.",
        features: ["سويدي أصيل ناعم الحبيبات","شكل كلاسيكي قطع مسطح","نعل خارجي مطاطي خفيف","بطانة نسيجية قابلة للتنفس","خيار سليب-أون بدون أربطة"],
        styling: ["بنطال أسود ضيق + تيشرت أبيض أوفر سايز","شينو بني داكن + كنزة رقبة لفافة كريمية","جينز رمادي فاتح + قميص أكسفورد أبيض"]
      },
      ru: {
        shortDescription: "Замша плоского кроя — чистая минималистичная мужественность.",
        description: "Говорит мало, значит много — 4919 Плоская замша предлагает чистую красоту замши без лишних деталей. Мелкозернистая натуральная замшевая поверхность приобретает разную глубину при каждом освещении и на ощупь как шёлк. Идеальная модель на весь день для тех, кто ищет повседневную элегантность; переходит от офиса к ужину без потери формы. Тёмные брюки с многослойным верхом для стильного образа, светлые брюки с базовой футболкой для расслабленного стиля.",
        features: ["Натуральная замша мелкого зерна","Классическая форма плоского кроя","Лёгкая резиновая подошва","Дышащая текстильная подкладка","Слипоны без шнурков"],
        styling: ["Чёрные зауженные брюки + белая оверсайз футболка","Тёмно-коричневые чино + кремовая водолазка","Светло-серые джинсы + белая оксфордская рубашка"]
      }
    },
    metaTitle: {
      tr: "4919 Süet Düz Erkek Ayakkabı | Neri Shoes",
      en: "4919 Flat Suede Men's Shoe | Neri Shoes",
      de: "4919 Flach Wildleder Herrenschuh | Neri Shoes",
      it: "4919 Pelle Scamosciata Piatta Uomo | Neri Shoes",
      ar: "4919 سويدي مسطح حذاء رجالي | Neri Shoes",
      ru: "4919 Замша плоского кроя Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "4919 Süet Düz Deriler — ince taneli hakiki süet ve minimalist kesim. Neri Shoes erkek ayakkabı koleksiyonu Adana.",
      en: "4919 Flat Suede Leather — fine-grain genuine suede and minimalist cut. Neri Shoes men's shoe collection.",
      de: "4919 Flach-Wildleder — feinkörniges echtes Wildleder und minimalistischer Schnitt. Neri Shoes Herrenschuh-Kollektion.",
      it: "4919 Pelle Scamosciata Piatta — vera pelle scamosciata a grana fine e taglio minimalista. Collezione scarpe uomo Neri Shoes.",
      ar: "4919 الجلد السويدي المسطح — سويدي أصيل ناعم الحبيبات وقطع مينيماليست. مجموعة أحذية رجالية Neri Shoes.",
      ru: "4919 Плоская замша — натуральная замша мелкого зерна и минималистичный крой. Коллекция мужской обуви Neri Shoes."
    }
  },

  "4920-suet-deri": {
    content: {
      tr: {
        shortDescription: "Süet ve pürüzsüz deri kombinasyonu — iki dünyanın en iyisi.",
        description: "Süet yumuşaklığı, derinin gücü — 4920, iki malzemeyi tek tasarımda ustaca harmanlıyor. Burnunda pürüzsüz deri, yanda ve ökçede ince süet kullanımı, görsel bir kontrast ve zengin bir tekstür oyunu yaratır. Bu iki malzeme kombinasyonu modelin hem günlük hem de yarı resmi ortamlarda kullanılabilmesini sağlar. Koyu jins ve polo gömlek ile rahat bir weekend stili, slim chino ve önlü gömlek ile ofis şıklığı elde edersin. Kaliteyi yakından hissetmek isteyenler için biçilmiş kaftan.",
        features: ["Pürüzsüz Hakiki Deri + Süet Kombinasyon","Dual-Texture Tasarım","Hafif Neolit Taban","Deri İç Astar","El Dikişi Detaylar"],
        styling: ["Koyu indigo jean + slim polo gömlek","Antrasit chino + açık renk knit kazak","Siyah slim pantolon + koyu gömlek"]
      },
      en: {
        shortDescription: "Smooth leather and suede combination — the best of both worlds.",
        description: "Suede softness, leather's strength — 4920 masterfully blends two materials in a single design. Smooth leather at the toe, fine suede at the sides and heel, creates a visual contrast and a rich texture play. This dual-material combination makes the model suitable for both casual and semi-formal settings. Dark jeans and a polo shirt for a relaxed weekend look, slim chinos and a button shirt for office elegance. Made for those who want to feel quality up close.",
        features: ["Smooth Genuine Leather + Suede Combination","Dual-Texture Design","Lightweight Neolite Sole","Leather Inner Lining","Hand-Stitched Details"],
        styling: ["Dark indigo jeans + slim polo shirt","Anthracite chinos + light knit sweater","Black slim trousers + dark shirt"]
      },
      de: {
        shortDescription: "Glattem Leder und Wildleder Kombination — das Beste aus beiden Welten.",
        description: "Wildleder-Weichheit, Lederstärke — 4920 vereint geschickt zwei Materialien in einem Design. Glattes Leder an der Zehenspitze, feines Wildleder an den Seiten und der Ferse, schafft einen visuellen Kontrast und ein reiches Texturspiel. Diese Dual-Material-Kombination macht das Modell sowohl für Alltag als auch für halbformelle Anlässe geeignet. Dunkle Jeans und ein Poloshirt für einen entspannten Wochenend-Look, Slim-Chino und Knopfhemd für Büroeleganz.",
        features: ["Glattes Echtes Leder + Wildleder Kombination","Dual-Texture Design","Leichte Neolite-Sohle","Leder-Innenfutter","Handgenähte Details"],
        styling: ["Dunkle Indigo-Jeans + Slim-Poloshirt","Anthrazit-Chino + Helles Strickpullover","Schwarze Slim-Hose + Dunkles Hemd"]
      },
      it: {
        shortDescription: "Combinazione pelle liscia e scamosciata — il meglio di entrambi i mondi.",
        description: "La morbidezza del camoscio, la forza della pelle — il 4920 unisce magistralmente due materiali in un unico design. Pelle liscia sulla punta, camoscio fine sui lati e sul tacco, crea un contrasto visivo e un ricco gioco di texture. Questa combinazione dual-material rende il modello adatto sia per l'uso quotidiano che per occasioni semi-formali. Jeans scuri e polo per un look weekend rilassato, chino slim e camicia per l'eleganza in ufficio.",
        features: ["Vera Pelle Liscia + Combinazione Scamosciata","Design Dual-Texture","Suola Neolite Leggera","Fodera Interna in Pelle","Dettagli Cuciti a Mano"],
        styling: ["Jeans indigo scuro + polo slim","Chino antracite + maglione leggero chiaro","Pantaloni slim neri + camicia scura"]
      },
      ar: {
        shortDescription: "مزيج الجلد الناعم والسويدي — أفضل ما في العالمين.",
        description: "نعومة السويد وقوة الجلد — يمزج 4920 بمهارة بين مادتين في تصميم واحد. الجلد الناعم عند المقدمة والسويد الرفيع عند الجوانب والكعب يخلقان تباين بصري ولعب غني بالملمس. هذا المزيج الثنائي يجعل الموديل مناسباً للاستخدام اليومي وشبه الرسمي. جينز داكن وبولو للإطلالة الكاجوال في عطلة نهاية الأسبوع، شينو ضيق وقميص بأزرار لأناقة المكتب.",
        features: ["جلد أصيل ناعم + مزيج سويدي","تصميم ثنائي الملمس","نعل نيوليت خفيف","بطانة داخلية جلدية","تفاصيل مخيطة يدوياً"],
        styling: ["جينز إنديغو داكن + بولو ضيق","شينو أنثراسايت + كنزة محبوكة فاتحة","بنطال أسود ضيق + قميص داكن"]
      },
      ru: {
        shortDescription: "Сочетание гладкой кожи и замши — лучшее из двух миров.",
        description: "Мягкость замши, сила кожи — 4920 мастерски объединяет два материала в одном дизайне. Гладкая кожа на носке, тонкая замша по бокам и на пятке создают визуальный контраст и богатую игру текстур. Эта комбинация из двух материалов делает модель подходящей как для повседневного, так и для полуофициального использования. Тёмные джинсы и поло для расслабленного уикенда, зауженные чино и рубашка для офисной элегантности.",
        features: ["Гладкая натуральная кожа + замша","Дизайн с двойной текстурой","Лёгкая подошва Neolite","Кожаная внутренняя подкладка","Детали ручной прострочки"],
        styling: ["Тёмные джинсы индиго + зауженная рубашка-поло","Антрацитовые чино + светлый вязаный свитер","Чёрные зауженные брюки + тёмная рубашка"]
      }
    },
    metaTitle: {
      tr: "4920 Süet Deri Erkek Ayakkabı | Neri Shoes",
      en: "4920 Suede Leather Men's Shoe | Neri Shoes",
      de: "4920 Wildleder Leder Herrenschuh | Neri Shoes",
      it: "4920 Pelle Scamosciata Scarpa Uomo | Neri Shoes",
      ar: "4920 جلد سويدي حذاء رجالي | Neri Shoes",
      ru: "4920 Замша и Кожа Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "4920 Süet Deri — pürüzsüz deri ve süet kombinasyonu, dual-texture erkek ayakkabı. Neri Shoes koleksiyonu.",
      en: "4920 Suede Leather — smooth leather and suede combination, dual-texture men's shoe. Neri Shoes collection.",
      de: "4920 Wildleder-Leder — Glattleder und Wildleder Kombination, Dual-Texture Herrenschuh. Neri Shoes Kollektion.",
      it: "4920 Pelle Scamosciata — combinazione pelle liscia e scamosciata, scarpa uomo dual-texture. Collezione Neri Shoes.",
      ar: "4920 الجلد السويدي — مزيج جلد ناعم وسويدي، حذاء رجالي ثنائي الملمس. مجموعة Neri Shoes.",
      ru: "4920 Замша и Кожа — сочетание гладкой кожи и замши, мужские туфли с двойной текстурой. Коллекция Neri Shoes."
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
