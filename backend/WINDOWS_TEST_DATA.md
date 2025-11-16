# Инструкция по загрузке тестовых данных в Windows 11

## Вариант 1: Через Docker Desktop (Рекомендуется)

Это самый простой способ для Windows 11.

### Шаг 1: Установите Docker Desktop
1. Скачайте Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Установите и запустите Docker Desktop
3. Дождитесь полной загрузки Docker (значок в трее должен быть зеленым)

### Шаг 2: Запустите проект
Откройте PowerShell или Command Prompt в корне проекта:

```powershell
# Запустите все контейнеры
docker compose up -d

# Подождите ~30 секунд пока база данных полностью запустится
# Проверьте статус
docker compose ps
```

### Шаг 3: Загрузите тестовые данные
Выберите один из способов:

#### Способ A: Через PowerShell (один файл)
```powershell
Get-Content backend\test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
```

#### Способ B: Через Docker exec
```powershell
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -f /docker-entrypoint-initdb.d/test_data.sql
```

#### Способ C: Копирование в контейнер
```powershell
# Скопируйте файл в контейнер
docker cp backend\test_data.sql bazarlar_postgres:/tmp/test_data.sql

# Выполните скрипт
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -f /tmp/test_data.sql
```

### Шаг 4: Проверьте результат
```powershell
# Подключитесь к базе данных
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# В psql выполните:
SELECT COUNT(*) FROM users WHERE role='seller';  -- Должно быть 11
SELECT COUNT(*) FROM products;                    -- Должно быть ~40
SELECT COUNT(*) FROM seller_profiles;             -- Должно быть 11

# Для выхода из psql:
\q
```

---

## Вариант 2: Через установленный PostgreSQL

Если у вас PostgreSQL установлен напрямую в Windows.

### Шаг 1: Создайте базу данных
Откройте **Command Prompt** или **PowerShell**:

```powershell
# Подключитесь к PostgreSQL (введите пароль postgres)
psql -U postgres

# Создайте базу данных
CREATE DATABASE bazarlar_claude;
CREATE USER bazarlar_user WITH PASSWORD 'bazarlar_pass';
GRANT ALL PRIVILEGES ON DATABASE bazarlar_claude TO bazarlar_user;
\q
```

### Шаг 2: Примените миграции базы данных
```powershell
cd backend

# Создайте виртуальное окружение
python -m venv venv

# Активируйте виртуальное окружение
.\venv\Scripts\Activate.ps1

# Установите зависимости
pip install -r requirements.txt

# Примените миграции Alembic
alembic upgrade head
```

### Шаг 3: Загрузите тестовые данные
```powershell
# Из папки backend
psql -U bazarlar_user -d bazarlar_claude -f test_data.sql

# Введите пароль: bazarlar_pass
```

### Шаг 4: Проверьте данные
```powershell
psql -U bazarlar_user -d bazarlar_claude

# В psql:
SELECT COUNT(*) FROM cities;
SELECT COUNT(*) FROM markets;
SELECT COUNT(*) FROM users WHERE role='seller';
SELECT COUNT(*) FROM products;
\q
```

---

## Вариант 3: Через pgAdmin 4

Если вы предпочитаете графический интерфейс.

### Шаг 1: Откройте pgAdmin 4
1. Запустите pgAdmin 4 (устанавливается вместе с PostgreSQL)
2. Подключитесь к серверу PostgreSQL (localhost)

### Шаг 2: Создайте базу данных
1. Правой кнопкой на "Databases" → "Create" → "Database"
2. Название: `bazarlar_claude`
3. Owner: `postgres`
4. Save

### Шаг 3: Откройте Query Tool
1. Нажмите правой кнопкой на `bazarlar_claude`
2. Выберите "Query Tool"

### Шаг 4: Загрузите скрипт
1. Нажмите кнопку "Open File" (папка с стрелкой)
2. Выберите файл `backend/test_data.sql`
3. Нажмите кнопку "Execute" (▶️ или F5)

### Шаг 5: Проверьте результат
Выполните SQL запросы в Query Tool:
```sql
SELECT COUNT(*) FROM users WHERE role='seller';
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM seller_profiles;
```

---

## Вариант 4: Через Git Bash

Если у вас установлен Git для Windows.

### Загрузите данные
```bash
# Откройте Git Bash в папке проекта
cd backend

# Через Docker
cat test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# Или через локальный PostgreSQL
PGPASSWORD=bazarlar_pass psql -U bazarlar_user -d bazarlar_claude -f test_data.sql
```

---

## Вариант 5: Через WSL2 (Windows Subsystem for Linux)

Если у вас установлен WSL2.

### Шаг 1: Откройте WSL2
```bash
wsl
```

### Шаг 2: Перейдите в папку проекта
```bash
# Диски Windows доступны в /mnt/
cd /mnt/c/Users/ВашеИмя/bazarlaronline/backend

# Или если проект в WSL
cd ~/bazarlaronline/backend
```

### Шаг 3: Загрузите данные
```bash
# Через Docker
cat test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# Или через локальный PostgreSQL
psql -U bazarlar_user -d bazarlar_claude -f test_data.sql
```

---

## Создание .bat файла для Windows

Для удобства создайте файл `load_test_data.bat` в папке `backend`:

```batch
@echo off
echo ================================================
echo   Загрузка тестовых данных в Bazarlar Online
echo ================================================
echo.

echo Проверка Docker контейнера...
docker ps | findstr bazarlar_postgres >nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Контейнер PostgreSQL не запущен!
    echo Сначала запустите: docker compose up -d
    pause
    exit /b 1
)

echo Загрузка тестовых данных...
type test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

if %errorlevel% equ 0 (
    echo.
    echo [УСПЕХ] Тестовые данные загружены!
    echo.
    echo Созданы:
    echo   - 5 городов
    echo   - 7 рынков
    echo   - 8 категорий + подкатегории
    echo   - 11 продавцов
    echo   - ~40 товаров и услуг
    echo.
) else (
    echo.
    echo [ОШИБКА] Не удалось загрузить данные!
    echo Проверьте логи выше.
)

echo ================================================
pause
```

### Использование .bat файла:
1. Дважды кликните на `load_test_data.bat`
2. Дождитесь завершения
3. Проверьте результат

---

## PowerShell скрипт

Создайте файл `load_test_data.ps1` в папке `backend`:

```powershell
# Загрузка тестовых данных для Bazarlar Online
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Загрузка тестовых данных в Bazarlar Online" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Docker
$dockerRunning = docker ps 2>$null | Select-String "bazarlar_postgres"
if (-not $dockerRunning) {
    Write-Host "[ОШИБКА] Контейнер PostgreSQL не запущен!" -ForegroundColor Red
    Write-Host "Сначала запустите: docker compose up -d" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Загрузка тестовых данных..." -ForegroundColor Yellow
Get-Content test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[УСПЕХ] Тестовые данные успешно загружены!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Созданы:" -ForegroundColor Cyan
    Write-Host "  - 5 городов"
    Write-Host "  - 7 рынков"
    Write-Host "  - 8 категорий + подкатегории"
    Write-Host "  - 11 продавцов с профилями"
    Write-Host "  - ~40 товаров и услуг"
    Write-Host ""
    Write-Host "Проверить данные:" -ForegroundColor Yellow
    Write-Host '  docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -c "SELECT COUNT(*) FROM products;"'
} else {
    Write-Host ""
    Write-Host "[ОШИБКА] Не удалось загрузить данные!" -ForegroundColor Red
}

Write-Host "================================================" -ForegroundColor Cyan
pause
```

### Использование PowerShell скрипта:
```powershell
cd backend
.\load_test_data.ps1
```

Если получаете ошибку политики выполнения:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\load_test_data.ps1
```

---

## Устранение проблем

### Ошибка: "docker: command not found"
**Решение:**
1. Установите Docker Desktop
2. Перезапустите PowerShell/CMD
3. Убедитесь, что Docker Desktop запущен

### Ошибка: "psql: command not found"
**Решение:**
1. Добавьте PostgreSQL в PATH:
   - Путь обычно: `C:\Program Files\PostgreSQL\16\bin`
2. Откройте "Изменение системных переменных среды"
3. Добавьте путь к PostgreSQL в переменную PATH
4. Перезапустите PowerShell/CMD

### Ошибка: "permission denied"
**Решение в PowerShell:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Ошибка: "FATAL: password authentication failed"
**Решение:**
Проверьте пароль в переменных окружения:
```powershell
$env:PGPASSWORD = "bazarlar_pass"
psql -U bazarlar_user -d bazarlar_claude -f test_data.sql
```

### Контейнер не запускается
**Решение:**
```powershell
# Остановите все контейнеры
docker compose down

# Очистите volumes (ВНИМАНИЕ: удалит все данные!)
docker compose down -v

# Запустите заново
docker compose up -d

# Проверьте логи
docker logs bazarlar_postgres
```

---

## Быстрая команда (копипаст)

### Для Docker Desktop:
```powershell
docker compose up -d && timeout /t 10 && Get-Content backend\test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
```

### Для локального PostgreSQL:
```powershell
cd backend
$env:PGPASSWORD="bazarlar_pass"
psql -U bazarlar_user -d bazarlar_claude -f test_data.sql
```

---

## Проверка данных после загрузки

### Через PowerShell:
```powershell
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -c "SELECT 'Cities:', COUNT(*) FROM cities UNION ALL SELECT 'Markets:', COUNT(*) FROM markets UNION ALL SELECT 'Sellers:', COUNT(*) FROM users WHERE role='seller' UNION ALL SELECT 'Products:', COUNT(*) FROM products;"
```

### Через psql интерактивно:
```powershell
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
```
```sql
-- Список всех продавцов
SELECT full_name, email FROM users WHERE role='seller';

-- Список магазинов
SELECT shop_name, seller_type FROM seller_profiles;

-- Товары по категориям
SELECT c.name, COUNT(p.id)
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name;
```

---

## Что дальше?

После загрузки тестовых данных:

1. **Запустите backend**:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload
   ```
   Откройте: http://localhost:8000/docs

2. **Запустите frontend**:
   ```powershell
   cd frontend
   npm install
   npm start
   ```
   Откройте: http://localhost:3000

3. **Протестируйте API**:
   - GET http://localhost:8000/api/products - список товаров
   - GET http://localhost:8000/api/cities - список городов
   - GET http://localhost:8000/api/categories - категории

---

**Дата создания:** 2025-11-16
**Версия:** 1.0
**Платформа:** Windows 11
