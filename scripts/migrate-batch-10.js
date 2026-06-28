const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "neri-urban-capraz-bagcikli-suet": {
    content: {
      tr: {
        shortDescription: "Çapraz bağcık detaylı premium süet — urban tarzın kentsel sessizliği.",
        description: "Şehir senin sahnense — Neri Urban Çapraz Bağcıklı Süet, büyük şehrin ritmine özel tasarlandı. Çapraz bağcık detayı, klasik dikeyden farklı bir dinamizm ve görsel akış yaratır; modeli kendine özgü kılan bu geometrik detaydır. Premium süet yüzey, zarifliğini günler geçtikçe artırır ve her kullanımda daha karakterli bir dokuya kavuşur. Dar paçalı slim pantolon ve oversize bir gömlek veya bomber jacket ile hipster-chic bir look elde edilir. Bu ayakkabıyı giyenler şehrin dilinden anlar.",
        features: ["Premium Hakiki Süet Üst Yüzey","Özel Çapraz Bağcık Deseni","Urban Tasarım Konsepti","Tok Kauçuk Taban","Süet Koruyucu Astar"],
        styling: ["Slim pantolon + oversize linen gömlek + çanta","Skinny jean + slim bomber jacket + beyaz tişört","Koyu chino + katmanlı knit kazak"]
      },
      en: {
        shortDescription: "Premium suede with cross-lace detail — the urban quiet of city style.",
        description: "The city is your stage — Neri Urban Cross-Lace Suede is designed for the rhythm of the metropolis. The cross-lace detail creates a dynamism and visual flow distinct from the classic vertical lace; it is this geometric detail that makes the model unique. The premium suede surface grows more refined with each passing day, gaining a more characterful texture with every wear. Slim-leg trousers with an oversized shirt or bomber jacket achieve a hipster-chic look. Those who wear this shoe speak the language of the city.",
        features: ["Premium Genuine Suede Upper","Exclusive Cross-Lace Pattern","Urban Design Concept","Solid Rubber Outsole","Suede-Protective Lining"],
        styling: ["Slim trousers + oversized linen shirt + bag","Skinny jeans + slim bomber jacket + white tee","Dark chinos + layered knit sweater"]
      },
      de: {
        shortDescription: "Premium-Wildleder mit Kreuzschnürsenkel-Detail — die urbane Stille des Stadtlooks.",
        description: "Die Stadt ist deine Bühne — der Neri Urban Kreuzschnürsenkel Wildleder wurde für den Rhythmus der Großstadt entworfen. Das Kreuzschnürsenkel-Detail schafft eine Dynamik und einen visuellen Fluss, der sich vom klassischen vertikalen Schnürsenkel unterscheidet; dieses geometrische Detail macht das Modell einzigartig. Die Premium-Wildleder-Oberfläche wird mit jedem Tag feiner und gewinnt mit jedem Tragen an Charakter.",
        features: ["Premium Echtes Wildleder-Obermaterial","Exklusives Kreuzschnürsenkel-Muster","Urbanes Design-Konzept","Robuste Gummiaußensohle","Wildleder-Schutzfutter"],
        styling: ["Slim-Hose + Oversized Leinhemd + Tasche","Skinny Jeans + Slim Bomberjacke + weißes T-Shirt","Dunkles Chino + geschichteter Strickpullover"]
      },
      it: {
        shortDescription: "Camoscio premium con dettaglio lacci incrociati — il silenzio urbano dello stile cittadino.",
        description: "La città è il tuo palcoscenico — il Neri Urban Scamosciato con Lacci Incrociati è progettato per il ritmo della metropoli. Il dettaglio dei lacci incrociati crea un dinamismo e un flusso visivo diverso dal classico laccio verticale; è questo dettaglio geometrico a rendere il modello unico. La superficie in camoscio premium diventa più raffinata giorno dopo giorno, acquisendo una texture più caratteriale ad ogni utilizzo.",
        features: ["Tomaia in Vera Pelle Scamosciata Premium","Pattern Esclusivo con Lacci Incrociati","Concetto di Design Urbano","Suola Esterna in Gomma Solida","Fodera Protettiva per Camoscio"],
        styling: ["Pantaloni slim + camicia di lino oversize + borsa","Jeans skinny + bomber slim + t-shirt bianca","Chino scuri + maglione a strati"]
      },
      ar: {
        shortDescription: "سويدي ممتاز مع تفصيل أربطة متقاطعة — الهدوء العمراني لأسلوب المدينة.",
        description: "المدينة مسرحك — صُمّم Neri Urban السويدي بأربطة متقاطعة لإيقاع المدينة الكبرى. تفصيل الأربطة المتقاطعة يخلق ديناميكية وتدفقاً بصرياً مختلفاً عن الرباط العمودي الكلاسيكي؛ هذا التفصيل الهندسي هو ما يجعل الموديل فريداً. السطح السويدي الممتاز يزداد رقياً مع مرور الأيام ويكتسب ملمساً أكثر شخصية مع كل استخدام.",
        features: ["جزء علوي سويدي أصيل ممتاز","نمط أربطة متقاطعة حصري","مفهوم تصميم عمراني","نعل خارجي مطاطي صلب","بطانة حماية للسويد"],
        styling: ["بنطال ضيق + قميص كتان أوفر سايز + حقيبة","جينز سكيني + جاكيت بومبر ضيق + تيشرت أبيض","شينو داكن + كنزة محبوكة طبقات"]
      },
      ru: {
        shortDescription: "Премиальная замша с крестообразной шнуровкой — городская тишь урбан-стиля.",
        description: "Город — твоя сцена — Neri Urban с крестообразной шнуровкой создан для ритма мегаполиса. Деталь крестообразной шнуровки создаёт динамику и визуальный поток, отличный от классической вертикальной шнуровки; именно эта геометрическая деталь делает модель уникальной. Поверхность из премиальной замши становится изысканнее с каждым днём и приобретает более характерную текстуру с каждой ноской.",
        features: ["Верх из натуральной замши премиум","Эксклюзивный узор крестообразной шнуровки","Урбан-концепция дизайна","Крепкая резиновая подошва","Защитная подкладка для замши"],
        styling: ["Зауженные брюки + оверсайз льняная рубашка + сумка","Скинни джинсы + зауженный бомбер + белая футболка","Тёмные чино + многослойный вязаный свитер"]
      }
    },
    metaTitle: {
      tr: "Neri Urban Çapraz Bağcıklı Süet Erkek | Neri Shoes",
      en: "Neri Urban Cross-Lace Suede Men's Shoe | Neri Shoes",
      de: "Neri Urban Kreuzschnürsenkel Wildleder Herren | Neri Shoes",
      it: "Neri Urban Scamosciato Lacci Incrociati Uomo | Neri Shoes",
      ar: "Neri Urban سويدي بأربطة متقاطعة رجالي | Neri Shoes",
      ru: "Neri Urban Замша Крестообразная шнуровка Мужские | Neri Shoes"
    },
    metaDescription: {
      tr: "Neri Urban Çapraz Bağcıklı Süet — premium süet ve çapraz bağcık urban tasarım. Neri Shoes erkek koleksiyonu.",
      en: "Neri Urban Cross-Lace Suede — premium suede and cross-lace urban design. Neri Shoes men's collection.",
      de: "Neri Urban Kreuzschnürsenkel Wildleder — Premium-Wildleder und Kreuzschnürsenkel Urban-Design. Neri Shoes Herrenkollektion.",
      it: "Neri Urban Scamosciato Lacci Incrociati — camoscio premium e design urbano con lacci incrociati. Collezione uomo Neri Shoes.",
      ar: "Neri Urban السويدي بأربطة متقاطعة — سويدي ممتاز وتصميم عمراني بأربطة متقاطعة. مجموعة رجالية Neri Shoes.",
      ru: "Neri Urban Замша Крестообразная шнуровка — премиальная замша и урбан-дизайн с крестообразной шнуровкой. Мужская коллекция Neri Shoes."
    }
  },

  "noble-leather-chelsea-bot": {
    content: {
      tr: {
        shortDescription: "Asil deri Chelsea bot — soyluluğun bileğe kadar çıkan hali.",
        description: "Asalet diz kapağında değil, bileğinde başlar — Noble Leather Chelsea Bot, İngiliz aristokrasisinin ayakkabı mirasını modern erkek için yeniden yorumluyor. En üst kalite hakiki deri ile üretilen bu bot, dokunuşta hissedilen fark, görünüşte hissettirilen sınıf sunar. Elastik yan bantları, sabah acelesi yaratmayan kolay giyim sunarken topuk çekme ilmikleri bütünü tamamlar. Siyah skinny pantolon ve uzun yün palto kombinasyonunda Avrupa şıklığını, slim jean ve oversized kazak ile bohem bir zarafeti yakalar. Koleksiyonunu tamamlamak için bir Chelsea bot ediniyorsan, bu olsun.",
        features: ["En Üst Kalite Hakiki Dana Derisi","Geniş Elastik Yan Bantlar","Topuk Çekme İlmikleri","Yüksek Kauçuk Taban","Tam Deri Astar"],
        styling: ["Skinny siyah pantolon + uzun yün palto + beyaz kemer","Slim jean + oversize knit kazak + trençkot","Koyu slim chino + turtleneck kazak"]
      },
      en: {
        shortDescription: "Noble leather Chelsea boot — aristocracy that reaches the ankle.",
        description: "Nobility begins not at the knee but at the ankle — Noble Leather Chelsea Boot reinterprets the footwear heritage of British aristocracy for the modern man. Crafted from the finest quality genuine leather, this boot offers a difference you feel on touch and a class you project on sight. Wide elastic side panels allow effortless morning wear while pull tabs complete the picture. Slim black jeans and a long wool coat capture European sophistication; slim jeans and an oversized sweater deliver bohemian elegance. If you are adding one Chelsea boot to your collection, let it be this one.",
        features: ["Finest Quality Genuine Calfskin","Wide Elastic Side Panels","Heel Pull Tabs","High Rubber Sole","Full Leather Lining"],
        styling: ["Skinny black trousers + long wool coat + white belt","Slim jeans + oversized knit sweater + trench coat","Dark slim chinos + turtleneck sweater"]
      },
      de: {
        shortDescription: "Edles Leder Chelsea-Boot — Aristokratie, die bis zum Knöchel reicht.",
        description: "Noblesse beginnt nicht am Knie, sondern am Knöchel — der Noble Leather Chelsea Boot interpretiert das Schuh-Erbe der britischen Aristokratie für den modernen Mann neu. Aus hochwertigstem Echtleder gefertigt, bietet dieser Boot einen Unterschied, den man beim Berühren spürt und eine Klasse, die man beim Anblick ausstrahlt. Breite elastische Seitenzüge ermöglichen müheloses Anziehen, während Fersenriemen das Bild vervollständigen.",
        features: ["Hochwertigstes Echtes Kalbsleder","Breite Elastische Seitenzüge","Fersenabzugsriemen","Hohe Gummisohle","Vollständiges Lederfutter"],
        styling: ["Skinny schwarze Hose + langer Wollmantel + weißer Gürtel","Slim Jeans + Oversized Strickpullover + Trenchcoat","Dunkle Slim-Chinos + Rollkragenpullover"]
      },
      it: {
        shortDescription: "Stivale Chelsea in pelle nobile — aristocrazia che arriva alla caviglia.",
        description: "La nobiltà non inizia al ginocchio, ma alla caviglia — il Noble Leather Chelsea Boot reinterpreta l'eredità calzaturiera dell'aristocrazia britannica per l'uomo moderno. Realizzato con la più pregiata vera pelle, questo stivale offre una differenza che si sente al tatto e una classe che si proietta alla vista. Elastici laterali ampi consentono una calzata mattutina senza sforzo mentre le linguette tacco completano il quadro.",
        features: ["Vera Pelle di Vitello di Massima Qualità","Elastici Laterali Ampi","Linguette Tacco","Suola Alta in Gomma","Fodera Completa in Pelle"],
        styling: ["Pantaloni skinny neri + lungo cappotto di lana + cintura bianca","Jeans slim + maglione oversize + trench","Chino slim scuri + dolcevita"]
      },
      ar: {
        shortDescription: "بوت تشيلسي من جلد نبيل — الأرستقراطية التي تصل إلى الكاحل.",
        description: "النبل لا يبدأ عند الركبة بل عند الكاحل — يُعيد Noble Leather Chelsea Bot تفسير إرث أحذية الأرستقراطية البريطانية للرجل المعاصر. مصنوع من أجود الجلود الأصيلة، يقدم هذا البوت فارقاً تحسه عند اللمس وأسلوباً ترسخه بالنظر. الأشرطة الجانبية المرنة الواسعة تتيح ارتداءً سهلاً في الصباح بينما حلقات سحب الكعب تكمل الصورة.",
        features: ["أجود جلد عجل أصيل","أشرطة جانبية مرنة واسعة","حلقات سحب الكعب","نعل مطاطي مرتفع","بطانة جلدية كاملة"],
        styling: ["بنطال أسود سكيني + بالطو صوف طويل + حزام أبيض","جينز ضيق + كنزة محبوكة أوفر سايز + ترنش","شينو داكن ضيق + كنزة رقبة عالية"]
      },
      ru: {
        shortDescription: "Благородный кожаный Chelsea boot — аристократия до самой щиколотки.",
        description: "Благородство начинается не у колена, а у щиколотки — Noble Leather Chelsea Boot переосмысляет обувное наследие британской аристократии для современного мужчины. Изготовленный из натуральной кожи высочайшего качества, этот сапог предлагает разницу, ощущаемую на ощупь, и класс, проецируемый на взгляд. Широкие эластичные боковые вставки обеспечивают лёгкое надевание утром, а петли для пятки завершают образ.",
        features: ["Натуральная телячья кожа высшего качества","Широкие эластичные боковые вставки","Петли для снятия обуви","Высокая резиновая подошва","Полная кожаная подкладка"],
        styling: ["Скинни чёрные брюки + длинное шерстяное пальто + белый ремень","Зауженные джинсы + оверсайз вязаный свитер + тренч","Тёмные зауженные чино + водолазка"]
      }
    },
    metaTitle: {
      tr: "Noble Leather Chelsea Bot Erkek | Neri Shoes",
      en: "Noble Leather Chelsea Boot Men's | Neri Shoes",
      de: "Noble Leather Chelsea Boot Herren | Neri Shoes",
      it: "Noble Leather Chelsea Boot Uomo | Neri Shoes",
      ar: "Noble Leather Chelsea Bot رجالي | Neri Shoes",
      ru: "Noble Leather Chelsea Boot Мужские | Neri Shoes"
    },
    metaDescription: {
      tr: "Noble Leather Chelsea Bot — en üst kalite hakiki deri, klasik elastik bantlı chelsea bot. Neri Shoes koleksiyonu.",
      en: "Noble Leather Chelsea Boot — finest genuine leather, classic elastic-panel chelsea boot. Neri Shoes collection.",
      de: "Noble Leather Chelsea Boot — hochwertigstes Echtleder, klassischer Chelsea-Boot mit Elastikzügen. Neri Shoes Kollektion.",
      it: "Noble Leather Chelsea Boot — vera pelle di massima qualità, chelsea boot classico con elastici. Collezione Neri Shoes.",
      ar: "Noble Leather Chelsea Bot — أجود جلد أصيل، بوت تشيلسي كلاسيكي بأشرطة مرنة. مجموعة Neri Shoes.",
      ru: "Noble Leather Chelsea Boot — натуральная кожа высшего качества, классический Chelsea с эластичными вставками. Коллекция Neri Shoes."
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
