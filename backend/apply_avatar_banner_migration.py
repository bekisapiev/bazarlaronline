#!/usr/bin/env python3
"""
Миграция для добавления аватара и баннера пользователя
Добавляет поля avatar и banner в таблицу users
"""
import asyncio
import sys
from sqlalchemy import text
from app.database.session import engine


async def apply_migration():
    """Apply avatar and banner migration"""
    async with engine.begin() as conn:
        print("🔄 Применение миграции для avatar и banner...")

        try:
            # Добавить поля avatar и banner в users
            print("  ➤ Добавление полей avatar и banner в users...")
            await conn.execute(text("""
                ALTER TABLE users
                ADD COLUMN IF NOT EXISTS avatar VARCHAR(500),
                ADD COLUMN IF NOT EXISTS banner VARCHAR(500)
            """))

            print("✅ Миграция успешно применена!")

        except Exception as e:
            print(f"❌ Ошибка при применении миграции: {e}")
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(apply_migration())
