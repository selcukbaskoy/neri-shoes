-- ============================================================
-- Neri Shoes Müşteri Paneli — Adım 1: Auth + Şema Migration
-- Tarih: 2026-07-06
-- Hedef: Supabase Auth entegrasyonu + yeni müşteri deneyimi tabloları
-- Kural: Misafir checkout bozulmaz. Tüm yeni tablolarda RLS aktif.
-- ============================================================

-- -----------------------------------------------------------
-- 1. Mevcut customers tablosu genişletme (misafir → kayıtlı eşleme)
-- -----------------------------------------------------------

-- Not: customers tablosu zaten mevcut (misafir checkout'ta kullanılıyor)
-- Eğer yoksa oluştur, varsa alter table yap.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE customers ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'email'
    ) THEN
        ALTER TABLE customers ADD COLUMN email text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'phone'
    ) THEN
        ALTER TABLE customers ADD COLUMN phone text;
    END IF;
END
$$;

-- customers tablosunda e-posta ve telefon üzerinde unique olmamalı
-- (aynı telefonla misafir checkout yapan biri sonradan kayıt olabilir)
-- ama auth_user_id varsa zaten kayıtlıdır.

-- customers RLS: misafir checkout bozulmamalı
-- Mevcut anon_rw_customers policy DENETIM-RAPORU'na göre kaldırıldı.
-- Yeni policy: anon INSERT (misafir checkout), SELECT kendi verisi (auth), service_role ALL.

-- Önce mevcut customers policy'lerini temizle (varsa)
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
DROP POLICY IF EXISTS "auth_select_own_customers" ON customers;
DROP POLICY IF EXISTS "auth_update_own_customers" ON customers;
DROP POLICY IF EXISTS "service_role_all_customers" ON customers;

-- customers tablosu için RLS (eğer aktif değilse aktifleştir)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Anon: sadece INSERT (misafir checkout form verisi)
CREATE POLICY "anon_insert_customers" ON customers
    FOR INSERT TO anon WITH CHECK (true);

-- Auth kullanıcı: sadece kendi kaydını gör/güncelle
CREATE POLICY "auth_select_own_customers" ON customers
    FOR SELECT TO authenticated USING (auth_user_id = auth.uid());

CREATE POLICY "auth_update_own_customers" ON customers
    FOR UPDATE TO authenticated USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

-- Service role: tam erişim (admin panel, server API'lar)
CREATE POLICY "service_role_all_customers" ON customers
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 2. orders tablosu genişletme (kupon + indirim)
-- -----------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'coupon_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN coupon_id uuid;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN discount_amount numeric DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_id text REFERENCES customers(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- orders RLS: misafir checkout server-side supabaseAdmin ile çalışır.
-- Anon'un orders'a doğrudan erişimi olmamalı (DENETIM-RAPORU K-2).
DROP POLICY IF EXISTS "anon_rw_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "auth_select_own_orders" ON orders;
DROP POLICY IF EXISTS "service_role_all_orders" ON orders;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Auth kullanıcı: sipariş geçmişi (e-posta/telefon eşleşmesi veya customer_id üzerinden)
-- Aşama 3'te (misafir eşleştirme) tam bağlantı kurulacak.
-- Şimdilik customer_id NULL kalabilir; auth user kendi e-postasıyla eşleşen siparişleri görecek.
CREATE POLICY "auth_select_own_orders" ON orders
    FOR SELECT TO authenticated USING (
        customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "service_role_all_orders" ON orders
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 3. order_items RLS (DENETIM-RAPORU K-2)
-- -----------------------------------------------------------

DROP POLICY IF EXISTS "anon_rw_order_items" ON order_items;
DROP POLICY IF EXISTS "auth_select_own_order_items" ON order_items;
DROP POLICY IF EXISTS "service_role_all_order_items" ON order_items;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_own_order_items" ON order_items
    FOR SELECT TO authenticated USING (
        order_id IN (
            SELECT id FROM orders WHERE
            customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
            OR customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
        )
    );

CREATE POLICY "service_role_all_order_items" ON order_items
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 4. Yeni tablo: customer_addresses
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS customer_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id text REFERENCES customers(id) ON DELETE CASCADE,
    title text NOT NULL,
    full_address text NOT NULL,
    city text NOT NULL,
    district text NOT NULL,
    postal_code text,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE customer_addresses IS 'Müşteri teslimat adresleri. Checkout''ta adres seçici kullanılır.';

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_crud_own_addresses" ON customer_addresses
    FOR ALL TO authenticated USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "service_role_all_addresses" ON customer_addresses
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 5. Yeni tablo: customer_favorites
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS customer_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id text REFERENCES customers(id) ON DELETE CASCADE,
    product_id text REFERENCES products(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(customer_id, product_id)
);

ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_crud_own_favorites" ON customer_favorites
    FOR ALL TO authenticated USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "service_role_all_favorites" ON customer_favorites
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 6. Yeni tablo: product_reviews (Verified Purchase + moderasyon)
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id text REFERENCES products(id) ON DELETE CASCADE,
    customer_id text REFERENCES customers(id) ON DELETE SET NULL,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    rating int NOT NULL CHECK (rating between 1 and 5),
    comment text,
    media_urls text[],           -- Supabase Storage URL'leri (foto/video)
    status text NOT NULL DEFAULT 'pending',  -- pending / approved / rejected
    admin_note text,             -- Admin moderasyon notu
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE product_reviews IS 'Ürün yorumları. Onaylı yorumlar (approved) ürün sayfasında görünür.';
COMMENT ON COLUMN product_reviews.order_id IS 'Dolu ise "Doğrulanmış Satın Alım" rozeti gösterilir.';

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Public (anon): sadece onaylı (approved) yorumları oku
CREATE POLICY "anon_select_approved_reviews" ON product_reviews
    FOR SELECT TO anon USING (status = 'approved');

-- Auth: kendi yorumlarını oku (her durumda), yeni yorum ekle
CREATE POLICY "auth_select_own_reviews" ON product_reviews
    FOR SELECT TO authenticated USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "auth_insert_own_reviews" ON product_reviews
    FOR INSERT TO authenticated WITH CHECK (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

-- Admin / service_role: tüm yorumları oku, durum güncelle (moderasyon)
CREATE POLICY "service_role_all_reviews" ON product_reviews
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 7. Yeni tablo: coupons (Admin yönetimli)
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),  -- 'percent' | 'fixed'
    discount_value numeric NOT NULL CHECK (discount_value > 0),
    min_order_amount numeric DEFAULT 0,
    valid_from timestamptz,
    valid_until timestamptz,
    max_uses int,
    used_count int DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE coupons IS 'İndirim kuponları. Checkout''ta kod girilerek kullanılır.';

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public: sadece aktif kuponları oku (kod listeleme gerekebilir, ama genelde API filtreler)
CREATE POLICY "anon_select_active_coupons" ON coupons
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "service_role_all_coupons" ON coupons
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 8. Yeni tablo: coupon_redemptions (kupon kullanım kaydı)
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    customer_id text REFERENCES customers(id) ON DELETE SET NULL,
    discount_amount numeric NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_own_redemptions" ON coupon_redemptions
    FOR SELECT TO authenticated USING (
        customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "service_role_all_redemptions" ON coupon_redemptions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 9. Yeni tablo: post_purchase_checkins (Satış sonrası check-in)
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS post_purchase_checkins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) UNIQUE,
    scheduled_at timestamptz NOT NULL,     -- teslimattan/satıştan +7 gün
    sent_at timestamptz,
    response text CHECK (response IN ('memnun', 'memnun_degil', 'yanitsiz')),
    review_invited boolean DEFAULT false,   -- değerlendirme daveti gönderildi mi
    created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE post_purchase_checkins IS 'Sipariş teslim sonrası +7 gün check-in kayıtları. Vercel Cron ile işlenir.';

ALTER TABLE post_purchase_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_checkins" ON post_purchase_checkins
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 10. Yeni tablo: stock_alerts ("Gelince haber ver")
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS stock_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id text REFERENCES products(id) ON DELETE CASCADE,
    size int,
    email text NOT NULL,
    notified boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Anon: herkes stok bildirimi bırakabilir (e-posta gerekli)
CREATE POLICY "anon_insert_stock_alerts" ON stock_alerts
    FOR INSERT TO anon WITH CHECK (true);

-- Auth: kendi bildirimlerini oku
CREATE POLICY "auth_select_own_alerts" ON stock_alerts
    FOR SELECT TO authenticated USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "service_role_all_stock_alerts" ON stock_alerts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 11. Güvenlik: admin_login_attempts RLS (DENETIM-RAPORU Y-1)
-- -----------------------------------------------------------

DROP POLICY IF EXISTS "server_rw" ON admin_login_attempts;

ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_login_attempts" ON admin_login_attempts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -----------------------------------------------------------
-- 12. Misafir checkout güvenliği: mevcut anon yazma izinlerini kaldır
-- -----------------------------------------------------------

-- products.all_write (DENETIM-RAPORU D-1)
DROP POLICY IF EXISTS "all_write" ON products;

-- products: anon SELECT kalır (ürün listesi), yazma sadece service_role
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "service_role_write_products" ON products;
CREATE POLICY "service_role_write_products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

-- product_stock: anon SELECT kalır (stok görünürlüğü), yazma sadece service_role/admin
DROP POLICY IF EXISTS "anon_rw_product_stock" ON product_stock;
DROP POLICY IF EXISTS "anon_select_stock" ON product_stock;
DROP POLICY IF EXISTS "service_role_all_stock" ON product_stock;

ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_stock" ON product_stock FOR SELECT TO anon USING (true);
CREATE POLICY "service_role_all_stock" ON product_stock FOR ALL TO service_role USING (true) WITH CHECK (true);

-- exchange_rates: anon SELECT (fiyat dönüşümü), yazma sadece service_role
DROP POLICY IF EXISTS "anon_rw_exchange_rates" ON exchange_rates;
DROP POLICY IF EXISTS "anon_select_rates" ON exchange_rates;
DROP POLICY IF EXISTS "service_role_all_rates" ON exchange_rates;

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_rates" ON exchange_rates FOR SELECT TO anon USING (true);
CREATE POLICY "service_role_all_rates" ON exchange_rates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- blog_posts: anon SELECT sadece published (zaten uygulanmış olmalı)
-- orders, customers, order_items: anon_rw policy'ler zaten kaldırıldı (yukarıda tekrar edildi)

-- -----------------------------------------------------------
-- 13. Indexes (performans)
-- -----------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer_id ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer_id ON product_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_order_id ON coupon_redemptions(order_id);
CREATE INDEX IF NOT EXISTS idx_post_purchase_checkins_order_id ON post_purchase_checkins(order_id);
CREATE INDEX IF NOT EXISTS idx_post_purchase_checkins_scheduled ON post_purchase_checkins(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_notified ON stock_alerts(notified) WHERE notified = false;

-- -----------------------------------------------------------
-- 14. Trigger: updated_at otomatik güncelleme
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_customer_addresses_updated') THEN
        CREATE TRIGGER trg_customer_addresses_updated
            BEFORE UPDATE ON customer_addresses
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_product_reviews_updated') THEN
        CREATE TRIGGER trg_product_reviews_updated
            BEFORE UPDATE ON product_reviews
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_coupons_updated') THEN
        CREATE TRIGGER trg_coupons_updated
            BEFORE UPDATE ON coupons
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- ============================================================
-- KURALLAR (Manuel kontrol listesi)
-- ============================================================
-- [ ] customers tablosu mevcut mu? (Eğer yoksa bu migration çalışmaz — önce customers tablosu oluşturulmalı)
-- [ ] auth.users tablosu (Supabase Auth) mevcut mu? (Supabase projesinde Auth modülü aktif mi?)
-- [ ] Misafir checkout test edildi mi? (anon orders INSERT kapalı → create-payment API route'u supabaseAdmin kullanıyor mu?)
-- [ ] Admin panel product_stock güncelleme test edildi mi? (supabaseAdmin kullanıyor mu?)
-- ============================================================
