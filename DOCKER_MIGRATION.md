# Миграция с локального PostgreSQL на Docker

## Что у вас было
- PostgreSQL установлен локально на Windows 11
- База данных: `bazarlar_claude`
- Пользователь: `bazarlar_user`
- Вы вручную создавали базу и пользователя

## Что будет после миграции
- PostgreSQL работает в Docker контейнере
- Все данные сохранены
- Легкое управление через docker-compose

---

## Пошаговая инструкция

### 1️⃣ Сделать бэкап текущей базы

**PowerShell (запустите от администратора):**

```powershell
# Перейти в папку проекта
cd C:\путь\к\bazarlaronline\backend

# Создать папку для бэкапов
mkdir backups -ErrorAction SilentlyContinue

# Сделать бэкап
pg_dump -U bazarlar_user -h localhost -d bazarlar_claude > backups/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

**Если `pg_dump` не найден:**
```powershell
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" -U bazarlar_user -h localhost -d bazarlar_claude > backups/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

Введите пароль вашего пользователя `bazarlar_user`.

✅ **Проверьте**: Файл бэкапа должен появиться в `backend/backups/` и иметь размер больше 0 байт.

---

### 2️⃣ Установить Docker Desktop

1. Скачайте: https://www.docker.com/products/docker-desktop/
2. Запустите установщик
3. **Перезагрузите компьютер**
4. Запустите Docker Desktop
5. Подождите, пока Docker полностью запустится (зеленая иконка в трее)

✅ **Проверьте**: Откройте PowerShell и выполните `docker --version`

---

### 3️⃣ Остановить локальный PostgreSQL

**Вариант 1: Через графический интерфейс**
1. Нажмите `Win + R` → введите `services.msc` → Enter
2. Найдите `postgresql-x64-16` (или похожее)
3. Правая кнопка → **Остановить**
4. Правая кнопка → **Свойства** → Тип запуска: **Вручную**

**Вариант 2: Через PowerShell (от администратора)**
```powershell
Stop-Service postgresql-x64-16
Set-Service postgresql-x64-16 -StartupType Manual
```

✅ **Проверьте**: PostgreSQL должен быть остановлен и порт 5432 свободен.

---

### 4️⃣ Запустить PostgreSQL в Docker

**PowerShell (в папке проекта):**

```powershell
cd C:\путь\к\bazarlaronline

# Запустить только PostgreSQL
docker-compose up -d postgres

# Посмотреть логи запуска
docker-compose logs -f postgres
```

Подождите 20-30 секунд. Вы должны увидеть:
```
database system is ready to accept connections
```

Нажмите `Ctrl+C` чтобы выйти из просмотра логов.

✅ **Проверьте статус:**
```powershell
docker-compose ps
```

Должно быть:
```
NAME                 STATUS
bazarlar_postgres    Up (healthy)
```

---

### 5️⃣ Восстановить данные из бэкапа

**Найдите ваш файл бэкапа** в `backend/backups/` (например, `backup_20250116_143022.sql`)

**PowerShell:**
```powershell
# Вариант 1 (PowerShell 7+)
cat backend/backups/backup_20250116_143022.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# Вариант 2 (PowerShell 5)
Get-Content backend/backups/backup_20250116_143022.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# Вариант 3 (если выше не работает)
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/backups/backup_20250116_143022.sql
```

Процесс может занять 1-5 минут в зависимости от размера базы.

✅ **Проверьте данные:**
```powershell
# Подключиться к базе
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# В psql выполните:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM seller_profiles;
SELECT COUNT(*) FROM products;
\q  # Выход
```

---

### 6️⃣ Проверить настройки подключения

Файл `backend/app/core/config.py` уже содержит правильные настройки:

```python
DATABASE_URL: str = "postgresql+asyncpg://bazarlar_user:bazarlar_pass@localhost:5432/bazarlar_claude"
```

**Пароль в Docker:** `bazarlar_pass`

Если вам нужно изменить пароль, отредактируйте `docker-compose.yml`:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ваш_новый_пароль  # Измените здесь
```

И перезапустите:
```powershell
docker-compose down
docker-compose up -d postgres
```

---

### 7️⃣ Запустить бэкенд и проверить работу

**PowerShell:**

```powershell
# Перейти в папку backend
cd backend

# Активировать виртуальное окружение
.\.venv\Scripts\Activate.ps1

# Запустить сервер
uvicorn app.main:app --reload
```

Откройте http://localhost:8000/docs и проверьте, что API работает.

---

## 🎉 Готово! Теперь у вас PostgreSQL в Docker

### Полезные команды

```powershell
# Запустить PostgreSQL
docker-compose up -d postgres

# Остановить PostgreSQL
docker-compose down

# Посмотреть логи
docker-compose logs -f postgres

# Подключиться к базе
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# Создать новый бэкап
docker exec bazarlar_postgres pg_dump -U bazarlar_user bazarlar_claude > backend/backups/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Загрузить тестовые данные
cat backend/test_data.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

# Посмотреть использование места
docker exec bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -c "\l+"

# Полностью удалить контейнер и данные (ОСТОРОЖНО!)
docker-compose down -v
```

---

## Преимущества, которые вы получили

✅ **Изоляция** - PostgreSQL не засоряет систему
✅ **Легкий запуск** - одна команда вместо кучи настроек
✅ **Переносимость** - работает одинаково на любом ПК
✅ **Бэкапы** - простые команды для сохранения данных
✅ **Версии** - можете иметь несколько версий PostgreSQL
✅ **Чистота** - легко удалить всё без следов

---

## Что делать, если что-то пошло не так

### Ошибка: "port 5432 already in use"
```powershell
# Проверить, что локальный PostgreSQL остановлен
Get-Service postgresql-*

# Остановить все PostgreSQL
Stop-Service postgresql-x64-16
```

### Ошибка: "Cannot connect to Docker"
1. Убедитесь, что Docker Desktop запущен
2. Проверьте иконку Docker в трее (должна быть зеленой)
3. Перезапустите Docker Desktop

### Ошибка при восстановлении бэкапа
```powershell
# Очистить базу и попробовать снова
docker exec -it bazarlar_postgres psql -U bazarlar_user -d postgres -c "DROP DATABASE bazarlar_claude;"
docker exec -it bazarlar_postgres psql -U bazarlar_user -d postgres -c "CREATE DATABASE bazarlar_claude;"

# Восстановить бэкап заново
cat backend/backups/backup_*.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
```

### Хочу вернуться к локальному PostgreSQL
```powershell
# Остановить Docker PostgreSQL
docker-compose down

# Запустить локальный PostgreSQL
Start-Service postgresql-x64-16
Set-Service postgresql-x64-16 -StartupType Automatic
```

---

## Дополнительные возможности

### Запустить весь стек (PostgreSQL + Redis + Backend + Frontend)

```powershell
docker-compose up -d
```

Это запустит:
- PostgreSQL (порт 5432)
- Redis (порт 6379)
- Backend API (порт 8000)
- Frontend React (порт 3000)
- Celery Worker (фоновые задачи)
- Celery Beat (планировщик)

### Остановить весь стек

```powershell
docker-compose down
```

### Посмотреть логи всех сервисов

```powershell
docker-compose logs -f
```

---

**Поздравляю! Вы успешно мигрировали на Docker! 🚀**
