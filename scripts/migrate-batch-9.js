const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "milano-gm": {
    content: {
      tr: {
        shortDescription: "İtalyan ilhamı, Türk zanaatı — lüks klasik erkek ayakkabının zirvesi.",
        description: "Milano sokaklarından ilham, Adana ustasının elinden çıkmış bir şaheser — Milano GM, ayakkabı dünyasında bir sınıf üstü konumlanır. Seçilmiş İtalyan ilhamı tasarımı ve yerli usta işçiliği bir araya gelince, binlerce liralık marka fiyatlarına rakip bir kalite çıkar ortaya. Resmi bir yemek daveti, şirket etkinliği veya özel kutlama — bu model her ortamda konuşulur. Siyah veya koyu lacivert takım elbise ile giyildiğinde tam anlamıyla gece ya da özel gün şıklığı sunar. Bir ayakkabı koleksiyonuna giren ilk lüks model olarak doğru adres.",
        features: ["Premium Hakiki Dana Derisi","İtalyan İlhamı Tasarım","El Dikişi Detaylar","Topluk Yükseltici Neolit Taban","Lüks Deri Astar"],
        styling: ["Siyah slim takım elbise + beyaz gömlek + kravat","Lacivert takım + saten cep mendili","Koyu gri slim pantolon + siyah ince kazak"]
      },
      en: {
        shortDescription: "Italian inspiration, Turkish craftsmanship — the pinnacle of luxury classic men's footwear.",
        description: "Inspired by the streets of Milan, crafted by the hands of Adana masters — Milano GM occupies a class above in the world of footwear. When Italian-inspired design meets local master craftsmanship, the result rivals brands priced many times higher. A formal dinner, a corporate event or a special celebration — this model gets talked about in any setting. Worn with a black or dark navy suit, it delivers true evening or special-occasion elegance. The right first luxury model to add to any shoe collection.",
        features: ["Premium Genuine Calfskin","Italian-Inspired Design","Hand-Stitched Details","Heel-Elevating Neolite Sole","Luxury Leather Lining"],
        styling: ["Black slim suit + white shirt + tie","Navy suit + satin pocket square","Dark grey slim trousers + black fine-knit sweater"]
      },
      de: {
        shortDescription: "Italienische Inspiration, türkisches Handwerk — der Gipfel des luxuriösen klassischen Herrenschuhs.",
        description: "Inspiriert von den Straßen Mailands, gefertigt von den Händen Adanaer Meister — der Milano GM nimmt eine Klasse höher in der Schuhwelt ein. Wenn italienisch inspiriertes Design auf lokales Meisterhandwerk trifft, entsteht eine Qualität, die mit vielfach teureren Marken mithalten kann. Ein formelles Abendessen, eine Unternehmensveranstaltung oder eine besondere Feier — dieses Modell wird in jedem Umfeld gelobt.",
        features: ["Premium Echtes Kalbsleder","Italienisch Inspiriertes Design","Handgenähte Details","Absatzhebende Neolite-Sohle","Luxus-Lederfutter"],
        styling: ["Schwarzer Slim-Anzug + weißes Hemd + Krawatte","Marineanzug + Seiden-Einstecktuch","Dunkelgrauer Slim-Hose + schwarzer Feinstrick-Pullover"]
      },
      it: {
        shortDescription: "Ispirazione italiana, artigianato turco — il vertice della calzatura classica di lusso da uomo.",
        description: "Ispirato dalle strade di Milano, realizzato dalle mani dei maestri di Adana — il Milano GM occupa una classe superiore nel mondo delle calzature. Quando il design ispirato all'italiano incontra la maestria artigianale locale, il risultato rivaleggia con marchi di prezzo ben più elevato. Una cena formale, un evento aziendale o una celebrazione speciale — questo modello fa parlare in qualsiasi contesto.",
        features: ["Vera Pelle di Vitello Premium","Design Ispirato all'Italiano","Dettagli Cuciti a Mano","Suola Neolite Rialzante","Fodera in Pelle di Lusso"],
        styling: ["Abito slim nero + camicia bianca + cravatta","Abito navy + fazzoletto da taschino in raso","Pantaloni slim grigio scuro + maglione fine nero"]
      },
      ar: {
        shortDescription: "إلهام إيطالي وحرفية تركية — قمة الأحذية الكلاسيكية الفاخرة للرجال.",
        description: "مستوحى من شوارع ميلانو، صنعته أيدي أسياد أضنة — يحتل Milano GM مرتبة أعلى درجة في عالم الأحذية. حين يلتقي التصميم المستوحى من الإيطالية مع الحرفية المحلية، تنتج جودة تنافس العلامات ذات الأسعار الأعلى بكثير. عشاء رسمي أو فعالية شركة أو احتفال خاص — يُثار الحديث عن هذا الموديل في أي بيئة.",
        features: ["جلد عجل أصيل ممتاز","تصميم مستوحى من الإيطالية","تفاصيل مخيطة يدوياً","نعل نيوليت رافع للكعب","بطانة جلدية فاخرة"],
        styling: ["بدلة سوداء ضيقة + قميص أبيض + ربطة عنق","بدلة بحرية + منديل جيب ساتان","بنطال رمادي داكن ضيق + كنزة رفيعة سوداء"]
      },
      ru: {
        shortDescription: "Итальянское вдохновение, турецкое мастерство — вершина классической мужской обуви класса люкс.",
        description: "Вдохновлён улицами Милана, создан руками мастеров Аданы — Milano GM занимает класс выше в мире обуви. Когда итальянский дизайн встречается с местным мастерством, результат соперничает с брендами, стоящими многократно дороже. Официальный ужин, корпоративное мероприятие или особое торжество — эта модель становится темой разговора в любой обстановке.",
        features: ["Премиальная натуральная телячья кожа","Дизайн в итальянском стиле","Детали ручной прострочки","Подошва Neolite с подъёмом каблука","Роскошная кожаная подкладка"],
        styling: ["Чёрный зауженный костюм + белая рубашка + галстук","Синий костюм + атласный нагрудный платок","Тёмно-серые зауженные брюки + тонкий чёрный свитер"]
      }
    },
    metaTitle: {
      tr: "Milano GM Erkek Ayakkabı | Neri Shoes",
      en: "Milano GM Men's Shoe | Neri Shoes",
      de: "Milano GM Herrenschuh | Neri Shoes",
      it: "Milano GM Scarpa Uomo | Neri Shoes",
      ar: "Milano GM حذاء رجالي | Neri Shoes",
      ru: "Milano GM Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Milano GM — İtalyan ilhamı tasarım ve hakiki dana derisi lüks erkek ayakkabı. Neri Shoes premium klasik koleksiyonu.",
      en: "Milano GM — Italian-inspired design and genuine calfskin luxury men's shoe. Neri Shoes premium classic collection.",
      de: "Milano GM — italienisch inspiriertes Design und echtes Kalbsleder Luxus-Herrenschuh. Neri Shoes Premium-Klassikkollektion.",
      it: "Milano GM — design ispirato all'italiano e vera pelle di vitello scarpa uomo di lusso. Collezione classica premium Neri Shoes.",
      ar: "Milano GM — تصميم مستوحى من الإيطالية وجلد عجل أصيل حذاء رجالي فاخر. مجموعة Neri Shoes الكلاسيكية المميزة.",
      ru: "Milano GM — дизайн в итальянском стиле и натуральная телячья кожа, роскошные мужские туфли. Премиальная классическая коллекция Neri Shoes."
    }
  },

  "monk-beast": {
    content: {
      tr: {
        shortDescription: "Tokalı monk strap tasarım — karakter sahibi erkeğin tercihi.",
        description: "Toka, sadece bir bağlama değil, bir imzadır — Monk Beast, double-monk strap tasarımıyla sahip olduğu kişiliği açıkça ortaya koyar. Klasik derby ve oxford modelleri aşanlar için bir sonraki adım; bağcık gerektirmeyen, toka ile kapanan yapısı aynı zamanda kullanım kolaylığı da sağlar. Gece davetinden iş toplantısına, her ortamda konuşulan bir model. İnce paçalı çuha pantolon ve yarım kollu örme kazak ile sanatsal bir stil, slim koyu pantolon ve beyaz gömlek ile klasik bir karşıtlık oluşturur. Karakterli olmak isteyenlere.",
        features: ["Çift Toka (Double-Monk Strap)","Hakiki Dana Derisi","Topaç Topuk","El Dikişi Brogue Detaylar","Pürüzsüz Kauçuk Taban"],
        styling: ["İnce paçalı gri pantolon + koyu kazak","Slim siyah pantolon + beyaz gömlek + ceket","Bej trench palto + koyu chino"]
      },
      en: {
        shortDescription: "Double monk strap design — the choice of the man with character.",
        description: "The buckle is not merely a fastening, it is a signature — Monk Beast makes its personality known through a double-monk strap design. The next step for those who have outgrown classic derby and oxford styles; the buckle closure removes the need for laces while adding effortless ease of wear. A model that gets talked about from evening events to business meetings. Fine-legged flannel trousers with a half-sleeve knit for an artistic look, slim dark trousers with a white shirt for a classic contrast. For those who want to be defined by character.",
        features: ["Double Buckle (Double-Monk Strap)","Genuine Calfskin Leather","Stacked Heel","Hand-Stitched Brogue Details","Smooth Rubber Outsole"],
        styling: ["Slim-leg grey trousers + dark sweater","Slim black trousers + white shirt + blazer","Beige trench coat + dark chinos"]
      },
      de: {
        shortDescription: "Double-Monk-Strap-Design — die Wahl des Mannes mit Charakter.",
        description: "Die Schnalle ist nicht nur eine Befestigung, sie ist eine Unterschrift — Monk Beast macht seine Persönlichkeit durch ein Double-Monk-Strap-Design deutlich. Der nächste Schritt für diejenigen, die klassische Derby- und Oxford-Stile hinter sich gelassen haben; der Schnallenverschluss macht Schnürsenkel überflüssig und bietet gleichzeitig mühelose Tragekomfort. Ein Modell, das von Abendveranstaltungen bis zu Geschäftsmeetings gelobt wird.",
        features: ["Doppelschnalle (Double-Monk-Strap)","Echtes Kalbsleder","Gestapelter Absatz","Handgenähte Brogue-Details","Glatte Gummiaußensohle"],
        styling: ["Schmal geschnittene graue Hose + dunkler Pullover","Schlanke schwarze Hose + weißes Hemd + Blazer","Beiger Trenchcoat + dunkle Chinos"]
      },
      it: {
        shortDescription: "Design double monk strap — la scelta dell'uomo con carattere.",
        description: "La fibbia non è solo una chiusura, è una firma — Monk Beast mostra la sua personalità attraverso un design double-monk strap. Il passo successivo per chi ha superato i classici stili derby e oxford; la chiusura con fibbia elimina la necessità dei lacci aggiungendo facilità d'uso. Un modello di cui si parla dalle serate agli incontri di lavoro. Pantaloni in flanella a gamba stretta con un maglione per un look artistico, pantaloni slim scuri con camicia bianca per un contrasto classico.",
        features: ["Doppia Fibbia (Double-Monk Strap)","Vera Pelle di Vitello","Tacco Stacked","Dettagli Brogue Cuciti a Mano","Suola Esterna in Gomma Liscia"],
        styling: ["Pantaloni grigi a gamba stretta + maglione scuro","Pantaloni slim neri + camicia bianca + blazer","Trench beige + chino scuri"]
      },
      ar: {
        shortDescription: "تصميم دبل مونك ستراب — اختيار الرجل صاحب الشخصية.",
        description: "الإبزيم ليس مجرد إغلاق، إنه توقيع — يُظهر Monk Beast شخصيته من خلال تصميم دبل مونك ستراب. الخطوة التالية لمن تجاوز أساليب الدربي والأكسفورد الكلاسيكية؛ إغلاق الإبزيم يُلغي الحاجة للأربطة مع إضافة سهولة الارتداء. موديل يُثار الحديث عنه من حفلات السهرة إلى اجتماعات العمل.",
        features: ["إبزيم مزدوج (دبل مونك ستراب)","جلد عجل أصيل","كعب مكدّس","تفاصيل بروغ مخيطة يدوياً","نعل خارجي مطاطي ناعم"],
        styling: ["بنطال رمادي ضيق الساق + كنزة داكنة","بنطال أسود ضيق + قميص أبيض + بليزر","ترنش بيج + شينو داكن"]
      },
      ru: {
        shortDescription: "Дизайн двойного монк-страпа — выбор мужчины с характером.",
        description: "Пряжка — это не просто застёжка, это подпись — Monk Beast заявляет о своей личности через дизайн двойного монк-страпа. Следующий шаг для тех, кто перерос классические дерби и оксфорды; застёжка на пряжку устраняет необходимость в шнурках, добавляя лёгкость надевания. Модель, о которой говорят от вечерних мероприятий до деловых встреч.",
        features: ["Двойная пряжка (Double-Monk Strap)","Натуральная телячья кожа","Составной каблук","Детали броги ручной прострочки","Гладкая резиновая подошва"],
        styling: ["Зауженные серые брюки + тёмный свитер","Зауженные чёрные брюки + белая рубашка + пиджак","Бежевый тренч + тёмные чино"]
      }
    },
    metaTitle: {
      tr: "Monk Beast Tokalı Erkek Ayakkabı | Neri Shoes",
      en: "Monk Beast Double Buckle Men's Shoe | Neri Shoes",
      de: "Monk Beast Doppelschnalle Herrenschuh | Neri Shoes",
      it: "Monk Beast Doppia Fibbia Scarpa Uomo | Neri Shoes",
      ar: "Monk Beast إبزيم مزدوج حذاء رجالي | Neri Shoes",
      ru: "Monk Beast Двойная пряжка Мужские туфли | Neri Shoes"
    },
    metaDescription: {
      tr: "Monk Beast — çift toka monk strap tasarım, hakiki dana derisi. Neri Shoes karakter erkek ayakkabı koleksiyonu.",
      en: "Monk Beast — double buckle monk strap design, genuine calfskin leather. Neri Shoes character men's shoe collection.",
      de: "Monk Beast — Doppelschnalle Monk-Strap-Design, echtes Kalbsleder. Neri Shoes Charakter-Herrenschuhkollektion.",
      it: "Monk Beast — design double monk strap, vera pelle di vitello. Collezione scarpe uomo con carattere Neri Shoes.",
      ar: "Monk Beast — تصميم دبل مونك ستراب وجلد عجل أصيل. مجموعة Neri Shoes للأحذية الرجالية ذات الشخصية.",
      ru: "Monk Beast — дизайн двойного монк-страпа, натуральная телячья кожа. Коллекция характерной мужской обуви Neri Shoes."
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
