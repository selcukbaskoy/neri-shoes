// Blog Batch 4 — Yazı 16-20 (Satın Alma x2 + Mevsimsel x3)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tphxrtxzkvivjkxoeujm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHhydHh6a3ZpdmpreG9ldWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODUwMzMsImV4cCI6MjA5NzM2MTAzM30._Eu5dVQGdJEZLydPbsFu0qpCSAHP5su5LFKAdgIM86A'
);

const LANGS = ['en', 'de', 'it', 'ar', 'ru'];

async function tr(text, to) {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch {
    return text;
  }
}

function splitChunks(text, max = 400) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > max && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur = cur ? cur + ' ' + s : s;
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks.length ? chunks : [text];
}

async function translateContent(trContent) {
  const result = { tr: trContent };
  for (const lang of LANGS) {
    try {
      const [title, excerpt] = await Promise.all([
        tr(trContent.title, lang),
        tr(trContent.excerpt, lang),
      ]);
      const chunks = splitChunks(trContent.body);
      const bodyParts = [];
      for (const chunk of chunks) {
        bodyParts.push(await tr(chunk, lang));
      }
      result[lang] = { title, body: bodyParts.join(' '), excerpt };
    } catch {
      result[lang] = { ...trContent };
    }
  }
  return result;
}

async function buildMeta(title, excerpt) {
  const metaTitle = { tr: `${title} | Neri Shoes Blog` };
  const metaDescription = { tr: excerpt.slice(0, 155) };
  for (const lang of LANGS) {
    try {
      const [t, e] = await Promise.all([tr(title, lang), tr(excerpt, lang)]);
      metaTitle[lang] = `${t} | Neri Shoes Blog`;
      metaDescription[lang] = e.slice(0, 155);
    } catch {
      metaTitle[lang] = metaTitle.tr;
      metaDescription[lang] = metaDescription.tr;
    }
  }
  return { metaTitle, metaDescription };
}

const POSTS = [
  {
    slug: 'toptan-ayakkabi-aliminda-dikkat-edilmesi-gerekenler',
    category: 'genel',
    cover_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    tr: {
      title: 'Toptan Ayakkabı Alımında Dikkat Edilmesi Gerekenler',
      excerpt: 'Toptan ayakkabı alımında doğru tedarikçi seçimi, minimum sipariş miktarı ve kalite kontrol süreçleri belirleyicidir. Başarılı bir toptan alım için bilmeniz gerekenler.',
      body: `Toptan ayakkabı alımı, hem perakendeciler hem de kendi iş ağını kurmak isteyen girişimciler için önemli bir süreçtir. Yanlış tedarikçi seçimi, stok sorunları ya da kalite uyuşmazlıkları bu sürecin en sık karşılaşılan problemleridir.

Tedarikçi Seçimi: Kısa Listenizi Daraltın

Toptan alımda ilk adım güvenilir tedarikçi listesini daraltmaktır. Bir tedarikçiyi değerlendirirken şu kriterlere dikkat edin: Üretim kapasitesi ve esnekliği — minimum sipariş miktarı büyük ise bu küçük işletmeler için risk oluşturabilir. Teslimat süresi — mevsimsel ürünlerde bu kritiktir. Referans ve geçmiş — daha önce benzer büyüklükteki işletmelere tedarik yapmış mı? Ödeme koşulları — peşin mi, vadeli mi, aşamalı mı?

Neri Shoes Toptan Alım Modeli

Neri Shoes, hem perakende hem de toptan satış yapan bir markadır. Toptan alıcılara özel fiyat aralıkları, çeşit esnekliği ve sipariş takip hizmeti sunulmaktadır. Detaylı bilgi için iletişim sayfası üzerinden talep iletilebilir.

Kalite Kontrolü Nasıl Yapılır?

Toptan alımda numune almak olmazsa olmaz bir adımdır. Büyük bir sipariş öncesinde birkaç adet numune incelenmeli ve şu kriterler kontrol edilmelidir: Dikiş düzgünlüğü ve simetri, deri yüzey kalitesi, taban yapışması, numara uyumu.

Stok Yönetimi: Dikkatli Planlayın

Ayakkabı stoku mevsimseldir. Kışlık modelleri yazın tedarik etmek maliyet avantajı sağlayabilir; ancak depolama maliyeti göz önünde bulundurulmalıdır. Başlangıçta az numara ve renk seçeneğiyle çalışmak riski azaltır.

Toptan alım doğru planlama yapıldığında perakende marjını önemli ölçüde iyileştirir. Neri Shoes ile çalışmayı düşünen toptan alıcılar için iletişim sayfasından detaylı bilgi alınabilir.`
    }
  },
  {
    slug: 'hediye-icin-erkek-ayakkabi-secim-rehberi',
    category: 'genel',
    cover_image: 'https://images.unsplash.com/photo-1549298222-c0c82f4a1776?w=1200&q=80',
    tr: {
      title: 'Hediye İçin Erkek Ayakkabı Seçim Rehberi',
      excerpt: "Erkek ayakkabısı hediye olarak düşünüyorsanız numara, stil ve malzeme tercihleri büyük önem taşır. Hata yapmadan mükemmel hediyeyi seçmek için bu rehberi okuyun.",
      body: `Erkek ayakkabısı, doğum günü, yıldönümü ya da özel gün için güçlü bir hediye seçeneğidir. Ancak numara ve stil yanlış seçildiğinde sonuç hayal kırıklığı yaratabilir. Sürprizi bozmadan doğru tercihi yapmak için birkaç strateji.

Numarayı Nasıl Öğrenirsiniz?

Numara bilmek, hediye seçiminin en kritik adımıdır. Birkaç yol mevcuttur: Kişinin mevcut ayakkabısının tabanını kontrol etmek — çoğu ayakkabıda numara içeride ya da tabanda yazar. Aile bireylerinden ya da ortak arkadaştan sormak. Tereddüt halinde bir numara büyük seçip iade/değişim garantisi olan bir yerden almak.

Neri Shoes online mağazasında satın alınan ürünlerde iade ve değişim seçeneği mevcuttur; bu, hediye alımında önemli bir güvencedir.

Stil Tercihi: Hediye Alınan Kişiyi Tanıyın

Ayakkabı stilini doğru belirlemek için kişinin günlük hayatı ve gardırobu hakkında fikir sahibi olmak gerekir.

Resmi ortamlarda çalışıyor ya da takım elbise giyiyor mu? Derby ya da Oxford modeller uygundur. Rahat ve günlük giyimi mi tercih ediyor? Loafer, Chelsea boot ya da temiz çizgili spor modeller ideal seçimlerdir.

Renk Seçimi: Güvenli mi, Cesur mu?

Hediyede renk tercihi kişinin tarzına göre yapılmalıdır. Eğer kişinin tarzı hakkında çok az bilginiz varsa siyah ya da koyu kahverengi en güvenli seçimdir; her kıyafetle uyum sağlar.

Taba, konyak ya da burgundy tonları daha karakterli seçimlerdir; kişinin bu renklere açık olduğunu biliyorsanız tercih edilebilir.

Ambalaj ve Sunum

Neri Shoes ürünleri premium kutuda gönderilmektedir. Hediye notu ekleme seçeneği için sipariş sırasında özel talep iletilebilir.

Bir Not: Bazı kişiler ayakkabı stiline özellikle duyarlıdır. Eğer hediye alınan kişinin güçlü tercihleri olduğunu düşünüyorsanız hediye çeki alternatif olabilir — bu şekilde kişi kendi tercihini kullanır.`
    }
  },
  {
    slug: '2026-erkek-ayakkabi-trendleri',
    category: 'genel',
    cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
    tr: {
      title: '2026 Erkek Ayakkabı Trendleri',
      excerpt: "2026 erkek ayakkabı modasında öne çıkan renkler, formlar ve malzemeler neler? Bu yılın en güçlü trendlerini ve gardırobunuza nasıl entegre edeceğinizi keşfedin.",
      body: `2026 erkek ayakkabı modası, birbirinden farklı iki yönde ilerliyor: Bir yanda nostalji ve el işçiliği özlemi, öte yanda teknik malzeme ve minimalist formların yükselişi. Her iki yön de aynı şeyi işaret ediyor: Kalite ve özgünlüğe doğru bir dönüş.

Trend 1: Daha Rafine Kalın Taban

2025'te başlayan kalın taban trendi 2026'da daha rafine bir forma bürünüyor. Aşırı kalın ve gürültülü tasarımların yerini daha temiz silüetli ama hâlâ belirgin tabanlı modeller alıyor. Özellikle loafer ve düz bot modellerinde bu form baskın.

Trend 2: Terracotta ve Toprak Tonları

Siyah ve kahverenginin hâkimiyeti sürerken 2026'da toprak tonları — kiremit, terracotta, açık kum, zeytin yeşili — güç kazanıyor. Bu renkler hem deri hem de süet yüzeylerde uygulanıyor ve özellikle günlük kombinlerde gardıroba sıcak bir ton katıyor.

Trend 3: Derby ve Oxford'un Geri Dönüşü

2024-2025 "her şey sneaker" döneminin ardından resmi ve yarı resmi ayakkabı kategorisi hız kazanıyor. Özellikle genç erkek tüketicilerde klasik derby ve Oxford'a olan ilgi artış gösteriyor. Bu trend, "quiet luxury" olarak adlandırılan sessiz lüks estetiğin bir parçası.

Trend 4: Teknik Konfor, Klasik Görünüm

Teknik inovasyonlar gardıroplara sızıyor. Mikro gözenekli deri yüzeyler ve gelişmiş iç taban malzemeleri, görünüş olarak klasik formları korurken konforu artırıyor.

Trend 5: Az Ama Kaliteli Gardırop Anlayışı

Tüketiciler artık çok sayıda ucuz ayakkabı yerine az sayıda kaliteli parça tercih ediyor. Bu anlayış özellikle bilinçli tüketici segmentinde güçleniyor. Buna bağlı olarak taban yenilenebilir ve dikiş tamir edilebilir modeller öne çıkıyor.

Neri Shoes ve 2026 Trendleri

Neri Shoes'un siyah-altın renk paleti ve lüks-minimalist tasarım dili, 2026'nın quiet luxury ve toprak tonu akımlarıyla doğal bir uyum içindedir. Mevcut koleksiyonda bu trendi temsil eden modeller için ürünler sayfasını ziyaret edebilirsiniz.`
    }
  },
  {
    slug: 'kis-sezonu-icin-en-uygun-ayakkabi-modelleri',
    category: 'genel',
    cover_image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1200&q=80',
    tr: {
      title: 'Kış Sezonu İçin En Uygun Ayakkabı Modelleri',
      excerpt: 'Kış aylarında doğru ayakkabı seçimi hem stili hem de konforu etkiler. Bu sezon en çok tercih edilen kışlık erkek ayakkabı modellerini ve seçim kriterlerini keşfedin.',
      body: `Kış aylarında ayakkabı seçimi mevsimsel gereksinimleri — soğuk, nem, kaygan zemin — style kaygılarıyla dengelemek demektir. Doğru model bu dengeyi kurar; yanlış model ise ya sizi üşütür ya stilinizden taviz verdirtir.

Kışın Ayakkabıdan Ne Beklenir?

Kışlık bir ayakkabıda dört temel özellik aranır: Su direnci — deri ya da membran yüzey nem geçişini yavaşlatmalıdır. Kaymaz taban — özellikle ıslak ve buzlu zeminde güvenlik kritiktir. Yeterli taban kalınlığı — soğuk zemin transferini azaltır. Termal konfor — iç astar ya da yün iç taban seçeneği ayağı ılık tutar.

Model 1: Deri Chelsea Boot

Kışın en pratik ve şık seçeneği siyah ya da koyu kahverengi deri Chelsea boot'tur. Bağcıksız yapısı pratik giyim sağlar; uzun silueti paçayı ıslaktan korur. Su geçirmezlik spreyi düzenli uygulandığında mevsim boyunca iyi bir performans sunar.

Model 2: Süet Derby

Süetin kışa hassasiyeti bilinir ama su geçirmezlik spreyi ile korunan süet derby, soğuk ama kuru günlerde estetik açıdan üstündür. Yağmurlu günlerde daha dikkatli davranmak gerekir.

Model 3: Klasik Deri Bot

Kışın en işlevsel modeli bilekten ya da baldırdan bağlanan deri çizmedir. İnce ve şık tutulan modeller hem kar hem de yağmura karşı ciddi bir koruma sağlar. Klasik bağcıklı bot modeller şehir kullanımı için idealdir.

Model 4: Oxford ve Derby

Kapalı ortamlar ve taşıma günleri için Oxford ya da derby hâlâ geçerliliğini korur. Tam deri üst ve kauçuk taban kombinasyonu, kışın şehir içi kullanımında dengeli bir seçimdir.

Kışın Kaçınılacak Modeller

Süet ayakkabı yoğun yağmur ve kardan uzak tutulmalıdır. İnce taban ve düşük bilekli modeller soğuk zemin transferine karşı savunmasızdır.

Neri Shoes kışlık koleksiyonunda siyah ve koyu kahverengi deri modeller mevcuttur. Ürünler sayfasından kışlık seçenekleri inceleyebilirsiniz.`
    }
  },
  {
    slug: 'yaz-sezonunda-nefes-alabilir-ayakkabi-secimi',
    category: 'genel',
    cover_image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80',
    tr: {
      title: 'Yaz Sezonunda Nefes Alabilir Ayakkabı Seçimi',
      excerpt: 'Sıcak havalarda nefes almayan ayakkabı terleme ve kokuya yol açar. Yaz için en iyi malzeme ve model seçimlerini, bakım önerilerini bu rehberde bulabilirsiniz.',
      body: `Yaz aylarında ayakkabı seçimi iki kritere dayanır: Nefes alabilirlik ve hafiflik. Bu iki özelliği bir arada sunan modeller, sıcak havalarda ayak sağlığını ve günlük konforu doğrudan etkiler.

Neden Nefes Alabilirlik Önemlidir?

İnsan ayağı günde önemli miktarda nem salgılar. Bu nem, nefes almayan bir ayakkabı içinde birikirse üç probleme yol açar: Mantar ve bakteri üremesine zemin hazırlar. Koku oluşur; kötü havalanma bu kokuyu katlar. Deri ya da iç taban zamanla zarar görür.

Nefes alabilir bir ayakkabı bu nemi dışarıya ileterek denge kurar.

Yazın En İyi Malzeme Seçimleri

Tam deri, görünürde sağlam bir malzeme olmasına rağmen mikro gözenekli yapısı sayesinde nefes alır. Yaz için ince taban deri ayakkabı hem şık hem de işlevseldir.

Kanvas ve dokuma kumaş özellikle günlük modellerde en yüksek hava sirkülasyonunu sağlar. Bakımı kolay, hafif ve renkli seçenekleri boldur.

Delikli deri ise bazı modellerde üst yüzeye işlenen küçük deliklerle hem estetik hem de havalandırma değeri katar.

Kaçınılacak Malzemeler

Sentetik deri ve PU kaplama yüzeyler yazın en problemli seçimdir: Nefes almaz, ısıyı hapseder ve nem birikmesini hızlandırır. Bu yüzeylerde uzun süre yürümek ayak sağlığını olumsuz etkiler.

Yazın En İyi Model Seçimleri

Loafer, çorapsız giyilebilir yapısı ve hafif deri üst yüzeyiyle yazın en doğal seçimidir. İnce taban loafer modeller özellikle sıcak günlerde tercih edilir.

Derby ve Oxford ince taban versiyonları iş ortamında yaz için idealdir. Kışlık kalın taban modellerinden daha iyi havalandırma sağlar.

Spor modeller hafif EVA tabanla günlük kullanım ve uzun yürüyüşler için amortismanı ve hafifliğiyle yaz konforunu artırır.

Yazlık Bakım Rutini

Yazın ter birikimi daha fazla olduğundan ayakkabıların aynı gün arka arkaya giyilmemesi önerilir. İki gün ara vermek, iç astarın tamamen havalanmasını sağlar. Haftalık iç taban spreyi ya da sedir kalıp kullanımı koku oluşumunu önler.

Neri Shoes yaz koleksiyonunda ince taban loafer ve spor modeller mevcuttur. Renk seçenekleri ve malzeme detayları için ürünler sayfasını ziyaret edebilirsiniz.`
    }
  }
];

async function processPost(post, index) {
  console.log(`\n[${index + 1}/${POSTS.length}] ${post.tr.title}`);

  console.log('  → İçerik çevriliyor (5 dil)...');
  const content = await translateContent(post.tr);

  console.log('  → Meta çevriliyor...');
  const { metaTitle, metaDescription } = await buildMeta(post.tr.title, post.tr.excerpt);

  console.log('  → Supabase\'e kaydediliyor...');
  const { error } = await supabase.from('blog_posts').upsert({
    id: post.slug,
    slug: post.slug,
    cover_image: post.cover_image,
    category: post.category,
    status: 'draft',
    content,
    meta_title: metaTitle,
    meta_description: metaDescription,
    translation_status: 'completed',
    published_at: null,
  }, { onConflict: 'id' });

  if (error) {
    console.error(`  ✗ Hata: ${error.message}`);
    return false;
  }

  const { data, error: verifyErr } = await supabase
    .from('blog_posts')
    .select('slug, translation_status')
    .eq('id', post.slug)
    .single();

  if (verifyErr || !data) {
    console.error(`  ✗ Doğrulama başarısız`);
    return false;
  }

  console.log(`  ✓ Kaydedildi: ${data.slug}`);
  return true;
}

async function main() {
  console.log('=== Blog Batch 4 (Yazı 16-20: Satın Alma + Mevsimsel) ===');
  let ok = 0;
  for (let i = 0; i < POSTS.length; i++) {
    const success = await processPost(POSTS[i], i);
    if (success) ok++;
  }
  console.log(`\n✓ Tamamlandı: ${ok}/${POSTS.length} yazı kaydedildi.`);
}

main().catch(console.error);
