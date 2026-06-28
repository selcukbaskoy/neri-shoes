const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "croco-black-edition": {
    content: {
      tr: {
        shortDescription: "Timsah desen hakiki deri — agresif şıklığın özel edisyonu.",
        description: "Sıradan değil, özel — Croco Black Edition, timsah desen baskılı hakiki deri ile koleksiyonun en çarpıcı modeli. Her baskı deseni kendine özgü; bu yüzden her çift, dünyada bir tane olan bir sanat eseridir. Sahip olduğun kalabalıkta seni ayırt eden bir model, gece yemeğinde masanın en ilginç kişisi olmanı sağlar. Siyah slim pantolon ve koyu gömlek ile tam anlamıyla all-black bir görünüm için biçilmiş kaftan. Bu ayakkabıyı giyen adam ceket giymeye ihtiyaç duymaz — zaten bütündür.",
        features: ["Timsah Desen Baskılı Hakiki Deri","Yüksek Parlaklıklı Yüzey","Özgün Desen Varyasyonları","Kauçuk Alt Taban","Özel Edisyon Üretim"],
        styling: ["All-black slim pantolon + siyah gömlek","Koyu gri pantolon + siyah balıkçı yaka","Siyah chino + beyaz gömlek (kontrast)"]
      },
      en: {
        shortDescription: "Crocodile-embossed genuine leather — a special edition of aggressive elegance.",
        description: "Not ordinary, extraordinary — Croco Black Edition is the most striking model in the collection, crafted from crocodile-embossed genuine leather. Every embossed pattern is unique, making each pair a one-of-a-kind work of art. A model that sets you apart in any crowd and makes you the most interesting person at the dinner table. Perfectly suited for an all-black look with black slim trousers and a dark shirt. The man wearing this needs no jacket — he is already complete.",
        features: ["Crocodile-Embossed Genuine Leather","High-Gloss Surface","Unique Pattern Variations","Rubber Outsole","Limited Edition Production"],
        styling: ["All-black slim trousers + black shirt","Dark grey trousers + black turtleneck","Black chinos + white shirt (contrast)"]
      },
      de: {
        shortDescription: "Krokodil-geprägtes Echtleder — eine Sonderedition aggressiver Eleganz.",
        description: "Nicht gewöhnlich, außergewöhnlich — die Croco Black Edition ist das auffälligste Modell der Kollektion aus krokodilgeprägtem Echtleder. Jedes geprägte Muster ist einzigartig und macht jedes Paar zu einem einmaligen Kunstwerk. Ein Modell, das dich in jeder Menge unterscheidet und zum interessantesten Gast am Tisch macht. Perfekt für einen All-Black-Look mit schwarzer Slim-Hose und dunklem Hemd. Der Mann, der das trägt, braucht kein Jackett — er ist bereits vollständig.",
        features: ["Krokodil-Geprägtes Echtleder","Hochglanz-Oberfläche","Einzigartige Mustervariationen","Gummiaußensohle","Sonderedition Produktion"],
        styling: ["All-Black Slim-Hose + schwarzes Hemd","Dunkelgraue Hose + schwarzer Rollkragen","Schwarzes Chino + weißes Hemd (Kontrast)"]
      },
      it: {
        shortDescription: "Vera pelle stampata a coccodrillo — un'edizione speciale di eleganza aggressiva.",
        description: "Non ordinario, straordinario — la Croco Black Edition è il modello più sorprendente della collezione, realizzato in vera pelle stampata a coccodrillo. Ogni motivo stampato è unico, rendendo ogni paio un'opera d'arte unica al mondo. Un modello che ti distingue in qualsiasi folla e ti rende la persona più interessante a tavola. Perfetto per un look total black con pantaloni slim neri e camicia scura. L'uomo che indossa questo non ha bisogno di giacca — è già completo.",
        features: ["Vera Pelle Stampata a Coccodrillo","Superficie Lucida ad Alta Brillantezza","Variazioni di Pattern Uniche","Suola Esterna in Gomma","Produzione Edizione Limitata"],
        styling: ["Pantaloni slim total black + camicia nera","Pantaloni grigio scuro + dolcevita nero","Chino nero + camicia bianca (contrasto)"]
      },
      ar: {
        shortDescription: "جلد أصيل مزخرف بنقش التمساح — إصدار خاص من الأناقة الجريئة.",
        description: "ليس عادياً بل استثنائياً — Croco Black Edition هو الموديل الأكثر إثارة في المجموعة من الجلد الأصيل المزخرف بنقش التمساح. كل نقش فريد من نوعه، مما يجعل كل زوج تحفة فنية لا مثيل لها في العالم. موديل يميزك في أي حشد ويجعلك الشخص الأكثر إثارة للاهتمام على طاولة العشاء. مثالي للإطلالة الكاملة بالأسود مع بنطال أسود ضيق وقميص داكن.",
        features: ["جلد أصيل بنقش تمساح","سطح لامع عالي اللمعان","تنوعات نقش فريدة","نعل خارجي مطاطي","إنتاج إصدار محدود"],
        styling: ["بنطال أسود ضيق + قميص أسود (توتال بلاك)","بنطال رمادي داكن + رقبة عالية سوداء","شينو أسود + قميص أبيض (تباين)"]
      },
      ru: {
        shortDescription: "Натуральная кожа с тиснением крокодил — особая серия агрессивной элегантности.",
        description: "Не обычная, исключительная — Croco Black Edition — самая эффектная модель коллекции из натуральной кожи с тиснением под крокодила. Каждый рисунок тиснения уникален, делая каждую пару неповторимым произведением искусства. Модель, которая выделяет тебя в любой толпе и делает самым интересным человеком за столом. Идеальна для образа total black с чёрными зауженными брюками и тёмной рубашкой. Мужчина в этих туфлях не нуждается в пиджаке — он уже завершён.",
        features: ["Натуральная кожа с тиснением крокодила","Высокоглянцевая поверхность","Уникальные вариации узора","Резиновая подошва","Производство ограниченной серии"],
        styling: ["Чёрные зауженные брюки + чёрная рубашка (total black)","Тёмно-серые брюки + чёрная водолазка","Чёрные чино + белая рубашка (контраст)"]
      }
    },
    metaTitle: {
      tr: "Croco Black Edition Erkek Ayakkabı | Neri Shoes",
      en: "Croco Black Edition Men's Shoe | Neri Shoes",
      de: "Croco Black Edition Herrenschuh | Neri Shoes",
      it: "Croco Black Edition Scarpa Uomo | Neri Shoes",
      ar: "Croco Black Edition حذاء رجالي | Neri Shoes",
      ru: "Croco Black Edition Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Croco Black Edition — timsah desen baskılı hakiki deri, özel edisyon erkek ayakkabı. Neri Shoes koleksiyonu.",
      en: "Croco Black Edition — crocodile-embossed genuine leather, limited edition men's shoe. Neri Shoes collection.",
      de: "Croco Black Edition — krokodilgeprägtes Echtleder, Sonderedition Herrenschuh. Neri Shoes Kollektion.",
      it: "Croco Black Edition — vera pelle stampata a coccodrillo, scarpa uomo edizione limitata. Collezione Neri Shoes.",
      ar: "Croco Black Edition — جلد أصيل بنقش تمساح، حذاء رجالي إصدار محدود. مجموعة Neri Shoes.",
      ru: "Croco Black Edition — натуральная кожа с тиснением крокодила, мужские туфли ограниченной серии. Коллекция Neri Shoes."
    }
  },

  "full-black": {
    content: {
      tr: {
        shortDescription: "Tamamen siyah, tamamen kararlı — all-black erkeğin son noktası.",
        description: "Siyah sadece bir renk değil, bir tutum — Full Black, bu tutumun ayakkabıya yansımasıdır. Üst yüzeyden tabana, dikişten bağcığa kadar her detay derin, mat bir siyahta işlendi. Bu denge, her tonun uyumunu bozmadan gardırobun her köşesine uyum sağlar. Siyah-siyah-siyah kombininden beyaz tişörtlü bir kontrast kombinasyonuna kadar hatasız çalışır. Minimalist estetiğin doruk noktası: ne fazla, ne eksik.",
        features: ["Tam Mat Siyah Hakiki Deri","Siyah Kauçuk Alt Taban","Siyah Bağcık Detayı","Siyah Deri Astar","Tek Ton Bütünlük Tasarımı"],
        styling: ["All-black slim pantolon + siyah gömlek + ceket","Siyah slim jean + beyaz oversize tişört (kontrast)","Siyah chino + siyah mock turtleneck"]
      },
      en: {
        shortDescription: "Completely black, completely deliberate — the final word for the all-black man.",
        description: "Black is not just a colour, it is an attitude — Full Black is that attitude translated into a shoe. From upper to sole, from stitch to lace, every detail is rendered in a deep, matte black. This coherence allows it to integrate into any corner of your wardrobe without disturbing a single tone. Works flawlessly from an all-black-on-black combination to a contrasting white tee. The pinnacle of minimalist aesthetics: nothing more, nothing less.",
        features: ["Full Matte Black Genuine Leather","Black Rubber Outsole","Black Lace Detail","Black Leather Lining","Monotone Unity Design"],
        styling: ["All-black slim trousers + black shirt + blazer","Black slim jeans + white oversized tee (contrast)","Black chinos + black mock turtleneck"]
      },
      de: {
        shortDescription: "Vollständig schwarz, vollständig entschlossen — das letzte Wort für den All-Black-Mann.",
        description: "Schwarz ist nicht nur eine Farbe, es ist eine Haltung — Full Black ist diese Haltung, in einen Schuh übersetzt. Vom Obermaterial bis zur Sohle, vom Stich bis zur Schnürung, ist jedes Detail in tiefem, mattem Schwarz gehalten. Diese Kohärenz ermöglicht es, sich in jeden Winkel deiner Garderobe einzufügen, ohne einen einzigen Ton zu stören. Funktioniert einwandfrei vom All-Black-auf-Schwarz bis zum Kontrast mit weißem T-Shirt.",
        features: ["Volles Mattes Schwarzes Echtleder","Schwarze Gummiaußensohle","Schwarzes Schnürsenkel-Detail","Schwarzes Lederfutter","Monoton-Einheitsdesign"],
        styling: ["All-Black Slim-Hose + schwarzes Hemd + Blazer","Schwarze Slim-Jeans + weißes Oversized-T-Shirt (Kontrast)","Schwarzes Chino + schwarzer Mock-Turtleneck"]
      },
      it: {
        shortDescription: "Completamente nero, completamente deliberato — l'ultima parola per l'uomo total black.",
        description: "Il nero non è solo un colore, è un atteggiamento — Full Black è quell'atteggiamento tradotto in una scarpa. Dalla tomaia alla suola, dal punto al laccio, ogni dettaglio è reso in un nero profondo e opaco. Questa coerenza permette di integrarsi in ogni angolo del guardaroba senza disturbare nessuna tonalità. Funziona impeccabilmente dal total black al contrasto con una t-shirt bianca.",
        features: ["Vera Pelle Nera Opaca Totale","Suola Esterna in Gomma Nera","Dettaglio Laccio Nero","Fodera in Pelle Nera","Design a Monotono Unitario"],
        styling: ["Pantaloni slim total black + camicia nera + blazer","Jeans slim neri + t-shirt oversize bianca (contrasto)","Chino nero + dolcevita nero"]
      },
      ar: {
        shortDescription: "أسود تماماً، متعمّد تماماً — الكلمة الأخيرة لرجل التوتال بلاك.",
        description: "الأسود ليس مجرد لون، إنه موقف — Full Black هو ذلك الموقف مُترجماً في حذاء. من الجزء العلوي إلى النعل، من الخياطة إلى الأربطة، كل تفصيل معالج باللون الأسود العميق المطفأ. هذا الاتساق يسمح له بالاندماج في كل زاوية من خزانتك دون الإخلال بأي درجة لونية. يعمل بشكل مثالي من التنسيق الأسود الكامل حتى التباين مع تيشرت أبيض.",
        features: ["جلد أصيل أسود مطفأ كامل","نعل خارجي مطاطي أسود","تفصيل أربطة سوداء","بطانة جلدية سوداء","تصميم وحدة أحادي اللون"],
        styling: ["بنطال أسود ضيق + قميص أسود + بليزر (توتال بلاك)","جينز أسود ضيق + تيشرت أبيض أوفر سايز (تباين)","شينو أسود + رقبة عالية سوداء"]
      },
      ru: {
        shortDescription: "Полностью чёрный, полностью осознанный — последнее слово для мужчины total black.",
        description: "Чёрный — это не просто цвет, это позиция — Full Black — это позиция, воплощённая в обуви. От верха до подошвы, от шва до шнурка, каждая деталь выполнена в глубоком матовом чёрном. Эта цельность позволяет органично вписаться в любой уголок гардероба, не нарушая ни одного тона. Безупречно работает как в образе total black, так и в контрасте с белой футболкой.",
        features: ["Полностью матовая чёрная натуральная кожа","Чёрная резиновая подошва","Чёрные шнурки","Чёрная кожаная подкладка","Монотонный дизайн единства"],
        styling: ["Чёрные зауженные брюки + чёрная рубашка + пиджак (total black)","Чёрные зауженные джинсы + белая оверсайз футболка (контраст)","Чёрные чино + чёрная водолазка"]
      }
    },
    metaTitle: {
      tr: "Full Black Erkek Ayakkabı | Neri Shoes",
      en: "Full Black Men's Shoe | Neri Shoes",
      de: "Full Black Herrenschuh | Neri Shoes",
      it: "Full Black Scarpa Uomo | Neri Shoes",
      ar: "Full Black حذاء رجالي | Neri Shoes",
      ru: "Full Black Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Full Black erkek ayakkabı — tamamen siyah hakiki deri, all-black tasarım. Neri Shoes klasik koleksiyonu.",
      en: "Full Black men's shoe — all-matte genuine leather, total black design. Neri Shoes classic collection.",
      de: "Full Black Herrenschuh — vollständig mattes Echtleder, All-Black-Design. Neri Shoes klassische Kollektion.",
      it: "Full Black scarpa uomo — vera pelle opaca totale, design total black. Collezione classica Neri Shoes.",
      ar: "Full Black حذاء رجالي — جلد أصيل مطفأ كامل، تصميم توتال بلاك. مجموعة Neri Shoes الكلاسيكية.",
      ru: "Full Black мужские туфли — полностью матовая натуральная кожа, дизайн total black. Классическая коллекция Neri Shoes."
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
