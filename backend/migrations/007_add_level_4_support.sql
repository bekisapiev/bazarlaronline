-- =====================================================================
-- Миграция 007: Добавление поддержки 4-го уровня категорий
-- Дата: 2025-11-27
-- Описание: Изменение CHECK constraint для поддержки level=4
-- =====================================================================

DO $$ BEGIN
    RAISE NOTICE 'Миграция 007: Добавление поддержки 4-го уровня категорий...';
END $$;

-- Удаляем старый constraint
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_level_check;

-- Добавляем новый constraint с поддержкой уровня 4
ALTER TABLE categories ADD CONSTRAINT categories_level_check CHECK (level IN (1, 2, 3, 4));

DO $$ BEGIN
    RAISE NOTICE '✓ Миграция 007 завершена успешно';
END $$;
