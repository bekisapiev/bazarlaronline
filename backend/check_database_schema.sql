-- Диагностический скрипт для проверки схемы базы данных
-- Проверяет наличие всех необходимых колонок для системы продвижения

\echo '=== Проверка колонок таблицы products ==='
\echo ''

-- Показать все колонки, связанные с продвижением
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN (
    'promotion_views_total',
    'promotion_views_remaining',
    'promotion_started_at',
    'is_promoted',
    'promoted_at'
  )
ORDER BY column_name;

\echo ''
\echo '=== Ожидаемые колонки: ==='
\echo 'promotion_views_total (integer, NOT NULL, default 0)'
\echo 'promotion_views_remaining (integer, NOT NULL, default 0)'
\echo 'promotion_started_at (timestamp, nullable)'
\echo ''
\echo 'Старые колонки (должны быть удалены):'
\echo 'is_promoted'
\echo 'promoted_at'
\echo ''

-- Показать индексы на promotion_views_remaining
\echo '=== Проверка индексов ==='
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'products'
  AND indexname LIKE '%promotion%';

\echo ''
\echo '=== Проверка данных ==='
-- Показать статистику по товарам с продвижением
SELECT
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE promotion_views_remaining > 0) as promoted_products,
  SUM(promotion_views_remaining) as total_remaining_views
FROM products;

\echo ''
\echo '=== Проверка таблицы auto_promotions ==='
-- Проверить, что таблица auto_promotions удалена
SELECT EXISTS (
  SELECT FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'auto_promotions'
) as auto_promotions_exists;

\echo ''
\echo 'Если auto_promotions_exists = true, таблица НЕ удалена (проблема!)'
\echo 'Если auto_promotions_exists = false, таблица удалена (OK)'
