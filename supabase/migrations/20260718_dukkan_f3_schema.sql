-- ═══════════════════════════════════════════════════════════════════════════
-- NERI SHOES — DÜKKAN ENTEGRASYONU F3: FİNANSAL/İŞLEMSEL GEÇMİŞ GÖÇÜ — ŞEMA TAMAMLAMA
-- ═══════════════════════════════════════════════════════════════════════════
-- F1 şeması (20260717_dukkan_f1_schema.sql) sqlite_id_map'i yalnız ürün eşlemesi
-- için tasarladı. F3 sırasında bulunan boşluk: store_sales / credit_collections /
-- manual_store_sales tablolarında sqlite_id kolonu yoktu → tekil script çalışması
-- içinde bellek haritasına bağımlı kalırdı, yeniden çalıştırma idempotent olmazdı.
-- Bu dosya SADECE additive: yeni kolon + partial unique index. Mevcut hiçbir
-- kolona/kurala dokunulmaz.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.store_sales
  add column if not exists sqlite_id integer;

create unique index if not exists idx_store_sales_sqlite_id
  on public.store_sales (sqlite_id)
  where sqlite_id is not null;

alter table public.credit_collections
  add column if not exists sqlite_id integer;

create unique index if not exists idx_credit_collections_sqlite_id
  on public.credit_collections (sqlite_id)
  where sqlite_id is not null;

alter table public.manual_store_sales
  add column if not exists sqlite_id integer;

create unique index if not exists idx_manual_store_sales_sqlite_id
  on public.manual_store_sales (sqlite_id)
  where sqlite_id is not null;

-- store_customers.sqlite_id kolonu F1'de zaten var ama unique index yoktu
create unique index if not exists idx_store_customers_sqlite_id
  on public.store_customers (sqlite_id)
  where sqlite_id is not null;
