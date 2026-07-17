# MALİYET BEKLEYEN ÜRÜNLER

Kaynak: canlı Supabase `products` tablosu (`tphxrtxzkvivjkxoeujm`), 2026-07-17 sorgusu. `[ARSIV]` ürünler (rogue Hotiç/LV Bej dahil) hariç tutuldu. Satış fiyatı Supabase'den doğrudan çekildi, referans amaçlıdır. **Alış Maliyeti** kolonunu doldur.

> **Not — sayım düzeltmesi:** DUKKAN-ENTEGRASYON-PLANI-V3-PIVOT.md §4 metninde "18 ürün" yazıyordu ama kendi tablosu ve canlı Supabase doğrulaması **19 satır** çıkardı. Fark "HOT Leather Series" adının Supabase'de 2 ayrı üründen (`hot-leather-series` = Kahverengi, `hot-leather-series-2` = Siyah) oluşmasından geliyor — metin bunu "17 tekil model + 2 ürün" diye tarif etmiş ama toplamı yanlış yazmış (17+2=19, 18 değil). Aşağıdaki liste gerçek ve tam: 19 satır.

| # | Model Adı | Renk | Satış Fiyatı (TL) | Alış Maliyeti (TL) |
|---|---|---|---|---|
| 1 | 313 Spor | Standart | 3.000 | 750 |
| 2 | 314 Runner | Standart | 2.800 | 750 |
| 3 | 4767 Yarasa Kauçuk Eva Taban | Standart | 3.000 | 750 |
| 4 | 4919 Süet Düz Deriler | Standart | 3.200 | 750 |
| 5 | 4920 Süet Deri | Siyah | 3.000 | 750 |
| 6 | Cloud Loafer Series | Standart | 3.000 | 750 |
| 7 | Croco Black Edition | Standart | 3.225 | 750 |
| 8 | Full Black | Standart | 3.200 | 750 |
| 9 | HOT Leather Series | Kahverengi | 3.000 | 750 |
| 10 | HOT Leather Series | Siyah | 3.000 | 750 |
| 11 | Hybrid Derby | Standart | 3.000 | 750 |
| 12 | Hybrid Derby 2 | Standart | 3.000 | 750 |
| 13 | LF-01 Beyaz EVA Taban | Standart | 3.000 | 750 |
| 14 | Milano GM | Standart | 3.000 | 750 |
| 15 | Monk Beast | Standart | 7.600 | 750 |
| 16 | Olive Python | Standart | 3.000 | 750 |
| 17 | Soft Luxe Driver | Standart | 3.199,99 | 750 |
| 18 | Stealth Black Edition | Standart | 0 / null (bkz. not) | 750 |
| 19 | Suede Knot Loafer | Standart | 2.800 | 750 |

**Not — Stealth Black Edition:** Supabase'de `price: null`, `compare_at_price: null`, `is_active: true`. Site tarafında gerçek bir bug (aktif ama fiyatsız), dükkan senkron hatası değil (bkz. V3-PIVOT.md §4/3c). Maliyet yine de girilebilir, satış fiyatı site düzeltilince tamamlanacak.
