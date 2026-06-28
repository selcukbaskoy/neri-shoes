// Blog Batch 3 — Yazı 11-15 (Üretim x4 + Satın Alma x1)
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
    slug: 'neri-shoesta-bir-ayakkabi-nasil-uretilir',
    category: 'uretim',
    cover_image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=1200&q=80',
    tr: {
      title: "Neri Shoes'ta Bir Ayakkabı Nasıl Üretilir?",
      excerpt: "Hammaddeden son kontrole kadar Neri Shoes'un üretim sürecini keşfedin. El işçiliği, kalite standartları ve Adana'da yapılan üretimin farkını anlıyoruz.",
      body: `Ayakkabı, görünürde basit bir nesne gibi dursa da üretim sürecinde 100'ü aşkın farklı adım içerebilir. Neri Shoes'un Adana'daki atölyesinde bu adımların her biri, hem geleneksel zanaatın hem de modern kalite standartlarının bir bileşimidir.

Hammadde Seçimi: Her Şey Deriden Başlar

Üretim sürecinin ilk ve en kritik adımı hammadde seçimidir. Neri Shoes, tüm deri ayakkabı modellerinde Türkiye'nin önde gelen tabakhanelerinden temin edilen tam deri kullanmaktadır. Bu deri türü, hayvanın üst dermal tabakasından elde edilir ve suni deri ya da düzeltilmiş deri ile karşılaştırıldığında çok daha dayanıklı ve nefes alabilir bir yapıya sahiptir.

Deri kalite kontrol süreci düzgün yüzey dokusu, yeterli kalınlık, renk tutarlılığı ve nem içeriği kriterlerini kapsar. Standartları karşılamayan parçalar üretime girmez.

Kalıp Hazırlama ve Biçim Verme

Her model için ayrı bir ayak kalıbı kullanılır. Kalıp, ayakkabının üç boyutlu formunu belirler ve ayağa uyumu doğrudan etkiler. Neri Shoes kalıpları, farklı ayak yapılarına göre tasarlanmış temel formlara dayanır.

Deri, kalıba göre kesim şablonlarıyla kesilir. Kesim sırasında deri yönünün doğru belirlenmesi önemlidir; yanlış yönde kesilen deri kullanım sırasında daha kolay deforme olur.

Dikim ve Birleştirme

Kesilen parçalar dikiş makinesiyle birleştirilir. Bu aşamada dikiş sıklığı ve iplik kalitesi belirleyicidir: İnce iplik ve sık dikiş, derinin yük altında yırtılma riskini azaltır. Burun, topuk ve yan dikişler ayrı ayrı kontrol edilir.

Montaj: Taban Bağlama

Taban montajı birkaç farklı yöntemle yapılabilir. Yapıştırma yöntemi hafif ve esnek modellerde kullanılır. Dikiş yöntemi ise daha güçlü bir bağ oluşturur ve taban değiştirme imkânı tanır; uzun ömürlü modellerde tercih edilir.

Son İşlemler ve Kalite Kontrol

Montajı tamamlanan ayakkabıya son şekli verilir: Kenarlar zımparalanır, deri yüzey boyanır, bağcıklar takılır. Ardından 12 noktalı kalite kontrol listesi uygulanır: Dikiş düzgünlüğü, renk tutarlılığı, taban yapışması, simetri ve topuk hizası bunların başında gelir.

Neri Shoes'ta her parti, rafları terk etmeden önce bu kontrolden geçer. Hedef; müşteriyle ilk kutuda başlayan uzun bir ilişkidir.`
    }
  },
  {
    slug: 'hakiki-deri-ile-sentetik-deri-arasindaki-fark',
    category: 'uretim',
    cover_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
    tr: {
      title: 'Hakiki Deri ile Sentetik Deri Arasındaki Fark',
      excerpt: 'Deri ayakkabı alırken gerçek mi sahte mi sorusu önemlidir. Malzeme farkı, uzun ömür, nefes alabilirlik ve fiyat-değer dengesi hakkında bilmeniz gerekenler.',
      body: `Bir ayakkabı satın alırken hangi soruyu sormalısınız? "Kaç lira?" sorusundan önce "Ne malzemeden?" sorusu gelmeli — çünkü malzeme farkı, uzun vadede hem konfor hem de maliyet açısından belirleyici rol oynar.

Deri Türleri: Gerçekten Neyin Farkı Var?

Hakiki deri hayvan derisinden elde edilir ve birçok alt kategoriye ayrılır: tam deri (full-grain), sürme deri (top-grain), düzeltilmiş deri (corrected grain) ve deri bölünmüşü (split leather).

Sentetik deri ise petrokimya bazlı malzemelerden üretilir ve görünüş olarak gerçek deriye benzeyebilir ama yapısal özellikleri tamamen farklıdır.

Nefes Alabilirlik

Tam deri, mikroskobik gözenekli yapısı sayesinde nefes alır: nem ve ısı dengesi kurar, ayağın terlemesini azaltır. Uzun gün kullanımında bu fark belirgin şekilde hissedilir.

Sentetik deri ise neredeyse hiç nefes almaz. Bu özellikle yoğun fiziksel aktivitede ya da uzun saatler giyilen ayakkabılarda belirgin bir rahatsızlık kaynağına dönüşür.

Dayanıklılık ve Uzun Ömür

Tam deri, kullanımla birlikte yumuşar ve ayak formuna uyum sağlar. Doğru bakımla 10-15 yıl kullanılabilir. Zamanla oluşan patina değer kaybettirir değil, karakterini artırır.

Sentetik deri ise 2-4 yıl sonra yüzeyden çatlar, pullanır ve renk solar. Bu bozulma geri döndürülemez; bakım ömrü uzatmaz.

Maliyet: Kısa Vade mi, Uzun Vade mi?

Sentetik deri ayakkabılar başlangıçta daha ucuzdur. Ancak iki ya da üç kez yenilendiğinde, başlangıçta tam deri model almaktan daha pahalıya gelir. Uzun vadeli maliyet hesabı tam deri lehine sonuçlanır.

Bakım Farkı

Tam deri bakım gerektirir: periyodik krem cila, su geçirmezlik spreyi, doğru depolama. Bu bakım verildiğinde ömrü uzar.

Sentetik derinin bakımı neredeyse yoktur — ama bunun nedeni bakımdan bağımsız olması değil, bakımın bir fark yaratmamasıdır. Yüzey bozulmaya başladığında yapılacak bir şey kalmamıştır.

Neri Shoes, tüm klasik ve iş modellerinde tam deri kullanmaktadır. Spor serisi bazı modellerde sentetik takviyeli yüzey içerebilir; bu modeller ürün sayfasında açıkça belirtilir.`
    }
  },
  {
    slug: 'adananin-ayakkabilik-kulturu-ve-neri-shoesun-yeri',
    category: 'uretim',
    cover_image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=1200&q=80',
    tr: {
      title: "Adana'nın Ayakkabıcılık Kültürü ve Neri Shoes'un Yeri",
      excerpt: "Adana, Türkiye'nin önemli ayakkabı üretim merkezlerinden biridir. Bu güçlü geleneğin içinden çıkan Neri Shoes'un hikayesini ve vizyonunu keşfedin.",
      body: `Türkiye'nin ayakkabı üretim haritasında İzmir, İstanbul ve Gaziantep öne çıkan isimler olsa da güneyde bir şehir, sessiz ama sağlam bir ayakkabıcılık geleneğini yüzyıllardır sürdürmektedir: Adana.

Adana'nın Ayakkabı Tarihi

Adana, tarihsel olarak Ortadoğu ve Akdeniz ticaret yollarının kesişim noktasında yer almıştır. Bu konum, kentin her türlü zanaata erken maruz kalmasını sağlamıştır. Özellikle 20. yüzyılın ortasından itibaren tekstil ve deri işçiliği, kentin ekonomik kimliğinin ayrılmaz parçası haline gelmiştir.

Günümüzde Adana, ağırlıklı olarak orta ve büyük boy yerel atölyelerin bulunduğu bir üretim merkezidir. Bu atölyeler, Türkiye'nin büyük perakende markalarına ve ihracat pazarlarına ayakkabı tedarik etmektedir.

Yerel Üretimin Avantajları

Adana'da üretilen ayakkabının avantajları birkaç temel başlıkta özetlenebilir:

Düşük lojistik maliyeti: Yerel hammadde temininden üreticiye ulaşım, büyük sanayi kentlerindeki uzun tedarik zincirlerini gerektirmez.

Zanaatkâr birikimi: Nesiller boyu aktarılan el becerisi, makine üretimiyle birleştiğinde hem hız hem de kalite sağlar.

Esnek üretim: Küçük parti siparişlere uyum, büyük sanayi tesislerinde mümkün olmayan kalite denetimini sağlar.

Neri Shoes'un Bu Geleneğe Yaklaşımı

Neri Shoes, Adana'nın bu üretim geleneğini modernize etmeyi hedefleyen bir girişimdir. Yerel hammadde ve zanaatkâr ortaklıkları üretimin temelini oluşturuyor. Ancak Neri bu geleneği salt muhafaza etmekle yetinmiyor; uluslararası tasarım anlayışı ve çok dilli dijital dağıtım altyapısıyla yerel üretimi küresel erişime açıyor.

Ürünlerdeki lüks-minimalist estetik — siyah tonlar, altın aksan, sade formlar — hem geleneksel Türk deri işçiliğinin kalite anlayışını hem de çağdaş Avrupa tasarım dilini yansıtmaktadır.

Yerel Üretim, Küresel Standart

Neri Shoes'un vizyonu basittir: Adana'da üretilen, dünyada giyilen. Bu vizyon hem kalite hem de fiyat açısından güçlü bir denge sunar. Benzer malzeme ve üretim kalitesini, Türk üretiminin maliyet avantajıyla bir araya getirmek — bu denge, Neri'nin piyasadaki konumunu tanımlar.`
    }
  },
  {
    slug: 'eva-taban-mi-kaucuk-taban-mi-teknoloji-karsilastirmasi',
    category: 'uretim',
    cover_image: 'https://images.unsplash.com/photo-1465877783223-4eba513e27c6?w=1200&q=80',
    tr: {
      title: 'EVA Taban mı, Kauçuk Taban mı? Teknoloji Karşılaştırması',
      excerpt: 'Ayakkabı tabanı seçimi konfor, dayanıklılık ve kullanım amacına göre değişir. EVA ve kauçuk taban arasındaki farkları ve hangisinin ne zaman tercih edilmesi gerektiğini öğrenin.',
      body: `Bir ayakkabının kalitesi ve konforu sadece üst kısmıyla değil, tabanıyla da belirlenir. Taban seçimi kullanım amacı, zemin tipi ve konfor beklentisine göre değişir. İki popüler taban malzemesi olan EVA ve kauçuk arasındaki farkları inceleyelim.

EVA (Etilen Vinil Asetat) Nedir?

EVA, hafif ve köpük yapısıyla bilinen sentetik bir polimer taban malzemesidir. Birçok modern spor ayakkabısı ve günlük modelde kullanılır.

Avantajları şunlardır: Son derece hafiftir; aynı boyuttaki kauçuk tabana kıyasla yüzde 30-50 daha az ağır olabilir. Amortismanı yüksektir; darbe absorpsiyonu özellikle uzun yürüyüşlerde fark yaratır. Soğukta esnekliğini korur; kış kullanımında bu önemlidir.

Dezavantajları şunlardır: Aşınmaya karşı direnci kauçuktan düşüktür; sık ve yoğun kullanımda daha hızlı bozulur. Kayma direnci bazı formülasyonlarda sınırlıdır; yağlı ya da ıslak zeminde dikkatli olunmalıdır. Taban yenileme genellikle mümkün değildir; taban aşındığında ayakkabının ömrü de sona erer.

Kauçuk Taban Nedir?

Kauçuk, hem doğal hem de sentetik formda taban malzemesi olarak kullanılır. Klasik iş ayakkabısı ve deri botların tercihi genellikle kauçuktur.

Avantajları şunlardır: Aşınmaya direnci çok yüksektir; yoğun günlük kullanımda yıllar dayanabilir. Kayma direnci üstündür; ıslak ve düzensiz zeminde güvenlik sağlar. Taban yenilenebilir; aşınan kauçuk taban değiştirtilerek ayakkabı uzun ömürlü kullanılmaya devam edilebilir.

Dezavantajları şunlardır: EVA'ya kıyasla daha ağırdır; uzun gün kullanımında bu hissedilir. Bazı kauçuk tipleri soğukta sertleşebilir ve esnekliği azalır.

Hangi Taban Ne Zaman?

Günlük şehir kullanımı ve yürüyüş yoğunluğu düşük ise EVA ideal bir tercihtir: hafif, amortisanlı ve pratik. Yoğun yürüyüş, kaygan zemin riski ya da uzun ömür beklentisi varsa kauçuk tercih edilmelidir.

Neri Shoes, spor ve günlük modellerde EVA tabanı tercih ederken klasik ve iş modellerinde kauçuk bazlı taban kullanmaktadır. Her ürünün taban türü ürün sayfasında açıkça belirtilmektedir.`
    }
  },
  {
    slug: 'dogru-ayakkabi-numarasi-nasil-secilir',
    category: 'genel',
    cover_image: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=1200&q=80',
    tr: {
      title: 'Doğru Ayakkabı Numarası Nasıl Seçilir?',
      excerpt: 'Yanlış numara seçimi hem konforu hem de ayak sağlığını etkiler. Ayak ölçüsü alma, numara sistemi farkları ve online alışverişte doğru fit için kapsamlı rehber.',
      body: `Yanlış numara seçimi, kaliteli bir ayakkabıyı bile rahatsız edici hale getirebilir. Üstelik uzun vadede ayak sağlığını da etkiler: Dar ayakkabı çekiç parmak ve bursit riskini artırır; fazla büyük ayakkabı ise tırnak hasarına ve denge problemlerine yol açabilir.

Neden Numara Seçimi Karmaşıklaşır?

Farklı ülkelerin farklı numara sistemleri kullanması ilk karmaşıklık kaynağıdır: Türkiye ve Avrupa'da kullanılan EU sistemi, ABD sisteminden farklıdır; İngiltere'nin UK sistemi ise her ikisinden ayrışır. Bunun yanı sıra aynı EU numarası, farklı markalarda farklı gerçek ölçüye karşılık gelebilir.

Ayağınızı Doğru Ölçün

En güvenilir yöntem ayak uzunluğunu milimetre cinsinden ölçmektir. Bunun için bir kâğıt yaprağını düz zemine koyun. Çorapla ayağınızı kâğıda basın ve topuk ile en uzun parmağın ucunu işaretleyin. İki nokta arasındaki mesafeyi cetvelle ölçün. Her iki ayağı da ölçün; genellikle biri diğerinden biraz büyüktür — büyük olanı esas alın.

Bu ölçüm baz alınarak standart numara tablosuyla karşılaştırma yapılabilir.

Online Alışverişte Dikkat Edilecekler

Online alışverişte numara belirsizliği daha büyük bir risk oluşturur. Marka hangi ülke sistemini kullanıyor? Ürün sayfasında santimetre ya da milimetre tablosu var mı? Yorumlarda numarası büyük ya da küçük uyarısı var mı? Bu soruları sormak, iade sürecini önler.

Neri Shoes ürünlerinde ölçü bilgisi cm cinsinden belirtilmektedir. Şüphe halinde bir numara büyük tercih edilmesi önerilir; çoğu deri model kullanımla birlikte hafifçe genişler.

Model Tipine Göre Numara Farkı

Dar burunlu modeller doğal olarak daha sıkı hissettirdiğinden bu modellerde yarım numara büyük almak yaygın bir uygulamadır. Geniş burunlu modeller ise boyuta daha sadık kalır.

Çorap Kalınlığı da Belirleyici

Kışlık modelleri kalın çorapla, yazlık ve günlük modelleri ince ya da görünmez çorapla kullanmayı planlıyorsanız, numara seçerken bunu göz önünde bulundurun. Kalın çorap için alınan numara ince çorapla büyük hissedebilir; bu nedenle beklenen kullanım koşuluna göre ölçüm yapılmasını öneririz.`
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
  console.log('=== Blog Batch 3 (Yazı 11-15: Üretim + Satın Alma) ===');
  let ok = 0;
  for (let i = 0; i < POSTS.length; i++) {
    const success = await processPost(POSTS[i], i);
    if (success) ok++;
  }
  console.log(`\n✓ Tamamlandı: ${ok}/${POSTS.length} yazı kaydedildi.`);
}

main().catch(console.error);
