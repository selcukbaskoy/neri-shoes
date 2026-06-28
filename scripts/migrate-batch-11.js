const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "olive-python": {
    content: {
      tr: {
        shortDescription: "Zeytin yeşili piton desen deri — doğanın gücünü ayağında taşı.",
        description: "Orman yeşilinin kentsel versiyonu — Olive Python, piton desen baskılı deri ile hem vahşi hem de sofistike bir denge kurar. Zeytin tonu, siyah ve bej ile mükemmel uyum içinde çalışırken; piton desen, görsel karmaşıklık katmanları ekler. Bu model, sıradan bir kombinasyonu hemen üst seviyeye taşıyan bir parçadır. Bej veya açık renk pantolon ve sade bir üst ile renk ve desen öne çıkar; bütün kombinasyona bu bakarak bakılır. Koleksiyonuna renk ve karakter katmak isteyenler için.",
        features: ["Piton Desen Baskılı Hakiki Deri","Zeytin Tonu","Kauçuk Alt Taban","Deri İç Astar","Exclusive Desen Çalışması"],
        styling: ["Bej slim chino + plain krem tişört","Açık gri pantolon + beyaz gömlek","Koyu jean + plain kazak + çanta"]
      },
      en: {
        shortDescription: "Olive green python-embossed leather — carry nature's power on your feet.",
        description: "The urban version of forest green — Olive Python strikes a balance between wild and sophisticated through python-embossed genuine leather. The olive tone works in perfect harmony with black and beige while the python pattern adds layers of visual complexity. This model is the piece that instantly elevates an ordinary outfit. With beige or light trousers and a plain top, the colour and pattern take the spotlight; the whole outfit is read through this shoe. For those who want to add colour and character to their collection.",
        features: ["Python-Embossed Genuine Leather","Olive Tone","Rubber Outsole","Leather Inner Lining","Exclusive Pattern Work"],
        styling: ["Beige slim chinos + plain cream tee","Light grey trousers + white shirt","Dark jeans + plain sweater + bag"]
      },
      de: {
        shortDescription: "Olivgrünes Python-geprägtes Leder — trage die Kraft der Natur an deinen Füßen.",
        description: "Die urbane Version von Waldgrün — Olive Python schlägt eine Balance zwischen Wild und Sophisticated durch Python-geprägtes Echtleder. Der Olivton harmoniert perfekt mit Schwarz und Beige, während das Python-Muster Schichten visueller Komplexität hinzufügt. Dieses Modell ist das Stück, das ein gewöhnliches Outfit sofort aufwertet. Mit beige oder hellen Hosen und einem schlichten Oberteil rücken Farbe und Muster in den Vordergrund.",
        features: ["Python-Geprägtes Echtleder","Olivton","Gummiaußensohle","Leder-Innenfutter","Exklusives Musterwerk"],
        styling: ["Beige Slim-Chino + einfaches cremefarbenes T-Shirt","Hellgrauer Hose + weißes Hemd","Dunkle Jeans + einfacher Pullover + Tasche"]
      },
      it: {
        shortDescription: "Vera pelle stampata a pitone verde oliva — porta la forza della natura ai tuoi piedi.",
        description: "La versione urbana del verde foresta — Olive Python trova un equilibrio tra selvatico e sofisticato attraverso vera pelle stampata a pitone. Il tono oliva lavora in perfetta armonia con il nero e il beige mentre il motivo a pitone aggiunge strati di complessità visiva. Questo modello è il pezzo che eleva immediatamente un outfit ordinario. Con pantaloni beige o chiari e una t-shirt semplice, il colore e il motivo prendono il sopravvento.",
        features: ["Vera Pelle Stampata a Pitone","Tonalità Oliva","Suola Esterna in Gomma","Fodera Interna in Pelle","Lavorazione Pattern Esclusiva"],
        styling: ["Chino slim beige + t-shirt crema semplice","Pantaloni grigio chiaro + camicia bianca","Jeans scuri + maglione semplice + borsa"]
      },
      ar: {
        shortDescription: "جلد أصيل بنقش ثعبان البيثون الزيتوني — احمل قوة الطبيعة على قدميك.",
        description: "النسخة الحضرية من الأخضر الغابي — يحقق Olive Python توازناً بين الوحشي والمتطور من خلال الجلد الأصيل بنقش البيثون. اللون الزيتوني يعمل في انسجام تام مع الأسود والبيج بينما نقش البيثون يضيف طبقات من التعقيد البصري. هذا الموديل هو القطعة التي ترفع الإطلالة العادية فوراً.",
        features: ["جلد أصيل بنقش بيثون","درجة لون زيتوني","نعل خارجي مطاطي","بطانة داخلية جلدية","تصميم نقش حصري"],
        styling: ["شينو بيج ضيق + تيشرت كريمي سادة","بنطال رمادي فاتح + قميص أبيض","جينز داكن + كنزة سادة + حقيبة"]
      },
      ru: {
        shortDescription: "Натуральная кожа с тиснением питон оливкового цвета — носи силу природы.",
        description: "Городская версия лесного зелёного — Olive Python устанавливает баланс между дикостью и утончённостью через натуральную кожу с тиснением питон. Оливковый тон идеально сочетается с чёрным и бежевым, а узор питона добавляет слои визуальной сложности. Эта модель — та самая вещь, которая мгновенно поднимает обычный образ на уровень выше.",
        features: ["Натуральная кожа с тиснением питона","Оливковый оттенок","Резиновая подошва","Кожаная внутренняя подкладка","Эксклюзивная работа с узором"],
        styling: ["Бежевые зауженные чино + простая кремовая футболка","Светло-серые брюки + белая рубашка","Тёмные джинсы + простой свитер + сумка"]
      }
    },
    metaTitle: {
      tr: "Olive Python Erkek Ayakkabı | Neri Shoes",
      en: "Olive Python Men's Shoe | Neri Shoes",
      de: "Olive Python Herrenschuh | Neri Shoes",
      it: "Olive Python Scarpa Uomo | Neri Shoes",
      ar: "Olive Python حذاء رجالي | Neri Shoes",
      ru: "Olive Python Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Olive Python — zeytin yeşili piton desen baskılı hakiki deri erkek ayakkabı. Neri Shoes özel koleksiyonu.",
      en: "Olive Python — olive green python-embossed genuine leather men's shoe. Neri Shoes exclusive collection.",
      de: "Olive Python — olivgrünes Python-geprägtes Echtleder Herrenschuh. Neri Shoes Exklusivkollektion.",
      it: "Olive Python — vera pelle stampata a pitone verde oliva scarpa uomo. Collezione esclusiva Neri Shoes.",
      ar: "Olive Python — جلد أصيل بنقش بيثون أخضر زيتوني حذاء رجالي. مجموعة Neri Shoes الحصرية.",
      ru: "Olive Python — натуральная кожа с тиснением питона оливкового цвета мужские туфли. Эксклюзивная коллекция Neri Shoes."
    }
  },

  "prestige-leather-bot": {
    content: {
      tr: {
        shortDescription: "Prestij sınıfı hakiki deri bot — her mevsim güçlü duruş.",
        description: "Prestij kelimesini hak eden tek şey kalitedir — Prestige Leather Bot, bu felsefeyle üretildi. En seçkin tabakhanerden alınan hakiki deri, ustanın elinde bir bot formuna dönüşürken her dikiş noktası özenle kontrol edilir. Dört mevsim kullanılabilecek ökçe yüksekliği ve taban sertliği, şehir içi yürüyüşte destek, özel ortamlarda ise sınıf hissi verir. Uzun pantolon ve slim fit palto veya yağmurluk ile sonbahar şıklığı, slim jean ve deri ceket ile dinamik bir görünüm sunar. Bu botu alan adamlar genellikle bir tanesini daha alır.",
        features: ["Seçkin Tabaka Hakiki Dana Derisi","Uzun Konçlu Bot Tasarımı","Kayış ve Toka Detayı","Yüksek Kauçuk Taban","Tam Deri Astar"],
        styling: ["Slim fit bej pantolon + kısa deri ceket","Siyah slim pantolon + koyu gömlek + bot üzeri paça","Slim jean + deri bomber jacket"]
      },
      en: {
        shortDescription: "Prestige-class genuine leather boot — a powerful stance in every season.",
        description: "The only thing worthy of the word prestige is quality — Prestige Leather Boot was built on this philosophy. The finest genuine leather from an elite tannery transforms into a boot form in the craftsman's hands, with every stitch point carefully controlled. The heel height and sole firmness suitable for four seasons provide support on city walks and a sense of class in special settings. Long trousers and a slim-fit coat for autumn sophistication, slim jeans and a leather jacket for a dynamic look. Men who buy this boot tend to come back for another.",
        features: ["Elite Tannery Genuine Calfskin","High-Shaft Boot Design","Strap and Buckle Detail","High Rubber Sole","Full Leather Lining"],
        styling: ["Slim fit beige trousers + short leather jacket","Black slim trousers + dark shirt + cuffed over boot","Slim jeans + leather bomber jacket"]
      },
      de: {
        shortDescription: "Prestige-Klasse Echtleder-Boot — starke Präsenz in jeder Jahreszeit.",
        description: "Das Einzige, das das Wort Prestige verdient, ist Qualität — der Prestige Leather Boot wurde auf dieser Philosophie aufgebaut. Das feinste Echtleder aus einer Elite-Gerberei verwandelt sich in den Händen des Handwerkers in eine Stiefelform, wobei jeder Stichpunkt sorgfältig kontrolliert wird. Die Absatzhöhe und Sohlenstärke für vier Jahreszeiten bieten Unterstützung auf Stadtwegen und Klassengefühl bei besonderen Anlässen.",
        features: ["Elite-Gerberei Echtes Kalbsleder","Hochschaft-Stiefeldesign","Riemen und Schnallen-Detail","Hohe Gummisohle","Vollständiges Lederfutter"],
        styling: ["Slim-Fit beige Hose + kurze Lederjacke","Schwarze Slim-Hose + dunkles Hemd + Stiefelumschlag","Slim Jeans + Leder-Bomberjacke"]
      },
      it: {
        shortDescription: "Stivale in vera pelle di classe prestige — una presenza forte in ogni stagione.",
        description: "L'unica cosa degna della parola prestige è la qualità — il Prestige Leather Boot è stato costruito su questa filosofia. La vera pelle più pregiata di una conceria d'élite si trasforma in una forma stivale nelle mani dell'artigiano, con ogni punto cucito attentamente controllato. L'altezza del tacco e la fermezza della suola per quattro stagioni forniscono supporto nelle passeggiate cittadine e un senso di classe in contesti speciali.",
        features: ["Vera Pelle di Vitello da Conceria d'Elite","Design Stivale a Gambale Alto","Dettaglio Cinghia e Fibbia","Suola Alta in Gomma","Fodera Completa in Pelle"],
        styling: ["Pantaloni slim beige + giacca corta in pelle","Pantaloni slim neri + camicia scura + risvolto sullo stivale","Jeans slim + bomber in pelle"]
      },
      ar: {
        shortDescription: "بوت جلد أصيل من الفئة المرموقة — وقفة قوية في كل موسم.",
        description: "الشيء الوحيد الذي يستحق كلمة المرموق هو الجودة — صُنع Prestige Leather Bot على هذه الفلسفة. أجود الجلود الأصيلة من مدبغة نخبوية تتحول في يدي الحرفي إلى شكل بوت مع مراقبة دقيقة لكل نقطة خياطة. ارتفاع الكعب وصلابة النعل المناسبة للفصول الأربعة توفر الدعم في التجوال المدني والإحساس بالأسلوب في المناسبات الخاصة.",
        features: ["جلد عجل أصيل من مدبغة نخبوية","تصميم بوت بساق طويلة","تفصيل حزام وإبزيم","نعل مطاطي مرتفع","بطانة جلدية كاملة"],
        styling: ["بنطال بيج ضيق + جاكيت جلدي قصير","بنطال أسود ضيق + قميص داكن + انطواء فوق البوت","جينز ضيق + جاكيت بومبر جلدي"]
      },
      ru: {
        shortDescription: "Натуральная кожа класса престиж — мощная стать в любой сезон.",
        description: "Единственное, что достойно слова «престиж» — это качество. Prestige Leather Boot создан на этой философии. Натуральная кожа высшего качества от элитной кожевни превращается в сапог в руках мастера, с тщательным контролем каждой точки шва. Высота каблука и жёсткость подошвы, подходящие для четырёх сезонов, обеспечивают поддержку при городских прогулках и ощущение класса в особых обстоятельствах.",
        features: ["Натуральная телячья кожа от элитной кожевни","Высокое голенище сапога","Деталь ремня и пряжки","Высокая резиновая подошва","Полная кожаная подкладка"],
        styling: ["Бежевые зауженные брюки + короткая кожаная куртка","Чёрные зауженные брюки + тёмная рубашка + отворот над сапогом","Зауженные джинсы + кожаный бомбер"]
      }
    },
    metaTitle: {
      tr: "Prestige Leather Bot Erkek | Neri Shoes",
      en: "Prestige Leather Boot Men's | Neri Shoes",
      de: "Prestige Leather Boot Herren | Neri Shoes",
      it: "Prestige Leather Boot Uomo | Neri Shoes",
      ar: "Prestige Leather Bot رجالي | Neri Shoes",
      ru: "Prestige Leather Boot Мужские | Neri Shoes"
    },
    metaDescription: {
      tr: "Prestige Leather Bot — seçkin tabaka hakiki deri, uzun konçlu klasik bot. Neri Shoes premium koleksiyonu.",
      en: "Prestige Leather Boot — elite tannery genuine leather, high-shaft classic boot. Neri Shoes premium collection.",
      de: "Prestige Leather Boot — Elite-Gerberei Echtleder, Hochschaft klassischer Stiefel. Neri Shoes Premium-Kollektion.",
      it: "Prestige Leather Boot — vera pelle da conceria d'élite, stivale classico a gambale alto. Collezione premium Neri Shoes.",
      ar: "Prestige Leather Bot — جلد أصيل من مدبغة نخبوية، بوت كلاسيكي بساق طويلة. مجموعة Neri Shoes المميزة.",
      ru: "Prestige Leather Boot — натуральная кожа от элитной кожевни, классический сапог с высоким голенищем. Премиальная коллекция Neri Shoes."
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
