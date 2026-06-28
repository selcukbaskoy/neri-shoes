const fs = require("fs");
const path = require("path");

const projectRoot = "C:\\Users\\selcu\\Desktop\\NeriSohes.com";
const urunlerDir = projectRoot + "\\ürünler";
const publicProducts = projectRoot + "\\public\\products";

// Ensure public/products directory exists
fs.mkdirSync(publicProducts, { recursive: true });

const PRODUCTS = [
  {
    folder: "313",
    slug: "313",
    name: "313 Spor",
    category: "spor",
    wholesale: true,
    retail: true,
    featured: true,
    shortDescription: "Hafif EVA taban ve nefes alabilir yapıyla günlük spor konforu.",
    description: "Her adımda enerjini hisset — 313 Spor, aktif yaşamın temposuna göre tasarlandı. Ultra hafif EVA taban teknolojisi, uzun gün boyunca ayaklarını yorulmadan taşır. Spor salonundan sokağa, sabahtan akşama kadar yorulmadan giyilebilen çok yönlü bir model. Beyaz spor çorap ve jogger eşofman altıyla ikonik bir sokak stili. Günlük şort, siyah tişört ve bu sneaker — en basit kombinasyonun en güçlü hali.",
    features: ["Hafif EVA Taban", "Nefes Alabilir Mesh Üst", "Esnek Bükülme Noktaları", "Kaymaz Kauçuk Alt Taban", "Ortopedik Tabanlık Desteği"],
    styling: ["Beyaz jogger + siyah tişört + beyaz çorap", "Skinny jean + basic tee + beyaz sneaker çorap", "Track pantolon + zip-up hoodie"],
    metaTitle: "313 Erkek Spor Ayakkabı | Neri Shoes",
    metaDescription: "Neri Shoes 313 spor ayakkabı — hafif EVA taban, nefes alabilir yapı ve günlük konfor. Aktif erkekler için tasarlandı."
  },
  {
    folder: "314",
    slug: "314",
    name: "314 Runner",
    category: "spor",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Yüksek performans süspansiyon tabanı ile sokak koşusu için.",
    description: "Hız ve stil arasındaki denge — 314 Runner, performansı estetikle buluşturur. Yüksek süspansiyonlu alt taban, her adımda darbe emilimi sağlar ve eklemleri korur. Tempolu yürüyüşten hafif koşuya kadar geniş kullanım aralığı sunar. Sıkı slim fit pantolon ve sade bir hoodie ile giydiğinde sportif ama şık görünür. Bir kez giyenler için vazgeçilmez olan bu model, konforunu ilk adımdan hissettirir.",
    features: ["Süspansiyonlu Alt Taban", "Mesh Üst Yüzey", "Hafif Sentetik Deri Kaplama", "Ergonomik İç Tabanlık", "Güçlendirilmiş Topuk Desteği"],
    styling: ["Slim fit gri pantolon + siyah hoodie", "Beyaz track suit + kontrast renkli çorap", "Günlük jean + oversize tişört"],
    metaTitle: "314 Runner Erkek Spor Ayakkabı | Neri Shoes",
    metaDescription: "314 Runner erkek spor ayakkabı — süspansiyonlu taban ve mesh üst yapı. Neri Shoes premium spor koleksiyonu."
  },
  {
    folder: "4767 ÖKÇELİ TABAN",
    slug: "4767-okceli-taban",
    name: "4767 Ökçeli Taban",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Yüksek ökçeli taban ve hakiki deri ile maskülen zarafet.",
    description: "Uzunluk ve duruş sana avantaj sağlar — 4767 Ökçeli Taban, birkaç santim fazlasıyla büyük fark yaratır. Hakiki dana derisi üst yüzey, yıllar geçtikçe daha güzel görünür; Neolit taban ise günlük kullanımın sert koşullarına dayanır. İş toplantısında, özel buluşmada veya resmi davette kimseyle karıştırılmazsın. Dar kesim lacivert pantolon ve beyaz gömlek ile kombinle, saatini takayı unutma. Bu model seni değil, sen bu modeli tamamlarsın.",
    features: ["Hakiki Dana Derisi", "Yüksek Ökçeli Neolit Taban", "Deri Astar", "El Dikişi Detay", "Bağcıklı Klasik Kapanma"],
    styling: ["Dar kesim lacivert takım + beyaz gömlek", "Siyah slim pantolon + mock turtleneck", "Antrasit chino + balıkçı yaka"],
    metaTitle: "4767 Ökçeli Taban Erkek Ayakkabı | Neri Shoes",
    metaDescription: "4767 Ökçeli Taban — hakiki dana derisi ve yüksek Neolit taban. Klasik erkek ayakkabı, Neri Shoes resmi koleksiyonu."
  },
  {
    folder: "4767-Yarasa Kauçuk - Eva Taban",
    slug: "4767-yarasa-kaucuk-eva-taban",
    name: "4767 Yarasa Kauçuk Eva Taban",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Yarasa tabanlı kauçuk ve EVA kombinasyonuyla gün boyu konfor.",
    description: "Zarif görünüş, yorulmayan adımlar — 4767 Yarasa Kauçuk EVA Taban, klasik tasarımı modern konforla buluşturur. Yarasa formlu özel kalıpla üretilen kauçuk-EVA kompozit taban, standart tabanların iki katı esneklik sunar. Resmi ortamlarda topuk sesini bastırır, uzun mesafe yürüyüşlerde ise baskı noktalarını eşit dağıtır. Slim pantolon ve önlü gömlek kombinasyonunda ofis şıklığını tanımlar. Klasik erkek gardırobunun temel taşı olmayı hak eden bir model.",
    features: ["Yarasa Formlu Kauçuk-EVA Kompozit Taban", "Hakiki Deri Üst Yüzey", "Baskı Dağıtıcı Ortopedik Astar", "El Dikişi Burun Detayı", "Antislip Alt Yüzey"],
    styling: ["Bej slim fit pantolon + beyaz gömlek + ceket", "Koyu gri chino + siyah önlü gömlek", "Lacivert takım + beyaz cep mendili"],
    metaTitle: "4767 Yarasa Kauçuk EVA Erkek Ayakkabı | Neri Shoes",
    metaDescription: "4767 Yarasa Kauçuk EVA Taban — klasik deri ve EVA kompozit taban konforu. Neri Shoes erkek ayakkabı koleksiyonu."
  },
  {
    folder: "4919 SÜET  DÜZ DERİLER",
    slug: "4919-suet-duz-deriler",
    name: "4919 Süet Düz Deriler",
    category: "erkek",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Düz kesim süet deri — minimalist maskülenliğin saf hali.",
    description: "Az söyleyen, çok anlatan bir tasarım — 4919 Süet Düz Deriler, gereksiz detaylardan arındırılmış saf süet güzelliğini sunar. İnce taneli doğal süet yüzey, her ışıkta farklı bir derinlik kazanır ve dokunuşu ipek gibi hissettir. Gündelik şıklık arayanlar için mükemmel bir gün boyu modeli; ofisten akşam yemeğine geçerken forma sokmadan taşır. Koyu renk pantolon ve katmanlı bir üst giysiyle şık, açık renk pantolon ve basic tişörtle rahat bir kombin oluşturur. Doğru süet bakımıyla bu ayakkabı senin imzan olur.",
    features: ["İnce Taneli Hakiki Süet", "Düz Kesim Klasik Form", "Hafif Kauçuk Alt Taban", "Nefes Alabilir Tekstil Astar", "Bağcıksız Slip-on Seçenek"],
    styling: ["Siyah slim pantolon + beyaz oversize tişört", "Koyu kahve chino + krem balıkçı yaka kazak", "Açık gri jean + beyaz oxford gömlek"],
    metaTitle: "4919 Süet Düz Erkek Ayakkabı | Neri Shoes",
    metaDescription: "4919 Süet Düz Deriler — ince taneli hakiki süet ve minimalist kesim. Neri Shoes erkek ayakkabı koleksiyonu Adana."
  },
  {
    folder: "4920 SÜET DERİ",
    slug: "4920-suet-deri",
    name: "4920 Süet Deri",
    category: "erkek",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Süet ve pürüzsüz deri kombinasyonu — iki dünyanın en iyisi.",
    description: "Süet yumuşaklığı, derinin gücü — 4920, iki malzemeyi tek tasarımda ustaca harmanlıyor. Burnunda pürüzsüz deri, yanda ve ökçede ince süet kullanımı, görsel bir kontrast ve zengin bir tekstür oyunu yaratır. Bu iki malzeme kombinasyonu modelin hem günlük hem de yarı resmi ortamlarda kullanılabilmesini sağlar. Koyu jins ve polo gömlek ile rahat bir weekend stili, slim chino ve önlü gömlek ile ofis şıklığı elde edersin. Kaliteyi yakından hissetmek isteyenler için biçilmiş kaftan.",
    features: ["Pürüzsüz Hakiki Deri + Süet Kombinasyon", "Dual-Texture Tasarım", "Hafif Neolit Taban", "Deri İç Astar", "El Dikişi Detaylar"],
    styling: ["Koyu indigo jean + slim polo gömlek", "Antrasit chino + açık renk knit kazak", "Siyah slim pantolon + koyu gömlek"],
    metaTitle: "4920 Süet Deri Erkek Ayakkabı | Neri Shoes",
    metaDescription: "4920 Süet Deri — pürüzsüz deri ve süet kombinasyonu, dual-texture erkek ayakkabı. Neri Shoes koleksiyonu."
  },
  {
    folder: "B-01  DOLAR",
    slug: "b-01-dolar",
    name: "B-01 Dolar",
    category: "gunluk",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Tok taban, rahat şekil — günlük taşınabilirliğin premium versiyonu.",
    description: "Her günün ayakkabısı olacak — B-01 Dolar, günlük kullanımın tüm gereksinimlerini bir modelde toplar. Tok ve dayanıklı tabanı uzun mesafe yürüyüşlerde destek sağlarken, geniş fit yapısı ayaklarınıza nefes aldırır. Şehir hayatının hızıyla uyumlu, pratik bir model: markete giderken, parkta otururken, arkadaş buluşmasında hep doğru seçim. Chino ve polo kombinasyonuyla clean bir şehirli look, jean ve bomber jacket ile sportif bir stil sunar. Renk seçenekleriyle gardırobuna kolayca entegre olur.",
    features: ["Tok Kauçuk Alt Taban", "Geniş Fit Erkek Kalıbı", "Hava Sirkülasyonlu Üst Yüzey", "Yastıklı İç Tabanlık", "Kolay Temizlenen Materyal"],
    styling: ["Bej chino + lacivert polo gömlek", "Slim jean + plain tişört + açık renk bomber", "Eşofman altı + oversize kapüşonlu"],
    metaTitle: "B-01 Dolar Günlük Erkek Ayakkabı | Neri Shoes",
    metaDescription: "B-01 Dolar günlük erkek ayakkabı — tok kauçuk taban ve rahat fit. Neri Shoes şehir günlük koleksiyonu."
  },
  {
    folder: "CBOT1",
    slug: "cbot1",
    name: "CBOT1 Chelsea Bot",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Elastik yan bantlı hakiki deri Chelsea bot — klasiğin özü.",
    description: "Siyahın tüm tonlarını içinde taşıyan bir chelsea — CBOT1, klasik İngiliz tasarımını Türk zanaat kalitesiyle sunuyor. Elastik yan bantlar, modele giymesi son derece kolay ve pratik bir özellik katarken ayağa da mükemmel oturum sağlar. Hakiki deri üst yüzey, zamanla daha soylu bir görünüm kazanır; her gün giyildikçe ayağına özel bir form alır. İnce paçalı siyah pantolon veya skinny jean üstüne, uzun bir kazak veya palto ile giyildiğinde ikonik bir siluet oluşturur. Dört mevsim sizi şık tutacak tek bir bot yatırımı.",
    features: ["Hakiki Dana Derisi", "Elastik Yan Bantlar", "Yüksek Kauçuk Taban", "Deri İç Astar", "Klasik Chelsea Kalıbı"],
    styling: ["Skinny siyah pantolon + uzun palto + beyaz tişört", "Slim jean + oversize knit kazak", "Siyah slim pantolon + turtleneck"],
    metaTitle: "CBOT1 Chelsea Bot Erkek Ayakkabı | Neri Shoes",
    metaDescription: "CBOT1 Chelsea Bot — hakiki deri ve elastik yan bantlar. Klasik İngiliz tasarımı, Neri Shoes kalitesiyle."
  },
  {
    folder: "CHUNKY",
    slug: "chunky",
    name: "Chunky Derby",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: true,
    shortDescription: "Masif kauçuk taban ve parlak deri — güçlü duruşun yeni tanımı.",
    description: "Görünce ikinci kez bakılacak bir ayakkabı — Chunky Derby, klasik derby'nin masif ve çarpıcı yorumudur. Tam parlak dana derisi üst yüzey, güçlü kauçuk taban ile buluşunca hem biçimsel hem de fiziksel bir ağırlık yaratır. Ofis toplantısında dikkat çekici, resmi bir etkinlikte anılmayı hak eden bir model. Siyah slim pantolon ve beyaz gömlek ile karizmatik, koyu gri takım elbise ile dominan bir görünüm sunar. Bunu giyen adam odaya girdiğinde fark edilir.",
    features: ["Tam Parlak Hakiki Dana Derisi", "Masif Çentikli Kauçuk Taban", "Yumuşak Hakiki Deri Astar", "Dikişli Yarasa Burun Detayı", "Bağcıklı Derby Kapanması"],
    styling: ["Slim fit siyah pantolon + beyaz gömlek + saat", "Antrasit chino + siyah mock turtleneck", "Koyu gri takım + beyaz cep mendili"],
    metaTitle: "Chunky Derby Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Chunky Derby erkek ayakkabı — tam parlak dana derisi ve masif kauçuk taban ile güçlü duruş. Neri Shoes 2026 koleksiyonu."
  },
  {
    folder: "Cloud Loafer Series",
    slug: "cloud-loafer-series",
    name: "Cloud Loafer Series",
    category: "gunluk",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Bulut hafifliğinde taban — bağcıksız konforu yeniden tanımlar.",
    description: "Adım atmak değil, süzülmek — Cloud Loafer Series, her adımı bulut gibi hafif hissettirmek için tasarlandı. Ultra hafif köpük taban teknolojisi, uzun gün boyunca sıfır yorgunluk hissine katkı sağlar. Slip-on tasarımıyla sabahları zaman kaybetmezsin, ayağın rahat oturur ve kıpırdamaz. Chino ya da slim jean ile casual bir şehirli stil, hafta sonu rahat bir kahve molasında veya şehir yürüyüşünde mükemmel tamamlar. Gardırobundaki en pratik modelin bu olmayacağına dair garanti istiyorsan, bir kez giy.",
    features: ["Ultra Hafif Köpük Taban", "Slip-On Tasarım", "Hakiki Deri veya Süet Üst", "Yastıklı Ortopedik İç Taban", "Geniş Fit Rahatlık"],
    styling: ["Krem chino + beyaz slim polo gömlek", "Açık gri slim jean + koyu tişört", "Şort + polo gömlek (yaz stili)"],
    metaTitle: "Cloud Loafer Series Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Cloud Loafer Series — ultra hafif köpük taban ve slip-on konfor. Neri Shoes günlük erkek ayakkabı koleksiyonu."
  },
  {
    folder: "Croco Black Edition",
    slug: "croco-black-edition",
    name: "Croco Black Edition",
    category: "erkek",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Timsah desen hakiki deri — agresif şıklığın özel edisyonu.",
    description: "Sıradan değil, özel — Croco Black Edition, timsah desen baskılı hakiki deri ile koleksiyonun en çarpıcı modeli. Her baskı deseni kendine özgü; bu yüzden her çift, dünyada bir tane olan bir sanat eseridir. Sahip olduğun kalabalıkta seni ayırt eden bir model, gece yemeğinde masanın en ilginç kişisi olmanı sağlar. Siyah slim pantolon ve koyu gömlek ile tam anlamıyla all-black bir görünüm için biçilmiş kaftan. Bu ayakkabıyı giyen adam ceket giymeye ihtiyaç duymaz — zaten bütündür.",
    features: ["Timsah Desen Baskılı Hakiki Deri", "Yüksek Parlaklıklı Yüzey", "Özgün Desen Varyasyonları", "Kauçuk Alt Taban", "Özel Edisyon Üretim"],
    styling: ["All-black slim pantolon + siyah gömlek", "Koyu gri pantolon + siyah balıkçı yaka", "Siyah chino + beyaz gömlek (kontrast)"],
    metaTitle: "Croco Black Edition Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Croco Black Edition — timsah desen baskılı hakiki deri, özel edisyon erkek ayakkabı. Neri Shoes koleksiyonu."
  },
  {
    folder: "Full Black",
    slug: "full-black",
    name: "Full Black",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Tamamen siyah, tamamen kararlı — all-black erkeğin son noktası.",
    description: "Siyah sadece bir renk değil, bir tutum — Full Black, bu tutumun ayakkabıya yansımasıdır. Üst yüzeyden tabana, dikişten bağcığa kadar her detay derin, mat bir siyahta işlendi. Bu denge, her tonun uyumunu bozmadan gardırobun her köşesine uyum sağlar. Siyah-siyah-siyah kombininden beyaz tişörtlü bir kontrast kombinasyonuna kadar hatasız çalışır. Minimalist estetiğin doruk noktası: ne fazla, ne eksik.",
    features: ["Tam Mat Siyah Hakiki Deri", "Siyah Kauçuk Alt Taban", "Siyah Bağcık Detayı", "Siyah Deri Astar", "Tek Ton Bütünlük Tasarımı"],
    styling: ["All-black slim pantolon + siyah gömlek + ceket", "Siyah slim jean + beyaz oversize tişört (kontrast)", "Siyah chino + siyah mock turtleneck"],
    metaTitle: "Full Black Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Full Black erkek ayakkabı — tamamen siyah hakiki deri, all-black tasarım. Neri Shoes klasik koleksiyonu."
  },
  {
    folder: "HBRİT DERBY2",
    slug: "hbrit-derby2",
    name: "Hybrid Derby 2",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "İkinci nesil hibrit derby — klasikle sporu mükemmel dengede tutar.",
    description: "İki dünyanın en iyisi tek bir modelde — Hybrid Derby 2, klasik derby formunu spor konfort teknolojisiyle harmanlar. Resmi görüntü, spor tabanın konforu: bu denklemi çözmek isteyenler için üretildi. Gün içinde toplantıdan spor aktiviteye geçişlerde fazladan değişime gerek bırakmayan çok yönlü yapısıyla öne çıkar. İnce paçalı pantolon ve önlü gömlek ile klasik iş stili, chino ve polo ile gelişmiş casual look yaratır. Aktif yaşamı olanlara özel bir klasik.",
    features: ["Klasik Deri Üst + Spor EVA Alt Taban", "Hibrit Yapı", "Hafif Ağırlık", "Yumuşak Deri Astar", "Nefes Alabilir Yapı"],
    styling: ["Slim chino + beyaz gömlek, hafif açık yaka", "Koyu jean + polo gömlek + denim ceket", "Siyah pantolon + çizgili gömlek"],
    metaTitle: "Hybrid Derby 2 Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Hybrid Derby 2 — klasik deri üst ve EVA alt taban hibrit yapı. Neri Shoes premium erkek ayakkabı koleksiyonu."
  },
  {
    folder: "HOT Leather Series",
    slug: "hot-leather-series",
    name: "HOT Leather Series",
    category: "erkek",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Hakiki derinin canlı renkleriyle dikkat çeken premium seri.",
    description: "Renk cesareti gerektirir — HOT Leather Series, hakiki derinin canlı ve derin tonal renklerini cesurca kullanır. Doğal deri boyama teknikleriyle elde edilen her renk, tonlar arasında geçişler ve derinlikler barındırır; fabrikasyon bir ton değil, yaşayan bir yüzey. Bu seri, stilini konuşturmak isteyenler için: hem şık hem de hafızalarda kalan bir model. Sade ve tek renkli üst giysiyle kombinlediğinde, bu ayakkabı kombininin tek yıldızı olur. Deri bakımı yapıldığında ömür boyu kullanılabilecek bir yatırım.",
    features: ["Hakiki Dana Derisi", "Doğal Boyama Tekniği", "Canlı Ton Renk Seçenekleri", "Deri İç Astar", "Tok Kauçuk Taban"],
    styling: ["Sade beyaz veya gri pantolon + renksiz tişört", "Koyu jean + plain krem kazak", "Bej chino + beyaz gömlek (renk odağı ayakkabı)"],
    metaTitle: "HOT Leather Series Erkek Ayakkabı | Neri Shoes",
    metaDescription: "HOT Leather Series — canlı renk hakiki dana derisi, doğal boyama teknikleri. Neri Shoes premium koleksiyonu."
  },
  {
    folder: "Hybrid Derby",
    slug: "hybrid-derby",
    name: "Hybrid Derby",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Ofisten sokağa kesintisiz taşıyan hibrit derby tasarımı.",
    description: "Sabah 9'dan gece 9'a tek model — Hybrid Derby, gün içindeki her geçişi kolaylaştırır. Klasik deri üst yapısı, resmi toplantılarda profesyonel bir görünüm sağlarken; gelişmiş EVA taban, uzun gün yürüyüşlerinde destekler. İki karakteri aynı anda taşıyan bu model, ofis ve sosyal hayat arasında gidip gelenlerin favorisi. Slim pantolon ve düğmeli gömlek ile ofis standardını yakalar, chino ve kazak ile gündelik zarafet sunar. Modern erkeğin modern çözümü.",
    features: ["Hakiki Deri Üst Yüzey", "Enerji Yansıtıcı EVA Ara Taban", "Klasik Derby Tasarımı", "Hafif Kauçuk Dış Taban", "Nefes Alabilir Tekstil Astar"],
    styling: ["Slim fit lacivert pantolon + beyaz gömlek", "Orta gri chino + açık mavi gömlek", "Bej chino + koyu polo gömlek"],
    metaTitle: "Hybrid Derby Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Hybrid Derby erkek ayakkabı — hakiki deri ve EVA taban, ofisten sokağa hibrit konfor. Neri Shoes koleksiyonu."
  },
  {
    folder: "LF-03 EVA TABAN",
    slug: "lf-03-eva-taban",
    name: "LF-03 EVA Taban",
    category: "spor",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Özel LF-03 EVA taban teknolojisiyle adım başı enerji geri kazanımı.",
    description: "Her adım enerji geri kazanır — LF-03 EVA Taban, spor ayakkabı teknolojisinin üst segmentine kendi geliştirdiğimiz taban formülüyle giriyor. LF-03 tabanlık sistemi, koşu sırasındaki darbe enerjisini emerek bir sonraki adıma aktarır; bu, maraton koşucularına bile tanıdık gelecek bir his. Nefes alabilir mesh üst yapı, yoğun aktivite sırasında ısı ve nemi dışarı atar. Koşu antrenmanlarından günlük aktif kullanıma kadar geniş bir performans aralığı sunar. Ayakkabının senin için ne kadar çalıştığını ilk adımda anlarsın.",
    features: ["LF-03 Enerji Geri Kazanımlı EVA Taban", "Mesh Nefes Alabilir Üst", "Dinamik Destek Orta Taban", "Kaymaz Kauçuk Dış Taban", "Çıkarılabilir Ortopedik Tabanlık"],
    styling: ["Spor şort + sıkı fit tişört + çorap", "Track pantolon + spor hoodie", "Slim jogger + cropped sweatshirt"],
    metaTitle: "LF-03 EVA Taban Erkek Spor Ayakkabı | Neri Shoes",
    metaDescription: "LF-03 EVA Taban spor ayakkabı — enerji geri kazanımlı EVA sistem ve mesh üst. Neri Shoes spor koleksiyonu."
  },
  {
    folder: "Milano-GM",
    slug: "milano-gm",
    name: "Milano GM",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: true,
    shortDescription: "İtalyan ilhamı, Türk zanaatı — lüks klasik erkek ayakkabının zirvesi.",
    description: "Milano sokaklarından ilham, Adana ustasının elinden çıkmış bir şaheser — Milano GM, ayakkabı dünyasında bir sınıf üstü konumlanır. Seçilmiş İtalyan ilhamı tasarımı ve yerli usta işçiliği bir araya gelince, binlerce liralık marka fiyatlarına rakip bir kalite çıkar ortaya. Resmi bir yemek daveti, şirket etkinliği veya özel kutlama — bu model her ortamda konuşulur. Siyah veya koyu lacivert takım elbise ile giyildiğinde tam anlamıyla gece ya da özel gün şıklığı sunar. Bir ayakkabı koleksiyonuna giren ilk lüks model olarak doğru adres.",
    features: ["Premium Hakiki Dana Derisi", "İtalyan İlhamı Tasarım", "El Dikişi Detaylar", "Topluk Yükseltici Neolit Taban", "Lüks Deri Astar"],
    styling: ["Siyah slim takım elbise + beyaz gömlek + kravat", "Lacivert takım + saten cep mendili", "Koyu gri slim pantolon + siyah ince kazak"],
    metaTitle: "Milano GM Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Milano GM — İtalyan ilhamı tasarım ve hakiki dana derisi lüks erkek ayakkabı. Neri Shoes premium klasik koleksiyonu."
  },
  {
    folder: "MONK-BEAST",
    slug: "monk-beast",
    name: "Monk Beast",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Tokalı monk strap tasarım — karakter sahibi erkeğin tercihi.",
    description: "Toka, sadece bir bağlama değil, bir imzadır — Monk Beast, double-monk strap tasarımıyla sahip olduğu kişiliği açıkça ortaya koyar. Klasik derby ve oxford modelleri aşanlar için bir sonraki adım; bağcık gerektirmeyen, toka ile kapanan yapısı aynı zamanda kullanım kolaylığı da sağlar. Gece davetinden iş toplantısına, her ortamda konuşulan bir model. İnce paçalı çuha pantolon ve yarım kollu örme kazak ile sanatsal bir stil, slim koyu pantolon ve beyaz gömlek ile klasik bir karşıtlık oluşturur. Karakterli olmak isteyenlere.",
    features: ["Çift Toka (Double-Monk Strap)", "Hakiki Dana Derisi", "Topaç Topuk", "El Dikişi Brogue Detaylar", "Pürüzsüz Kauçuk Taban"],
    styling: ["İnce paçalı gri pantolon + koyu kazak", "Slim siyah pantolon + beyaz gömlek + ceket", "Bej trench palto + koyu chino"],
    metaTitle: "Monk Beast Tokalı Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Monk Beast — çift toka monk strap tasarım, hakiki dana derisi. Neri Shoes karakter erkek ayakkabı koleksiyonu."
  },
  {
    folder: "NERİ URBAN (Çapraz Bağcıklı Süet)",
    slug: "neri-urban-capraz-bagcikli-suet",
    name: "Neri Urban Çapraz Bağcıklı Süet",
    category: "erkek",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Çapraz bağcık detaylı premium süet — urban tarzın kentsel sessizliği.",
    description: "Şehir senin sahnense — Neri Urban Çapraz Bağcıklı Süet, büyük şehrin ritmine özel tasarlandı. Çapraz bağcık detayı, klasik dikeyden farklı bir dinamizm ve görsel akış yaratır; modeli kendine özgü kılan bu geometrik detaydır. Premium süet yüzey, zarifliğini günler geçtikçe artırır ve her kullanımda daha karakterli bir dokuya kavuşur. Dar paçalı slim pantolon ve oversize bir gömlek veya bomber jacket ile hipster-chic bir look elde edilir. Bu ayakkabıyı giyenler şehrin dilinden anlar.",
    features: ["Premium Hakiki Süet Üst Yüzey", "Özel Çapraz Bağcık Deseni", "Urban Tasarım Konsepti", "Tok Kauçuk Taban", "Süet Koruyucu Astar"],
    styling: ["Slim pantolon + oversize linen gömlek + çanta", "Skinny jean + slim bomber jacket + beyaz tişört", "Koyu chino + katmanlı knit kazak"],
    metaTitle: "Neri Urban Çapraz Bağcıklı Süet Erkek | Neri Shoes",
    metaDescription: "Neri Urban Çapraz Bağcıklı Süet — premium süet ve çapraz bağcık urban tasarım. Neri Shoes erkek koleksiyonu."
  },
  {
    folder: "Noble Leather Chelsea BOT",
    slug: "noble-leather-chelsea-bot",
    name: "Noble Leather Chelsea Bot",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: true,
    shortDescription: "Asil deri Chelsea bot — soyluluğun bileğe kadar çıkan hali.",
    description: "Asalet diz kapağında değil, bileğinde başlar — Noble Leather Chelsea Bot, İngiliz aristokrasisinin ayakkabı mirasını modern erkek için yeniden yorumluyor. En üst kalite hakiki deri ile üretilen bu bot, dokunuşta hissedilen fark, görünüşte hissettirilen sınıf sunar. Elastik yan bantları, sabah acelesi yaratmayan kolay giyim sunarken topuk çekme ilmikleri bütünü tamamlar. Siyah skinny pantolon ve uzun yün palto kombinasyonunda Avrupa şıklığını, slim jean ve oversized kazak ile bohem bir zarafeti yakalar. Koleksiyonunu tamamlamak için bir Chelsea bot ediniyorsan, bu olsun.",
    features: ["En Üst Kalite Hakiki Dana Derisi", "Geniş Elastik Yan Bantlar", "Topuk Çekme İlmikleri", "Yüksek Kauçuk Taban", "Tam Deri Astar"],
    styling: ["Skinny siyah pantolon + uzun yün palto + beyaz kemer", "Slim jean + oversize knit kazak + trençkot", "Koyu slim chino + turtleneck kazak"],
    metaTitle: "Noble Leather Chelsea Bot Erkek | Neri Shoes",
    metaDescription: "Noble Leather Chelsea Bot — en üst kalite hakiki deri, klasik elastik bantlı chelsea bot. Neri Shoes koleksiyonu."
  },
  {
    folder: "Olive Python",
    slug: "olive-python",
    name: "Olive Python",
    category: "erkek",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Zeytin yeşili piton desen deri — doğanın gücünü ayağında taşı.",
    description: "Orman yeşilinin kentsel versiyonu — Olive Python, piton desen baskılı deri ile hem vahşi hem de sofistike bir denge kurar. Zeytin tonu, siyah ve bej ile mükemmel uyum içinde çalışırken; piton desen, görsel karmaşıklık katmanları ekler. Bu model, sıradan bir kombinasyonu hemen üst seviyeye taşıyan bir parçadır. Bej veya açık renk pantolon ve sade bir üst ile renk ve desen öne çıkar; bütün kombinasyona bu bakarak bakılır. Koleksiyonuna renk ve karakter katmak isteyenler için.",
    features: ["Piton Desen Baskılı Hakiki Deri", "Zeytin Tonu", "Kauçuk Alt Taban", "Deri İç Astar", "Exclusive Desen Çalışması"],
    styling: ["Bej slim chino + plain krem tişört", "Açık gri pantolon + beyaz gömlek", "Koyu jean + plain kazak + çanta"],
    metaTitle: "Olive Python Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Olive Python — zeytin yeşili piton desen baskılı hakiki deri erkek ayakkabı. Neri Shoes özel koleksiyonu."
  },
  {
    folder: "Prestige Leather BOT",
    slug: "prestige-leather-bot",
    name: "Prestige Leather Bot",
    category: "klasik",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Prestij sınıfı hakiki deri bot — her mevsim güçlü duruş.",
    description: "Prestij kelimesini hak eden tek şey kalitedir — Prestige Leather Bot, bu felsefeyle üretildi. En seçkin tabakhanerden alınan hakiki deri, ustanın elinde bir bot formuna dönüşürken her dikiş noktası özenle kontrol edilir. Dört mevsim kullanılabilecek ökçe yüksekliği ve taban sertliği, şehir içi yürüyüşte destek, özel ortamlarda ise sınıf hissi verir. Uzun pantolon ve slim fit palto veya yağmurluk ile sonbahar şıklığı, slim jean ve deri ceket ile dinamik bir görünüm sunar. Bu botu alan adamlar genellikle bir tanesini daha alır.",
    features: ["Seçkin Tabaka Hakiki Dana Derisi", "Uzun Konçlu Bot Tasarımı", "Kayış ve Toka Detayı", "Yüksek Kauçuk Taban", "Tam Deri Astar"],
    styling: ["Slim fit bej pantolon + kısa deri ceket", "Siyah slim pantolon + koyu gömlek + bot üzeri paça", "Slim jean + deri bomber jacket"],
    metaTitle: "Prestige Leather Bot Erkek | Neri Shoes",
    metaDescription: "Prestige Leather Bot — seçkin tabaka hakiki deri, uzun konçlu klasik bot. Neri Shoes premium koleksiyonu."
  },
  {
    folder: "Prestige Leather SÜET",
    slug: "prestige-leather-suet",
    name: "Prestige Leather Süet",
    category: "erkek",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Prestij seviyesinde süet — yumuşak dokunuş, güçlü izlenim.",
    description: "Süetin en üst hali — Prestige Leather Süet, sıradan süet modellerinden farklı olarak premium kalite standartlarında üretilir. Seçilmiş ince taneli nubuck süet, parmak darbelerine ve neme karşı işlenmiş özel kaplama sayesinde uzun ömürlüdür. Ayağa oturuşu yapısal olarak sağlamdır; günün sonunda da ilk giyildiği andaki formunu korur. Casual bir yemek davetinde veya rahat bir iş ortamında, slim pantolon ve katmanlı üst giysilerle mükemmel uyum sağlar. Süeti hafife alanlar bu modeli giyene kadar haksız kalır.",
    features: ["Premium Nubuck Süet", "Nem Koruyucu Özel Kaplama", "Yapısal Kalıp Desteği", "Hafif Neolit Taban", "Deri Astar"],
    styling: ["Koyu slim pantolon + knit kazak", "Bej chino + açık renkli gömlek + ceket", "Orta gri slim jean + koyu oversize tişört"],
    metaTitle: "Prestige Leather Süet Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Prestige Leather Süet — premium nubuck süet, nem koruyucu kaplama. Neri Shoes prestij erkek ayakkabı koleksiyonu."
  },
  {
    folder: "SOFT-LUXE DRIVER",
    slug: "soft-luxe-driver",
    name: "Soft Luxe Driver",
    category: "gunluk",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Yumuşak lüks deri driver loafer — ayağınıza sarılır, sizi taşır.",
    description: "Yumuşak deri sarılır, hafif kauçuk taşır — Soft Luxe Driver, klasik driving moccasin'in lüks bir yorumudur. Özel işlenmiş yumuşak nappa deri üst yapısı, ayak formuna göre şekillenir ve zamanla mükemmel bir oturum sağlar. Altında yer alan granül kauçuk nopalar, araç içinde, yat güvertesinde veya kaldırım taşlarında aynı kavrayışı sunar. Chino veya slim jean ile hafta sonu rahatı, keten pantolon ve önlü gömlek ile yazlık şıklık elde edilir. Bu ayakkabıyı giyenler çoğu günlük modeli geride bırakır.",
    features: ["Nappa Yumuşak Hakiki Deri", "Granül Kauçuk Nopa Taban", "Slip-On Driver Tasarımı", "Tam Deri Astar", "Lastikli Bilek Bantı"],
    styling: ["Slim bej keten pantolon + beyaz önlü gömlek + saat", "Açık renkli chino + polo gömlek", "Slim jean + keten önlü gömlek"],
    metaTitle: "Soft Luxe Driver Günlük Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Soft Luxe Driver — nappa yumuşak deri, granül kauçuk nopa taban driving loafer. Neri Shoes günlük lüks koleksiyonu."
  },
  {
    folder: "Stealth Black Edition",
    slug: "stealth-black-edition",
    name: "Stealth Black Edition",
    category: "spor",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Tam siyah stealth sneaker — görünmez güç, hissedilen konfor.",
    description: "Dikkat çekmeden etkileme sanatı — Stealth Black Edition, tüm dikkat çekici detayları siyahın derinliğinde saklayan bir sneaker. Siyah mesh üzere siyah kaplama, siyah taban üzerinde siyah nopa — her detay var ama gizli. Bu all-black sneaker yakın bakıldığında kompleks, uzaktan ise sade görünür; bu karşıtlık onu özel kılan şeydir. Slim siyah jean ve hoodie ile koyu tonlarda güçlü bir şehirli look oluşturur. Koleksiyonundaki renk cümbüşünün yanında bu modelin siyahlığı dengeleyici olur.",
    features: ["Siyah Mesh + Siyah Kaplama", "All-Black Komponent Tasarım", "Hafif EVA Ara Taban", "Siyah Kaymaz Dış Taban", "Gizli Yansıtıcı Detaylar"],
    styling: ["Slim siyah jean + koyu hoodie + siyah çorap", "Siyah jogger + oversized siyah tişört", "Koyu gri chino + siyah zip-up"],
    metaTitle: "Stealth Black Edition Erkek Spor Ayakkabı | Neri Shoes",
    metaDescription: "Stealth Black Edition — all-black mesh spor ayakkabı, hafif EVA taban. Neri Shoes spor koleksiyonu."
  },
  {
    folder: "SUEDE-KNOT LOAFER",
    slug: "suede-knot-loafer",
    name: "Suede Knot Loafer",
    category: "gunluk",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Süet düğüm detaylı loafer — günlük şıklığın en rafine yorumu.",
    description: "Bir düğüm, binlerce yıllık tarih taşır — Suede Knot Loafer, klasik bit loafer'ın ikonik topunu bugüne taşır ve yumuşak süetle yeniden yorumlar. El işçiliğiyle yerleştirilen süet düğüm, modelin imzası ve tartışmasız ayırt edici özelliğidir. Ultra hafif kauçuk taban, uzun yürüyüşlerde ve sert kaldırım taşlarında destekler. Chino ve polo gömlek ile Akdeniz tarzı bir şıklık, slim jean ve beyaz gömlek ile casual-chic bir tarz elde edilir. Bu ayakkabı, o özel bir şeyin olduğunu söyleyen modele sahip olmak için doğru fırsattır.",
    features: ["Hakiki Süet Üst Yüzey", "El İşçiliği Süet Düğüm Detayı", "Slip-On Konfor", "Hafif Kauçuk Alt Taban", "Deri Astar"],
    styling: ["Slim krem chino + lacivert polo gömlek + saat", "Slim jean + beyaz önlü gömlek + hafif ceket", "Bej linen pantolon + beyaz tişört"],
    metaTitle: "Suede Knot Loafer Erkek Ayakkabı | Neri Shoes",
    metaDescription: "Suede Knot Loafer — hakiki süet ve el işçiliği düğüm detaylı loafer. Neri Shoes günlük koleksiyonu."
  },
  {
    folder: "VOLCANO STEALTH",
    slug: "volcano-stealth",
    name: "Volcano Stealth",
    category: "spor",
    wholesale: true,
    retail: true,
    featured: false,
    shortDescription: "Volkanik kauçuk taban ve stealth profil — spor ayakkabıda yeni çubuk.",
    description: "Volkan patlamaz, yürür — Volcano Stealth, adındaki gücü her adıma aktarır. Yüksek profilli volkanik yapıdan ilham alınan alt taban, olağanüstü kavrayış ve darbe emme kapasitesiyle diğer spor modellerin önüne geçer. Stealth tasarım felsefesiyle üst yüzey minimal tutulmuş, ancak taban enerji dolu; görsel dengenin tam tersi bir enerji hissi yaratır. Şehir koşusundan trail yürüyüşe, spor salonundan şehir içi kullanıma kadar çalışır. Bu tabana sahip olduğunda diğer spor ayakkabıların tabanına bakış açın değişir.",
    features: ["Volkan İlhamlı Yüksek Profil Kauçuk Taban", "Stealth Minimal Üst Yüzey", "Trail-Ready Kavrayış Noktaları", "Hafif EVA Ara Taban", "Nefes Alabilir Mesh Üst"],
    styling: ["Tech fleece pantolon + spor tişört", "Trail şort + uzun kollu sıkı fit", "Track suit + beyaz çorap + spor çanta"],
    metaTitle: "Volcano Stealth Erkek Spor Ayakkabı | Neri Shoes",
    metaDescription: "Volcano Stealth — volkan ilhamlı kauçuk taban, minimal stealth tasarım spor ayakkabı. Neri Shoes koleksiyonu."
  }
];

// Copy images and build product JSON
const jsonProducts = [];

for (const product of PRODUCTS) {
  const folderPath = path.join(urunlerDir, product.folder);
  const destPath = path.join(publicProducts, product.slug);

  fs.mkdirSync(destPath, { recursive: true });

  let allFiles = [];
  try {
    allFiles = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  } catch (e) {
    console.error(`Could not read folder: ${product.folder}`, e.message);
    continue;
  }

  // Sort: Screenshots first (by number), then Gemini images
  const screenshots = allFiles.filter(f => f.startsWith("Screenshot")).sort((a, b) => {
    const numA = parseInt(a.replace("Screenshot_", "").replace(".png", "").replace("png", "")) || 0;
    const numB = parseInt(b.replace("Screenshot_", "").replace(".png", "").replace("png", "")) || 0;
    return numA - numB;
  });
  const gemini = allFiles.filter(f => f.startsWith("Gemini")).sort();
  const ordered = [...screenshots, ...gemini];
  const limited = ordered.slice(0, 6);

  const images = [];
  limited.forEach((file, i) => {
    const ext = path.extname(file);
    const destFile = `img${i + 1}${ext}`;
    try {
      fs.copyFileSync(path.join(folderPath, file), path.join(destPath, destFile));
      images.push(`/products/${product.slug}/${destFile}`);
    } catch (e) {
      console.error(`Failed to copy ${file} for ${product.folder}: ${e.message}`);
    }
  });

  console.log(`✓ ${product.folder} → ${product.slug}: ${images.length} images`);

  jsonProducts.push({
    id: product.slug,
    slug: product.slug,
    name: product.name,
    category: product.category,
    images: images,
    image: images[0] || `/products/${product.slug}/img1.png`,
    wholesale: product.wholesale,
    retail: product.retail,
    featured: product.featured,
    shortDescription: product.shortDescription,
    description: product.description,
    features: product.features,
    styling: product.styling,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription
  });
}

// Write products.json
const outputPath = path.join(projectRoot, "data", "products.json");
fs.writeFileSync(outputPath, JSON.stringify(jsonProducts, null, 2), "utf-8");
console.log(`\n✓ data/products.json written with ${jsonProducts.length} products`);
