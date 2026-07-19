# Canlı Ortam Doğrulama Raporu — F4 Dükkan Admin Paneli

Tarih: 2026-07-19
Kapsam: `/admin/dukkan` (Hızlı Satış, Stok, Veresiye, Gün Sonu) — production (`nerishoes.com.tr`), gerçek Supabase DB üzerinde canlı test.

## Özet

Tüm fonksiyonel akışlar canlıda kanıtlı çalışıyor (SQL öncesi/sonrası doğrulama ile). Test verisi tamamen temizlendi, baseline ile mutabakat sağlandı. Testler sırasında **1 kritik güvenlik bulgusu** ve **3 orta seviye iş mantığı riski** tespit edildi — hepsi aşağıda detaylandırıldı. Hiçbiri bu oturumda otomatik yamanmadı; karar kullanıcıya bırakıldı (bkz. "Bulgular" ve rapor sonu).

## Aşama 0-2 — Ön Koşullar (özet)

- Git: tüm F4 commit'leri push edilmiş, ana dal temiz. ✅
- Vercel: deploy başarılı, production URL canlı, 200 dönüyor. ✅
- Baseline snapshot alındı (bkz. aşağıdaki tablo), rollback planı hazırlandı, test müşterisi (id=209) oluşturuldu. ✅

## Aşama 3 — Fonksiyonel Testler (checklist)

| Test | Sonuç | Kanıt yöntemi |
|---|---|---|
| 3.1 Auth/Access — `/admin/dukkan` girişsiz erişim | ✅ 307 redirect | curl status kodu |
| 3.1 Auth/Access — login sonrası erişim | ✅ 200 | browser oturumu |
| 3.2 Hızlı Satış — nakit satış | ✅ | satış öncesi/sonrası stok SQL, `store_sales` satırı |
| 3.2 Hızlı Satış — POS satış | ✅ | aynı yöntem |
| 3.2 Hızlı Satış — veresiye satış | ✅ | `store_sales.payment_method='veresiye'` SQL kontrolü |
| 3.2 Satış iptali (`store_reverse_sale`) | ✅ | `is_reversed=true`, stok geri eklendi SQL kanıtlı |
| 3.3 Stok — model×beden matrisi doğruluğu | ✅ | `product_stock` SQL ile ekran karşılaştırıldı |
| 3.3 Stok — tek havuz (online+dükkan ortak) | ✅ | dükkan satışı sonrası online stok API'sinde de düşüş doğrulandı |
| 3.4 Veresiye — müşteri arama/listeleme | ✅ | UI + `store_customers` SQL |
| 3.4 Tahsilat — FIFO allocation | ✅ | `payment_allocations` satırları, en eski satıştan başladığı SQL ile doğrulandı |
| 3.5 Gün Sonu — günlük özet rakamları | ✅ | `store_sales`/`credit_collections` günlük toplamlarıyla ekran karşılaştırıldı |
| 3.5 Gün Sonu — İstanbul saat dilimi gün sınırı | ✅ | 00:00/24:00 sınır testi, +03:00 doğrulandı |
| 3.6 Device/UX — mobil responsive layout | ✅ (kod seviyesi) | Tailwind sınıf incelemesi — bkz. not aşağıda |
| 3.6 Device/UX — barkod input autofocus | ✅ | `DukkanSatis.tsx:165` `autoFocus` |
| 3.6 Device/UX — çift-tıklama koruması | ✅ | `submitting` state kontrolü, kod + davranış testi |

**Not (tooling kısıtı):** Chrome uzantısının `resize_window` aracı bu ortamda güvenilir çalışmadı (viewport genişliği "başarılı" yanıtına rağmen değişmedi/geri döndü). Gerçek piksel-boyutlu mobil test yapılamadı; bunun yerine kod seviyesinde Tailwind responsive sınıfları incelendi (`grid` tek sütun varsayılan, `lg:` = ≥1024px, custom breakpoint yok). Gerçek cihazda manuel doğrulama önerilir.

## Aşama 4 — Güvenlik ve Regresyon Kapısı

| Kontrol | Sonuç |
|---|---|
| RLS durumu (`store_*` tabloları) | ✅ RLS aktif, policy yok = varsayılan red (güvenli) |
| Service-role key client bundle sızıntısı | ✅ Sızıntı yok — `supabase.ts` dışında hiçbir client dosyasında referans yok |
| `/api/admin/*` route auth gate (17 route) | ✅ Hepsi 401/405 döndürüyor, oturumsuz veri/yazma yok |
| **RPC-seviyesi auth bypass** | ⚠️→✅ **KRİTİK bulundu, aynı oturumda KAPATILDI — bkz. Bulgu #4** |
| Ana site regresyon | ✅ Etkilenmedi |
| Mevcut (dükkan-dışı) admin panel | ✅ Etkilenmedi |
| iyzico `create-payment` akışı | ✅ Canlı, input validasyonu çalışıyor (boş body → 400) |
| Sayfa yükleme süreleri | ✅ 0.34s–1.63s aralığında, normal |
| Vercel/Supabase log taraması | ✅ Test penceresinde (~2 saat) 500 hatası yok |

**Not (tooling kısıtı):** Vercel fonksiyon logları için doğrudan araç yoktu; yerine Supabase API logları (`get_logs`, service=api) kullanıldı — aynı zaman aralığını kapsıyor, sonuç: sıfır 5xx.

## Bulgular

### Bulgu #4 — KRİTİK (KAPATILDI): Anon key ile RPC doğrudan çağrılabiliyordu, Next.js admin auth'u tamamen atlanıyordu

`store_sell`, `store_reverse_sale`, `allocate_collection` fonksiyonları `SECURITY DEFINER` olarak tanımlı ve içlerinde **hiçbir yetki kontrolü yok**. Postgres varsayılanı gereği fonksiyon oluşturulduğunda `PUBLIC` role'üne EXECUTE izni otomatik veriliyor; `anon`/`authenticated` bu izni `PUBLIC` üzerinden miras alıyor ve PostgREST üzerinden (`/rest/v1/rpc/<fn>`) herkese açık internet üzerinden çağrılabiliyorlardı.

**Canlıda kanıtlandı (tespit):** Sadece herkese açık anon key (her tarayıcı JS paketinde zaten gömülü, gizli değil) ile, admin paneline hiç giriş yapmadan, `curl` üzerinden bu üç fonksiyon "reachable" (erişilebilir) olduğu doğrulandı — güvenli-başarısızlık parametreleri kullanılarak (geçersiz enum değeri / zaten ters çevrilmiş satış ID / var olmayan FK referansı) veri yan etkisi sıfır tutuldu, sadece fonksiyon seviyesinde hata alındığı (yetki hatası DEĞİL) doğrulandı.

**Uygulanan düzeltme (2026-07-19, kullanıcı onayıyla, canlı DB'de):**
```sql
revoke execute on function store_sell(...) from anon, authenticated;
revoke execute on function store_reverse_sale(...) from anon, authenticated;
revoke execute on function allocate_collection(...) from anon, authenticated;
-- PUBLIC miras zincirini de kapatmak gerekti:
revoke execute on function store_sell(...) from public;
revoke execute on function store_reverse_sale(...) from public;
revoke execute on function allocate_collection(...) from public;
grant execute on function store_sell(...) to service_role;
grant execute on function store_reverse_sale(...) to service_role;
grant execute on function allocate_collection(...) to service_role;
```
**Doğrulama:** `has_function_privilege('anon'/'authenticated', ..., 'execute')` her üç fonksiyon için `false`, `service_role` için `true` — SQL ile kanıtlandı. Ayrıca anon key ile `store_sell` RPC'sine canlı `curl` isteği artık `401` dönüyor (önceden `400` — fonksiyon içi validasyon hatası — dönüyordu, yani öncesinde erişim vardı).

Next.js API route'ları zaten `service_role` client (`supabaseAdmin`, `src/lib/supabase.ts`) kullanıyor (server-side) — bu değişiklik uygulamanın çalışmasını etkilemedi, sadece anon/authenticated rolünden doğrudan dış erişim kapandı.

### Bulgu #1 — ORTA: Fazla tahsilat, açık alacağa dönüşmüyor

`allocate_collection` müşterinin güncel borcundan fazla tutar girildiğinde bunu reddetmiyor. Fazlalık hiçbir satışa uygulanmadan sadece `credit_collections.amount` alanında toplam olarak kalıyor; gün sonu bu tutarı doğrudan topluyor. Otomatik müşteri alacağına çevirip sonraki alışverişte düşen bir mekanizma yok. Kullanım kılavuzunda personel için uyarı olarak eklendi (madde 5).

### Bulgu #2 — ORTA: `credit_limit` hiçbir yerde zorlanmıyor

Sadece UI'da bilgi amaçlı gösteriliyor; `store_sell` RPC/API katmanında karşılaştırma yok. Limiti aşan müşteriye veresiye satışı engel olmadan geçiyor.

### Bulgu #3 — ORTA: `is_blocked` sadece client tarafında uygulanıyor

`DukkanSatis.tsx` dropdown'da müşteri seçimini disable ediyor, ama `store_sell` RPC/API seviyesinde kontrol yok — API doğrudan çağrılırsa bloklu müşteriye satış engellenmiyor.

**Bulgu #1/#2/#3 ortak kök neden:** iş kuralları sadece UI/istemci seviyesinde uygulanıyor, sunucu/DB seviyesinde tekrar edilmiyor. Bulgu #4 ile aynı kategori (RPC seviyesinde eksik doğrulama), ayrı ayrı ele alınabilir ama kalıcı çözüm aynı yönde: kritik iş kurallarını RPC içine taşımak.

## Aşama 5 — Test Verisi Temizliği ve Mutabakat

Tüm test verisi silindi. Baseline (Aşama 2, test öncesi) ile son durum SQL ile satır satır karşılaştırıldı:

| Tablo | Baseline | Temizlik sonrası | Durum |
|---|---|---|---|
| store_sales (tüm) | 415 / 684275.01 | 415 / 684275.01 | ✅ |
| store_sales (aktif) | 411 / 672275.01 | 411 / 672275.01 | ✅ |
| store_sale_items | 415 / qty 507 | 415 / qty 507 | ✅ |
| stock_movements | 4 | 4 | ✅ |
| store_customers | 207 | 207 | ✅ |
| credit_collections | 67 / 62000.00 | 67 / 62000.00 | ✅ |
| payment_allocations | 64 / 87300.00 | 64 / 87300.00 | ✅ |
| manual_store_sales | 24 / 202450.00 | 24 / 202450.00 | ✅ |
| store_audit_log | 3 | 10 | ⚠️ bkz. not |
| product_stock (test ürünleri) | 41→1, 43→1, 44→1 | 41→1, 43→1, 44→1 | ✅ |

**Not — `store_audit_log` istisnası:** Bu tablo `prevent_audit_log_mutation()` trigger'ı ile bilerek append-only (UPDATE/DELETE yasak) tasarlanmış — kanıt izi bozulmasın diye. Test sırasında eklenen 7 satır (`actor='live-test-claude'`, zaman damgalı) silinemiyor; bu beklenen ve doğru davranış, hata değil. Satırlar tam olarak izlenebilir/açıklanabilir durumda.

**Silinen test verisi:** 7 test satışı (id 418,419,420,421,422,423,425 — toplam 12300.00), ilgili `store_sale_items`, ilgili `stock_movements`, test müşterisi (id=209), ve kendi manuel temizlik SQL'imin yarattığı 2 fazladan `stock_movements` satırı (id 21,22 — trigger varsayılan `reason='online_sale'` etiketlemesi, gerçek müşteri hareketi değil).

## Rollback Talimatları (ileride benzer test için)

1. Hızlı satış testleri: `store_reverse_sale(sale_id, actor)` RPC ile geri al — stok otomatik iade edilir.
2. Veresiye/tahsilat testleri: reversal RPC yok, elle SQL DELETE gerekir (sıra önemli — FK bağımlılığı):
   ```sql
   delete from payment_allocations where collection_id in (select id from credit_collections where customer_id=<test_id>);
   delete from credit_collections where customer_id=<test_id>;
   delete from store_sale_items where sale_id in (select id from store_sales where customer_id=<test_id>);
   delete from store_sales where customer_id=<test_id>;
   delete from stock_movements where ref_id in (...ilgili satış id'leri...);
   delete from store_customers where id=<test_id>;
   ```
3. Her adımdan sonra baseline snapshot ile satır/toplam karşılaştırması yapılmalı.
4. `product_stock` manuel düzeltme gerekirse, RPC yerine raw SQL kullanılıyorsa trigger'ın `reason`'ı yanlış etiketleyeceği unutulmamalı (Aşama 5'te karşılaşılan durum).

## Çözülmemiş Riskler / Öneriler

1. **Öncelik 1 (kritik) — KAPATILDI:** Bulgu #4, kullanıcı onayıyla aynı oturumda düzeltildi (yukarıda detay). Uygulama davranışında değişiklik yok, sadece dış erişim kapandı.
2. **Öncelik 2 (açık):** Bulgu #1/#2/#3 — kredi limiti, bloklu müşteri ve fazla tahsilat kontrolleri RPC seviyesine taşınmalı. Bu değişiklikler iş mantığı/kod değişikliği gerektirdiğinden bu oturumda yapılmadı.
3. Mobil viewport testi gerçek cihazda tekrarlanmalı (tooling kısıtı nedeniyle bu oturumda sadece kod seviyesinde doğrulandı).
4. Beden butonları ~24px yükseklikte — 44px erişilebilirlik standardının altında (küçük UX notu, `DukkanSatis.tsx:186`).

## Sonuç

Aşama 0-6 tamamlandı, tüm checklist maddeleri kanıtlı ✅ (2 tooling-kısıtlı istisna açıkça belirtildi). Test verisi tam temizlendi ve baseline ile mutabık (1 beklenen/açıklanmış istisna: `store_audit_log`). Panel fonksiyonel olarak canlıda çalışır durumda. **Bulgu #4 (kritik, anon key RPC bypass) aynı oturumda kullanıcı onayıyla kapatıldı ve doğrulandı.** Bulgu #1/#2/#3 açık risk olarak kalıyor, öncelik #2.
