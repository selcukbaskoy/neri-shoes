-- ============================================================
-- TASLAK — ÇALIŞTIRILMADI. Onaydan sonra service_role ile uygulanacak.
-- Yol B: products'a additive renk gruplama. Yıkıcı işlem YOK.
-- Tarih: 2026-07-07
-- ============================================================

-- 1) Additive kolonlar (hepsi nullable → PG17'de tablo yeniden yazımı yok)
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_family TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_name   JSONB;   -- {"tr":"Siyah","en":"Black","de":"Schwarz","it":"Nero","ar":"أسود","ru":"Чёрный"}
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_hex    TEXT;

-- Opsiyonel hex format guard (NOT VALID → tarama kilidi olmadan sonradan validate)
-- ALTER TABLE products ADD CONSTRAINT chk_color_hex
--   CHECK (color_hex ~* '^#[0-9a-f]{6}$') NOT VALID;

-- 2) "Aktif kardeşleri color_family ile getir" için partial composite index
--    CONCURRENTLY = tablo kilidi yok (transaction dışında çalıştır)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_color_family_active
  ON products (color_family)
  WHERE is_active AND color_family IS NOT NULL;

-- 3) (İLERİDE, dükkan migrasyonunda) SKU'dan aile türetme: NS-{MODEL}-{RENK} -> NS-{MODEL}
--    Bugün 29 üründen yalnız 2'sinde SKU var → bugün otomatik seed YAPILMAZ.
--    Önce DRY-RUN SELECT ile incele, sonra guard'lı UPDATE:
-- SELECT id, sku, regexp_replace(sku,'^(NS-[^-]+)-.*$','\1') AS derived_family
-- FROM products WHERE sku ~ '^NS-[^-]+-.+$';

-- ============================================================
-- GERİ ALMA (down) — Staging'de prova yapılmalı:
-- ============================================================
-- DROP INDEX CONCURRENTLY IF EXISTS idx_products_color_family_active;
-- ALTER TABLE products DROP COLUMN IF EXISTS color_hex;
-- ALTER TABLE products DROP COLUMN IF EXISTS color_name;
-- ALTER TABLE products DROP COLUMN IF EXISTS color_family;
