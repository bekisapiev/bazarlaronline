-- =====================================================================
-- Migration: Add product_type and bookings table
-- =====================================================================
-- Описание:
-- 1. Добавляет поле product_type в таблицу products (product/service)
-- 2. Создает таблицу bookings для записей на услуги
--
-- Запуск:
-- docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/001_add_product_type_and_bookings.sql
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. Добавляем поле product_type в таблицу products
-- =====================================================================

-- Добавляем колонку product_type
ALTER TABLE products
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) NOT NULL DEFAULT 'product';

-- Добавляем constraint для проверки значения
ALTER TABLE products
DROP CONSTRAINT IF EXISTS check_product_type;

ALTER TABLE products
ADD CONSTRAINT check_product_type CHECK (product_type IN ('product', 'service'));

-- Создаем индекс для быстрой фильтрации по типу
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);

DO $$ BEGIN
    RAISE NOTICE '✓ Добавлено поле product_type в таблицу products';
END $$;

-- =====================================================================
-- 2. Создаем таблицу bookings для записей на услуги
-- =====================================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Customer contact info (required even if not registered)
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,

    -- Appointment details
    booking_datetime TIMESTAMP NOT NULL,
    comment TEXT,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT check_booking_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);

-- Создаем индексы для bookings
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seller_id ON bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_buyer_id ON bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_datetime ON bookings(booking_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Создаем индекс для быстрого поиска будущих записей продавца
CREATE INDEX IF NOT EXISTS idx_bookings_seller_datetime ON bookings(seller_id, booking_datetime)
WHERE status IN ('pending', 'confirmed');

DO $$ BEGIN
    RAISE NOTICE '✓ Создана таблица bookings';
END $$;

-- =====================================================================
-- 3. Обновляем существующие продукты (устанавливаем тип = 'product')
-- =====================================================================

UPDATE products
SET product_type = 'product'
WHERE product_type IS NULL OR product_type = '';

DO $$ BEGIN
    RAISE NOTICE '✓ Обновлены существующие продукты (установлен тип = product)';
END $$;

COMMIT;

-- =====================================================================
-- Итоговая статистика
-- =====================================================================

DO $$
DECLARE
    products_count INT;
    services_count INT;
BEGIN
    SELECT COUNT(*) INTO products_count FROM products WHERE product_type = 'product';
    SELECT COUNT(*) INTO services_count FROM products WHERE product_type = 'service';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Товаров (product): %', products_count;
    RAISE NOTICE 'Услуг (service): %', services_count;
    RAISE NOTICE 'Таблица bookings создана';
    RAISE NOTICE '========================================';
END $$;
