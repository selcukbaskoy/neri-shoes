const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');
const products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const TRANSLATIONS = {
  "313": {
    content: {
      tr: {
        shortDescription: "Hafif EVA taban ve nefes alabilir yapıyla günlük spor konforu.",
        description: "Her adımda enerjini hisset — 313 Spor, aktif yaşamın temposuna göre tasarlandı. Ultra hafif EVA taban teknolojisi, uzun gün boyunca ayaklarını yorulmadan taşır. Spor salonundan sokağa, sabahtan akşama kadar yorulmadan giyilebilen çok yönlü bir model. Beyaz spor çorap ve jogger eşofman altıyla ikonik bir sokak stili. Günlük şort, siyah tişört ve bu sneaker — en basit kombinasyonun en güçlü hali.",
        features: ["Hafif EVA Taban","Nefes Alabilir Mesh Üst","Esnek Bükülme Noktaları","Kaymaz Kauçuk Alt Taban","Ortopedik Tabanlık Desteği"],
        styling: ["Beyaz jogger + siyah tişört + beyaz çorap","Skinny jean + basic tee + beyaz sneaker çorap","Track pantolon + zip-up hoodie"]
      },
      en: {
        shortDescription: "Lightweight EVA sole and breathable upper for all-day sport comfort.",
        description: "Feel the energy with every step — 313 Sport is built for the pace of an active life. Ultra-lightweight EVA sole technology carries your feet all day without fatigue. Versatile enough to take you from the gym to the street without missing a beat. Pair white sport socks with joggers for an iconic street look. Shorts, a black tee, and these sneakers — simplicity at its most powerful.",
        features: ["Lightweight EVA Sole","Breathable Mesh Upper","Flexible Flex Points","Non-Slip Rubber Outsole","Orthopedic Insole Support"],
        styling: ["White joggers + black tee + white socks","Skinny jeans + basic tee + white sneaker socks","Track pants + zip-up hoodie"]
      },
      de: {
        shortDescription: "Leichte EVA-Sohle und atmungsaktives Obermaterial für ganztägigen Sportkomfort.",
        description: "Spüre die Energie bei jedem Schritt — 313 Sport wurde für das Tempo eines aktiven Lebens entwickelt. Die ultraleichte EVA-Sohlentechnologie trägt deine Füße den gesamten Tag ohne Ermüdung. Vielseitig genug, um dich vom Fitnessstudio bis auf die Straße zu begleiten. Weiße Sportsocken kombiniert mit Jogginghose für einen ikonischen Streetlook. Shorts, schwarzes T-Shirt und dieser Sneaker — Schlichtheit in ihrer stärksten Form.",
        features: ["Leichte EVA-Sohle","Atmungsaktives Mesh-Obermaterial","Flexible Biegepunkte","Rutschfeste Gummiaußensohle","Orthopädische Einlegesohle"],
        styling: ["Weiße Jogginghose + schwarzes T-Shirt + weiße Socken","Skinny Jeans + Basic-Shirt + weiße Sneakersocken","Sporthose + Zip-Hoodie"]
      },
      it: {
        shortDescription: "Suola EVA leggera e tomaia traspirante per il comfort sportivo di tutto il giorno.",
        description: "Senti l'energia ad ogni passo — il 313 Sport è progettato per il ritmo della vita attiva. La tecnologia della suola ultra-leggera in EVA porta i tuoi piedi per tutto il giorno senza affaticarli. Abbastanza versatile da portarti dalla palestra alla strada. Abbina calzini bianchi a pantaloni jogger per un look street iconico. Shorts, t-shirt nera e queste sneaker — la semplicità nella sua forma più potente.",
        features: ["Suola EVA Leggera","Tomaia in Mesh Traspirante","Punti di Flessione Flessibili","Suola Esterna Antiscivolo","Supporto Plantare Ortopedico"],
        styling: ["Jogger bianchi + t-shirt nera + calzini bianchi","Jeans skinny + t-shirt basic + calzini da sneaker bianchi","Tuta sportiva + felpa con zip"]
      },
      ar: {
        shortDescription: "نعل EVA خفيف الوزن وجزء علوي قابل للتنفس لراحة رياضية طوال اليوم.",
        description: "اشعر بالطاقة في كل خطوة — صُمّم 313 Sport لإيقاع الحياة النشطة. تقنية النعل الخفيف جداً من EVA تحمل قدميك طوال اليوم دون تعب. متعدد الاستخدامات لمرافقتك من الصالة الرياضية إلى الشارع. الجوارب الرياضية البيضاء مع بنطال الجوقر لإطلالة شارعية أيقونية. شورت يومي وتيشرت أسود وهذا الحذاء — البساطة في أقوى صورها.",
        features: ["نعل EVA خفيف الوزن","جزء علوي شبكي قابل للتنفس","نقاط ثني مرنة","نعل خارجي مطاطي مقاوم للانزلاق","دعم نعل داخلي تقويمي"],
        styling: ["جوقر أبيض + تيشرت أسود + جوارب بيضاء","جينز ضيق + تيشرت بيسك + جوارب بيضاء","بنطال تدريب + هودي بسحّاب"]
      },
      ru: {
        shortDescription: "Лёгкая подошва EVA и дышащий верх для спортивного комфорта весь день.",
        description: "Ощути энергию с каждым шагом — 313 Sport создан для темпа активной жизни. Ультралёгкая подошва EVA несёт твои ноги без усталости весь день. Достаточно универсальные, чтобы перенести тебя из спортзала на улицу. Белые спортивные носки с джоггерами — иконический уличный образ. Шорты, чёрная футболка и эти кроссовки — простота в её мощнейшей форме.",
        features: ["Лёгкая подошва EVA","Дышащий сетчатый верх","Гибкие точки изгиба","Нескользящая резиновая подошва","Ортопедическая стелька"],
        styling: ["Белые джоггеры + чёрная футболка + белые носки","Скинни джинсы + базовая футболка + белые носки","Спортивные штаны + толстовка на молнии"]
      }
    },
    metaTitle: {
      tr: "313 Erkek Spor Ayakkabı | Neri Shoes",
      en: "313 Men's Sport Shoe | Neri Shoes",
      de: "313 Herren Sportschuh | Neri Shoes",
      it: "313 Scarpa Sportiva Uomo | Neri Shoes",
      ar: "313 حذاء رياضي رجالي | Neri Shoes",
      ru: "313 Мужские спортивные кроссовки | Neri Shoes"
    },
    metaDescription: {
      tr: "Neri Shoes 313 spor ayakkabı — hafif EVA taban, nefes alabilir yapı ve günlük konfor. Aktif erkekler için tasarlandı.",
      en: "Neri Shoes 313 sport shoe — lightweight EVA sole, breathable build and everyday comfort. Designed for active men.",
      de: "Neri Shoes 313 Sportschuh — leichte EVA-Sohle, atmungsaktive Konstruktion und täglicher Komfort. Für aktive Männer.",
      it: "Neri Shoes 313 scarpa sportiva — suola EVA leggera, costruzione traspirante e comfort quotidiano. Progettata per uomini attivi.",
      ar: "Neri Shoes 313 حذاء رياضي — نعل EVA خفيف وبنية قابلة للتنفس وراحة يومية. مصمم للرجال النشطين.",
      ru: "Neri Shoes 313 спортивная обувь — лёгкая подошва EVA, дышащая конструкция и повседневный комфорт. Для активных мужчин."
    }
  },

  "314": {
    content: {
      tr: {
        shortDescription: "Yüksek performans süspansiyon tabanı ile sokak koşusu için.",
        description: "Hız ve stil arasındaki denge — 314 Runner, performansı estetikle buluşturur. Yüksek süspansiyonlu alt taban, her adımda darbe emilimi sağlar ve eklemleri korur. Tempolu yürüyüşten hafif koşuya kadar geniş kullanım aralığı sunar. Sıkı slim fit pantolon ve sade bir hoodie ile giydiğinde sportif ama şık görünür. Bir kez giyenler için vazgeçilmez olan bu model, konforunu ilk adımdan hissettirir.",
        features: ["Süspansiyonlu Alt Taban","Mesh Üst Yüzey","Hafif Sentetik Deri Kaplama","Ergonomik İç Tabanlık","Güçlendirilmiş Topuk Desteği"],
        styling: ["Slim fit gri pantolon + siyah hoodie","Beyaz track suit + kontrast renkli çorap","Günlük jean + oversize tişört"]
      },
      en: {
        shortDescription: "High-performance suspension sole for street running and everyday speed.",
        description: "The balance between speed and style — 314 Runner brings performance and aesthetics together. The high-suspension outsole absorbs impact with every step, protecting your joints. Covers a wide range from brisk walking to light running. Slim fit pants and a simple hoodie make it sporty yet sharp. Once worn, this model becomes indispensable — you feel the comfort from the very first step.",
        features: ["Suspension Outsole","Mesh Upper","Lightweight Synthetic Leather Overlay","Ergonomic Insole","Reinforced Heel Support"],
        styling: ["Slim fit grey pants + black hoodie","White track suit + contrasting socks","Casual jeans + oversized tee"]
      },
      de: {
        shortDescription: "Hochleistungs-Dämpfungssohle für Straßenlauf und alltägliche Geschwindigkeit.",
        description: "Die Balance zwischen Geschwindigkeit und Stil — der 314 Runner vereint Leistung und Ästhetik. Die Hochdämpfungssohle absorbiert bei jedem Schritt den Aufprall und schützt die Gelenke. Bietet eine breite Palette von zügigem Gehen bis zum leichten Laufen. Slim-Fit-Hose und ein schlichter Hoodie machen ihn sportlich, aber schick. Einmal getragen, wird dieses Modell unverzichtbar.",
        features: ["Dämpfungsaußensohle","Mesh-Obermaterial","Leichtes synthetisches Leder-Overlay","Ergonomische Einlegesohle","Verstärkte Fersenunterstützung"],
        styling: ["Slim-Fit-Grau-Hose + schwarzer Hoodie","Weißer Trainingsanzug + kontrastierende Socken","Casual-Jeans + Oversized-T-Shirt"]
      },
      it: {
        shortDescription: "Suola a sospensione ad alte prestazioni per il running urbano e la velocità quotidiana.",
        description: "L'equilibrio tra velocità e stile — il 314 Runner unisce prestazioni ed estetica. La suola ad alta sospensione assorbe l'impatto ad ogni passo, proteggendo le articolazioni. Copre un ampio range dalla camminata veloce alla corsa leggera. Pantaloni slim fit e una semplice felpa lo rendono sportivo ma elegante. Una volta indossato, questo modello diventa indispensabile.",
        features: ["Suola a Sospensione","Tomaia in Mesh","Rivestimento in Pelle Sintetica Leggera","Soletta Ergonomica","Supporto Tallone Rinforzato"],
        styling: ["Pantaloni slim grigio + felpa nera","Tuta bianca + calzini a contrasto","Jeans casual + t-shirt oversize"]
      },
      ar: {
        shortDescription: "نعل تعليق عالي الأداء للركض في الشارع والسرعة اليومية.",
        description: "التوازن بين السرعة والأناقة — يجمع 314 Runner بين الأداء والجماليات. تمتص الجزء السفلي عالي التعليق الصدمات مع كل خطوة وتحمي مفاصلك. يغطي نطاقاً واسعاً من المشي السريع إلى الجري الخفيف. بنطال سليم فيت وهودي بسيط يجعله رياضياً وأنيقاً في آن واحد. مجرد تجربته تجعله لا غنى عنه.",
        features: ["نعل خارجي بتعليق","جزء علوي شبكي","طلاء جلد اصطناعي خفيف","نعل داخلي مريح","دعم كعب معزز"],
        styling: ["بنطال رمادي سليم فيت + هودي أسود","بدلة رياضية بيضاء + جوارب متباينة","جينز كاجوال + تيشرت أوفر سايز"]
      },
      ru: {
        shortDescription: "Высокопроизводительная амортизирующая подошва для уличного бега и скорости.",
        description: "Баланс между скоростью и стилем — 314 Runner объединяет производительность и эстетику. Амортизирующая подошва поглощает удары при каждом шаге, защищая суставы. Охватывает широкий диапазон от быстрой ходьбы до лёгкого бега. Зауженные брюки и простая толстовка делают его спортивным и стильным. Однажды надев, эту модель уже не хочется снимать.",
        features: ["Амортизирующая подошва","Сетчатый верх","Лёгкое синтетическое кожаное покрытие","Эргономичная стелька","Усиленная поддержка пятки"],
        styling: ["Серые зауженные брюки + чёрная толстовка","Белый спортивный костюм + контрастные носки","Повседневные джинсы + оверсайз футболка"]
      }
    },
    metaTitle: {
      tr: "314 Runner Erkek Spor Ayakkabı | Neri Shoes",
      en: "314 Runner Men's Sport Shoe | Neri Shoes",
      de: "314 Runner Herren Sportschuh | Neri Shoes",
      it: "314 Runner Scarpa Sportiva Uomo | Neri Shoes",
      ar: "314 Runner حذاء رياضي رجالي | Neri Shoes",
      ru: "314 Runner Мужские спортивные кроссовки | Neri Shoes"
    },
    metaDescription: {
      tr: "314 Runner erkek spor ayakkabı — süspansiyonlu taban ve mesh üst yapı. Neri Shoes premium spor koleksiyonu.",
      en: "314 Runner men's sport shoe — suspension outsole and mesh upper. Neri Shoes premium sport collection.",
      de: "314 Runner Herren Sportschuh — Dämpfungssohle und Mesh-Obermaterial. Neri Shoes Premium-Sportkollektion.",
      it: "314 Runner scarpa sportiva uomo — suola a sospensione e tomaia in mesh. Collezione sport premium Neri Shoes.",
      ar: "314 Runner حذاء رياضي رجالي — نعل تعليق وجزء علوي شبكي. مجموعة الرياضة المميزة من Neri Shoes.",
      ru: "314 Runner мужские спортивные кроссовки — амортизирующая подошва и сетчатый верх. Премиальная спортивная коллекция Neri Shoes."
    }
  }
};

const converted = products.map(p => {
  const t = TRANSLATIONS[p.id];
  if (!t) return p; // leave untouched products as-is

  const { shortDescription, description, features, styling, metaTitle, metaDescription, image, images, ...rest } = p;
  return {
    ...rest,
    images: p.images,
    image: p.image,
    content: t.content,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
  };
});

fs.writeFileSync(dataPath, JSON.stringify(converted, null, 2), 'utf-8');

const done = converted.filter(p => p.content).map(p => p.id);
const pending = converted.filter(p => !p.content).map(p => p.id);
console.log('DONE (' + done.length + '):', done.join(', '));
console.log('PENDING (' + pending.length + '):', pending.join(', '));
