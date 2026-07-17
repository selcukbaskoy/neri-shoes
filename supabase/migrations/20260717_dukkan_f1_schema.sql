-- ═══════════════════════════════════════════════════════════════════════════
-- NERI SHOES — DÜKKAN ENTEGRASYONU F1: ŞEMA + TRIGGER + RPC
-- ═══════════════════════════════════════════════════════════════════════════
-- Kaynak: DUKKAN-ENTEGRASYON-PLANI.md §3.2 + DUKKAN-ENTEGRASYON-PLANI-V2.md V2-2, V2-6 (F1)
-- Değişmez sözleşme: products/product_stock/orders mevcut kolonları, decrement_stock
-- imzası ve gövdesi, webhook HMAC, anon RLS politikaları — BUNLARA DOKUNULMAZ.
-- Tüm değişiklikler ADDITIVE (yeni tablo/kolon/trigger/fonksiyon). Rollback = DROP.
--
-- Gerçek kolon tipleri canlı DB'den doğrulandı (2026-07-17):
--   products.id            = text
--   product_stock.product_id = text, product_stock.size = integer
--   decrement_stock(p_product_id text, p_size integer, p_qty integer) — DOKUNULMADI
--
-- Çalıştırma: Supabase Dashboard → SQL Editor → New query → tamamını yapıştır → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 0. product_stock: barkod hazırlığı (V2-2) + ikinci savunma hattı ──────
alter table public.product_stock
  add column if not exists barcode text;

create unique index if not exists idx_product_stock_barcode
  on public.product_stock (barcode)
  where barcode is not null;

alter table public.product_stock
  add constraint product_stock_quantity_nonneg check (quantity >= 0);

-- ─── 1. Maliyet — products'tan AYRI, default-deny (Karar 6) ────────────────
create table if not exists public.product_costs (
  product_id      text not null references public.products(id),
  size            integer not null,
  purchase_price  numeric(10,2) not null,
  effective_from  timestamptz not null default now(),
  primary key (product_id, size, effective_from)
);
alter table public.product_costs enable row level security;
-- policy YOK = yalnız service_role erişir (anon/authenticated tamamen kapalı)

-- ─── 2. Stok hareket defteri (trigger doldurur; decrement_stock'a sıfır dokunuş) ─
create table if not exists public.stock_movements (
  id          bigserial primary key,
  product_id  text not null,
  size        integer not null,
  delta       int not null,
  reason      text not null,               -- 'online_sale'|'store_sale'|'return'|'adjustment'|'migration_seed'|'goods_in'
  channel     text not null default 'online',
  ref_id      bigint,
  created_at  timestamptz default now()
);
alter table public.stock_movements enable row level security;

create index if not exists idx_stock_movements_product_created
  on public.stock_movements (product_id, created_at desc);

-- ─── 3. Dükkan müşterisi (Supabase Auth'tan AYRI) ──────────────────────────
create table if not exists public.store_customers (
  id            bigserial primary key,
  name          text not null,
  phone         text,
  credit_limit  numeric(10,2) not null default 0,
  is_blocked    boolean not null default false,   -- 'Ulaşılamıyor' blokajı
  sqlite_id     int,                               -- göç izi
  created_at    timestamptz default now()
);
alter table public.store_customers enable row level security;

-- ─── 4. Satış: başlık + satır (v1 tek satır, çoklu satıra hazır şema) ──────
create table if not exists public.store_sales (
  id                 bigserial primary key,
  customer_id        bigint references public.store_customers(id),
  payment_method     text not null check (payment_method in ('nakit','pos','veresiye')),
  discount_amount    numeric(10,2) not null default 0,
  total_price        numeric(10,2) not null,
  note               text,
  is_paid            boolean not null default false,     -- yalnız veresiyede anlamlı
  amount_paid        numeric(10,2) not null default 0,
  paid_at            timestamptz,
  promised_pay_at    date,
  sale_unreachable   boolean not null default false,
  is_reversed        boolean not null default false,
  reversed_at        timestamptz,
  correction_note    text,
  is_legacy          boolean not null default false,      -- SQLite'tan taşınan geçmiş
  sold_at            timestamptz not null default now()
);
alter table public.store_sales enable row level security;

create index if not exists idx_store_sales_customer on public.store_sales (customer_id);
create index if not exists idx_store_sales_sold_at on public.store_sales (sold_at desc);
create index if not exists idx_store_sales_open_credit
  on public.store_sales (customer_id)
  where payment_method = 'veresiye' and is_paid = false;

create table if not exists public.store_sale_items (
  id                 bigserial primary key,
  sale_id            bigint not null references public.store_sales(id),
  product_id         text references public.products(id),
  size               integer,
  quantity           int not null,
  unit_price         numeric(10,2) not null,
  returned_quantity  int not null default 0
);
alter table public.store_sale_items enable row level security;

create index if not exists idx_store_sale_items_sale on public.store_sale_items (sale_id);
create index if not exists idx_store_sale_items_product on public.store_sale_items (product_id, size);

-- ─── 5. FIFO veresiye tahsilat (SQLite modeli birebir) ─────────────────────
create table if not exists public.credit_collections (
  id              bigserial primary key,
  customer_id     bigint not null references public.store_customers(id),
  amount          numeric(10,2) not null,
  payment_method  text not null default 'nakit',  -- 'promosyon_hediye' dahil
  collected_at    timestamptz not null,
  note            text,
  created_at      timestamptz default now()
);
alter table public.credit_collections enable row level security;

create table if not exists public.payment_allocations (
  id             bigserial primary key,
  collection_id  bigint not null references public.credit_collections(id),
  sale_id        bigint not null references public.store_sales(id),
  amount         numeric(10,2) not null
);
alter table public.payment_allocations enable row level security;

create index if not exists idx_payment_allocations_collection on public.payment_allocations (collection_id);
create index if not exists idx_payment_allocations_sale on public.payment_allocations (sale_id);

-- ─── 6. Stok-dışı satış (Antigraviti) — stok düşümü yok, ciroya yazılır ────
create table if not exists public.manual_store_sales (
  id                  bigserial primary key,
  customer_id         bigint references public.store_customers(id),
  sale_date           date not null,
  product_description text not null,
  quantity            int not null,
  payment_method       text not null check (payment_method in ('nakit','pos')),
  discount_amount      numeric(10,2) not null default 0,
  total_amount         numeric(10,2) not null,
  note                 text,
  created_by           text not null,               -- inkar edilemezlik
  created_at           timestamptz default now()
);
alter table public.manual_store_sales enable row level security;

-- ─── 7. Append-only audit log ───────────────────────────────────────────────
create table if not exists public.store_audit_log (
  id          bigserial primary key,
  actor       text not null,
  action      text not null,   -- 'manual_sale'|'reverse_sale'|'collection_delete'|'goods_in'|...
  payload     jsonb,
  created_at  timestamptz default now()
);
alter table public.store_audit_log enable row level security;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'store_audit_log append-only: UPDATE/DELETE yasak';
end;
$$;

drop trigger if exists trg_store_audit_log_no_mutation on public.store_audit_log;
create trigger trg_store_audit_log_no_mutation
  before update or delete on public.store_audit_log
  for each row execute function public.prevent_audit_log_mutation();

-- ─── 8. Göç eşleme tablosu (SQLite → Supabase FK çevirisi) ─────────────────
create table if not exists public.sqlite_id_map (
  sqlite_product_id   int primary key,
  supabase_product_id text not null references public.products(id),
  size                 integer not null
);
alter table public.sqlite_id_map enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: product_stock AFTER UPDATE → stock_movements
-- webhook (decrement_stock) ve store_sell aynı UPDATE yolundan geçer; reason/
-- channel ayrımı session-local GUC ile yapılır. GUC set edilmezse (decrement_stock
-- gibi) varsayılan 'online_sale'/'online' yazılır — decrement_stock'a SIFIR DOKUNUŞ.
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.trg_log_stock_movement()
returns trigger
language plpgsql
security definer
as $$
declare
  v_reason  text;
  v_channel text;
  v_ref     bigint;
begin
  if NEW.quantity = OLD.quantity then
    return NEW;
  end if;

  v_reason  := coalesce(nullif(current_setting('app.movement_reason', true), ''), 'online_sale');
  v_channel := coalesce(nullif(current_setting('app.movement_channel', true), ''), 'online');
  v_ref     := nullif(current_setting('app.movement_ref', true), '')::bigint;

  insert into public.stock_movements (product_id, size, delta, reason, channel, ref_id)
  values (NEW.product_id, NEW.size, NEW.quantity - OLD.quantity, v_reason, v_channel, v_ref);

  return NEW;
end;
$$;

drop trigger if exists trg_product_stock_movement on public.product_stock;
create trigger trg_product_stock_movement
  after update on public.product_stock
  for each row execute function public.trg_log_stock_movement();

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC: store_sell — dükkan satışı, decrement_stock'u ÇAĞIRMAZ, kendi atomik
-- UPDATE'ini yapar (asla read-then-write; WHERE quantity >= qty deseni).
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.store_sell(
  p_customer_id      bigint,
  p_payment_method    text,
  p_items             jsonb,     -- [{product_id, size, quantity, unit_price}, ...]
  p_discount_amount   numeric default 0,
  p_note              text default null,
  p_promised_pay_at   date default null
)
returns bigint
language plpgsql
security definer
as $$
declare
  v_sale_id  bigint;
  v_item     jsonb;
  v_total    numeric := 0;
  v_updated  int;
begin
  if p_payment_method not in ('nakit','pos','veresiye') then
    raise exception 'invalid payment_method: %', p_payment_method;
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_total := v_total + (v_item->>'quantity')::int * (v_item->>'unit_price')::numeric;
  end loop;
  v_total := v_total - coalesce(p_discount_amount, 0);

  insert into public.store_sales (customer_id, payment_method, discount_amount, total_price, note, promised_pay_at)
  values (p_customer_id, p_payment_method, coalesce(p_discount_amount, 0), v_total, p_note, p_promised_pay_at)
  returning id into v_sale_id;

  perform set_config('app.movement_reason', 'store_sale', true);
  perform set_config('app.movement_channel', 'store', true);
  perform set_config('app.movement_ref', v_sale_id::text, true);

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.store_sale_items (sale_id, product_id, size, quantity, unit_price)
    values (
      v_sale_id,
      v_item->>'product_id',
      (v_item->>'size')::int,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric
    );

    update public.product_stock
    set quantity = quantity - (v_item->>'quantity')::int
    where product_id = (v_item->>'product_id')
      and size = (v_item->>'size')::int
      and quantity >= (v_item->>'quantity')::int;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'insufficient stock: product_id=% size=%', v_item->>'product_id', v_item->>'size';
    end if;
  end loop;

  perform set_config('app.movement_reason', '', true);
  perform set_config('app.movement_channel', '', true);
  perform set_config('app.movement_ref', '', true);

  return v_sale_id;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC: store_reverse_sale — satış iptali, stok iadesi
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.store_reverse_sale(
  p_sale_id bigint,
  p_actor   text
)
returns void
language plpgsql
security definer
as $$
declare
  v_item record;
begin
  if exists (select 1 from public.store_sales where id = p_sale_id and is_reversed) then
    raise exception 'sale % already reversed', p_sale_id;
  end if;

  perform set_config('app.movement_reason', 'return', true);
  perform set_config('app.movement_channel', 'store', true);
  perform set_config('app.movement_ref', p_sale_id::text, true);

  for v_item in select * from public.store_sale_items where sale_id = p_sale_id loop
    update public.product_stock
    set quantity = quantity + v_item.quantity
    where product_id = v_item.product_id and size = v_item.size;
  end loop;

  update public.store_sales
  set is_reversed = true, reversed_at = now()
  where id = p_sale_id;

  insert into public.store_audit_log (actor, action, payload)
  values (p_actor, 'reverse_sale', jsonb_build_object('sale_id', p_sale_id));

  perform set_config('app.movement_reason', '', true);
  perform set_config('app.movement_channel', '', true);
  perform set_config('app.movement_ref', '', true);
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC: allocate_collection — FIFO veresiye tahsilat dağıtımı
-- ═══════════════════════════════════════════════════════════════════════════
create or replace function public.allocate_collection(
  p_customer_id     bigint,
  p_amount          numeric,
  p_payment_method  text default 'nakit',
  p_collected_at    timestamptz default now(),
  p_note            text default null
)
returns bigint
language plpgsql
security definer
as $$
declare
  v_collection_id  bigint;
  v_remaining      numeric := p_amount;
  v_sale           record;
  v_alloc          numeric;
begin
  insert into public.credit_collections (customer_id, amount, payment_method, collected_at, note)
  values (p_customer_id, p_amount, p_payment_method, p_collected_at, p_note)
  returning id into v_collection_id;

  for v_sale in
    select id, total_price - amount_paid as remaining
    from public.store_sales
    where customer_id = p_customer_id
      and payment_method = 'veresiye'
      and is_paid = false
      and is_reversed = false
    order by sold_at asc
    for update
  loop
    exit when v_remaining <= 0;
    v_alloc := least(v_remaining, v_sale.remaining);
    if v_alloc <= 0 then
      continue;
    end if;

    insert into public.payment_allocations (collection_id, sale_id, amount)
    values (v_collection_id, v_sale.id, v_alloc);

    update public.store_sales
    set amount_paid = amount_paid + v_alloc,
        is_paid     = (amount_paid + v_alloc >= total_price),
        paid_at     = case when (amount_paid + v_alloc >= total_price) then p_collected_at else paid_at end
    where id = v_sale.id;

    v_remaining := v_remaining - v_alloc;
  end loop;

  return v_collection_id;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- KONTROL SORGULARI (Run sonrası doğrulama)
-- ═══════════════════════════════════════════════════════════════════════════
-- Yeni tablolar boş olmalı:
--   select 'product_costs', count(*) from product_costs
--   union all select 'stock_movements', count(*) from stock_movements
--   union all select 'store_customers', count(*) from store_customers
--   union all select 'store_sales', count(*) from store_sales;
--
-- Anon sızıntı taraması (F1 regresyon kapısı c) — her tablo için anon key ile:
--   curl "$SUPABASE_URL/rest/v1/product_costs?select=*" -H "apikey: $ANON_KEY"
--   → beklenen: [] veya 401/403, ASLA veri dönmemeli.
--
-- decrement_stock hâlâ çalışıyor mu (webhook zinciri kırılmadı mı):
--   select proname, pg_get_functiondef(oid) from pg_proc where proname='decrement_stock';
-- ═══════════════════════════════════════════════════════════════════════════
