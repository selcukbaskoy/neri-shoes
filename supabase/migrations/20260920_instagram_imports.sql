-- ============================================================
-- Neri Shoes — Instagram İçerik Aktarım Taslak Kuyruğu
-- Tarih: 2026-09-20
-- Amac: Instagram Graph API'den cekilen postlari admin onayina
-- sunmak icin taslak tablosu. Otomatik urun yayini YOK — admin
-- her taslagi urun formuna acip fiyat/beden/kategori girerek
-- kaydeder (bkz. src/components/admin/AdminInstagram.tsx).
-- ============================================================

create table if not exists public.instagram_imports (
  id uuid primary key default gen_random_uuid(),
  ig_media_id text not null unique,
  permalink text,
  caption text,
  media_type text,
  image_urls text[] not null default '{}',
  ig_timestamp timestamptz,
  status text not null default 'pending' check (status in ('pending', 'imported', 'rejected')),
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_instagram_imports_status
  on public.instagram_imports (status, ig_timestamp desc);

alter table public.instagram_imports enable row level security;

drop policy if exists "service_role_all_instagram_imports" on public.instagram_imports;
create policy "service_role_all_instagram_imports" on public.instagram_imports
  for all to service_role using (true) with check (true);

-- Not: anon/authenticated icin hicbir policy yok — bu tablo sadece
-- admin API route'lari (service_role) tarafindan okunur/yazilir.
