// Blog Batch 2 — Yazı 6-10 (Stil kategorisi)
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
    slug: 'klasik-derby-ayakkabi-hangi-kiyafetlerle-kombinlenir',
    category: 'stil',
    cover_image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&q=80',
    tr: {
      title: 'Klasik Derby Ayakkabı Hangi Kıyafetlerle Kombinlenir?',
      excerpt: 'Derby ayakkabı, gardıropun en çok yönlü parçalarından biridir. Takımdan denimine kadar farklı kombin önerilerini ve stil ipuçlarını keşfedin.',
      body: `Derby ayakkabı, erkek modasının temel taşlarından biridir. Oxford ayakkabıdan daha az resmi olan yapısı sayesinde hem iş hem de günlük kombinlerde kullanılabilir. Peki hangi kıyafetle nasıl giyilir?

Derby Nedir, Oxford'dan Farkı Ne?

Görünüş itibarıyla birbirine benzeyen derby ve oxford ayakkabıların farkı bağcık bölgesindedir: Oxford'da bağcıkların iki yanı birbirine dikilir, derby'de ise açıktır. Bu küçük fark, derby'yi Oxford'a göre daha geniş bir ayağa uyumlu ve daha az resmi yapar.

Takım Elbise ile Derby

Siyah ya da koyu kahverengi derby, klasik takım elbiseyle mükemmel uyum sağlar. Özellikle Oxford'un fazla resmi kaçtığı ortamlarda siyah derby ideal seçimdir. Koyu mavi ya da antrasit takımla koyu kahverengi derby, bu kombinasyonu biraz daha modern ve sıcak gösterir.

Günlük Kazak ve Pantolon Kombinleri

Derby'nin asıl potansiyeli yarı resmi kombinlerde ortaya çıkar. Düz kesim ya da slim fit pantolon, boğazlı kazak ya da Oxford gömlek ve koyu kahverengi derby — bu üçlü, iş dışı önemli randevular için hatasız bir görüntü verir.

Renk seçiminde kural şudur: Ayakkabı rengi kemeri, kemer rengi saati andırmalıdır. Bu uyum, kombini düşünülmüş ve özenli gösterir.

Pantolon ve Ceket Kombinleri

Pantolon-ceket kombininde derby en doğal konumundadır. Koyu pantolon, açık renk gömlek ve sport ceket ile kahverengi derby; smart casual denilen görünümün vazgeçilmez üçüncü ayağıdır.

Denim ile Derby

Koyu indigo slim fit denim, açık renk gömlek ya da kazak ve koyu taba ya da bordo derby — bu kombin "şehirde rahat ama özenli" görünümün özüdür. Açık mavi soluk denim ya da yırtık modeller ise derby'yle uyumsuz kaçar.

Renk Kılavuzu

Siyah derby en resmi ve en koyu renk pantolon ve takımlarla uyum sağlar. Kahverengi derbiler ise daha fazla esneklik sunar: koyu kahve resmi ortamlarda işe yarar, açık taba ya da konyak tonları günlük kombinlerde sıcak ve modern bir hava yaratır.

Neri Shoes klasik derby modellerinde kullanılan tam deri üst yüzey, zamanla şekil alarak kullanıcının ayak formuna uyum sağlar. Bu kişiselleşme, derby ayakkabıyı gardirobun yıllar içinde daha değerli hale gelen bir parçasına dönüştürür.`
    }
  },
  {
    slug: 'chelsea-boot-ile-5-farkli-stil-onerisi',
    category: 'stil',
    cover_image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',
    tr: {
      title: 'Chelsea Boot ile 5 Farklı Stil Önerisi',
      excerpt: 'Chelsea boot hem günlük hem de yarı resmi kombinlerde kullanılabilen çok yönlü bir klasiktir. İşte her tarza uygun 5 farklı Chelsea boot kombini.',
      body: `Chelsea boot, 1960'lardan bu yana geçerliliğini koruyan nadir ayakkabı modellerinden biridir. Elastik yan bantları ve bağcıksız yapısıyla hem pratik hem de estetik açıdan güçlü bir seçimdir.

1. Skinny ya da Slim Fit Denim ile Chelsea Boot

Chelsea boot'un en klasik kombinasyonu budur. Dar ya da slim fit denim, çizmeyi tamamen görünür kılar ve uzatılmış bir bacak etkisi yaratır. Koyu indigo ya da siyah denim, siyah veya koyu kahverengi Chelsea boot ile birlikte üzerine beyaz ya da gri sade bir kazak eklendiğinde mükemmel bir modern klasik görünüm elde edilir.

2. Slim Fit Pantolon, Blazer ve Chelsea Boot

Bu kombinasyon smart casual'ın en güçlü ifadesidir. Koyu pantolon, yapılandırılmamış bir blazer ve koyu chelsea boot; iş toplantısından sanat galerisine kadar pek çok ortama uyar. Renkli ya da dokulu bir blazer seçerseniz, ayakkabının nötr ton kalması gerekir.

3. Takım Elbise ile Chelsea Boot

Düz burunlu, koyu renkli bir Chelsea boot takım elbiseyle kombinlenebilir. Özellikle slim suit tercihlerinde bu kombinasyon zarifleşir. Siyah ya da koyu bordo Chelsea boot bu kombinin en güvenli seçimleridir.

4. Şort ile Chelsea Boot

Diz üstü kumaş ya da kargo şort, gevşek bırakılmış bir gömlek veya kazak ve Chelsea boot; özellikle İngiliz ve İskandinav street style'ında sıkça görülen cesur bir kombinasyondur. Başarılı olabilmesi için şort paçanın topuk üzerinde durması gerekir; çizme şortun içinde kalmamalıdır.

5. Trençkot ile Chelsea Boot

Sonbahar-kış geçişinin simgesi bu kombinasyon, Chelsea boot'u en iyi anlatan görüntüdür. Uzun trençkot ya da overcoat, slim pantolon ve siyah ya da koyu kahverengi Chelsea boot; bu üçlü hem sıcak tutar hem de çarpıcı bir silüet oluşturur.

Chelsea Boot Bakımı

Chelsea boot'lar haftada ya da iki haftada bir krem cila uygulaması ve aylık balmumu polisajı gerektirir. Elastik yan bantlar zamanla yorulabilir; koparsa tamircide değiştirtmek modelin ömrünü önemli ölçüde uzatır.

Neri Shoes Chelsea boot modellerinde deri üst yüzey ve elastik yan bant kombinasyonu, konforu ve dayanıklılığı bir arada sunar. Doğru kombinle her mevsim kullanılabilir bir gardırop klasiğidir.`
    }
  },
  {
    slug: 'is-hayatinda-dogru-ayakkabi-secimi',
    category: 'stil',
    cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    tr: {
      title: 'İş Hayatında Doğru Ayakkabı Seçimi',
      excerpt: 'İş ortamında ayakkabı seçimi, profesyonel imajın kritik bir parçasıdır. Farklı iş kültürlerine göre doğru model, renk ve bakım önerileri bu rehberde.',
      body: `Bir ayakkabının iş ortamına uygunluğu, sadece görünümden ibaret değildir; gün içindeki konfor, temizlik kolaylığı ve uzun vadeli dayanıklılık da bu seçimin parçalarıdır. Farklı iş kültürleri farklı standartlar gerektirdiğinden tek bir doğru cevap yoktur. Ama belirli ilkeler, doğru seçimi kolaylaştırır.

Resmi İş Ortamı: Hukuk, Finans, Yönetim

Bu ortamlarda ayakkabı seçimi en muhafazakâr skalada yer alır. Siyah tam deri Oxford veya derby ayakkabı, koyu takım elbiseyle en güvenli kombinasyondur. Stiletto taban ya da çarpıcı renkler bu ortamlarda yer bulmaz; amaç profesyonelliği öne çıkarmak, dikkat çekmemektir.

Bakım bu kategoride özellikle önemlidir: Buruşmuş, mat ya da çizikli bir deri ayakkabı, iyi bir takımın etkisini tamamen sıfırlar. Haftada en az bir kez krem cila, günlük fırçalama bu ortamın zorunluluğudur.

Yarı Resmi İş Ortamı: Pazarlama, Teknoloji, Mimarlık

Smart casual denilen bu alanda çok daha fazla esneklik vardır. Kahverengi derby, loafer ya da Chelsea boot, açık renkli pantolon ya da slim denim ile birlikte çalışır. Renkli aksan — bordo, taba, konyak tonları — bu ortamlarda karakter katar.

Bununla birlikte günlük rahat ile iş rahat arasındaki sınırı korumak gerekir. Spor sneaker ya da çok kısa bot modelleri, bu ortamda bile fazla rahat kaçabilir.

Yaratıcı Sektörler: Tasarım, Medya, Moda

Bu alanlarda kurallar önemli ölçüde gevşer. Ancak kuralsız özgürlük, düşünülmemiş tercihle karıştırılmamalıdır. Premium sneaker, yaratıcı deri bot ya da alışılmadık renk kombinleri bu ortamlarda makbul; hatta beklenen görünümü tamamlar.

Renk ve Malzeme Kılavuzu

Siyah her zaman en resmi ve en evrensel seçimdir; lacivert ve antrasit takımlarla hatasız uyum sağlar. Koyu kahverengi kahverengi ya da bej ağırlıklı kombinlerde güçlüdür; takımla da giyilebilir ama siyahtan biraz daha az resmidir. Taba ve konyak tonları günlük ve yarı resmi kombinlerde çarpıcıdır; resmi takımla kullanımda dikkatli olunmalıdır.

Pratik İpucu: Ayakkabınızı İki Gün Üst Üste Giyme

İş ortamında aynı ayakkabıyı iki gün art arda giymek, hem deri bakımını hem de görünümü olumsuz etkiler. En az iki çift arasında dönüşüm yapmak, her çiftin her gün taze ve bakımlı görünmesini sağlar.

Neri Shoes iş modelleri, kalite standardını modern kesimlerle birleştirerek hem resmi hem de yarı resmi kategorilerde sağlam seçenekler sunar.`
    }
  },
  {
    slug: 'loafer-ayakkabi-rahatlık-ve-sikligi-birlestirme-sanati',
    category: 'stil',
    cover_image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80',
    tr: {
      title: 'Loafer Ayakkabı: Rahatlık ve Şıklığı Birleştirme Sanatı',
      excerpt: 'Loafer, bağcıksız yapısıyla konforu ön plana taşırken şıklıktan taviz vermez. Farklı loafer türleri, kombin önerileri ve bakım ipuçları bu rehberde.',
      body: `Loafer, erkek ayakkabı dünyasının belki de en demokratik parçasıdır: rahat, pratik ve doğru kullanıldığında son derece şık. 1930'larda ortaya çıkan bu model, bugün hem ofis hem de kent sokakları için uygun bir tasarıma sahiptir. Peki loafer'ı doğru giymek ne demektir?

Loafer Türleri

Penny loafer, üst kısmında küçük bir delik bulunan klasik modeldir. En tanınan loafer türü olup yarı resmi ve günlük kombinlerde çalışır.

Tassel loafer, üst kısımda püsküller bulunan versiyondur. Daha karakterli ve biraz daha resmi olup özellikle İtalyan modası etkisindeki smart casual kombinlerde güçlüdür.

Horsebit loafer, metalik ata gemi tokalı modeldir. Bu tasarım bugün pek çok markada üretilmektedir. Metalik detay sayesinde hem resmi hem de yaratıcı ortamlarda güçlüdür.

Loafer ile Kombin Önerileri

Loafer'ın en doğal arkadaşı çorapsız ya da görünmez çoraplı kombindir. Bu stil özellikle yaz aylarında güçlüdür; ayak bileğini açıkta bırakarak hafif ve serbest bir görünüm verir.

Keten ya da slim pantolon ile loafer'ın en iyi eşidir. Pantolon paçasının topuğu örtecek şekilde uzun olması loafer'ı görünmez kılar; paça tam bilek üzerinde durduğunda ayakkabı öne çıkar.

Şort ile loafer kombinasyonu Akdeniz estetiğini çağrıştırır: koyu kumaş şort, sade bir linen gömlek ve taba horsebit loafer.

Loafer Bakımı

Loafer, taban ve üst kısım olmak üzere iki ayrı yüzeyin bakımını gerektirir. Üst kısım için haftada bir krem cila, ayda bir balmumu uygundur. Taban ise kayar zemin riskine karşı düzenli kontrol edilmeli; aşınan parçalar tamircide yenilenmeli.

Günlük kullanımda bağcıksız yapının getirdiği kolaylık bir dezavantaja dönüşebilir: Loafer, düzgün oturmak için topuğun dik tutulmasını gerektirir. Topuk düşürülmüş şekilde sürtünerek giyilirse, arka deri kısmı hızla bozulur.

Neri Shoes loafer modellerinde kullanılan sürme deri üst ve EVA taban kombinasyonu, hafiflik ve gün boyu konfor sağlar. Doğru bakımla bu modeller, her sezon gardırobun dönüp dönüp başvurulan parçası haline gelir.`
    }
  },
  {
    slug: 'sneaker-ile-klasik-kombinler-rahat-ama-sik-olmak',
    category: 'stil',
    cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
    tr: {
      title: 'Sneaker ile Klasik Kombinler: Rahat Ama Şık Olmak',
      excerpt: 'Premium sneaker artık sadece spor için değil. Takımla bile giyilebilen sneaker trendini, doğru model ve kombin seçimini bu rehberde keşfedin.',
      body: `On yıl önce sneaker ile takım ifadesi bir tezat yaratırdı. Bugün ise moda dünyasının en yaygın görüntülerinden biridir. Ancak her sneaker her kombinle çalışmaz. Sneaker'ın rahat ama şık dengesini kurabilmek için birkaç ilkeyi anlamak gerekir.

Doğru Sneaker Nasıl Seçilir?

Klasik kombinlere uygun sneaker'ın özellikleri bellidir: Temiz siluet — gereksiz panel, logo ya da spor detay yok. Düz ya da hafif dolgu taban — kalın platformlu taban resmi ya da yarı resmi kombinle uyumsuz. Nötr renk — beyaz, siyah, gri, krem; parlak renkler dikkat dağıtır. Kaliteli malzeme — deri ya da canvas tercih edilmeli; sintetik malzeme ucuz görüntü verir.

Bu kriterlere uyan clean sneaker modelleri artık hem günlük hem de yarı resmi kombinlerde benimsenmiştir.

Sneaker ile Slim Pantolon ve Blazer

Bu en başarılı kombinasyondur. Koyu slim fit pantolon, yapılandırılmamış bir blazer ve beyaz ya da gri clean sneaker; üzerine kırışıksız bir gömlek ya da kazak eklendiğinde bu kombin her iş-dışı önemli ortama uygundur. Ayakkabının rengini nötr tutun; blazer'ın rengi ya da deseni zaten yeterli karakter katar.

Sneaker ile Denim

En klasik kombindir. Slim ya da straight cut denim ve clean beyaz sneaker; minimal bir T-shirt ya da gömlek ile tamamlanır. Soluk ya da yırtık denim sneaker'ın daha rahat karakteriyle uyum içindedir; çok koyu slim denim ise biraz daha smart casual'a çeker.

Sneaker ile Takım Elbise

En cesur kombinasyondur. Başarılı olabilmesi için takımın yapısı önemlidir: Hafif, yapılandırılmamış takım bu kombinasyona daha kolay uyum sağlar. Takım ile giyilen sneaker'ın rengi takımla aynı ton ailesinde ya da tamamen nötr olmalıdır. Koyu lacivert takım ve beyaz clean sneaker bu kombinasyonun altın standardıdır.

Sneaker'ın Bakımı

Clean sneaker modeli seçmenin bedeli bakım hassasiyetidir. Beyaz deri sneaker haftada bir nemli bezle silinmeli, yılda iki kez deri temizleyicisiyle derin temizlenmelidir. Beyaz kauçuk taban kenarı için özel beyazlatıcı sprey kullanılabilir. Ayakkabı kalıbı sneaker için de geçerlidir; özellikle deri modellerde kalıp kullanmak şekli korur.

Neri Shoes spor serisindeki modeller, bu hibrit estetik için tasarlanmıştır: Temiz silüet, kaliteli deri ya da canvas üst ve konforu ön plana çıkaran EVA taban. Hem spor hem de şehir kullanımı için ideal bir denge.`
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

  console.log(`  ✓ Kaydedildi: ${data.slug} | çeviri: ${data.translation_status}`);
  return true;
}

async function main() {
  console.log('=== Blog Batch 2 (Yazı 6-10: Stil) ===');
  let ok = 0;
  for (let i = 0; i < POSTS.length; i++) {
    const success = await processPost(POSTS[i], i);
    if (success) ok++;
  }
  console.log(`\n✓ Tamamlandı: ${ok}/${POSTS.length} yazı kaydedildi.`);
}

main().catch(console.error);
