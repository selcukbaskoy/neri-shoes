// Blog Batch 1 — Yazı 1-5 (Bakım kategorisi)
// Her yazı sırayla: çeviri → Supabase insert → doğrulama
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
    slug: 'erkek-deri-ayakkabi-bakimi-kislik-modeller',
    category: 'bakim',
    cover_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
    tr: {
      title: 'Erkek Deri Ayakkabı Bakımı: Kışlık Modeller İçin Temel Kurallar',
      excerpt: 'Kış koşulları tuz, nem ve soğukla deri ayakkabılarınıza zarar verir. Bu rehberde kışa hazırlık, günlük rutin ve doğru depolama yöntemlerini öğrenin.',
      body: `Kış ayları, deri ayakkabılar için en zorlu dönemin başlangıcıdır. Yol tuzu, kar suyu ve düşen sıcaklıklar; derinizin doğal yağını bozarak çatlaklar, solgunluk ve erken yıpranmaya yol açar. Oysa birkaç basit alışkanlıkla bu riski büyük ölçüde azaltmak mümkündür.

Kışa Hazırlık: Sezondan Önce Yapılacaklar

İlk kar yağmadan en az iki gün önce ayakkabılarınıza su geçirmezlik bakımı uygulayın. Tam deri (full-grain leather) modeller için balmumu bazlı ürünler hem besler hem de nem bariyeri oluşturur. Parlak (lakeli) deri modellerde ise özel lak deri spreyi kullanın; normal su geçirmezlik spreyi bu yüzeyleri matlaştırır.

Yeni aldığınız kışlık bir deri ayakkabıyı hiç kullanmadan önce de bu işlemi yapın. Fabrikadan çıkan ayakkabılar genellikle koruma katmanı eklenmemiş olarak satılır.

Günlük Rutin: Her Kullanım Sonrası

Her kullanımın ardından kuru, yumuşak bir bezle ayakkabıyı silin. Bu sadece estetik bir adım değildir; tuzun deri üzerinde bıraktığı beyaz kalıntılar 30 dakikadan fazla beklediğinde mat izler oluşturabilir. İz oluşursa, eşit parçalar su ve beyaz sirke karışımıyla nemlendirilmiş bezle silebilirsiniz.

Islak ayakkabıyı kalorifer ya da saç kurutma makinesi gibi ısı kaynaklarının önüne koymaktan kaçının. Hızlı kuruma derinin fibrillerini sertleştirir ve esnekliğini kaybetmesine neden olur. En iyisi, ayak kalıbı içinde oda sıcaklığında kurutmaktır.

Haftalık Derin Bakım

Haftada bir kez şu dört adımı uygulayın: Önce sert kılsız bir fırçayla kuru kirleri alın. Ardından alkol içermeyen deri temizleyicisiyle silin ve kurumaya bırakın. Renk uyumlu ayakkabı kremini tutun, dairesel hareketlerle işleyin ve fazlasını silin. Son adımda yumuşak bir bez ya da parlak fırçayla polisaj yapın.

Neri Shoes kışlık modellerinde kullanılan tam taban dikişi bu rutin için idealdir: Gerektiğinde taban yenilenebilir, deri üst kısım yıllarca kullanılabilir.

Sezon Sonu Depolama

Kış biterken ayakkabıları temizlenmiş halde, ayak kalıbıyla desteklenmiş şekilde ve nefes alabilen bez torba içinde saklayın. Plastik poşet veya hava geçirmez kutu kullanmayın; nem birikimi mantara zemin hazırlar.

Doğru bakımla, kaliteli bir deri ayakkabı tek sezonu değil, on yılı aşkın bir süreyi sizinle geçirebilir. Neri Shoes kışlık modellerini seçerken bu uzun ömrü göz önünde bulundurun; başlangıçta görünen fiyat farkı, uzun vadede çok daha ekonomik bir seçimdir.`
    }
  },
  {
    slug: 'deri-ayakkabi-nasil-parlatilir-adim-adim-rehber',
    category: 'bakim',
    cover_image: 'https://images.unsplash.com/photo-1549298222-c0c82f4a1776?w=1200&q=80',
    tr: {
      title: 'Deri Ayakkabı Nasıl Parlatılır? Adım Adım Rehber',
      excerpt: 'Deri ayakkabınızı ayna gibi parlatmak için doğru tekniği öğrenin. Cream polish ve wax polish farkından fırça seçimine kadar eksiksiz rehber.',
      body: `İyi parlatılmış bir deri ayakkabı, hem kıyafetin kalitesini yükseltir hem de deriyi uzun süre nemli ve esnek tutar. Ancak parlatmak birçok kişinin sandığından daha teknik bir işlemdir. Yanlış ürünle ya da yanlış sırayla yapılırsa deri rengi solabilir, yüzey zedelenebilir.

Hangi Ürünü Ne Zaman Kullanırsınız?

Cream polish (krem cila): Deriyi besler, nemi dengeler ve hafif parlak bir görünüm verir. Düzenli kullanım içindir; haftada bir ideal sıklıktır.

Wax polish (balmumu cila): Çok daha parlak, yansıtıcı bir yüzey oluşturur. Deri beslemez ama ayna etkisi için gereklidir. Ayda bir ya da özel günler için uygundur.

Kremayı hiç uygulamadan balmumu kullanmak uzun vadede deriyi kurutur. Doğru sıra şudur: önce krem, sonra balmumu.

Adım Adım Parlatma Süreci

Birinci adım temizliktir: Eski cila kalıntılarını ve kirleri, sadece deri için üretilmiş alkol içermeyen temizleyiciyle silin. Boyalı kumaş ya da deterjan kullanmayın.

İkinci adım kurumadır: Ayakkabıyı 15-20 dakika oda sıcaklığında kurumaya bırakın.

Üçüncü adım krem cila uygulamaktır: Parmak ucunuza ya da küçük bir tiftik bezine az miktarda krem cila alın, dairesel hareketlerle tüm yüzeye işleyin. Özellikle burun ve topuk bölgelerine dikkat edin. 10 dakika bekleyin.

Dördüncü adım ilk fırçalamadır: Sert kıllı bir fırçayla aynı dairesel hareketlerle fazla kremayı silin. Bu adım ısı oluşturarak cilanın deriyle bütünleşmesini sağlar.

Beşinci adım balmumu uygulamaktır (opsiyonel): Parmakla ince bir kat balmumu uygulayın, 5-10 dakika bekleyin.

Altıncı adım son polisajdır: Yumuşak pamuklu bir bezle hızlı, ileri-geri hareketlerle son parlatmayı yapın.

Yaygın Hatalar

Çok fazla cila uygulamak: Aşırı cila birikmesi deriyi tıkar. Az ama sık uygulamak çok daha etkilidir.

Renkli cila yerine renksiz kullanmak: Siyah ve kahverengi deriler için renk uyumlu cila tercih edin; renksiz cila uzun vadede renk solmasına katkıda bulunabilir.

Süet ve nubuk'a krem cila uygulamak: Bu materyaller tamamen farklı bakım gerektirir; standart cila bu yüzeyleri mahvedebilir.

Neri Shoes tam deri modellerinde kullanılan yüzey, parlatmaya en iyi yanıt veren deri türlerinden biridir. Düzenli polisajla bu modeller zamanla daha zengin bir patina kazanır ve karakterini artırır.`
    }
  },
  {
    slug: 'suet-ayakkabi-bakimi-yapilmasi-ve-yapilmamasi-gerekenler',
    category: 'bakim',
    cover_image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=80',
    tr: {
      title: 'Süet Ayakkabı Bakımı: Yapılması ve Yapılmaması Gerekenler',
      excerpt: 'Süet ayakkabılar özel bakım gerektirir. Doğru fırça, silgi ve koruma spreyi seçiminden leke çıkarma tekniklerine kadar her şeyi öğrenin.',
      body: `Süet, görünümüyle şıklığı ve dokusuyla konforu bir araya getiren nadir deri türlerinden biridir. Ancak pürüzlü yüzeyi onu daha hassas kılar: yanlış ürünle ya da sert elle muamele gördüğünde telafi edilemez izler kalabilir. İyi haber şu: doğru teknikle süet ayakkabılar yıllarca ilk günkü gibi kalabilir.

Süet Nedir, Neden Özeldir?

Süet, derinin içine bakan yüzeyinden üretilir. Tüy gibi pürüzlü dokusu aslında küçük, yönlendirilmiş lif demetleridir. Bu lifler aşınma, su ve yağla kolayca bozulur. Bu yüzden tam deriye uygulanan krem cila ya da su tamamen süete yanlış ürünlerdir.

Doğru Bakım Araçları

Süet fırçası pirinç ya da naylon kıllı, özel yapıda bir fırçadır. Tozlama ve pürüzü yeniden canlandırmak için kullanılır. Süet silgisi (eraser) ise leke ve izler için süet yüzeye zarar vermeden çalışır. Süet koruma spreyi nano veya florkarbon bazlı olmalıdır; su ve yağa karşı yüzeyi korur ve her 2-3 kullanımda bir uygulanmalıdır.

Yapılması Gerekenler

Ayakkabıyı kullanmadan önce süet spreyi ile koruyun. Yeni alınan süet modellerde bu adımı asla atlamayın.

Kullanım sonrası kıl fırçayla tozlayın. Toz ve kiri liflerin arasına gömmeden önce çıkarmak esastır.

Kuru lekeleri süet fırçasıyla dairesel hareketle silin. Islak leke ise önce kurumaya bırakın, sonra silgiyle işleyin.

Yapılmaması Gerekenler

Su ile yıkamak ya da ıslak bez kullanmak ciddi bir hatadır. Süet ıslanırsa lifler yapışır ve yüzey bozulur. Yağmura yakalanırsanız gazete kağıdıyla doldurulmuş halde kurumaya bırakın, kesinlikle ısı kaynağı kullanmayın.

Krem cila ya da ayakkabı boyası uygulamak da büyük bir hatadır. Süet lifi kremayı emer ve yüzeyde kalıcı leke oluşturur.

Sert kıllı fırça kullanmak ise yüzeydeki ince liflere zarar verir ve geriye dönüşü olmayan izler bırakır.

Depolama ve Uzun Vadeli Bakım

Uzun süreli kullanmayacaksanız süet ayakkabıları bez torba içinde saklayın. Doğrudan güneş ışığına maruz kalan süet rengini kaybeder. Silika jel paket ekleyerek nemi de kontrol altında tutabilirsiniz.

Mevsimlik bir süet bakım rutini yılda bir yapıldığında, en hassas modeller bile yıllarca ilk günkü canlılığını korur.`
    }
  },
  {
    slug: 'ayakkabiinizin-omrunu-uzatan-7-aliskanlik',
    category: 'bakim',
    cover_image: 'https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=1200&q=80',
    tr: {
      title: 'Ayakkabınızın Ömrünü Uzatan 7 Alışkanlık',
      excerpt: 'Kaliteli deri ayakkabı uzun ömürlüdür — ama bu ömür bakım alışkanlıklarınıza bağlıdır. Günlük hayata kolayca entegre edilebilen 7 alışkanlığı keşfedin.',
      body: `Kaliteli bir deri ayakkabı, iyi bakıldığında 10-15 yıl rahatlıkla kullanılabilir. Ancak bu uzun ömür kendiliğinden gelmiyor: günlük birkaç dakikalık dikkat ve doğru alışkanlıklar, ayakkabıların yıpranma hızını dramatik biçimde yavaşlatır. İşte en etkili yedi alışkanlık.

1. Aynı Ayakkabıyı Üst Üste Giyme

Deri, her kullanımda terlemeyi emer. Bu nemin tamamen buharlaşması için en az 24 saat gerekir. Aynı çifti iki gün üst üste giydiğinizde nem içeride kalır, deriyi içten çürütür ve taban bağlantısını zayıflatır. En az iki ya da üç çift arasında dönüşüm yapın.

2. Ayak Kalıbı Kullanın

Ayakkabı kalıbı sadece şekli korumaz; nem tutma noktalarını havalandırır ve kullanım kaynaklı kırışıkları uzun vadede düzeltir. Özellikle sedir ağacından yapılmış kalıplar nemi emer ve mantar oluşumunu önler.

3. Topuk Koruyucuyu Zamanında Değiştirin

Topuk koruyucuların aşınma eşiğini geçmesine izin vermeyin. Plastik ya da deri olan bu küçük parça bittiğinde, sonraki aşınan katman metaldir; hem ses çıkarır hem de topuğu geri dönülemez biçimde tahrip eder. Topuk seslenmeye başlamadan önce tamirciye götürün.

4. Gece Havalandırın, Kapalı Tutmayın

Kullandığınız ayakkabıyı gece kutusuna ya da dolaba koyma huyunu bırakın. İlk bir ila iki saat, nem için havalandırma süresidir. Sedir kalıbıyla açık ortamda bırakın, sonra depolayın.

5. İlk Gün Koruma Spreyi Uygulayın

Yeni bir deri ayakkabıyı satın aldığınız gün su ve yağ geçirmezlik spreyi uygulayın. Fabrika ürünleri çoğunlukla bu katmansız gelir. İlk kullanım sırasında maruz kaldığı tuz, yağ ya da nem, yapılmayan bir bakımın bedelini kalıcı leke olarak öder.

6. Doğru Bağcık Gerin

Bağcıklı modellerde bağcığı fazla sıkı bağlamak deri üzerinde çizgi izi bırakır; çok gevşek bağlamak ise ayağın öne kaymasına neden olarak taban aşınmasını asimetrik hale getirir. Bağcığı, ayağı sabit tutan ama deriyi baskı altına almayan şekilde bağlayın.

7. Sezonu Temizlenmiş Bitirin

Kıştan çıkarken ya da yaz sonunda dolaba kaldırırken ayakkabıları son kez temizleyip besleyin. Üzerindeki nem, tuz ya da organik kir, aylar boyunca kapalı ortamda biyolojik bozunmaya yol açar. Temizlenmiş, kremlenmiş ve kalıplı şekilde saklanan ayakkabı, gelecek sezonun başında sizi sürprizle karşılamaz.

Bu yedi alışkanlık birbirinden bağımsızdır; hepsini birden başlamak zorunda değilsiniz. Ayak kalıbı almak ya da çift sayınızı artırmak bile başlı başına fark yaratır.`
    }
  },
  {
    slug: 'yagmurlu-havada-deri-ayakkabi-korumasi',
    category: 'bakim',
    cover_image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1200&q=80',
    tr: {
      title: 'Yağmurlu Havada Deri Ayakkabı Koruması',
      excerpt: 'Yağmur, deri ayakkabının en büyük düşmanıdır. Su geçirmezlik ürünleri, ıslanma sonrası doğru kurutma ve kalıcı hasarı önleme yöntemleri bu rehberde.',
      body: `Ani bir yağmura yakalandınız, deri ayakkabılarınız ıslandı. Bundan sonra ne yaparsanız yapın deriniz bir miktar etkilenmiş olacak; ancak hasarı minimum seviyede tutmak ve kalıcı iz bırakmadan kurtarmak tamamen mümkündür. Üstelik iyi bir önlem planıyla yağmurun sorun olması baştan engellenebilir.

Yağmurun Deriye Etkisi

Su, deri liflerine penetre olduğunda iki aşamalı hasar verir: Islak halde deri şişer ve gerilir. Kuruma sırasında doğal yağ da buharlaşır, lif kısalır ve deri sertleşir. Bu döngü tekrarlandıkça deri kırılganlaşır ve çatlaklar oluşur.

Tuz içeren yol suyu ise daha da tehlikelidir: Tuz, kuruma sonrası mat beyaz leke bırakır ve lif bağlarını kimyasal olarak bozar.

Önceden Koruma: Nano Sprey Uygulama

En etkili çözüm önceden korumadır. Kaliteli bir nano veya florkarbon bazlı su geçirmezlik spreyi, deri yüzeyinde görünmez bir film oluşturarak su damlalarını geri iter. Bu sprey aylık ya da 6-8 kullanımda bir yenilenmelidir.

Uygulama için ayakkabıyı önce temizleyin ve kurulayın. 20-25 cm mesafeden eşit şekilde spreyleyin, 10 dakika bekleyin ve ikinci kat uygulayın. İlk kullanım öncesi bu işlem yapıldıysa, çoğu yağmur seansı ciddi hasar bırakmaz.

Islandıktan Sonra Yapılacaklar

İlk beş dakika içinde kuru bir bezle dışındaki su fazlasını silin; sürtmeyin, hafifçe bastırın.

Şekil koruması için ayakkabının içine gazete kağıdı ya da bez parçalar doldurun. Bu, kuruma sırasında şeklin bozulmasını önler. Sedir kalıbınız varsa daha da iyidir.

Isı kaynağından uzakta, hava akımı olan bir alanda 12-24 saat kurumaya bırakın. Kalorifer, saç kurutma makinesi ve güneş ışığından uzak durun; bunların hepsi sertleşmeye yol açar.

Kuruyunca beyaz tuz lekesi oluştuysa, eşit parça su ve beyaz sirke karışımıyla nemlendirilmiş bezle nazikçe silin.

Tamamen kuruyunca deri kondisyoner ya da krem cila uygulayın. Kuruma sürecinde kaybolan doğal yağı yerine koyar.

Uzun Vadeli Strateji

Hava tahminlerine göre yağmur beklenen günlerde tam deri modeller yerine daha az hassas alternatifler tercih edilebilir. Neri Shoes modellerinde kullanılan EVA taban nemli koşullarda dayanıklı bir zemin sağlar; ancak üst deri bakımı yine de gereklidir.

Sonuç olarak yağmurlu havadan kaçmak zorunda değilsiniz. Önceden uygulanan bir sprey ve ıslandıktan sonraki doğru rutin, deri ayakkabınızı uzun yıllar sağlıklı tutmak için yeterlidir.`
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
  console.log('=== Blog Batch 1 (Yazı 1-5: Bakım) ===');
  let ok = 0;
  for (let i = 0; i < POSTS.length; i++) {
    const success = await processPost(POSTS[i], i);
    if (success) ok++;
  }
  console.log(`\n✓ Tamamlandı: ${ok}/${POSTS.length} yazı kaydedildi.`);
}

main().catch(console.error);
