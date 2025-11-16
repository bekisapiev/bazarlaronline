@echo off
REM Скрипт для загрузки тестовых данных в Windows
REM Автор: Claude AI
REM Дата: 2025-11-16

chcp 65001 >nul
echo ================================================
echo   Загрузка тестовых данных в Bazarlar Online
echo ================================================
echo.

echo Проверка Docker контейнера...
docker ps 2>nul | findstr bazarlar_postgres >nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Контейнер PostgreSQL не запущен!
    echo.
    echo Сначала запустите проект:
    echo   docker compose up -d
    echo.
    pause
    exit /b 1
)

echo Загрузка тестовых данных...
echo.
type test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo [УСПЕХ] Тестовые данные успешно загружены!
    echo ================================================
    echo.
    echo Созданы:
    echo   - 5 городов (Бишкек, Ош, Джалал-Абад, Каракол, Токмок^)
    echo   - 7 рынков
    echo   - 8 категорий уровня 1 + подкатегории
    echo   - 1 администратор (admin@bazarlar.online^)
    echo   - 1 базовый продавец (seller@bazarlar.online^)
    echo   - 10 продавцов с профилями
    echo   - ~40 товаров и услуг
    echo.
    echo Проверить данные:
    echo   docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
    echo.
    echo Примеры SQL запросов:
    echo   SELECT COUNT(*^) FROM users WHERE role='seller';
    echo   SELECT COUNT(*^) FROM products;
    echo   SELECT COUNT(*^) FROM seller_profiles;
    echo.
) else (
    echo.
    echo ================================================
    echo [ОШИБКА] Не удалось загрузить данные!
    echo ================================================
    echo.
    echo Проверьте:
    echo   1. Docker контейнер запущен: docker ps
    echo   2. База данных создана: docker logs bazarlar_postgres
    echo   3. Миграции применены
    echo.
)

echo ================================================
pause
