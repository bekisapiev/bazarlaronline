# Обновление PostgreSQL с версии 16 на версию 18

PostgreSQL 18 - новейшая версия, выпущенная 25 сентября 2025 года. Основные улучшения:

- **Асинхронный I/O (AIO)** - до 3x прирост производительности в некоторых сценариях
- **Skip Scan для B-tree индексов** - быстрее запросы без указания всех ведущих колонок
- **Новый протокол 3.2** - первое обновление протокола с 2003 года
- **Улучшенные обновления** - сохранение статистики планировщика при обновлении версий
- **Virtual generated columns** - виртуальные вычисляемые колонки
- **OAuth аутентификация** - встроенная поддержка OAuth

## Автоматическое обновление (рекомендуется)

Используйте скрипт автоматического обновления:

```bash
cd /var/www/bazarlaronline
sudo chmod +x deployment/upgrade-postgresql.sh
sudo ./deployment/upgrade-postgresql.sh
```

Скрипт автоматически:
- Остановит PostgreSQL 16
- Предложит создать backup (рекомендуется выбрать "yes")
- Удалит PostgreSQL 16
- Установит PostgreSQL 18
- Предложит восстановить данные из backup

---

## Ручное обновление

Если вы предпочитаете делать все вручную:

### Шаг 1: Создайте backup (ВАЖНО!)

```bash
# Создайте директорию для backup
sudo mkdir -p /var/backups/postgresql

# Создайте backup всех баз данных
sudo -u postgres pg_dumpall > /var/backups/postgresql/backup_$(date +%Y%m%d_%H%M%S).sql

# Проверьте, что backup создан
ls -lh /var/backups/postgresql/
```

### Шаг 2: Остановите PostgreSQL

```bash
sudo systemctl stop postgresql
```

### Шаг 3: Удалите PostgreSQL 16

```bash
# Удалите PostgreSQL 16
sudo apt remove --purge postgresql-16 postgresql-client-16 postgresql-contrib-16 -y

# Удалите ненужные зависимости
sudo apt autoremove -y
```

### Шаг 4: Добавьте официальный репозиторий PostgreSQL

```bash
# Установите необходимые пакеты
sudo apt install -y curl ca-certificates gnupg

# Добавьте GPG ключ
sudo install -d /usr/share/postgresql-common/pgdg
curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc

# Добавьте репозиторий
sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Обновите список пакетов
sudo apt update
```

### Шаг 5: Установите PostgreSQL 18

```bash
sudo apt install -y postgresql-18 postgresql-client-18 postgresql-contrib-18
```

### Шаг 6: Запустите PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Шаг 7: Проверьте версию

```bash
sudo -u postgres psql -c "SELECT version();"
```

Вы должны увидеть "PostgreSQL 18.x"

### Шаг 8: Восстановите данные из backup

```bash
# Найдите ваш backup файл
ls -lh /var/backups/postgresql/

# Восстановите данные (замените имя файла на ваше)
sudo -u postgres psql < /var/backups/postgresql/backup_YYYYMMDD_HHMMSS.sql
```

### Шаг 9: Создайте пользователя и базу данных для приложения

```bash
sudo -u postgres psql
```

В PostgreSQL консоли выполните:

```sql
-- Создайте пользователя
CREATE USER bazarlar_user WITH PASSWORD 'ваш_сильный_пароль';

-- Создайте базу данных
CREATE DATABASE bazarlar_prod OWNER bazarlar_user;

-- Дайте права
GRANT ALL PRIVILEGES ON DATABASE bazarlar_prod TO bazarlar_user;

-- Для PostgreSQL 15+ также выполните:
\c bazarlar_prod
GRANT ALL ON SCHEMA public TO bazarlar_user;
GRANT CREATE ON SCHEMA public TO bazarlar_user;

-- Выход
\q
```

### Шаг 10: Примените миграции приложения

```bash
cd /var/www/bazarlaronline/backend

# Примените все миграции
for migration in migrations/*.sql; do
    echo "Applying $migration..."
    sudo -u postgres psql -d bazarlar_prod -f "$migration"
done
```

### Шаг 11: Обновите .env файл (если нужно)

PostgreSQL 17 использует тот же порт и настройки, но проверьте .env:

```bash
nano /var/www/bazarlaronline/backend/.env
```

Убедитесь, что:
```env
DATABASE_URL=postgresql+asyncpg://bazarlar_user:ваш_пароль@localhost:5432/bazarlar_prod
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bazarlar_prod
DB_USER=bazarlar_user
DB_PASSWORD=ваш_пароль
```

### Шаг 12: Перезапустите приложение

```bash
sudo systemctl restart bazarlar-api
sudo systemctl restart bazarlar-celery
```

### Шаг 13: Проверьте работу

```bash
# Проверьте подключение к базе данных
psql -h localhost -U bazarlar_user -d bazarlar_prod -c "SELECT COUNT(*) FROM products;"

# Проверьте логи API
sudo journalctl -u bazarlar-api -f
```

---

## Альтернатива: Установить конкретную версию PostgreSQL

Если вам нужна конкретная версия (например, PostgreSQL 16, 15, 14):

```bash
# Посмотрите доступные версии
apt-cache search postgresql | grep postgresql-[0-9]

# Установите нужную версию (например, 15)
sudo apt install -y postgresql-15 postgresql-client-15 postgresql-contrib-15
```

---

## Если нужно оставить PostgreSQL 16

Если PostgreSQL 16 вам подходит и вы хотите его оставить:

```bash
# Просто создайте пользователя и базу данных
sudo -u postgres psql

# В PostgreSQL консоли:
CREATE USER bazarlar_user WITH PASSWORD 'ваш_пароль';
CREATE DATABASE bazarlar_prod OWNER bazarlar_user;
GRANT ALL PRIVILEGES ON DATABASE bazarlar_prod TO bazarlar_user;
\c bazarlar_prod
GRANT ALL ON SCHEMA public TO bazarlar_user;
GRANT CREATE ON SCHEMA public TO bazarlar_user;
\q
```

PostgreSQL 16 - это стабильная и актуальная версия, она отлично подходит для production.

---

## Откат на PostgreSQL 16 (если что-то пошло не так)

Если после обновления возникли проблемы:

```bash
# Остановите PostgreSQL 18
sudo systemctl stop postgresql

# Удалите PostgreSQL 18
sudo apt remove --purge postgresql-18 postgresql-client-18 -y

# Установите PostgreSQL 16
sudo apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16

# Восстановите из backup
sudo -u postgres psql < /var/backups/postgresql/backup_YYYYMMDD_HHMMSS.sql
```

---

## Проверка после обновления

```bash
# 1. Проверьте версию PostgreSQL
sudo -u postgres psql -c "SELECT version();"

# 2. Проверьте статус сервиса
sudo systemctl status postgresql

# 3. Проверьте список баз данных
sudo -u postgres psql -c "\l"

# 4. Проверьте подключение от приложения
psql -h localhost -U bazarlar_user -d bazarlar_prod -c "SELECT current_database();"

# 5. Проверьте таблицы
sudo -u postgres psql -d bazarlar_prod -c "\dt"

# 6. Проверьте логи PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-18-main.log
```

---

## Важные замечания

1. **Всегда делайте backup** перед обновлением!
2. PostgreSQL 16 - это стабильная версия, обновление на 18 не обязательно
3. PostgreSQL 18 - новейшая версия (выпущена 25 сентября 2025)
4. Если у вас уже есть данные в PostgreSQL 16, обязательно создайте backup перед удалением
5. После обновления проверьте работу всех функций приложения

---

## Поддержка версий PostgreSQL

- PostgreSQL 18 - Latest (выпущена 25 сентября 2025)
- PostgreSQL 17 - Stable (выпущена в 2024)
- PostgreSQL 16 - Stable (текущая стабильная)
- PostgreSQL 15 - Stable
- PostgreSQL 14 - Stable
- PostgreSQL 13 и ниже - Legacy

**Рекомендация:** Для production используйте PostgreSQL 16, 17 или 18.
