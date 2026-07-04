export type LegalSection = {
  id: string;
  heading: string;
  body: string | string[];
};

export type LegalDocument = {
  pageTitle: string;
  lastUpdated: string;
  disclaimer: string;
  sections: LegalSection[];
};

export const privacyPolicy: LegalDocument = {
  pageTitle: "Gizlilik Politikası & KVKK Aydınlatma Metni",
  lastUpdated: "Haziran 2026",
  disclaimer:
    "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca hazırlanmış bilgilendirme amaçlı bir aydınlatma metnidir. Sorularınız için info@nerishoes.com adresine ulaşabilirsiniz.",
  sections: [
    {
      id: "veri-sorumlusu",
      heading: "1. Veri Sorumlusu",
      body: [
        "Neri Ayakkabı ('Neri Shoes'), Adana, Türkiye merkezli erkek deri ayakkabı üreticisi ve satıcısıdır.",
        "Şirket: Neri Shoes",
        "Adres: Sarıyakup, 23040. Sk., 01020 Seyhan/Adana, Türkiye",
        "E-posta: info@nerishoes.com",
        "Web sitesi: nerishoes.com",
      ],
    },
    {
      id: "islenen-veriler",
      heading: "2. İşlenen Kişisel Veriler",
      body: [
        "Ad, soyad ve telefon numarası — WhatsApp üzerinden iletişim kurulması halinde.",
        "E-posta adresi ve mesaj içeriği — iletişim formu kullanılması halinde.",
        "Bu web sitesi doğrudan ödeme, hesap kaydı veya sipariş işlemi gerçekleştirmemektedir; finansal veri veya kimlik belgesi verisi işlenmemektedir.",
      ],
    },
    {
      id: "isleme-amaclari",
      heading: "3. İşleme Amaçları",
      body: [
        "Toptan satış ve ürün bilgi taleplerine yanıt verilmesi.",
        "İş ortaklığı ve bayi görüşmelerinin yürütülmesi.",
        "Yasal yükümlülüklerin yerine getirilmesi.",
      ],
    },
    {
      id: "veri-aktarimi",
      heading: "4. Verilerin Aktarılması",
      body: [
        "Yetkili kamu kurumları ve yargı mercileri — yasal yükümlülük kapsamında.",
        "WhatsApp üzerinden iletişimde mesajlar Meta Platforms, Inc. sunucularında işlenmektedir; bu aktarım kullanıcının kendi tercihiyle başlattığı iletişim sonucunda gerçekleşmektedir.",
      ],
    },
    {
      id: "toplama-yontemi",
      heading: "5. Veri Toplama Yöntemi ve Hukuki Sebep",
      body: [
        "WhatsApp butonu: Kullanıcının bizzat iletişimi başlatması — meşru menfaat (KVKK Madde 5/2-f).",
        "İletişim formu: Kullanıcı talebi — ilgili kişinin talebinin yerine getirilmesi (KVKK Madde 5/2-c).",
      ],
    },
    {
      id: "veri-sahibi-haklari",
      heading: "6. Veri Sahibinin Hakları (KVKK Madde 11)",
      body: [
        "Veri sahibi olarak aşağıdaki haklara sahipsiniz:",
        "• Kişisel verilerinizin işlenip işlenmediğini öğrenme",
        "• İşlenmişse buna ilişkin bilgi talep etme",
        "• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
        "• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme",
        "• Eksik veya yanlış işlenmiş ise düzeltilmesini isteme",
        "• Kanunda öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme",
        "• Düzeltme, silme veya yok etme işlemlerinin üçüncü kişilere bildirilmesini isteme",
        "• İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhe bir sonucun ortaya çıkmasına itiraz etme",
        "• Kanuna aykırı işleme nedeniyle uğranılan zararın giderilmesini talep etme",
        "Başvuru için info@nerishoes.com adresine 'KVKK Başvurusu' konusuyla e-posta gönderebilirsiniz. Talepler yasal süre içinde (en geç 30 gün) yanıtlanır.",
      ],
    },
    {
      id: "iletisim",
      heading: "7. İletişim",
      body: [
        "E-posta: info@nerishoes.com",
        "Adres: Sarıyakup, 23040. Sk., 01020 Seyhan/Adana, Türkiye",
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  pageTitle: "Kullanım Şartları",
  lastUpdated: "Haziran 2026",
  disclaimer:
    "Bu kullanım şartları, nerishoes.com adresini ziyaret eden ve/veya hizmetlerinden yararlanan tüm kullanıcılar için geçerlidir. Siteyi kullanmaya devam etmeniz bu şartları kabul ettiğiniz anlamına gelir.",
  sections: [
    {
      id: "hizmet-tanimi",
      heading: "1. Hizmet Tanımı",
      body: [
        "Bu web sitesi, Neri Shoes markasına ait erkek deri ayakkabıların tanıtım ve toptan satış sorgusu amacıyla işletilen bir bilgilendirme platformudur.",
        "Site üzerinden doğrudan ödeme veya kullanıcı hesabı oluşturma yapılamaz. Ticari görüşmeler WhatsApp veya e-posta yoluyla yürütülmektedir.",
      ],
    },
    {
      id: "fikri-mulkiyet",
      heading: "2. Fikri Mülkiyet",
      body: [
        "Sitedeki tüm içerik; görseller, logolar, metinler ve tasarım ögeleri Neri Shoes'a aittir ve Türk fikri mülkiyet mevzuatı (5846 sayılı FSEK ve ilgili mevzuat) kapsamında korunmaktadır.",
        "İçeriklerin izinsiz kopyalanması, çoğaltılması ve ticari amaçla kullanılması kesinlikle yasaktır.",
      ],
    },
    {
      id: "sorumluluk",
      heading: "3. Sorumluluk Sınırlaması",
      body: [
        "Sitedeki ürün bilgileri, fiyatlar ve stok durumu bilgilendirme amaçlıdır; önceden haber verilmeksizin değişebilir.",
        "Neri Shoes, sitenin kesintisiz veya hatasız çalışacağına dair bir garanti vermemektedir.",
        "WhatsApp gibi üçüncü taraf platformlar kendi kullanım koşullarına ve gizlilik politikalarına tabidir; bu platformların kullanımından doğacak sorumluluk kullanıcıya aittir.",
        "Neri Shoes, dolaylı, arızi veya sonuç niteliğindeki zararlardan sorumlu tutulamaz.",
      ],
    },
    {
      id: "kullanici-yukumlulukleri",
      heading: "4. Kullanıcı Yükümlülükleri",
      body: [
        "Siteyi yalnızca yasal ve meşru amaçlarla kullanınız.",
        "Otomatik tarama (scraping), bot veya benzeri araçlarla veri toplanması yasaktır.",
        "Yanıltıcı, zararlı veya hukuka aykırı içerik iletmek yasaktır.",
      ],
    },
    {
      id: "uyusmazlik",
      heading: "5. Uyuşmazlık Çözümü",
      body: [
        "Bu şartlar Türk hukukuna tabidir. Tüm uyuşmazlıklarda Adana Mahkemeleri ve İcra Daireleri yetkilidir.",
        "Hukuki süreç başlatılmadan önce taraflar, 15 (on beş) gün içinde dostane çözüm yolunu deneyecektir.",
      ],
    },
    {
      id: "degisiklik",
      heading: "6. Değişiklik Hakkı",
      body: [
        "Neri Shoes, bu kullanım şartlarını herhangi bir ön bildirim yapmaksızın değiştirme hakkını saklı tutar.",
        "Güncellemeler sitede yayımlandığı andan itibaren geçerli olur. Siteyi kullanmaya devam etmeniz, güncel şartları kabul ettiğiniz anlamına gelir.",
      ],
    },
    {
      id: "yururluk",
      heading: "7. Yürürlük ve İletişim",
      body: [
        "Bu kullanım şartları Haziran 2026 tarihinde yürürlüğe girmiştir.",
        "E-posta: info@nerishoes.com",
        "Adres: Sarıyakup, 23040. Sk., 01020 Seyhan/Adana, Türkiye",
      ],
    },
  ],
};

export const deliveryPolicy: LegalDocument = {
  pageTitle: "Teslimat ve İade Şartları",
  lastUpdated: "Haziran 2026",
  disclaimer:
    "Bu metin bilgilendirme amaçlıdır. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği (RG: 27.11.2014/29188) uyarınca hazırlanmıştır. Hukuki danışmanlık için info@nerishoes.com adresine ulaşabilirsiniz.",
  sections: [
    {
      id: "teslimat",
      heading: "1. Teslimat Koşulları",
      body: [
        "Siparişler, ödeme onayından sonra 1-3 iş günü içinde hazırlanarak kargoya teslim edilir.",
        "Türkiye içi teslimat süresi 2-4 iş gündür; uluslararası gönderimler için tarafınızla ayrıca iletişime geçilir.",
        "Hafta içi saat 17:00'ye kadar verilen siparişler aynı gün kargoya verilir.",
        "Kargo firması: Yurtiçi Kargo / MNG Kargo (stok ve bölgeye göre değişebilir).",
        "Teslimat adresi: Sipariş formunda belirtilen adrestir. Adres hatalı girildiğinde oluşacak gecikmelerden Neri Shoes sorumlu tutulamaz.",
      ],
    },
    {
      id: "cayma-hakki",
      heading: "2. Cayma Hakkı (14 Gün)",
      body: [
        "Mesafeli Sözleşmeler Yönetmeliği uyarınca ürünü teslim aldığınız tarihten itibaren 14 (on dört) takvim günü içinde, herhangi bir gerekçe göstermeksizin sözleşmeden cayabilirsiniz.",
        "Cayma talebinizi info@nerishoes.com adresine e-posta ile iletebilir ya da WhatsApp hattımızdan bildirebilirsiniz.",
        "Cayma hakkı süresi, ürünün size veya belirlediğiniz üçüncü kişiye teslim edildiği gün başlar.",
      ],
    },
    {
      id: "iade-kosullari",
      heading: "3. İade Koşulları",
      body: [
        "İade edilecek ürün kullanılmamış, hasar görmemiş ve orijinal ambalajında (kutu, pelür kağıdı vb.) olmalıdır.",
        "Ayakkabının iç tabanı kullanım izleri taşımamalıdır.",
        "Ürün etiketleri sökülmüş ya da ürün tahrip edilmişse iade kabul edilmez.",
        "Hijyen nedeniyle iç çorap veya tabanlık gibi kişisel ürünler iade kapsamı dışındadır.",
      ],
    },
    {
      id: "iade-sureci",
      heading: "4. İade Süreci",
      body: [
        "Adım 1: info@nerishoes.com adresine 'İade Talebi' konusuyla e-posta gönderin; sipariş numaranızı ve iade gerekçenizi belirtin.",
        "Adım 2: Onay e-postasından sonra ürünü orijinal ambalajında aşağıdaki adrese kargolayın:",
        "İade Adresi: Sarıyakup, 23040. Sk., 01020 Seyhan/Adana, Türkiye",
        "Adım 3: İade kargo ücreti müşteriye aittir; ancak ayıplı veya yanlış gönderilen ürünlerde kargo masrafı Neri Shoes tarafından karşılanır.",
        "Adım 4: Ürün tarafımıza ulaşıp incelendikten sonra 14 gün içinde ödeme iadesi yapılır.",
      ],
    },
    {
      id: "ayipli-urun",
      heading: "5. Ayıplı / Hatalı Ürün",
      body: [
        "Teslim aldığınız ürün ayıplı, eksik veya siparişinizden farklıysa lütfen 48 saat içinde fotoğraflı şekilde info@nerishoes.com adresine bildirin.",
        "Bu durumlarda iade/değişim kargo ücreti tarafımızdan karşılanır ve en hızlı şekilde çözüm sağlanır.",
      ],
    },
    {
      id: "iletisim",
      heading: "6. İletişim",
      body: [
        "E-posta: info@nerishoes.com",
        "Adres: Sarıyakup, 23040. Sk., 01020 Seyhan/Adana, Türkiye",
        "Çalışma Saatleri: Pazartesi–Cumartesi 09:00–19:00",
      ],
    },
  ],
};

export const distanceSalesContract: LegalDocument = {
  pageTitle: "Mesafeli Satış Sözleşmesi",
  lastUpdated: "Haziran 2026",
  disclaimer:
    "Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği (RG: 27.11.2014/29188) kapsamında hazırlanmış bir şablon metindir. Hukuki geçerlilik açısından avukat onayı önerilir.",
  sections: [
    {
      id: "taraflar",
      heading: "1. Taraflar",
      body: [
        "SATICI: Neri Shoes | Adres: Sarıyakup, 23040. Sk., 01020 Seyhan/Adana, Türkiye | E-posta: info@nerishoes.com | Web sitesi: nerishoes.com",
        "ALICI: Sipariş formunda belirtilen kişi/adres bilgileri.",
      ],
    },
    {
      id: "konu",
      heading: "2. Sözleşmenin Konusu",
      body: [
        "İşbu sözleşme, ALICI'nın nerishoes.com üzerinden elektronik ortamda sipariş verdiği ürün(ler)in satışı ve teslimatına ilişkin tarafların hak ve yükümlülüklerini 6502 sayılı Kanun ve ilgili yönetmelik hükümleri uyarınca düzenler.",
        "Ürün bilgileri (isim, renk, beden, adet, fiyat) sipariş onay e-postasında belirtilmektedir.",
      ],
    },
    {
      id: "odeme",
      heading: "3. Ödeme Bilgileri",
      body: [
        "Ödeme; kredi kartı, banka kartı veya iyzico güvenli ödeme altyapısı aracılığıyla yapılır.",
        "Sipariş tutarı, ödeme onayı alındığı anda karttan tahsil edilir.",
        "Tüm fiyatlar Türk Lirası (TRY) cinsinden ve KDV dahil olarak gösterilir.",
      ],
    },
    {
      id: "teslimat",
      heading: "4. Teslimat",
      body: [
        "Ürünler, ödeme onayından itibaren 1-3 iş günü içinde kargoya teslim edilir.",
        "Türkiye içi teslimat 2-4 iş günü içinde gerçekleşir.",
        "Teslimat; sipariş formunda ALICI tarafından belirtilen adrese yapılır.",
      ],
    },
    {
      id: "cayma-hakki",
      heading: "5. Cayma Hakkı",
      body: [
        "ALICI, teslim tarihinden itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.",
        "Cayma bildirimi info@nerishoes.com adresine yazılı olarak iletilmelidir.",
        "Kullanılmış, hasar görmüş veya orijinal ambalajı açılmış ürünler cayma hakkı kapsamı dışındadır.",
        "Cayma halinde ürün iade edildiğinde ve incelendikten sonra 14 gün içinde ödeme iadesi yapılır.",
      ],
    },
    {
      id: "garanti",
      heading: "6. Garanti",
      body: [
        "Üretim kaynaklı ayıplı ürünlerde ücretsiz onarım veya değişim yapılır.",
        "Normal aşınma ve yıpranma garanti kapsamı dışındadır.",
      ],
    },
    {
      id: "uyusmazlik",
      heading: "7. Uyuşmazlık Çözümü",
      body: [
        "Taraflar arasında çıkabilecek uyuşmazlıklarda öncelikle uzlaşma yolu denenir.",
        "Tüketici, şikayetlerini Tüketici Hakem Heyeti veya Tüketici Mahkemesi'ne iletebilir.",
        "Yetkili mahkeme: Adana Tüketici Mahkemeleri.",
      ],
    },
    {
      id: "yururluk",
      heading: "8. Yürürlük",
      body: [
        "İşbu sözleşme, ALICI'nın siparişini onayladığı tarihte yürürlüğe girer.",
        "Bu sözleşme Türk hukukuna tabidir.",
      ],
    },
  ],
};
