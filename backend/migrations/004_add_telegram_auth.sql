-- =====================================================================
-- Миграция 004: Добавление полей для Telegram авторизации
-- =====================================================================
-- Описание: Добавляет поля для авторизации через Telegram
-- Запуск: python backend/migrations/run_migrations.py
-- =====================================================================

BEGIN;

-- Добавление полей для Telegram
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_expires_at TIMESTAMP;

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Комментарии
COMMENT ON COLUMN users.telegram_id IS 'Telegram ID пользователя для авторизации через Telegram';
COMMENT ON COLUMN users.telegram_username IS 'Telegram username пользователя';
COMMENT ON COLUMN users.phone_verification_code IS 'Код верификации отправленный в Telegram';
COMMENT ON COLUMN users.phone_verification_expires_at IS 'Время истечения кода верификации';

COMMIT;

-- Вывод сообщения
DO $$
BEGIN
    RAISE NOTICE '✅ Миграция 004: Поля для Telegram авторизации успешно добавлены';
END $$;
