-- =====================================================================
-- Патч: Обновление существующих продуктов
-- =====================================================================
-- Устанавливает product_type = 'product' для всех существующих товаров
--
-- Запуск:
-- docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/002_update_existing_products.sql
-- =====================================================================

BEGIN;

DO $$
DECLARE
    updated_count INT;
BEGIN
    RAISE NOTICE 'Обновление типа для существующих продуктов...';

    UPDATE products
    SET product_type = 'product'
    WHERE product_type IS NULL OR product_type = '';

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    RAISE NOTICE '✓ Обновлено записей: %', updated_count;
END $$;

COMMIT;
