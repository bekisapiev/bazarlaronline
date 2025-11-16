# Скрипт для заполнения таблицы products тестовыми данными
# Автор: Claude AI
# Дата: 2025-11-17

$ErrorActionPreference = "Continue"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Заполнение таблицы products тестовыми данными" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия Docker
try {
    $null = docker --version 2>&1
} catch {
    Write-Host "[ОШИБКА] Docker не установлен или не запущен!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Проверка запущенного контейнера PostgreSQL
Write-Host "Проверка Docker контейнера..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null | Select-String "bazarlar_postgres"

if (-not $dockerRunning) {
    Write-Host "[ОШИБКА] Контейнер PostgreSQL не запущен!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Сначала запустите проект:" -ForegroundColor Yellow
    Write-Host "  docker compose up -d" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# Заполнение таблицы products
Write-Host "Заполнение таблицы products..." -ForegroundColor Yellow
Write-Host ""

try {
    Get-Content fill_products.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "[УСПЕХ] Товары успешно добавлены!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""

        Write-Host "Проверить данные:" -ForegroundColor Yellow
        Write-Host '  docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude' -ForegroundColor White
        Write-Host ""

        Write-Host "Примеры SQL запросов:" -ForegroundColor Yellow
        Write-Host "  SELECT COUNT(*) FROM products;" -ForegroundColor Gray
        Write-Host "  SELECT title, price FROM products LIMIT 10;" -ForegroundColor Gray
        Write-Host ""

        # Показываем статистику
        Write-Host "Получение статистики..." -ForegroundColor Cyan
        $stats = docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -t -c "SELECT COUNT(*) FROM products" 2>$null

        if ($stats) {
            Write-Host "  Всего товаров в базе: $($stats.Trim())" -ForegroundColor White
        }

    } else {
        throw "Ошибка выполнения SQL скрипта"
    }

} catch {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "[ОШИБКА] Не удалось добавить товары!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "  1. Нет продавцов в базе данных" -ForegroundColor White
    Write-Host "  2. Категории не созданы" -ForegroundColor White
    Write-Host "  3. Неверные настройки подключения" -ForegroundColor White
    Write-Host ""
    Write-Host "Ошибка: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
pause
