# Neri Shoes — Blog Sistemi Gereksinimleri

## Amaç
Erkek ayakkabı, deri bakımı, stil/kombin konularında SEO odaklı blog içeriği üretmek ve yayınlamak. İçerik üretimi Claude Code üzerinden (claude-blog skill ile) yapılacak, ama **yayınlama admin panelden** olacak — Claude Code'a her yazı için tekrar bağlanmaya gerek kalmayacak.

## Kritik Gereksinim: Backend Entegrasyonu

Blog sadece "Claude Code ile yazı üret" ile sınırlı KALMAMALI. Şunlar zorunlu:

1. **Admin panelden yeni blog yazısı eklenebilmeli** — mevcut ürün ekleme akışına benzer şekilde:
   - Başlık, içerik (rich text veya markdown), kapak görseli, SEO meta alanları
   - Kategori/etiket (örn: "Bakım", "Stil", "Üretim Süreci")
   - Yayın durumu: Taslak / Yayında

2. **Yayınlandığında otomatik olarak siteye çıkmalı** — admin "Yayınla" butonuna bastığında:
   - Veritabanına (Supabase) kaydedilmeli
   - 6 dile (tr/en/de/it/ar/ru) otomatik çevrilmeli (ürünlerde kurduğumuz MyMemory/Google Translate pipeline'ı ile aynı mantık)
   - /blog/[slug] sayfası anında erişilebilir olmalı (revalidate veya dynamic render ile, yeniden deploy gerekmemeli)

3. **claude-blog skill'i SADECE içerik üretim aracı** — yazıyı admin panelin veritabanına (Supabase) yazacak şekilde entegre edilmeli, ayrı bir dosya sistemi (örn. MDX dosyaları repo'da) DEĞİL. Çünkü:
   - Repo'ya commit + deploy gerektiren bir sistem, admin panelden anlık yayın yapmaya engel olur
   - Ürünlerde kurduğumuz Supabase mimarisiyle tutarlı olmalı

## Kurulması Gereken Skiller

1. **AgriciDaniel/claude-blog** — SEO odaklı blog yazım skill'i (araştırma, taslak, SEO optimizasyonu)
2. (Opsiyonel, ileride) **boraoztunc/skills** içindeki copywriting/AI-temizleme skilleri — yazının "yapay zeka kokmaması" için

## Veritabanı Şeması (Supabase)

```sql
create table blog_posts (
  id text primary key,
  slug text unique not null,
  cover_image text,
  category text,
  status text default 'draft', -- 'draft' | 'published'
  content jsonb not null, -- {tr: {title, body, excerpt}, en: {...}, ...}
  meta_title jsonb,
  meta_description jsonb,
  translation_status text default 'pending',
  published_at timestamp with time zone,
  created_at timestamp with time zone default now()
);
```

## Admin Panel Akışı

1. Admin "Blog Yazıları" sekmesine girer (mevcut "Ürün Yönetimi" yapısına paralel)
2. "Yeni Yazı Ekle" formu: Türkçe başlık + içerik + kapak görseli + kategori
3. Kaydet → Supabase'e draft olarak yazılır, 6 dile otomatik çevrilir (arka planda, ürünlerdeki gibi)
4. Admin "Yayınla" butonuna basınca status: 'published' olur, published_at damgalanır
5. Site tarafında /blog ve /blog/[slug] sayfaları published olanları gösterir

## claude-blog Skill'inin Rolü

- Claude Code'a "Neri Shoes için kış ayakkabı bakımı konusunda blog yazısı yaz" dendiğinde:
  - Skill araştırma yapar, SEO uyumlu başlık/içerik üretir
  - Çıktıyı admin panel API'sine (Supabase'e) DOĞRUDAN yazacak bir script ile kaydeder (taslak olarak)
  - Admin daha sonra panelden gözden geçirip yayınlar

## Çok Dilli Destek — SADECE ÇEVİRİ DEĞİL

Blog sistemi 6 dilin (tr/en/de/it/ar/ru) HER BİRİNDE gerçekten çalışmalı. Bu iki seviyede ele alınmalı:

1. **Admin panel ve otomatik çeviri katmanı (zorunlu, ürünlerle aynı mantık):**
   Admin Türkçe yazıyı kaydettiğinde, mevcut translate.ts pipeline'ı (MyMemory/Google Translate, ücretsiz) ile content.tr otomatik olarak content.en/de/it/ar/ru'ya çevrilir. Bu, HER blog yazısı için minimum garanti — admin sadece Türkçe yazsa bile site 6 dilde de okunabilir olur.

2. **claude-blog skill'inin çok dilli SEO desteği (ek katman, isteğe bağlı kullanım):**
   claude-blog skill'i sadece Türkçe içerik üretmekle sınırlı kalmamalı. Skill'in kendi araştırma/SEO yeteneklerini kullanarak, istenirse bir konunun İngilizce, Almanca vb. versiyonunu da AYRI SEO araştırmasıyla (o dildeki arama hacmi, anahtar kelimeler, rakip içerikler) üretebilmesi gerekir — çünkü düz çeviri, o dildeki gerçek SEO anahtar kelimelerini yakalamayabilir.
   - Pratikte: admin panelde "Bu yazı için [dil] SEO'sunu özel olarak optimize et" seçeneği olabilir
   - Bu seçenek kullanılmazsa sistem otomatik çeviriye (madde 1) güvenir — hiçbir dil eksik/boş kalmaz

## Site Genelinde Çok Dilli Tutarlılık

- /blog ve /blog/[slug] sayfaları next-intl [locale] yapısı içinde olmalı (ürün sayfalarıyla aynı routing mantığı)
- Header'daki "Blog" linki TÜM 6 dilde doğru çevrilmiş olmalı (messages/*.json dosyalarına eklenmeli)
- Arapça (RTL) düzeninde blog sayfaları da diğer sayfalar gibi dir="rtl" ile doğru render olmalı
- Blog kategorileri (Bakım, Stil, Üretim Süreci vb.) da 6 dilde çevrilmiş olmalı, sadece içerik değil arayüz etiketleri de

## Yapılmaması Gerekenler

- Blog yazılarını dosya sisteminde (MDX/Markdown dosyaları olarak repo içinde) tutmak — bu, admin panelden bağımsız yayın yapmayı engeller
- Her yazı için Claude Code oturumu açmayı ZORUNLU kılmak — tek seferlik kurulumdan sonra admin panel kendi başına çalışabilmeli
