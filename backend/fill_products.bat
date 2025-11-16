@echo off
chcp 65001 >nul
echo ================================================
echo   Заполнение таблицы products тестовыми данными
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

echo Заполнение таблицы products...
echo.
type fill_products.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo [УСПЕХ] Товары успешно добавлены!
    echo ================================================
    echo.
    echo Проверить данные:
    echo   docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
    echo.
    echo SQL запрос для проверки:
    echo   SELECT COUNT(*^) FROM products;
    echo.
) else (
    echo.
    echo ================================================
    echo [ОШИБКА] Не удалось добавить товары!
    echo ================================================
    echo.
)

echo ================================================
pause
