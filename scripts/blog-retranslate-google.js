// Google Translate public endpoint kullanan re-translate
// Posts 2-20 için başlık + excerpt + body çevirisi
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://tphxrtxzkvivjkxoeujm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHhydHh6a3ZpdmpreG9ldWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODUwMzMsImV4cCI6MjA5NzM2MTAzM30._Eu5dVQGdJEZLydPbsFu0qpCSAHP5su5LFKAdgIM86A'
);

const LANGS = ['en', 'de', 'it', 'ar', 'ru'];

async function trGoogle(text, to) {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && Array.isArray(data[0])) {
      return data[0].map(item => (item && item[0]) ? item[0] : '').join('');
    }
    return text;
  } catch (e) {
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

  const { title: trTitle, body: trBody, excerpt: trExcerpt } = post.content?.tr || {};
  if (!trTitle) {
    console.log(`  ✗ TR içerik yok`);
    return false;
  }

  const newContent = { tr: post.content.tr };
  const newMetaTitle = { tr: post.meta_title?.tr || `${trTitle} | Neri Shoes Blog` };
  const newMetaDesc = { tr: post.meta_description?.tr || trExcerpt?.slice(0, 155) };

  for (const lang of LANGS) {
    try {
      // Başlık çevir
      const tTitle = await trGoogle(trTitle, lang);
      await new Promise(r => setTimeout(r, 200));

      // Excerpt çevir
      const tExcerpt = await trGoogle(trExcerpt || '', lang);
      await new Promise(r => setTimeout(r, 200));

      // Body'yi chunk'lara böl ve çevir
      const chunks = splitChunks(trBody || '');
      const translatedChunks = [];
      for (const chunk of chunks) {
        const tChunk = await trGoogle(chunk, lang);
        translatedChunks.push(tChunk);
        await new Promise(r => setTimeout(r, 150));
      }

      newContent[lang] = {
        title: tTitle,
        body: translatedChunks.join(' '),
        excerpt: tExcerpt,
      };
      newMetaTitle[lang] = `${tTitle} | Neri Shoes Blog`;
      newMetaDesc[lang] = tExcerpt.slice(0, 155);

      console.log(`    ${lang}: ✓ ${tTitle.slice(0, 45)}`);
    } catch (e) {
      console.log(`    ${lang}: ✗ ${e.message}`);
      newContent[lang] = post.content?.tr;
      newMetaTitle[lang] = newMetaTitle.tr;
      newMetaDesc[lang] = newMetaDesc.tr;
    }
  }

  const { error: upErr } = await supabase
    .from('blog_posts')
    .update({
      content: newContent,
      meta_title: newMetaTitle,
      meta_description: newMetaDesc,
      translation_status: 'completed',
    })
    .eq('id', slug);

  if (upErr) {
    console.error(`  ✗ Güncelleme hatası: ${upErr.message}`);
    return false;
  }

  return true;
}

async function main() {
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

  console.log(`=== Google Translate Re-translate (${slugs.length} yazı) ===`);
  let ok = 0;
  for (let i = 0; i < slugs.length; i++) {
    console.log(`\n[${i + 1}/${slugs.length}] ${slugs[i]}`);
    const success = await retranslatePost(slugs[i]);
    if (success) ok++;
    // Post arası bekleme
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n✓ Tamamlandı: ${ok}/${slugs.length} yazı güncellendi.`);
}

main().catch(console.error);
