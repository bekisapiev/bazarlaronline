-- =====================================================================
-- Миграция: Удаление Telegram полей из таблицы users
-- =====================================================================
-- Описание: Удаляет поля telegram_id и telegram_username из таблицы users
--          так как Telegram авторизация больше не поддерживается
-- Применение: psql -U bazarlar_user -d bazarlar_claude < backend/database/migrations/remove_telegram_fields.sql
-- =====================================================================

BEGIN;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'УДАЛЕНИЕ TELEGRAM ПОЛЕЙ ИЗ ТАБЛИЦЫ USERS';
    RAISE NOTICE '========================================';
END $$;

-- Проверяем существование столбцов перед удалением
DO $$
BEGIN
    -- Удаляем telegram_id если существует
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'telegram_id'
    ) THEN
        ALTER TABLE users DROP COLUMN telegram_id;
        RAISE NOTICE '✓ Столбец telegram_id удален';
    ELSE
        RAISE NOTICE '- Столбец telegram_id не найден (уже удален)';
    END IF;

    -- Удаляем telegram_username если существует
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'telegram_username'
    ) THEN
        ALTER TABLE users DROP COLUMN telegram_username;
        RAISE NOTICE '✓ Столбец telegram_username удален';
    ELSE
        RAISE NOTICE '- Столбец telegram_username не найден (уже удален)';
    END IF;
END $$;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!';
    RAISE NOTICE 'Telegram поля удалены из таблицы users';
    RAISE NOTICE '========================================';
END $$;
