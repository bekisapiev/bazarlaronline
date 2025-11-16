#!/bin/bash

# Скрипт для загрузки тестовых данных в базу PostgreSQL
# Автор: Claude AI
# Дата: 2025-11-16

set -e

echo "================================================"
echo "  Загрузка тестовых данных в Bazarlar Online"
echo "================================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка, запущен ли Docker контейнер
if ! docker ps | grep -q bazarlar_postgres; then
    echo -e "${RED}Ошибка: Контейнер PostgreSQL не запущен!${NC}"
    echo -e "${YELLOW}Сначала запустите проект:${NC}"
    echo "  docker compose up -d"
    exit 1
fi

echo -e "${YELLOW}Загрузка тестовых данных...${NC}"
echo ""

# Вариант 1: Через docker exec (если используется Docker)
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < test_data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Тестовые данные успешно загружены!${NC}"
    echo ""
    echo "Созданы:"
    echo "  - 5 городов (Бишкек, Ош, Джалал-Абад, Каракол, Токмок)"
    echo "  - 7 рынков"
    echo "  - 8 категорий уровня 1"
    echo "  - Подкатегории для одежды и электроники"
    echo "  - 1 администратор (admin@bazarlar.online)"
    echo "  - 1 тестовый продавец (seller@bazarlar.online)"
    echo "  - 10 продавцов с профилями"
    echo "  - ~40 товаров и услуг"
    echo ""
    echo -e "${YELLOW}Проверить данные:${NC}"
    echo "  docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude"
    echo ""
    echo "Примеры SQL запросов:"
    echo "  SELECT COUNT(*) FROM users WHERE role='seller';"
    echo "  SELECT COUNT(*) FROM products;"
    echo "  SELECT COUNT(*) FROM seller_profiles;"
else
    echo ""
    echo -e "${RED}✗ Ошибка при загрузке данных!${NC}"
    echo "Проверьте логи выше для получения деталей."
    exit 1
fi

echo "================================================"
