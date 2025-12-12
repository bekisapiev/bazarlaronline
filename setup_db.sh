#!/bin/bash
# =============================================================================
# Скрипт инициализации базы данных Bazarlar Online
# PostgreSQL 15
# =============================================================================

set -e  # Остановить выполнение при ошибке

echo "=========================================="
echo "ИНИЦИАЛИЗАЦИЯ БД BAZARLAR ONLINE"
echo "=========================================="
echo ""

# Проверка, что PostgreSQL запущен
if ! docker ps | grep -q bazarlar_postgres; then
    echo "❌ Контейнер PostgreSQL не запущен!"
    echo "Запустите: docker-compose up -d postgres"
    exit 1
fi

echo "✓ Контейнер PostgreSQL запущен"
echo ""

# Ждем, пока PostgreSQL будет готов
echo "Ожидание готовности PostgreSQL..."
sleep 3

# Проверка подключения
if ! docker exec bazarlar_postgres pg_isready -U bazarlar_user -d bazarlar_claude > /dev/null 2>&1; then
    echo "Ожидание запуска PostgreSQL..."
    sleep 5
fi

echo "✓ PostgreSQL готов к работе"
echo ""

# Создание схемы БД
echo "Создание схемы БД..."
if docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql > /dev/null 2>&1; then
    echo "✓ Схема БД создана"
else
    echo "❌ Ошибка при создании схемы БД"
    exit 1
fi

echo ""

# Загрузка справочных данных
echo "Загрузка справочных данных..."
if docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/seed_data.sql > /dev/null 2>&1; then
    echo "✓ Справочные данные загружены"
else
    echo "❌ Ошибка при загрузке справочных данных"
    exit 1
fi

echo ""

# Загрузка тестовых данных (опционально)
read -p "Загрузить тестовые данные? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Загрузка тестовых данных..."
    if docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/test_data.sql > /dev/null 2>&1; then
        echo "✓ Тестовые данные загружены"
    else
        echo "❌ Ошибка при загрузке тестовых данных"
        exit 1
    fi
else
    echo "⊘ Тестовые данные пропущены"
fi

echo ""
echo "=========================================="
echo "✓ БАЗА ДАННЫХ ГОТОВА!"
echo "=========================================="
echo ""
echo "Подключение к БД:"
echo "  docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude"
echo ""
echo "Проверка таблиц:"
echo "  docker exec bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -c '\dt'"
echo ""
