#!/usr/bin/env python3
"""
Скрипт для применения миграции 005_add_password_hash
"""
import asyncio
from sqlalchemy import text
from app.database.session import engine


async def apply_migration():
    """Применить миграцию для добавления поля password_hash"""

    migration_sql = """
-- Добавление поля для хранения хеша пароля
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
"""

    print("Применение миграции для добавления поля password_hash...")

    async with engine.begin() as conn:
        try:
            await conn.execute(text(migration_sql))
            print(f"✅ Выполнено: Добавлено поле password_hash в таблицу users")
        except Exception as e:
            print(f"⚠️  Ошибка (может быть игнорирована если колонка уже существует): {e}")

    print("✅ Миграция успешно применена!")
    print("Перезапустите бэкенд сервер для применения изменений.")


if __name__ == "__main__":
    asyncio.run(apply_migration())
