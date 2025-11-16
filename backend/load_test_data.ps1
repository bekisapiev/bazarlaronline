# Скрипт для загрузки тестовых данных в Windows PowerShell
# Автор: Claude AI
# Дата: 2025-11-16

$ErrorActionPreference = "Continue"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Загрузка тестовых данных в Bazarlar Online" -ForegroundColor Cyan
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
    Write-Host "Дождитесь запуска контейнера (~30 секунд) и запустите скрипт снова." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Загрузка данных
Write-Host "Загрузка тестовых данных..." -ForegroundColor Yellow
Write-Host ""

try {
    Get-Content test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "[УСПЕХ] Тестовые данные успешно загружены!" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""

        Write-Host "Созданы:" -ForegroundColor Cyan
        Write-Host "  ✓ 5 городов (Бишкек, Ош, Джалал-Абад, Каракол, Токмок)" -ForegroundColor White
        Write-Host "  ✓ 7 рынков" -ForegroundColor White
        Write-Host "  ✓ 8 категорий уровня 1 + подкатегории" -ForegroundColor White
        Write-Host "  ✓ 1 администратор (admin@bazarlar.online)" -ForegroundColor White
        Write-Host "  ✓ 1 базовый продавец (seller@bazarlar.online)" -ForegroundColor White
        Write-Host "  ✓ 10 продавцов с различными профилями" -ForegroundColor White
        Write-Host "  ✓ ~40 товаров и услуг" -ForegroundColor White
        Write-Host ""

        Write-Host "Проверить данные:" -ForegroundColor Yellow
        Write-Host '  docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude' -ForegroundColor White
        Write-Host ""

        Write-Host "Примеры SQL запросов:" -ForegroundColor Yellow
        Write-Host "  SELECT COUNT(*) FROM users WHERE role='seller';" -ForegroundColor Gray
        Write-Host "  SELECT COUNT(*) FROM products;" -ForegroundColor Gray
        Write-Host "  SELECT COUNT(*) FROM seller_profiles;" -ForegroundColor Gray
        Write-Host ""

        # Показываем статистику
        Write-Host "Статистика загруженных данных:" -ForegroundColor Cyan
        $stats = docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -t -c "
            SELECT
                'Продавцов: ' || COUNT(*) FROM users WHERE role='seller'
            UNION ALL
            SELECT 'Товаров: ' || COUNT(*) FROM products
            UNION ALL
            SELECT 'Профилей: ' || COUNT(*) FROM seller_profiles
            UNION ALL
            SELECT 'Городов: ' || COUNT(*) FROM cities
            UNION ALL
            SELECT 'Рынков: ' || COUNT(*) FROM markets
        " 2>$null

        if ($stats) {
            $stats | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        }

    } else {
        throw "Ошибка выполнения SQL скрипта"
    }

} catch {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "[ОШИБКА] Не удалось загрузить данные!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "  1. База данных не создана" -ForegroundColor White
    Write-Host "  2. Миграции не применены" -ForegroundColor White
    Write-Host "  3. Неверные настройки подключения" -ForegroundColor White
    Write-Host ""
    Write-Host "Проверьте логи:" -ForegroundColor Yellow
    Write-Host "  docker logs bazarlar_postgres" -ForegroundColor White
    Write-Host ""
    Write-Host "Ошибка: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
pause
