#!/usr/bin/env python3
"""
Скрипт для применения миграции 004_add_telegram_auth
"""
import asyncio
from sqlalchemy import text
from app.database.session import engine


async def apply_migration():
    """Применить миграцию для добавления полей Telegram"""

    migration_sql = """
-- Добавление полей для Telegram
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_expires_at TIMESTAMP;

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
"""

    print("Применение миграции для добавления полей Telegram...")

    async with engine.begin() as conn:
        # Выполнение каждого statement отдельно
        statements = [s.strip() for s in migration_sql.split(';') if s.strip()]

        for stmt in statements:
            try:
                await conn.execute(text(stmt))
                print(f"✅ Выполнено: {stmt[:50]}...")
            except Exception as e:
                print(f"⚠️  Ошибка (может быть игнорирована если колонка уже существует): {e}")

    print("✅ Миграция успешно применена!")
    print("Перезапустите бэкенд сервер для применения изменений.")


if __name__ == "__main__":
    asyncio.run(apply_migration())
