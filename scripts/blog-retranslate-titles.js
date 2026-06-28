// Sadece başlık + excerpt'i çevirir (body atlanır — limite sığmak için)
// Posts 2-20 için çalıştırılacak
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
    console.log(`    ! ${to}: API yanıtı: ${data.responseStatus} ${data.responseData?.translatedText?.slice(0,30)}`);
    return null; // null döndür ki orijinalden ayırt edebilelim
  } catch {
    return null;
  }
}

async function retranslatePost(slug) {
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('content, meta_title, meta_description')
    .eq('id', slug)
    .single();

  if (error || !post) {
    console.log(`  ✗ Bulunamadı: ${slug}`);
    return false;
  }

  const trTitle = post.content?.tr?.title;
  const trExcerpt = post.content?.tr?.excerpt;

  if (!trTitle) {
    console.log(`  ✗ TR içerik yok: ${slug}`);
    return false;
  }

  // Mevcut içeriği kopyala
  const newContent = { ...post.content };
  const newMetaTitle = { ...post.meta_title };
  const newMetaDesc = { ...post.meta_description };

  let anyTranslated = false;
  for (const lang of LANGS) {
    // Mevcut çeviri Türkçeyle aynıysa yeniden çevir
    const existing = post.content?.[lang];
    if (existing?.title && existing.title !== trTitle) {
      console.log(`    ${lang}: zaten çevrilmiş, atlandı`);
      continue;
    }

    const [tTitle, tExcerpt] = await Promise.all([
      tr(trTitle, lang),
      tr(trExcerpt, lang),
    ]);

    if (tTitle && tTitle !== trTitle) {
      newContent[lang] = {
        title: tTitle,
        body: post.content?.[lang]?.body || trTitle, // body'yi koru
        excerpt: tExcerpt || trExcerpt,
      };
      newMetaTitle[lang] = `${tTitle} | Neri Shoes Blog`;
      newMetaDesc[lang] = (tExcerpt || trExcerpt).slice(0, 155);
      console.log(`    ${lang}: ✓ ${tTitle.slice(0, 40)}...`);
      anyTranslated = true;
    } else {
      console.log(`    ${lang}: limit aşıldı, atlandı`);
    }

    // Rate limit için küçük bekleme
    await new Promise(r => setTimeout(r, 300));
  }

  if (!anyTranslated) return false;

  const { error: upErr } = await supabase
    .from('blog_posts')
    .update({ content: newContent, meta_title: newMetaTitle, meta_description: newMetaDesc })
    .eq('id', slug);

  if (upErr) {
    console.error(`  ✗ Güncelleme hatası: ${upErr.message}`);
    return false;
  }

  return true;
}

async function main() {
  // Post 1 zaten çevrildi; Posts 2-20 slugları
  const slugs = [
    'deri-ayakkabi-nasil-parlatilir-adim-adim-rehber',
    'suet-ayakkabi-bakimi-yapilmasi-ve-yapilmamasi-gerekenler',
    'ayakkabiinizin-omrunu-uzatan-7-aliskanlik',
    'yagmurlu-havada-deri-ayakkabi-korumasi',
    'klasik-derby-ayakkabi-hangi-kiyafetlerle-kombinlenir',
    'chelsea-boot-ile-5-farkli-stil-onerisi',
    'is-hayatinda-dogru-ayakkabi-secimi',
    'loafer-ayakkabi-rahatlık-ve-sikligi-birlestirme-sanati',
    'sneaker-ile-klasik-kombinler-rahat-ama-sik-olmak',
    'neri-shoesta-bir-ayakkabi-nasil-uretilir',
    'hakiki-deri-ile-sentetik-deri-arasindaki-fark',
    'adananin-ayakkabilik-kulturu-ve-neri-shoesun-yeri',
    'eva-taban-mi-kaucuk-taban-mi-teknoloji-karsilastirmasi',
    'dogru-ayakkabi-numarasi-nasil-secilir',
    'toptan-ayakkabi-aliminda-dikkat-edilmesi-gerekenler',
    'hediye-icin-erkek-ayakkabi-secim-rehberi',
    '2026-erkek-ayakkabi-trendleri',
    'kis-sezonu-icin-en-uygun-ayakkabi-modelleri',
    'yaz-sezonunda-nefes-alabilir-ayakkabi-secimi',
  ];

  console.log(`=== Başlık + Excerpt Re-translate (${slugs.length} yazı) ===`);
  let ok = 0;
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    console.log(`\n[${i + 1}/${slugs.length}] ${slug}`);
    const success = await retranslatePost(slug);
    if (success) ok++;
    // Her post arasında bekleme (rate limit)
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nSonuç: ${ok}/${slugs.length} yazı güncellendi.`);
}

main().catch(console.error);
