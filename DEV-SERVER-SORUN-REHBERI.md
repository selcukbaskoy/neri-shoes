# Neri Shoes — Dev Server Açılmama Sorunu: Kalıcı Teşhis Rehberi

Bu proje boyunca, kod değişikliği sonrası dev server'ın açılmaması/site'nin "ulaşılamıyor" demesi tekrar tekrar yaşandı (en az 6 kez). Bu dosya, KÖK NEDENİ bulmak ve kalıcı olarak çözmek için izlenecek adımları tanımlar. Her yeni "site açılmıyor" durumunda Claude Code ÖNCE bu dosyayı okumalı.

---

## GEÇMİŞTE GÖRÜLEN SEMPTOMLAR

1. `Cannot find module './vendor-chunks/@formatjs.js'` hatası
2. `ChunkLoadError: Loading chunk app/[locale]/... failed`
3. `Background command failed with exit code 255`
4. Tarayıcıda "Bu siteye ulaşılamıyor" / "ERR_CONNECTION_REFUSED"
5. Birden fazla `node.exe` process'inin aynı anda farklı portlarda (3000, 3001, 3002...) çalışması

## GEÇİCİ ÇÖZÜM (HER ZAMAN İŞE YARAR AMA KÖK NEDENİ ÇÖZMEZ)

```bash
taskkill /F /IM node.exe
rm -rf .next
npm run build
npm run dev
```

Bu HER ZAMAN sorunu o anlık çözer. Ama neden tekrar tekrar oluyor, bunu anlamadan ilerlemek zaman kaybettiriyor.

---

## KÖK NEDEN ARAŞTIRMASI — BUNLAR KONTROL EDİLMELİ

Claude Code, bu hata tekrar oluştuğunda, geçici çözümü uygulamadan ÖNCE şu araştırmayı yapmalı:

### 1. Arka Plan İşlem Sızıntısı (En Olası Neden)
Bu projede sık sık `Background command` kullanıldı (script çalıştırma, dev server başlatma). Bu komutlar düzgün sonlanmadan yeni bir komut başlatılırsa, birden fazla node process'i aynı `.next` klasörüne yazmaya çalışır → cache bozulur.

**Kontrol:**
```bash
tasklist | findstr node
```
Birden fazla node.exe process'i varsa, bu kesin kanıttır.

**Kalıcı önlem:** Yeni bir `npm run dev` veya `npm run build` başlatmadan ÖNCE, HER ZAMAN önce mevcut process'leri kontrol et ve kapat. Bunu otomatik bir alışkanlık haline getir, hata çıkmasını bekleme.

### 2. Windows'a Özgü Webpack Cache Race Condition
`.next/cache/webpack/` klasöründe `ENOENT: rename ... 0.pack.gz_` gibi hatalar daha önce görüldü. Bu, Windows dosya sisteminin webpack'in cache yazma işlemiyle çakışmasından kaynaklanan bilinen bir sorun.

**Kalıcı önlem:** `next.config.mjs` içine dev modunda webpack cache'i devre dışı bırakan bir ayar eklenebilir:
```js
webpack: (config, { dev }) => {
  if (dev) {
    config.cache = false;
  }
  return config;
}
```
Bu, dev server'ı biraz yavaşlatır ama cache bozulmasını köküne kadar önler.

### 3. Çok Sayıda Dosya Değişikliğinin Aynı Anda Yapılması
Bu hata genelde BÜYÜK bir değişiklik turundan (çoklu dosya update, yeni component yazma) sonra çıkıyor — hot module reload (HMR) çok fazla değişikliği aynı anda işlemeye çalışınca chunk ID'leri tutarsızlaşıyor olabilir.

**Kalıcı önlem:** Çok sayıda dosya değiştirildiğinde (3+ component), değişiklik turu bittiğinde dev server'ı YENİDEN BAŞLATMAYI rutin hale getir — hata çıkmasını beklemeden, önlem olarak.

---

## YENİ KALICI İŞ AKIŞI (HER KOD DEĞİŞİKLİĞİ TURU SONRASI UYGULANACAK)

Claude Code, bundan sonra her "birden fazla dosya değiştirdim" durumunun ardından, otomatik olarak şu sırayı uygulamalı — hata çıkmasını beklemeden:

```bash
# 1. Önce mevcut process'leri kontrol et
tasklist | findstr node

# 2. Varsa kapat
taskkill /F /IM node.exe

# 3. Cache'i temizle (önlem olarak, hata yoksa bile)
rm -rf .next

# 4. Temiz build
npm run build

# 5. Build başarılıysa tek bir dev server başlat
npm run dev
```

Bu 5 adım, "hata çıktıktan sonra düzelt" yerine "hata çıkmadan önle" mantığına geçirir.

---

## ARKA PLAN KOMUTLARI İÇİN KURAL

Claude Code, `Background command` kullandığında:
- Bir arka plan komutu başlattıktan sonra, işi bitmeden YENİ bir arka plan komutu (özellikle dev server veya build) başlatmamalı
- Her arka plan komutunun gerçekten tamamlandığını (exit code 0) doğrulamadan üzerine yeni komut eklememeli
- Şüpheli durumda (exit code 255 gibi belirsiz hatalar), hemen `tasklist | findstr node` ile gerçek durumu kontrol etmeli, tahmin etmemeli

---

## YENİ UI METNİ EKLERKEN ÇEVİRİ KURALI (TEKRARLANAN HATA DESENİ)

Bu projede TEKRAR TEKRAR yaşanan bir hata deseni var: yeni bir özellik eklenirken (numara seçici, stok mesajı, döviz notu, vb.) UI metni HARDCODE TÜRKÇE yazılıyor ve messages/*.json dosyalarına eklenmesi unutuluyor. Sonuç: Arapça/İngilizce/Almanca gibi dillerde sayfanın geri kalanı çevrilmişken, o tek metin Türkçe kalıyor (örnek: "NUMARA SEÇ" başlığı Arapça sayfada Türkçe görünmüştü).

### KESİN KURAL — HER YENİ UI METNİ İÇİN ZORUNLU ADIMLAR

Claude Code, ne zaman yeni bir kullanıcı arayüzü metni (başlık, buton, etiket, mesaj, placeholder) eklerse, AŞAĞIDAKİ 3 ADIMI TEK BİR İŞLEM OLARAK görmeli — biri yapılıp diğeri unutulamaz:

1. **Hardcode Türkçe metin YAZMA.** Her zaman `useTranslations()` hook'u ile bir çeviri key'i kullan (örn. `t('sizeSelector.title')`), asla `<h3>Numara Seç</h3>` gibi sabit metin yazma.

2. **AYNI İŞLEM İÇİNDE, messages/tr.json, en.json, de.json, it.json, ar.json, ru.json dosyalarının HEPSİNE o key'i ekle.** Sadece tr.json'a ekleyip "sonra diğerlerini de eklerim" deme — hepsini AYNI ANDA ekle, ayrı bir adım olarak bırakma.

3. **Ekledikten sonra, GERÇEKTEN her dilde test et** — en az 2 dilde (biri LTR örn. EN, biri RTL örn. AR) sayfayı açıp o metnin GERÇEKTEN çevrilmiş göründüğünü kanıtla. "Eklediğim için çalışır" diye varsayma.

### NEDEN BU HATA TEKRARLANIYOR

Geriye dönük olarak bakıldığında bu hatanın çıktığı durumlar hep aynı desende: bir özellik HIZLICA, "önce çalışsın sonra detayları hallederiz" mantığıyla eklendiğinde, çeviri adımı "detay" olarak görülüp atlanıyor. Bu yanlış bir önceliklendirme — bu projede çok dillilik bir "detay" değil, temel bir gereksinim. Yeni bir UI metni, çevirisi olmadan TAMAMLANMIŞ sayılmaz.

### SELF-CHECK — HER YENİ ÖZELLİK SONRASI SOR

Bir özellik eklendikten sonra, build/test öncesi şu soruyu sor ve cevapla:
"Bu özellikte kullanıcının göreceği YENİ bir metin var mı? Varsa, bu metin 6 dil dosyasının HEPSİNDE mevcut mu? Bunu gerçekten kontrol ettim mi (varsayım değil)?"

Cevap belirsizse, şu komutu çalıştır ve TÜM dillerde aynı key sayısının olduğunu doğrula:
```bash
node -e "
const tr = require('./messages/tr.json');
const en = require('./messages/en.json');
const de = require('./messages/de.json');
const it = require('./messages/it.json');
const ar = require('./messages/ar.json');
const ru = require('./messages/ru.json');
function countKeys(obj, prefix = '') {
  let count = 0;
  for (const k in obj) {
    if (typeof obj[k] === 'object') count += countKeys(obj[k], prefix + k + '.');
    else count++;
  }
  return count;
}
console.log('tr:', countKeys(tr), 'en:', countKeys(en), 'de:', countKeys(de), 'it:', countKeys(it), 'ar:', countKeys(ar), 'ru:', countKeys(ru));
"
```
Sayılar birbirinden farklıysa, hangi dilde eksik key olduğunu bulup tamamla.

---

## OTOMATİK MULTI-AGENT ORKESTRASYON — KALICI ÇALIŞMA KURALI

Bu projede ~/.claude/agents/ dizininde 78 özelleşmiş agent kurulu (design: 9, engineering: 32, marketing: 25, testing: 8 — bölümler: UI Designer, Frontend Developer, Backend Architect, Code Reviewer, SEO Specialist, Reality Checker, Evidence Collector, vb.). Bundan sonra HER karmaşık/önemli görev için, kullanıcı tek tek hangi agent'ı çağıracağını belirtmek ZORUNDA değil — Claude Code kendisi şu süreci OTOMATİK olarak işletecek.

### SÜREÇ

1. **Görevi al, hangi agent'ların ilgili olduğuna kendin karar ver.** Kullanıcı "/agent:frontend-developer" gibi bir komut yazmasa bile, görevin doğasına göre (frontend mi, backend mi, SEO mu, test mi, tasarım mı) ilgili 2-5 agent'ı kendin seç.

2. **Seçilen agent'ları gerçekten "çalıştır"** — yani onların perspektifinden gerçek değerlendirme/öneri/itiraz üret (sanal ekip tartışma formatındaki gibi: her agent kendi görüşünü sunar, birbirine itiraz eder veya destekler, çatışan görüşler açıkça gösterilir).

3. **Otomatik karar ver.** Tartışma sonunda, hangi yaklaşımın en doğru olduğuna SEN karar ver. Kullanıcıdan onay İSTEME.

4. **Hemen uygula.** Karar verildikten sonra, kodlama/değişiklik/test sürecine DURMADAN geç.

5. **Gerçekten test et.** Bu dosyadaki standart iş akışını (node process kontrolü, cache temizliği, build+dev test) ve varsa Playwright/Chrome MCP ile gerçek tarayıcı testini uygula — "yaptım, çalışır" deme, kanıtla.

6. **Sonunda kısa bir özet sun.** Hangi agent'ları kullandın, tartışmanın özeti neydi, hangi karara ulaşıldı, ne uygulandı, test sonucu ne oldu — bunu kullanıcıya bildir. Bu bir onay talebi DEĞİL, bilgilendirmedir.

### NE ZAMAN BU SÜRECİ KULLAN

- Yeni bir özellik isteği geldiğinde (örn. "X özelliğini ekle")
- Bir tasarım/mimari karar gerektiğinde (örn. "bu nasıl olmalı")
- Bir sorunun kök nedenini bulup düzeltme gerektiğinde
- Kullanıcı "ekip kursun", "tartışsınlar", "agent'lar kullan" gibi bir ifadeyle açıkça bu süreci tetiklediğinde

### NE ZAMAN BU SÜRECİ KULLANMA

- Çok basit, tek adımlı işlemler (bir dosya okuma, bir komut çalıştırma, küçük bir typo düzeltme) için gereksiz — agent orkestrasyonu sadece KARMAŞIKLIK veya KARAR GEREKTİREN durumlarda devreye girer
- Kullanıcı zaten çok spesifik, tek bir teknik talimat verdiyse (örn. "şu satırı şöyle değiştir") agent tartışmasına gerek yok, direkt uygula

### KULLANICIDAN ONAY GEREKMEYEN DURUM

Bu sürecin ÇEKİRDEK noktası: kullanıcı tek bir istek yazar, gerisi (agent seçimi, tartışma, karar, uygulama, test) OTOMATİK ilerler. Kullanıcı "/agent:x kullan" yazmak ZORUNDA değil. Ara onay istenmez — "ARA ONAY İSTENMEYECEK" prensibi burada da geçerlidir (bkz. BLOG-ICERIK-PLANI.md'deki aynı prensip).

---

---

## OTOMATİK GIT COMMIT/PUSH — KALICI ÇALIŞMA KURALI

Bu proje GitHub'a bağlı (github.com/selcukbaskoy/neri-shoes, main branch). Bundan sonra Claude Code, her anlamlı değişiklik tamamlandığında (bir özellik bitince, bir bug düzeltilince, bir aşama tamamlanınca) OTOMATİK olarak commit + push yapacak — kullanıcıdan "şimdi push et" komutu beklemeden.

### KURALLAR

1. **Ne zaman commit/push yapılır:** Bir görev/değişiklik turu BAŞARIYLA tamamlandığında (build hatasız, testler geçtiğinde). Yarım kalmış, test edilmemiş bir değişiklik COMMIT EDİLMEZ.

2. **Commit mesajı:** Açıklayıcı, Türkçe veya İngilizce (tutarlı olsun), ne değiştiğini net anlatan bir mesaj (örn. "Sepet sistemine stok limiti kontrolü eklendi" — "fix" veya "update" gibi anlamsız mesajlar KULLANILMAZ).

3. **Otomatik push:** Commit sonrası hemen `git push` yapılır — kullanıcıdan onay istenmez (bu, DEV-SERVER-SORUN-REHBERI.md'deki "ARA ONAY İSTENMEYECEK" prensibiyle tutarlıdır).

4. **.gitignore kontrolü:** Her commit öncesi, yanlışlıkla büyük/gereksiz/hassas dosyaların (örn. .env.local, node_modules, .next, büyük binary dosyalar) eklenmediğinden emin olunur. `git status` ile commit'e girecek dosyalar kontrol edilir.

5. **Push başarısız olursa:** (örn. ağ sorunu, conflict) kullanıcıya net olarak bildirilir, otomatik olarak tekrar denenir veya sebep açıklanır — sessizce başarısız olunmaz.

6. **Bu kural, projenin Vercel'e bağlanmasından SONRA da geçerli olacak** — yani her push, otomatik olarak Vercel'de de yeni bir deploy tetikleyecek (Vercel'in GitHub entegrasyonu sayesinde). Bu, kullanıcının "şimdi versiyona koymak istemiyorum" dediği bir aşamada DİKKAT edilmesi gereken bir durumdur — eğer kullanıcı "şu an deploy etmek istemiyorum ama GitHub'a göndermek istiyorum" derse, Vercel'de bu push için otomatik deploy'u durdurma/preview branch kullanma seçeneği değerlendirilebilir (bu, ileride Vercel bağlandığında ayrıca ele alınacak bir detaydır).


Eğer yukarıdaki önlemler uygulandıktan sonra hata YİNE de çıkarsa, bu dosyaya yeni bir "Tespit Edilen Ek Neden" bölümü eklenmeli — böylece bilgi birikimi kaybolmaz, her seferinde sıfırdan araştırma yapılmaz.

---

## TESPİT EDİLEN EK NEDEN — 3. TEKRAR (2026-06-30): HER npm install SONRASI VENDOR-CHUNK BOZULMASI

### Desen
Hata üçüncü kez, her seferinde FARKLI bir paket adıyla çıktı:
1. `vendor-chunks/@formatjs.js` (next-intl kurulunca)
2. `vendor-chunks/@opentelemetry.js` (devDependency eklenince)  
3. `vendor-chunks/@supabase.js` (supabase-js kurulunca)

Bu bir tesadüf değil — her yeni `npm install` sonrası sistemli olarak tekrarlıyor.

### Kök Neden
`dev:fast` scripti `.next`'i temizlemiyordu. Birisi `npm install <paket>` yapıp ardından `npm run dev:fast` başlatınca:
- Yeni paketin vendor chunk'ı oluşturulmadan manifest'e ekleniyor (webpack'in incremental rebuild'ı yarım kalıyor)
- Eski `.next/server/vendor-chunks/` referansları stale kalıyor
- `Cannot find module './vendor-chunks/@X.js'` hatası çıkıyor

Ek olarak: `next.config.mjs`'deki `cache = false` sadece webpack'in disk cache'ini devre dışı bırakıyordu, ama `snapshot.managedPaths` ayarı yoktu — bu da webpack'in node_modules'ü "managed path" olarak görüp incremental update yapmaya çalışmasına (ve başarısız olmasına) yol açıyordu.

### Uygulanan Kalıcı Çözüm (2026-06-30)

**1. `postinstall` scripti eklendi (package.json):**
```json
"postinstall": "node -e \"require('fs').rmSync('.next',{recursive:true,force:true})\""
```
Her `npm install` (yeni paket ekleme dahil) sonrası `.next` OTOMATIK olarak silinir. Sonraki `npm run dev` temiz başlar.

**2. `dev:fast` scripti kaldırıldı (package.json):**
Bu script `.next` temizlemeden dev server başlatıyordu — stale cache sorunlarının asıl tetikleyicisiydi. Artık tek güvenli yol `npm run dev`.

**3. `snapshot.managedPaths = []` eklendi (next.config.mjs):**
```js
config.snapshot = {
  ...config.snapshot,
  managedPaths: [],
};
```
Webpack'in node_modules değişikliklerini incremental olarak işlemeye çalışmasını önler — her dev start'ta node_modules tam olarak taranır, yarım vendor chunk oluşturulmaz.

### Doğrulama
- Build (`npm run build`) hatasız tamamlandı (355 sayfa)
- `postinstall` hook: bir sonraki `npm install` otomatik olarak `.next`'i temizleyecek

---

## KOD KEŞFİ KURALI — codebase-memory-mcp

codebase-memory-mcp global olarak kurulu ve aktif. Yapısal kod soruları için (kim çağırıyor, nerede kullanılıyor, mimari nasıl) grep/Explore yerine ÖNCELİKLE graph tool'larını kullan:
- `search_graph` — fonksiyon/class/route bul
- `trace_path` — çağrı zinciri izle
- `get_code_snippet` — tam kaynak konumunu al
- `get_architecture` — proje yapısına bak

Yeni bir proje açıldığında: önce `index_repository` çalıştır (bir kerelik), sonrası otomatik.

