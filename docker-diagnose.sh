#!/bin/bash

# Скрипт диагностики Docker контейнеров для проекта Bazarlar
# Использование: ./docker-diagnose.sh

echo "=================================="
echo "Docker Диагностика для Bazarlar"
echo "=================================="
echo ""

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен"
    exit 1
fi

echo "✅ Docker установлен: $(docker --version)"
echo ""

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose не установлен"
    exit 1
fi

echo "✅ Docker Compose установлен"
echo ""

echo "=================================="
echo "Статус контейнеров"
echo "=================================="
docker-compose ps
echo ""

echo "=================================="
echo "Логи PostgreSQL (последние 50 строк)"
echo "=================================="
docker-compose logs --tail=50 postgres
echo ""

echo "=================================="
echo "Проверка подключения к PostgreSQL"
echo "=================================="
if docker exec bazarlar_postgres pg_isready -U bazarlar_user -d bazarlar_claude 2>/dev/null; then
    echo "✅ PostgreSQL работает и принимает подключения"
else
    echo "❌ PostgreSQL не отвечает"
    echo ""
    echo "Попытка проверить процессы внутри контейнера:"
    docker exec bazarlar_postgres ps aux 2>/dev/null || echo "❌ Не удалось получить список процессов"
fi
echo ""

echo "=================================="
echo "Использование ресурсов"
echo "=================================="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

echo "=================================="
echo "Проверка volumes"
echo "=================================="
docker volume ls | grep bazarlar
echo ""

echo "=================================="
echo "Проверка сети"
echo "=================================="
docker network ls | grep bazarlar
echo ""

echo "=================================="
echo "Занятые порты"
echo "=================================="
echo "Проверка порта 54320 (PostgreSQL):"
if netstat -tuln 2>/dev/null | grep -q ":54320 "; then
    echo "✅ Порт 54320 прослушивается"
    netstat -tuln | grep ":54320 "
else
    if ss -tuln 2>/dev/null | grep -q ":54320 "; then
        echo "✅ Порт 54320 прослушивается"
        ss -tuln | grep ":54320 "
    else
        echo "❌ Порт 54320 не прослушивается"
    fi
fi
echo ""

echo "=================================="
echo "Рекомендации по устранению проблем"
echo "=================================="
echo ""
echo "Если PostgreSQL не запускается:"
echo "1. Проверьте логи: docker-compose logs postgres"
echo "2. Очистите volumes: docker-compose down -v && docker-compose up -d"
echo "3. Проверьте доступное место: df -h"
echo "4. Проверьте память: free -h"
echo "5. Пересоздайте контейнер: docker-compose up -d --force-recreate postgres"
echo ""
echo "Для проверки подключения изнутри контейнера:"
echo "docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude"
echo ""
echo "Для просмотра логов в реальном времени:"
echo "docker-compose logs -f postgres"
echo ""
