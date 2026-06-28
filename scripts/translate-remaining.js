/**
 * Kalan 7 post için çeviri — post başına, dil başına, adım adım
 * İlerlemeyi scripts/translation-progress.json'a yazar
 * Yarıda kesilirse kaldığı yerden devam eder
 *
 * Kullanım: node scripts/translate-remaining.js
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://tphxrtxzkvivjkxoeujm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaHhydHh6a3ZpdmpreG9ldWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODUwMzMsImV4cCI6MjA5NzM2MTAzM30._Eu5dVQGdJEZLydPbsFu0qpCSAHP5su5LFKAdgIM86A'
);

const PROGRESS_FILE = path.join(__dirname, 'translation-progress.json');
const LANGS = ['en', 'de', 'it', 'ar', 'ru'];

// Progress dosyası yönetimi
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Delay
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Call counter — her 8 çağrıda bir uzun bekleme
let callCount = 0;
async function waitBetweenCalls() {
  callCount++;
  if (callCount % 8 === 0) {
    process.stdout.write(' [bekleniyor 5s] ');
    await wait(5000);
  } else {
    await wait(700);
  }
}

// Google Translate (tek metin)
async function trGoogle(text, to) {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data[0])) {
      return data[0].map(item => (item && item[0]) ? item[0] : '').join('');
    }
    return text;
  } catch (e) {
    console.error(`\n  ! translate hata (${to}): ${e.message}`);
    return text; // fallback
  }
}

// Body'yi chunk'lara böl
function splitChunks(text, max = 350) {
  if (!text) return [''];
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

// Bir post için TEK bir dil çevirisi
async function translateOneLang(trContent, lang) {
  // Başlık
  await waitBetweenCalls();
  const title = await trGoogle(trContent.title, lang);

  // Excerpt
  await waitBetweenCalls();
  const excerpt = await trGoogle(trContent.excerpt || '', lang);

  // Body chunk'ları
  const chunks = splitChunks(trContent.body || '');
  const bodyParts = [];
  for (const chunk of chunks) {
    await waitBetweenCalls();
    bodyParts.push(await trGoogle(chunk, lang));
  }

  return { title, excerpt, body: bodyParts.join(' ') };
}

// Bir post'un TÜM dillerini çevir ve Supabase'e kaydet
async function translatePost(slug, progress) {
  console.log(`\n--- Post: ${slug} ---`);

  // Supabase'den post'u çek
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('content, meta_title, meta_description')
    .eq('id', slug)
    .single();

  if (error || !post) {
    console.log('  ✗ Post bulunamadı');
    return false;
  }

  const trContent = post.content?.tr;
  if (!trContent?.title) {
    console.log('  ✗ TR içerik yok');
    return false;
  }

  // Progress'i başlat
  if (!progress[slug]) progress[slug] = {};

  const newContent = { ...post.content };
  const newMetaTitle = { ...(post.meta_title || {}) };
  const newMetaDesc = { ...(post.meta_description || {}) };

  // TR meta'yı garantile
  if (!newMetaTitle.tr) newMetaTitle.tr = `${trContent.title} | Neri Shoes Blog`;
  if (!newMetaDesc.tr) newMetaDesc.tr = (trContent.excerpt || '').slice(0, 155);

  let changed = false;

  for (const lang of LANGS) {
    // Bu dil zaten tamamlandıysa atla
    if (progress[slug][lang] === 'done') {
      console.log(`  ${lang}: zaten tamamlandı, atlandı`);
      continue;
    }

    // Mevcut çeviri gerçek çeviri mi yoksa fallback mı?
    const existing = post.content?.[lang];
    if (existing?.title && existing.title !== trContent.title) {
      console.log(`  ${lang}: çeviri var, atlandı`);
      progress[slug][lang] = 'done';
      continue;
    }

    process.stdout.write(`  ${lang}: çevriliyor... `);
    const translated = await translateOneLang(trContent, lang);

    // Çeviri başarılı mı? (Başlık Türkçeden farklıysa gerçek çeviridir)
    if (translated.title !== trContent.title) {
      newContent[lang] = { title: translated.title, body: translated.body, excerpt: translated.excerpt };
      newMetaTitle[lang] = `${translated.title} | Neri Shoes Blog`;
      newMetaDesc[lang] = translated.excerpt.slice(0, 155);
      progress[slug][lang] = 'done';
      changed = true;
      console.log(`✓ ${translated.title.slice(0, 40)}`);
    } else {
      console.log(`⚠ başlık değişmedi (API sorunu?)`);
    }

    // Progress'i ara kaydet
    saveProgress(progress);
  }

  if (!changed) {
    console.log('  → Değişiklik yok, güncelleme atlandı');
    return true;
  }

  // Supabase'e kaydet
  const { error: upErr } = await supabase
    .from('blog_posts')
    .update({ content: newContent, meta_title: newMetaTitle, meta_description: newMetaDesc })
    .eq('id', slug);

  if (upErr) {
    console.error(`  ✗ Kayıt hatası: ${upErr.message}`);
    return false;
  }

  console.log(`  → Kaydedildi`);
  return true;
}

// Ana fonksiyon
async function main() {
  const remaining = [
    'eva-taban-mi-kaucuk-taban-mi-teknoloji-karsilastirmasi',
    'dogru-ayakkabi-numarasi-nasil-secilir',
    'toptan-ayakkabi-aliminda-dikkat-edilmesi-gerekenler',
    'hediye-icin-erkek-ayakkabi-secim-rehberi',
    '2026-erkek-ayakkabi-trendleri',
    'kis-sezonu-icin-en-uygun-ayakkabi-modelleri',
    'yaz-sezonunda-nefes-alabilir-ayakkabi-secimi',
  ];

  const progress = loadProgress();
  console.log('=== Kalan 7 Post Çevirisi ===');
  console.log(`İlerleme dosyası: ${PROGRESS_FILE}`);

  let completed = 0;
  for (let i = 0; i < remaining.length; i++) {
    const slug = remaining[i];
    const allDone = LANGS.every(l => progress[slug]?.[l] === 'done');

    if (allDone) {
      console.log(`\n[${i + 1}/${remaining.length}] ${slug} — zaten tamamlanmış`);
      completed++;
      continue;
    }

    const ok = await translatePost(slug, progress);
    if (ok) completed++;

    // 3-4 post'ta bir kısa rapor
    if ((i + 1) % 3 === 0 || i === remaining.length - 1) {
      console.log(`\n>>> İlerleme: ${completed}/${remaining.length} post tamamlandı`);
    }

    // Post'lar arası bekleme
    if (i < remaining.length - 1) {
      console.log('  [post arası 3s bekleme]');
      await wait(3000);
    }
  }

  console.log(`\n=== Bitti: ${completed}/${remaining.length} post çevrildi ===`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
