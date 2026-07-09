# NeriShoes - Teknik Proje Dokümanı

Bu doküman, NeriShoes lokal perakende stok ve satış takip uygulamasının mimari, yapısal ve fonksiyonel analizini içerir.

---

## 1. KULLANILAN TEKNOLOJİLER VE DİLLER

NeriShoes, lokal bir Windows bilgisayarda minimum sistem gereksinimiyle ve internet bağlantısına ihtiyaç duymadan çalışacak şekilde tasarlanmıştır.

*   **Ana Programlama Dilleri:**
    *   **JavaScript (Node.js & Tarayıcı JS):** Backend sunucu mantığı, veri işleme, API endpoint'leri ve kullanıcı arayüzü etkileşimlerinin tamamında ES6+ standartlarında JavaScript kullanılmıştır.
    *   **VBScript (.vbs):** Uygulamanın Windows işletim sisteminde arka planda (sessiz modda) çalışmasını sağlamak ve tarayıcıyı "uygulama penceresi" modunda otomatik tetiklemek amacıyla geliştirilmiştir.
    *   **Batch (.bat):** Windows üzerinde tek tıkla kurulum, bağımlılık kontrolü (NPM ve Node.js), sunucu başlatma ve PID üzerinden durdurma işlemleri için Windows komut betikleri kullanılmıştır.
*   **Kütüphaneler ve Framework'ler:**
    *   **Express.js (v4.21.2):** HTTP sunucusu ve REST API altyapısı olarak kullanılmıştır. İstemciye (frontend) statik dosyaların sunulmasını ve veri alışverişini yönetir.
    *   **Multer (v2.1.1):** Ürün kartları oluşturulurken yüklenen ayakkabı görsellerinin sunucuya yüklenmesi (`multipart/form-data`) ve `/public/uploads` dizininde saklanması için ara yazılım (middleware) olarak tercih edilmiştir.
    *   **ESLint (v9.28.0):** Kod kalitesi, standart uyumluluğu ve statik analiz süreçleri için entegre edilmiştir.
*   **Frontend (Arayüz) Altyapısı:**
    *   Uygulamanın kullanıcı arayüzünde herhangi bir JavaScript framework'ü (React, Vue, Angular vb.) veya harici CSS framework'ü (Tailwind, Bootstrap vb.) **kullanılmamıştır**. 
    *   Tasarım, tamamen özelleştirilmiş CSS değişkenleri (CSS variables) ve modern CSS Grid/Flexbox yapıları kullanan **Vanilla CSS** ile kodlanmıştır.
    *   Arayüz kontrolleri ve dinamik veri güncellemeleri saf **Vanilla JavaScript** (DOM manipülasyonu, Fetch API) ile yönetilmektedir.
*   **Veritabanı ve Veri Saklama Çözümü:**
    *   **SQLite3 (v5.1.7):** İlişkisel veritabanı motoru olarak gömülü SQLite tercih edilmiştir. Veriler proje kök dizinindeki `database.sqlite` dosyasında saklanır.
    *   **Performans & Güvenlik Konfigürasyonları:** SQLite'ın veri yazma hızını ve kararlılığını artırmak için WAL (Write-Ahead Logging) günlük modu (`PRAGMA journal_mode = WAL`), senkronizasyon düzeyi (`PRAGMA synchronous = FULL`) ve kilitlenme zaman aşımı (`PRAGMA busy_timeout = 5000`) aktif olarak kullanılmaktadır.

---

## 2. PROJE VE DOSYA YAPISI (ARCHITECTURAL STRUCTURE)

Proje, iş mantığının (services), veri erişiminin (lib/query) ve sunum katmanının (routes/public) birbirinden ayrıldığı modüler bir **MVC/Service** mimarisine sahiptir.

### Dosya Hiyerarşisi

```text
c:\nerishoes\
├── .env                  # Port, Host, Admin PIN ve yedekleme sıklığı parametreleri
├── .env.example          # Şablon çevre değişkenleri dosyası
├── database.sqlite       # Aktif SQLite veritabanı (WAL modunda -wal ve -shm dosyaları oluşabilir)
├── NeriShoes.vbs         # Uygulamayı sessiz modda başlatan ve tarayıcıda açan ana tetikleyici
├── NeriShoes Baslat.bat  # Sunucu konsolu görünür halde başlatma betiği
├── NeriShoesStop.bat     # PID dosyasını okuyarak çalışan sunucuyu sonlandıran betik
├── package.json          # Node.js bağımlılıkları ve çalıştırma scriptleri
│
├── public/               # Frontend (Arayüz) Katmanı
│   ├── index.html        # Tek sayfadan oluşan (SPA) ana dashboard arayüzü
│   ├── app.js            # API istekleri, sayfalama (pagination) ve DOM manipülasyonu yapan frontend kodu
│   ├── styles.css        # Responsive tasarımı sağlayan, renk paletleri tanımlı Vanilla CSS dosyası
│   └── uploads/          # Ürün görsellerinin (ayakkabı fotoğrafları) kaydedildiği klasör
│
├── src/                  # Backend Katmanı
│   ├── server.js         # UYGULAMANIN GİRİŞ NOKTASI (Sunucuyu ayağa kaldırır, PID yazar, yedekleyiciyi kurar)
│   ├── app.js            # Express uygulamasını hazırlar, veritabanını ilklendirir, rotaları bağlar
│   ├── db.js             # SQLite bağlantısını kurar ve migrations işlemlerini başlatır
│   ├── config/
│   │   └── index.js      # Çevre değişkenlerinin doğrulanıp proje genelinde kullanılabilir hale gelmesini sağlar
│   ├── lib/              # Yardımcı Modüller
│   │   ├── dbMigrate.js  # SQLite tablo şemalarını kuran ve eksik kolonları ekleyen migration modülü
│   │   ├── query.js      # SQLite işlemlerini Promise sarmalayıcıları (run, all, get) ile asenkron yöneten kütüphane
│   │   ├── backup.js     # SQLite WAL checkpoint alan, yedekleri diskte kopyalayan ve geri yükleyen modül
│   │   ├── creditHelpers.js# Risk sınıfları, gün hesaplama ve tarih formatlama gibi veresiye yardımcıları
│   │   └── saleAmounts.js# Satış fiyatları, net tutarlar ve indirim hesaplama araçları
│   ├── middleware/
│   │   └── upload.js     # Multer dosya boyutu, format kontrolü ve disk depolama kuralları
│   ├── services/         # İş Mantığı (Business Logic) Katmanı
│   │   ├── productService.js   # Ürün ve stok ekleme/normalleştirme fonksiyonları
│   │   ├── customerService.js  # Müşteri veresiye limiti sorgulama ve engelleme kuralları
│   │   └── collectionService.js# FIFO veresiye dağıtımı, tahsilat ve eski verilerin göç (migration) mantığı
│   └── routes/           # REST API Katmanı
│       ├── index.js      # Tüm alt rotaları Express uygulamasına monte eder
│       ├── products.js   # Ürün oluşturma, güncelleme, silme ve arama endpoint'leri
│       ├── customers.js  # Müşteri kartı yönetimi ve ciro/kar metrikleri
│       ├── sales.js      # Stoklu ve stok dışı (yönetici onaylı) satış işlemleri, iadeye uygun satış listesi
│       ├── collections.js# Veresiye tahsilatı, FIFO önizleme, açık borçlar ve tahsilat geri alma endpoint'leri
│       ├── returns.js    # Kısmi/tam ürün iade ve stok yenileme endpoint'leri
│       ├── reports.js    # Günlük ciro, en çok satanlar ve detaylı stok durum raporları
│       └── backups.js    # Disk üzerindeki veritabanı yedeklerini listeleme ve geri yükleme
│
├── backups/              # Sunucu tarafından otomatik (startup, shutdown, auto) alınan .sqlite kopyaları
├── docs/                 # Sistem dökümanları (BACKUP_OPERATIONS.md vb.)
└── test/                 # Test betikleri (SQLite ve API entegrasyon testleri)
```

### Uygulamanın Giriş Noktası (Entry Point)
Uygulamanın giriş noktası `src/server.js` dosyasıdır. Bu dosya;
1. `src/app.js` üzerinden Express uygulamasını (veritabanı ilklendirmesiyle beraber) ayağa kaldırır.
2. İşletim sistemi sürecine ait PID kodunu `nerishoes.pid` dosyasına yazar (böylece durdurma betiği bu süreci sonlandırabilir).
3. Uygulamanın düzgün kapanması (`SIGINT`, `SIGTERM`) durumlarında otomatik kapanış yedeği alır.
4. `.env` dosyasındaki süreye göre (varsayılan 10 dakikada bir) periyodik arka plan yedekleme (`setInterval`) mekanizmasını tetikler.

---

## 3. FONKSİYONEL ANALİZ VE AKIŞ

NeriShoes, üç ana süreç üzerine kurulmuştur: Stok Takibi, Satış İşlemleri ve Veresiye/Tahsilat Yönetimi.

### A. Stok ve Ürün Kartı Yönetimi
*   **Akıllı Stok Birleştirme:** Yeni bir ürün eklenirken (`POST /api/products`), eğer sistemde aynı `model_name`, `color` ve `size` (numara) kombinasyonuna sahip bir ürün zaten mevcutsa, sıfırdan kayıt açılmaz. Veritabanında mevcut kaydın adedi girilen miktar kadar artırılır (`quantity = quantity + ?`), alış/satış fiyatları güncellenir ve görseli yenilenir.
*   **Multer Görsel Yönetimi:** Ürün kartına yüklenen görseller sunucuda benzersiz bir isimle saklanır. Ürün güncellendiğinde veya silindiğinde, diskte çöp veri kalmaması adına eski görseller dosya sisteminden (`fs.unlink`) silinir.
*   **Stok Analizi:** `src/routes/reports.js` altındaki `/api/reports/stock` endpoint'i; toplam stok adetlerini, stoktaki ürünlerin alış ve satış fiyatları üzerinden tahmini maliyet/ciro değerlerini, tükenen veya kritik seviyeye (5 adedin altına) düşen ürünlerin model, renk ve beden dağılımlarını hesaplar.

### B. Satış İşlemi Akışı
Satışlar iki farklı senaryoda gerçekleşir (`POST /api/sales`):
1.  **Stoklu Satış:** Seçilen ürünün stok miktarı kontrol edilir. Stok yeterliyse, satış kaydı oluşturulur ve `products` tablosundaki ilgili ürünün stoğu satılan miktar kadar düşürülür.
2.  **Stok Dışı Satış (Manuel Giriş):** Eğer satılan ürün stokta tanımlı değilse, arayüzden "Stok Dışı Satış" seçilir. Bu işlem sunucu tarafında tanımlı olan `ADMIN_PIN` doğrulamasını (yönetici onayı) gerektirir. Stok dışı satışlar veritabanında `manual_report_sales` tablosuna yazılır ve stok düşümü yapılmadan doğrudan günlük ciro ve satış raporlarına yansıtılır.
*   **Satışın Geri Alınması (Reversing):** Satış kaydında hata yapıldığında, `PATCH /api/sales/:id/reverse` rotasıyla satış iptal edilebilir. Bu işlem satılan miktarı stoka iade eder ve satışı aktif durumdan pasif duruma (`is_reversed = 1`) çeker.

### C. Veresiye ve FIFO Tahsilat Algoritması
Uygulamanın en kritik iş kuralları veresiye altyapısindedir (`src/services/collectionService.js`):
*   **Limit Kontrolü:** Ödeme yöntemi "veresiye" seçildiğinde gerçek bir müşteri seçilmesi zorunludur. Seçilen müşterinin açık veresiye borçları toplamı ile yeni satış bedeli, müşteriye tanımlanan `credit_limit` değerini aşamaz.
*   **Müşteriye Ulaşılamıyor Blokajı:** Eğer bir veresiye satışı için müşteri aramalara yanıt vermiyorsa, ilgili satış satırı tahsilat ekranından "Müşteriye Ulaşılamıyor" olarak işaretlenebilir (`sale_unreachable = 1`). Bu durumda müşteri engellenir ve açık borcu tahsil edilene kadar sistem o müşteriye yeni bir satış yapılmasına kesinlikle izin vermez (`assertCustomerAllowedForNewSale`).
*   **FIFO (İlk Giren İlk Çıkar) Dağıtımı:** Müşteri veresiye borcuna karşılık toplu ödeme yaptığında, ödenen miktar müşterinin açık (ödenmemiş) veresiye satışlarına kronolojik sırayla (en eski satıştan en yeniye doğru) dağıtılır.
    *   *Örnek:* Müşterinin sırasıyla 1000 TL, 500 TL ve 1200 TL'lik üç açık satışı olsun. Müşteri 1700 TL ödeme yaptığında; FIFO algoritması 1000 TL'lik ilk satışı tamamen kapatır (`amount_paid = 1000`, `is_paid = 1`), 500 TL'lik ikinci satışı tamamen kapatır (`amount_paid = 500`, `is_paid = 1`), kalan 200 TL'yi ise 1200 TL'lik son satışa kısmi ödeme olarak kaydeder (`amount_paid = 200`, `is_paid = 0`). Bu ilişkiler `payment_allocations` tablosunda tutulur.
*   **Tahsilat İptali (Geri Alma):** Yanlış girilen bir tahsilat kaydı silindiğinde (`DELETE /api/collections/:id`), ilgili tahsilatın kapatmış olduğu tüm satışların `amount_paid` değerleri düşürülür ve satışlar tekrar açık (ödenmemiş) statüsüne çekilir.

### D. Yedekleme ve Geri Yükleme Mantığı
*   Yedekleme sırasında veritabanı kilitlenmelerini ve WAL günlük dosyasındaki tutarsızlıkları önlemek adına önce `PRAGMA wal_checkpoint(FULL)` komutu çalıştırılarak tüm önbellekteki veriler diske (`database.sqlite`) yazılır. Ardından kopyalama işlemi güvenli bir şekilde yapılır.
*   Yedekten geri yükleme esnasında (`restoreFromBackupFile`), veri bütünlüğünün bozulmaması için foreign key kontrolleri geçici olarak kapatılır (`PRAGMA foreign_keys = OFF`), tüm tablolar silinir ve yedek dosyası `ATTACH DATABASE` komutu ile geçici olarak bağlanarak veriler topluca kopyalanır.

---

## 4. AI İÇİN KISA BAĞLAM (CONTEXT) ÖZETİ

NeriShoes, Windows ortamında internet bağlantısı olmadan çalışabilen, Node.js/Express.js backend ve gömülü SQLite veritabanı kullanan, arayüzü saf HTML, Vanilla JavaScript ve Vanilla CSS ile geliştirilmiş lokal bir perakende ayakkabı satış ve stok takip paneli uygulamasıdır. Proje, aynı model-renk-numara ürünlerin stoklarını otomatik birleştirebilen ürün/stok modülüne, yönetici PIN onaylı stok dışı satış yapabilen satış modülüne ve müşteri kredi limitlerini denetleyip tahsilatları en eski borçtan başlayarak kronolojik olarak kapatan gelişmiş bir FIFO (First-In, First-Out) veresiye ve tahsilat yönetim sistemine sahiptir.

---
*Bu rapor projenin mevcut kod tabanı analiz edilerek, kod yapısında herhangi bir değişiklik yapılmadan hazırlanmıştır.*
