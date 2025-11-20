#!/usr/bin/env python3
"""
Скрипт для удаления всех таблиц из базы данных
⚠️  ОСТОРОЖНО: Это удалит ВСЕ данные!

Использование:
    python backend/migrations/drop_all_tables.py
"""

import os
import sys
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv


def get_db_connection():
    """Создание подключения к PostgreSQL"""
    env_path = Path(__file__).parent.parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)

    db_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'bazarlar_claude'),
        'user': os.getenv('DB_USER', 'bazarlar_user'),
        'password': os.getenv('DB_PASSWORD', 'bazarlar_pass'),
    }

    print(f"Подключение к {db_params['user']}@{db_params['host']}:{db_params['port']}/{db_params['database']}")

    try:
        conn = psycopg2.connect(**db_params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except psycopg2.Error as e:
        print(f"❌ Ошибка подключения к базе данных: {e}")
        sys.exit(1)


def drop_all_tables(conn):
    """Удаление всех таблиц и типов из базы данных"""

    # SQL для удаления всех таблиц
    drop_sql = """
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        -- Удаление всех таблиц
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
        LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
            RAISE NOTICE 'Удалена таблица: %', r.tablename;
        END LOOP;

        -- Удаление всех ENUM типов
        FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        LOOP
            EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
            RAISE NOTICE 'Удален тип: %', r.typname;
        END LOOP;
    END $$;
    """

    cursor = conn.cursor()
    cursor.execute("SET client_min_messages TO NOTICE;")

    try:
        print("\n⚠️  ВНИМАНИЕ: Сейчас будут удалены ВСЕ таблицы из базы данных!")
        response = input("Вы уверены? Введите 'YES' для подтверждения: ")

        if response != 'YES':
            print("❌ Операция отменена")
            return False

        print("\n" + "="*60)
        print("УДАЛЕНИЕ ВСЕХ ТАБЛИЦ")
        print("="*60)

        cursor.execute(drop_sql)

        # Вывод сообщений
        for notice in conn.notices:
            message = notice.replace('NOTICE:', '').strip()
            if message:
                print(message)

        conn.notices.clear()
        cursor.close()

        print("\n✅ Все таблицы успешно удалены")
        print("\nТеперь вы можете запустить миграции заново:")
        print("  python backend/migrations/run_migrations.py")

        return True

    except psycopg2.Error as e:
        print(f"❌ Ошибка при удалении таблиц: {e}")
        return False


def main():
    conn = get_db_connection()
    drop_all_tables(conn)
    conn.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
