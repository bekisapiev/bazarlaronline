#!/usr/bin/env python3
"""
Скрипт для запуска миграций базы данных
Использование:
    python backend/migrations/run_migrations.py
    python backend/migrations/run_migrations.py --schema-only  # только структура (001)
    python backend/migrations/run_migrations.py --data-only    # только данные (002, 003)
"""

import os
import sys
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv
import argparse


def get_db_connection():
    """Создание подключения к PostgreSQL"""
    # Загрузка переменных из .env файла
    env_path = Path(__file__).parent.parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)

    # Параметры подключения
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


def run_sql_file(conn, filepath):
    """Выполнение SQL-файла"""
    if not filepath.exists():
        print(f"❌ Файл не найден: {filepath}")
        return False

    print(f"\n{'='*60}")
    print(f"Выполнение: {filepath.name}")
    print(f"{'='*60}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            sql = f.read()

        cursor = conn.cursor()

        # Включение вывода RAISE NOTICE
        cursor.execute("SET client_min_messages TO NOTICE;")

        # Выполнение SQL
        cursor.execute(sql)

        # Получение и вывод всех сообщений
        for notice in conn.notices:
            # Убираем префикс "NOTICE:"
            message = notice.replace('NOTICE:', '').strip()
            if message:
                print(message)

        conn.notices.clear()
        cursor.close()

        print(f"✅ {filepath.name} выполнен успешно")
        return True

    except psycopg2.Error as e:
        print(f"❌ Ошибка при выполнении {filepath.name}:")
        print(f"   {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Запуск миграций базы данных')
    parser.add_argument('--schema-only', action='store_true', help='Только создание таблиц (001)')
    parser.add_argument('--data-only', action='store_true', help='Только данные (002, 003)')
    parser.add_argument('--test-data-only', action='store_true', help='Только тестовые данные (003)')
    args = parser.parse_args()

    # Путь к директории с миграциями
    migrations_dir = Path(__file__).parent

    # Список файлов миграций
    migrations = []

    if args.schema_only:
        migrations = [
            migrations_dir / '001_create_tables.sql',
        ]
    elif args.data_only:
        migrations = [
            migrations_dir / '002_reference_data.sql',
            migrations_dir / '003_test_data.sql',
        ]
    elif args.test_data_only:
        migrations = [
            migrations_dir / '003_test_data.sql',
        ]
    else:
        # По умолчанию - все миграции
        migrations = [
            migrations_dir / '001_create_tables.sql',
            migrations_dir / '002_reference_data.sql',
            migrations_dir / '003_test_data.sql',
        ]

    print("\n" + "="*60)
    print("ЗАПУСК МИГРАЦИЙ БАЗЫ ДАННЫХ")
    print("="*60)

    # Подключение к БД
    conn = get_db_connection()

    success_count = 0
    failed_count = 0

    # Выполнение миграций
    for migration_file in migrations:
        if run_sql_file(conn, migration_file):
            success_count += 1
        else:
            failed_count += 1
            print(f"\n⚠️  Прекращение выполнения из-за ошибки в {migration_file.name}")
            break

    # Закрытие подключения
    conn.close()

    # Итоги
    print("\n" + "="*60)
    print("ИТОГИ")
    print("="*60)
    print(f"Успешно выполнено: {success_count}")
    print(f"Ошибок: {failed_count}")
    print("="*60 + "\n")

    return 0 if failed_count == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
