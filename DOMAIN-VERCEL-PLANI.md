# Neri Shoes — Domain Yönlendirme Planı (cPanel → Vercel)

## DURUM
- Domain: nerishoes.com.tr (zaten satın alınmış, cPanel hosting üzerinde)
- Hosting: Node.js DESTEKLEMİYOR — Next.js siteyi burada çalıştıramayız
- Karar: Hosting'in dosya barındırma kısmını KULLANMAYACAĞIZ. Domain'i Vercel'e yönlendireceğiz.
- E-posta: cPanel'de halihazırda kurulu e-posta hesapları varsa (nerishoescom gibi), bunların DEVAM ETMESİ önemli — domain yönlendirmesi yaparken e-postayı bozmayacak şekilde dikkatli ilerlenecek.

## YAPILACAKLAR (SIRAYLA)

### 1. Vercel Hesabı ve Proje Kurulumu
- Vercel'e (vercel.com) ücretsiz hesap açılır (henüz açılmadıysa)
- Proje GitHub'a bağlanır (eğer proje şu an sadece lokal bilgisayarda ise, önce bir GitHub reposuna push edilmesi gerekir)
- Vercel, bu repoyu otomatik tanıyıp Next.js projesi olarak deploy eder

### 2. Environment Variables (ENV) Aktarımı
Lokal `.env.local` dosyasındaki TÜM değişkenler Vercel'in proje ayarlarına (Environment Variables) tek tek girilir:
- Supabase URL + anon key
- ADMIN_PASSWORD
- WHATSAPP_NUMBER
- IYZICO_API_KEY / IYZICO_SECRET_KEY (sandbox, sonra production)
- Diğer tüm gizli anahtarlar

### 3. Vercel'de İlk Deploy (Geçici Adres ile Test)
- Vercel projeyi `[proje-adı].vercel.app` gibi geçici bir adreste otomatik yayınlar
- Bu geçici adreste site GERÇEKTEN test edilir (ana sayfa, ürünler, admin panel, sepet, ödeme simülasyonu) — domain bağlamadan önce her şeyin çalıştığı doğrulanır

### 4. DNS Ayarlarının Değiştirilmesi (KRİTİK ADIM — DİKKATLİ YAPILACAK)
cPanel'deki domain DNS ayarları, Vercel'in istediği değerlerle değiştirilir:
- Vercel projesine "nerishoes.com.tr" custom domain olarak eklenir
- Vercel, hangi DNS kayıtlarının (A record, CNAME) ayarlanması gerektiğini gösterir
- Bu kayıtlar, domain'in DNS yönetim panelinden (cPanel'in DNS Zone Editor'ünden VEYA domain'in alındığı yerden — domain her zaman cPanel hosting ile aynı firmadan alınmamış olabilir, bu kontrol edilecek) girilir

**E-POSTA KORUMASI:** DNS değişikliği yapılırken MX kayıtları (e-posta yönlendirmesi) DOKUNULMADAN bırakılır — sadece A/CNAME kayıtları (web trafiği) değiştirilir. Bu, mevcut e-posta hesaplarının (varsa) çalışmaya devam etmesini sağlar.

### 5. SSL Sertifikası
Vercel, custom domain bağlanınca otomatik ücretsiz SSL sertifikası sağlar — bu, iyzico'nun istediği "SSL Sertifikası" kriterini de otomatik karşılar.

### 6. DNS Yayılma Süresi
DNS değişiklikleri 1-48 saat içinde dünya çapında yayılır (genelde birkaç saat içinde tamamlanır). Bu süre boyunca site geçici olarak erişilemez/tutarsız görünebilir — bu normaldir, sabırla beklenecek.

### 7. Doğrulama
DNS yayıldıktan sonra:
- nerishoes.com.tr adresi açıldığında Vercel'deki siteyi GERÇEKTEN gösterdiği doğrulanır
- SSL kilidinin (https://) çalıştığı doğrulanır
- Varsa e-posta hesaplarının hâlâ çalıştığı doğrulanır

## HOSTING PAKETİ NE OLACAK?
- cPanel hosting paketi artık web sitesi barındırma için KULLANILMAYACAK
- Eğer hosting paketinde sadece e-posta hizmeti kullanmak isteniyorsa, paket bu amaçla tutulabilir
- Eğer hosting tamamen gereksizse, yenileme döneminde iptal edilebilir (bu kullanıcının kendi kararı, şimdi acele edilmeyecek)

## RİSKLER VE DİKKAT EDİLECEKLER
- DNS değişikliği YANLIŞ yapılırsa site VEYA e-posta geçici olarak erişilemez hale gelebilir — bu yüzden değişiklik öncesi mevcut DNS kayıtlarının bir yedeği (ekran görüntüsü) alınacak
- iyzico başvurusu yaparken kullanılacak domain artık nerishoes.com.tr (Vercel üzerinde) olacak — başvuru bu adresle yapılacak
- Bu işlem GERÇEK domain/DNS değişikliği içerdiği için, Claude Code DNS paneline giriş yapamaz — bu adımları kullanıcının (Selçuk) kendisinin yapması gerekir, Claude Code sadece NET talimatlar verir
