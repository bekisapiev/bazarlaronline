#!/bin/bash

# Скрипт для автоматического запуска всех сервисов Bazarlar Online

echo "🚀 Запуск сервисов Bazarlar Online..."

# Проверка и запуск PostgreSQL
echo "📦 Проверка PostgreSQL..."
if ! service postgresql status > /dev/null 2>&1; then
    echo "   Запуск PostgreSQL..."
    service postgresql start
    sleep 2
else
    echo "   PostgreSQL уже запущен"
fi

# Запуск Backend
echo "🔧 Запуск Backend сервера..."
cd /home/user/bazarlaronline/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "   Backend запущен (PID: $BACKEND_PID)"

# Запуск Frontend (если нужно)
# echo "🎨 Запуск Frontend сервера..."
# cd /home/user/bazarlaronline/frontend
# npm start &
# FRONTEND_PID=$!
# echo "   Frontend запущен (PID: $FRONTEND_PID)"

echo ""
echo "✅ Все сервисы запущены!"
echo ""
echo "   Backend API: http://localhost:8000"
echo "   Frontend:    http://localhost:3000"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

# Ожидание
wait $BACKEND_PID
