# Локальный запуск на Windows (без Docker)

Инструкция для запуска Bazarlar Online на Windows для разработки.

## Требования

- **Python:** 3.11+
- **Node.js:** 18+
- **PostgreSQL:** 15+ (или Docker для PostgreSQL)
- **Redis:** 7+ (опционально, или Docker для Redis)

---

## Вариант 1: С PostgreSQL и Redis через Docker (РЕКОМЕНДУЕТСЯ)

Этот вариант проще, так как не требует установки PostgreSQL и Redis на Windows.

### Шаг 1: Установите Docker Desktop

1. Скачайте [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Установите и запустите Docker Desktop

### Шаг 2: Запустите только PostgreSQL и Redis

```powershell
# В корне проекта
cd C:\sites\bazar_online_claude\bazarlaronline-main

# Создайте docker-compose.dev.yml только для БД
cat > docker-compose.dev.yml @"
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: bazarlar_postgres
    environment:
      POSTGRES_DB: bazarlar_claude
      POSTGRES_USER: bazarlar_user
      POSTGRES_PASSWORD: bazarlar_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: bazarlar_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
"@

# Запустите контейнеры
docker-compose -f docker-compose.dev.yml up -d

# Проверьте что контейнеры запущены
docker ps
```

### Шаг 3: Обновите .env файл

В корне проекта обновите `.env`:

```env
# Используйте эти настройки для Docker PostgreSQL/Redis
DATABASE_URL=postgresql+asyncpg://bazarlar_user:bazarlar_pass@localhost:5432/bazarlar_claude
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bazarlar_claude
DB_USER=bazarlar_user
DB_PASSWORD=bazarlar_pass

REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Шаг 4: Инициализируйте базу данных

```powershell
# Создайте схему
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql

# Загрузите тестовые данные (опционально)
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/test_data.sql
```

### Шаг 5: Запустите Backend

```powershell
# В новом окне PowerShell
cd C:\sites\bazar_online_claude\bazarlaronline-main\backend

# Активируйте виртуальное окружение
.\venv\Scripts\Activate

# Запустите backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен на: http://localhost:8000/docs

### Шаг 6: Запустите Frontend

```powershell
# В новом окне PowerShell
cd C:\sites\bazar_online_claude\bazarlaronline-main\frontend

# Установите зависимости (если еще не установлены)
npm install

# Запустите frontend
npm start
```

Frontend будет доступен на: http://localhost:3000

---

## Вариант 2: С локальным PostgreSQL (сложнее)

Если хотите установить PostgreSQL локально на Windows.

### Шаг 1: Установите PostgreSQL

1. Скачайте [PostgreSQL 15](https://www.postgresql.org/download/windows/)
2. Установите с паролем для пользователя `postgres`
3. Запомните порт (обычно 5432)

### Шаг 2: Создайте базу данных

```powershell
# Откройте psql (PostgreSQL Shell)
psql -U postgres

# В psql выполните:
CREATE DATABASE bazarlar_claude;
CREATE USER bazarlar_user WITH PASSWORD 'bazarlar_pass';
GRANT ALL PRIVILEGES ON DATABASE bazarlar_claude TO bazarlar_user;
\q
```

### Шаг 3: Обновите .env

```env
DATABASE_URL=postgresql+asyncpg://bazarlar_user:bazarlar_pass@localhost:5432/bazarlar_claude
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bazarlar_claude
DB_USER=bazarlar_user
DB_PASSWORD=bazarlar_pass
```

### Шаг 4: Инициализируйте схему

```powershell
# В PowerShell
cd C:\sites\bazar_online_claude\bazarlaronline-main

# Создайте схему
psql -U bazarlar_user -d bazarlar_claude -f backend/database/schema.sql

# Загрузите тестовые данные (опционально)
psql -U bazarlar_user -d bazarlar_claude -f backend/database/test_data.sql
```

### Шаг 5: Установите Redis (опционально)

Вариант A: Через Docker (проще)
```powershell
docker run -d -p 6379:6379 --name bazarlar_redis redis:7-alpine
```

Вариант B: Через WSL
```powershell
# Включите WSL и установите Redis через Linux
wsl --install
wsl
sudo apt update && sudo apt install redis-server
redis-server
```

---

## Решение проблем

### Ошибка: "Connect call failed ('127.0.0.1', 5432)"

**Причина:** PostgreSQL не запущен или не слушает на порту 5432.

**Решение:**
```powershell
# Проверьте что PostgreSQL запущен
docker ps  # Для Docker варианта

# Или для локального PostgreSQL
# Откройте "Службы" Windows и проверьте что postgresql-x64-15 запущен
```

### Ошибка: "database does not exist"

**Причина:** База данных не создана.

**Решение:**
```powershell
# Для Docker
docker exec -i bazarlar_postgres psql -U postgres -c "CREATE DATABASE bazarlar_claude;"

# Для локального PostgreSQL
psql -U postgres -c "CREATE DATABASE bazarlar_claude;"
```

### Ошибка: "password authentication failed"

**Причина:** Неправильный пароль в .env

**Решение:**
1. Проверьте `.env` файл
2. Убедитесь что `DB_PASSWORD` совпадает с паролем в PostgreSQL

### Ошибка: "Redis connection failed"

**Причина:** Redis не запущен.

**Решение:**
```powershell
# Запустите Redis через Docker
docker run -d -p 6379:6379 --name bazarlar_redis redis:7-alpine

# Проверьте
docker ps | findstr redis
```

### Порт 5432 или 6379 уже занят

**Решение:**
```powershell
# Найдите процесс, использующий порт
netstat -ano | findstr :5432
netstat -ano | findstr :6379

# Остановите процесс (замените PID на реальный)
taskkill /PID <PID> /F
```

---

## Проверка работы

### Backend API
Откройте в браузере: http://localhost:8000/docs

Вы должны увидеть Swagger UI с документацией API.

### Frontend
Откройте в браузере: http://localhost:3000

Вы должны увидеть главную страницу приложения.

### Тестовый вход

Если загрузили тестовые данные:
- **Email:** buyer1@example.com
- **Пароль:** password123

---

## Быстрый перезапуск

Если нужно перезапустить всё:

```powershell
# Остановите backend (Ctrl+C в окне с uvicorn)
# Остановите frontend (Ctrl+C в окне с npm start)

# Перезапустите Docker контейнеры (если используете)
docker-compose -f docker-compose.dev.yml restart

# Запустите backend снова
cd backend
.\venv\Scripts\Activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Запустите frontend снова
cd frontend
npm start
```

---

## Следующие шаги

- ✅ Backend запущен на http://localhost:8000
- ✅ Frontend запущен на http://localhost:3000
- 📖 Изучите API: http://localhost:8000/docs
- 🎨 Начните разработку
- 🐳 Для production см. [deployment/BEGET_DEPLOYMENT.md](deployment/BEGET_DEPLOYMENT.md)
