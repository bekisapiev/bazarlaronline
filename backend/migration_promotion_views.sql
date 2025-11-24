-- Миграция: Переход с системы поднятия на продвижение по просмотрам
-- Дата: 2025-01-24
-- Описание: Удаляет старые поля is_promoted/promoted_at и добавляет новые поля для просмотров

-- 1. Удалить таблицу auto_promotions
DROP TABLE IF EXISTS auto_promotions CASCADE;

-- 2. Удалить старые колонки из products
ALTER TABLE products
  DROP COLUMN IF EXISTS is_promoted,
  DROP COLUMN IF EXISTS promoted_at;

-- 3. Добавить новые колонки для системы продвижения по просмотрам
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS promotion_views_total INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS promotion_views_remaining INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS promotion_started_at TIMESTAMP;

-- 4. Добавить комментарии к новым колонкам
COMMENT ON COLUMN products.promotion_views_total IS 'Всего купленных просмотров для продвижения';
COMMENT ON COLUMN products.promotion_views_remaining IS 'Оставшихся просмотров для продвижения';
COMMENT ON COLUMN products.promotion_started_at IS 'Дата начала продвижения товара';

-- 5. Создать индекс для быстрой сортировки по оставшимся просмотрам
CREATE INDEX IF NOT EXISTS idx_products_promotion_views
  ON products(promotion_views_remaining DESC)
  WHERE promotion_views_remaining > 0;

-- Проверка результата
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('promotion_views_total', 'promotion_views_remaining', 'promotion_started_at')
ORDER BY column_name;
