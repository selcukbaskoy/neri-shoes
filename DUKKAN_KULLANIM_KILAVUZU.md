# Dükkan Paneli Kullanım Kılavuzu

Bu kılavuz, mağazadaki satış ekibi için hazırlanmıştır. Teknik bilgi gerektirmez.

## 1. Panele Giriş

1. Tarayıcıdan `nerishoes.com.tr/admin` adresine girin.
2. Yönetici şifresini yazıp giriş yapın.
3. Giriş sonrası "Dükkan" bağlantısına tıklayın (veya doğrudan `nerishoes.com.tr/admin/dukkan`).
4. Panelde 4 sekme göreceksiniz: **Hızlı Satış**, **Stok**, **Veresiye**, **Gün Sonu**.

Şifreyi kimseyle paylaşmayın. Şüpheli bir durumda hemen yöneticiye haber verin.

## 2. Hızlı Satış — Nakit / Kart (POS) Satışı

1. "Hızlı Satış" sekmesinde üstteki kutuya barkodu okutun veya ürün adını yazın.
2. Çıkan sonuçlardan doğru bedeni seçip sepete ekleyin.
3. Sağ taraftan ödeme tipini seçin: **Nakit** veya **POS**.
4. Gerekirse indirim tutarını ve not alanını doldurun.
5. Toplamı kontrol edin, **"Satışı Tamamla"** butonuna basın.
6. Buton "Kaydediliyor..." yazısına döner — tekrar tıklamayın, işlem bitene kadar bekleyin.
7. Satış tamamlanınca sepet otomatik boşalır, stok anında güncellenir.

## 3. Hızlı Satış — Veresiye (Borca Yazma)

1. Sepeti aynı şekilde doldurun.
2. Ödeme tipi olarak **Veresiye** seçin.
3. Açılan listeden müşteriyi seçin (isim veya telefon ile arayabilirsiniz).
4. **Önemli:** Sistem şu an müşterinin borç limitini veya "engelli" (bloklu) durumunu otomatik olarak durdurmuyor — sadece ekranda uyarı/renk olarak gösteriyor. Limiti aşan veya bloklu bir müşteriye veresiye satış yapmadan önce mutlaka listede görünen bakiye ve durum bilgisini elle kontrol edin.
5. İsterseniz "sözü verilen ödeme tarihi" girebilirsiniz.
6. Satışı tamamlayın.

## 4. Stok Sekmesi

- Ürün adı veya barkod ile arama yapabilirsiniz.
- Her ürün için beden × adet tablosu (matris) görünür.
- Bu sayı, hem online mağazadaki hem dükkandaki stoktur — **tek ortak havuzdur**. Dükkanda satılan bir çift, online mağazada da anında düşer (ve tam tersi).
- Sekmeyi her açtığınızda güncel veriyi çeker, sayfayı yenilemenize gerek yoktur.

## 5. Veresiye Sekmesi ve Tahsilat

- Bu sekmede borçlu müşteri listesi, bakiyeleri ve vade bilgileri görünür.
- Vadesi geçmiş müşteriler kırmızı renkte ve "(gecikmiş)" etiketiyle gösterilir.
- Bir müşteriden tahsilat almak için:
  1. Müşterinin yanındaki tahsilat butonuna tıklayın.
  2. Alınan tutarı girin (nakit veya POS).
  3. Kaydedin.
- **Tahsilat mantığı (FIFO):** Girdiğiniz tutar, müşterinin **en eski** borcundan başlayarak otomatik olarak sırayla kapatılır. En yeni borca dokunulmaz, önce en eski satış kapanır.
- **Dikkat:** Müşterinin güncel borcundan **fazla tutar girerseniz**, sistem bunu reddetmez — fazlalık hiçbir satışa uygulanmadan sadece "tahsil edilen toplam" olarak kaydedilir ve şu an bu fazlalığı otomatik olarak müşteri alacağına çevirip sonraki alışverişte düşen bir mekanizma yoktur. Bu yüzden tahsilat tutarını girmeden önce ekrandaki güncel borç rakamını mutlaka kontrol edin, borçtan fazla tutar girmeyin.
- Kredi limiti şu an sadece bilgi amaçlı gösterilir, sistem otomatik durdurmaz — yeni veresiye satışı öncesi limiti elle kontrol edin.

## 6. Gün Sonu Sekmesi

- Seçtiğiniz tarihe ait günlük özet: nakit, POS, veresiye satışları, online satışlar ve o gün tahsil edilen veresiye ödemeleri ayrı ayrı listelenir.
- "Toplam Ciro" rakamı, o gün yapılan satışların toplamıdır (veresiye tahsilatları bu rakama dahil edilmez, ayrı satırda gösterilir).
- Gün, İstanbul saatine göre 00:00–24:00 aralığını kapsar.
- Kasayı sayarken bu ekrandaki nakit/POS rakamlarını referans alın.

## 7. Yanlış Satışı Geri Alma (İptal / İade)

- Hızlı Satış geçmişinde yanlış girilen bir satışı bulup **"Geri Al"** (iptal) butonuna basabilirsiniz.
- Bu işlem satılan ürünün stoğunu geri ekler, satışı "iptal edildi" olarak işaretler.
- **Satış kaydı silinmez**, sadece iptal damgası vurulur — bu sayede geçmişte ne olduğu her zaman görülebilir (denetim izi).
- Veresiye tahsilatları için şu an bir "geri alma" butonu yoktur. Yanlışlıkla tahsilat girilirse yöneticiye bildirin, elle düzeltme gerekir.

## 8. Sık Karşılaşılan Sorunlar

| Durum | Ne yapmalı |
|---|---|
| "Stok yetersiz" hatası | Ürün az önce başka biri tarafından satılmış olabilir (aynı anda iki kişi aynı ürünü satmaya çalışırsa sistem sadece birine izin verir). Stok sekmesinden güncel adedi kontrol edin. |
| Sayfa donuyor / yavaş | Sayfayı yenileyin (F5). Sepet sıfırlanır ama satış geçmişi etkilenmez. |
| Barkod okutulunca arama kutusuna düşmüyor | Sayfayı açtığınızda imleç otomatik arama kutusundadır; başka bir alana tıkladıysanız arama kutusuna tekrar tıklayıp tekrar okutun. |
| Müşteri listede görünmüyor | İsim veya telefonla arayın; müşteri hiç kayıtlı değilse yöneticiden yeni müşteri eklemesini isteyin. |

## 9. Kesinlikle Yapılmaması Gerekenler

- Şifreyi başkasıyla paylaşmayın, ekranı kilitlemeden masadan ayrılmayın.
- Aynı satışı art arda birden fazla kez "Satışı Tamamla" ile göndermeyin — buton "Kaydediliyor..." durumundayken bekleyin.
- Kredi limitini aşan veya bloklu görünen müşteriye ekrandaki uyarıyı görmezden gelip veresiye satış yapmayın.
- Müşterinin borcundan fazla tahsilat tutarı girmeyin (yukarıda 5. maddede açıklanan sebepten).
- Panel dışından (başka bir program, link vb.) satış/iptal/tahsilat işlemi yaptırmaya çalışmayın.

## Destek

Panelle ilgili teknik bir sorun, beklenmeyen hata veya "bu doğru görünmüyor" dediğiniz bir durumda satışı durdurup yöneticiyle iletişime geçin. Ekran görüntüsü almak sorunun çözümünü hızlandırır.
