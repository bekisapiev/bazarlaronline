#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для применения миграции 007: добавление поддержки level=4
"""

import asyncio
import asyncpg

# Данные для подключения к базе
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "bazarlar_claude",
    "user": "postgres",
    "password": "postgres"  # ИЗМЕНИТЕ НА ВАШ ПАРОЛЬ!
}


async def apply_migration():
    """Применяет миграцию для добавления поддержки level=4"""
    print("=" * 60)
    print("МИГРАЦИЯ 007: Добавление поддержки 4-го уровня категорий")
    print("=" * 60)
    print()

    # Подключаемся к базе
    print("🔌 Подключение к базе данных...")
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        print("✅ Подключение установлено")
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        return

    try:
        print("\n📦 Применение миграции...")

        # Проверяем текущий constraint
        print("\n1️⃣  Проверяем текущее ограничение...")
        current_check = await conn.fetchval(
            """
            SELECT conbin::text
            FROM pg_constraint
            WHERE conname = 'categories_level_check'
            """
        )
        if current_check:
            print(f"   ℹ️  Текущее ограничение: {current_check}")
        else:
            print("   ⚠️  Ограничение не найдено")

        # Удаляем старый constraint
        print("\n2️⃣  Удаляем старое ограничение...")
        await conn.execute("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_level_check")
        print("   ✅ Старое ограничение удалено")

        # Добавляем новый constraint
        print("\n3️⃣  Добавляем новое ограничение с поддержкой level=4...")
        await conn.execute(
            "ALTER TABLE categories ADD CONSTRAINT categories_level_check CHECK (level IN (1, 2, 3, 4))"
        )
        print("   ✅ Новое ограничение добавлено")

        # Проверяем новый constraint
        print("\n4️⃣  Проверяем обновленное ограничение...")
        new_check = await conn.fetchval(
            """
            SELECT conbin::text
            FROM pg_constraint
            WHERE conname = 'categories_level_check'
            """
        )
        if new_check:
            print(f"   ✅ Новое ограничение: {new_check}")
        else:
            print("   ❌ Ошибка: ограничение не создано!")

        print("\n✅ Миграция успешно применена!")

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        raise
    finally:
        await conn.close()
        print("\n🔌 Соединение закрыто\n")


async def main():
    """Главная функция"""
    print("\n🚀 Запуск миграции...\n")

    try:
        await apply_migration()
        print("=" * 60)
        print("🎉 МИГРАЦИЯ ЗАВЕРШЕНА!")
        print("=" * 60)
        print("\nТеперь вы можете запустить скрипт migrate_categories_4level.py")
        print()
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ Критическая ошибка: {e}")
        print("=" * 60)
        print()
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
