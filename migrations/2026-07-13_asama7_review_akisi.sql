-- Aşama 7 — Review akışı için gerekli şema düzeltmeleri
-- ÖNCE bu dosyayı Supabase SQL Editor'de çalıştır, sonra deploy güvenli olur.

-- 1) product_reviews: admin/reviews PUT route'u bu kolona yazıyor ama tabloda yoktu (mevcut bug — admin moderasyon paneli kırıktı)
alter table public.product_reviews add column if not exists admin_note text;

-- 2) product_reviews: %10 review kuponunun tekrar tekrar verilmemesi için idempotency bayrağı
alter table public.product_reviews add column if not exists coupon_issued boolean not null default false;

-- 3) post_purchase_checkins: checkins/respond route'u bu kolonlara yazıyor ama tabloda yoktu (mevcut bug — "memnun musun" linkleri kırıktı)
alter table public.post_purchase_checkins add column if not exists response text;
alter table public.post_purchase_checkins add column if not exists review_invited boolean not null default false;
