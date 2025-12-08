# Экспорт и импорт базы данных PostgreSQL

Эта инструкция поможет вам перенести локальную базу данных на production сервер.

## Метод 1: Экспорт и импорт через pg_dump (рекомендуется)

### Шаг 1: Экспортируйте локальную базу данных

#### На Windows (локальный компьютер):

```powershell
# Откройте PowerShell или Command Prompt

# Перейдите в директорию PostgreSQL bin (если не в PATH)
cd "C:\Program Files\PostgreSQL\18\bin"

# Экспортируйте базу данных в файл
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude -F c -b -v -f "C:\backup\bazarlar_backup.dump"

# Или экспорт в SQL формате (текстовый)
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude --no-owner --no-acl -f "C:\backup\bazarlar_backup.sql"
```

**Параметры:**
- `-h localhost` - хост базы данных
- `-U bazarlar_user` - имя пользователя
- `-d bazarlar_claude` - имя базы данных
- `-F c` - формат custom (бинарный, сжатый)
- `-b` - включить большие объекты
- `-v` - verbose (подробный вывод)
- `-f` - файл назначения
- `--no-owner` - не восстанавливать владельцев объектов
- `--no-acl` - не восстанавливать права доступа

#### На Linux (если база на Linux):

```bash
# Создайте директорию для backup
mkdir -p ~/backups

# Экспортируйте базу данных
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude -F c -b -v -f ~/backups/bazarlar_backup.dump

# Или в SQL формате
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude --no-owner --no-acl -f ~/backups/bazarlar_backup.sql
```

### Шаг 2: Перенесите dump на сервер Beget

#### Вариант A: Через SCP (с Linux/Mac или Git Bash на Windows)

```bash
# Используйте SCP для копирования файла
scp ~/backups/bazarlar_backup.sql bazarlar@your_server_ip:/tmp/

# Или с Windows (через Git Bash или WSL):
scp "C:\backup\bazarlar_backup.sql" bazarlar@your_server_ip:/tmp/
```

#### Вариант B: Через SFTP (FileZilla, WinSCP)

1. Откройте FileZilla или WinSCP
2. Подключитесь к серверу по SFTP:
   - Host: `your_server_ip`
   - Username: `bazarlar`
   - Password: ваш пароль
   - Port: 22
3. Загрузите файл `bazarlar_backup.sql` в директорию `/tmp/` на сервере

#### Вариант C: Через wget/curl (если файл в интернете)

```bash
# На сервере:
cd /tmp
wget https://your-storage.com/bazarlar_backup.sql
```

### Шаг 3: На сервере создайте базу данных

```bash
# Подключитесь к серверу по SSH
ssh bazarlar@your_server_ip

# Создайте базу данных и пользователя
sudo -u postgres psql
```

В PostgreSQL консоли:

```sql
-- Создайте пользователя
CREATE USER bazarlar_user WITH PASSWORD 'ваш_сильный_пароль';

-- Создайте базу данных
CREATE DATABASE bazarlar_prod OWNER bazarlar_user;

-- Дайте права
GRANT ALL PRIVILEGES ON DATABASE bazarlar_prod TO bazarlar_user;

-- Подключитесь к базе данных
\c bazarlar_prod

-- Дайте права на схему public (для PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO bazarlar_user;
GRANT CREATE ON SCHEMA public TO bazarlar_user;

-- Выход
\q
```

### Шаг 4: Импортируйте данные на сервере

#### Если использовали custom формат (.dump):

```bash
# Восстановите из custom dump
pg_restore -h localhost -U bazarlar_user -d bazarlar_prod -v /tmp/bazarlar_backup.dump

# С очисткой существующих данных
pg_restore -h localhost -U bazarlar_user -d bazarlar_prod -c -v /tmp/bazarlar_backup.dump
```

#### Если использовали SQL формат (.sql):

```bash
# Восстановите из SQL файла
psql -h localhost -U bazarlar_user -d bazarlar_prod -f /tmp/bazarlar_backup.sql

# Или через sudo если нужны права
sudo -u postgres psql -d bazarlar_prod -f /tmp/bazarlar_backup.sql
```

### Шаг 5: Проверьте импорт

```bash
# Подключитесь к базе данных
psql -h localhost -U bazarlar_user -d bazarlar_prod

# В PostgreSQL консоли проверьте таблицы
\dt

# Проверьте количество записей
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;

# Выход
\q
```

---

## Метод 2: Прямой dump через pipe (быстрее)

Если у вас быстрый интернет, можно сделать прямой dump:

```bash
# С локального компьютера напрямую на удаленный сервер
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude --no-owner --no-acl | \
  ssh bazarlar@your_server_ip "psql -h localhost -U bazarlar_user -d bazarlar_prod"
```

---

## Метод 3: Экспорт только схемы или только данных

### Только схема (структура таблиц):

```bash
# Экспорт только схемы
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude --schema-only -f schema.sql

# Импорт схемы
psql -h localhost -U bazarlar_user -d bazarlar_prod -f schema.sql
```

### Только данные:

```bash
# Экспорт только данных
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude --data-only -f data.sql

# Импорт данных
psql -h localhost -U bazarlar_user -d bazarlar_prod -f data.sql
```

---

## Метод 4: Экспорт конкретных таблиц

```bash
# Экспорт конкретной таблицы
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude -t products -f products.sql

# Экспорт нескольких таблиц
pg_dump -h localhost -U bazarlar_user -d bazarlar_claude -t products -t users -t orders -f tables.sql

# Импорт
psql -h localhost -U bazarlar_user -d bazarlar_prod -f products.sql
```

---

## Решение проблем

### Ошибка: "role does not exist"

```bash
# Создайте пользователя перед импортом
sudo -u postgres createuser -P bazarlar_user
```

### Ошибка: "database does not exist"

```bash
# Создайте базу данных
sudo -u postgres createdb -O bazarlar_user bazarlar_prod
```

### Ошибка: "permission denied for schema public"

```sql
-- В psql выполните:
\c bazarlar_prod
GRANT ALL ON SCHEMA public TO bazarlar_user;
GRANT CREATE ON SCHEMA public TO bazarlar_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bazarlar_user;
```

### Ошибка: "must be owner of extension"

```bash
# Импортируйте от имени postgres, затем измените владельца
sudo -u postgres psql -d bazarlar_prod -f /tmp/bazarlar_backup.sql

# Затем измените владельца таблиц
sudo -u postgres psql -d bazarlar_prod
```

```sql
-- Измените владельца всех таблиц
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO bazarlar_user;';
    END LOOP;
END $$;

-- Измените владельца базы данных
ALTER DATABASE bazarlar_prod OWNER TO bazarlar_user;
```

### Большой размер dump файла

```bash
# Сжмите dump
gzip bazarlar_backup.sql

# Перенесите сжатый файл
scp bazarlar_backup.sql.gz bazarlar@your_server_ip:/tmp/

# На сервере распакуйте и импортируйте
gunzip /tmp/bazarlar_backup.sql.gz
psql -h localhost -U bazarlar_user -d bazarlar_prod -f /tmp/bazarlar_backup.sql
```

### Медленный импорт

```bash
# Временно отключите триггеры и индексы для быстрого импорта
psql -h localhost -U bazarlar_user -d bazarlar_prod << EOF
SET session_replication_role = replica; -- Отключить триггеры
\i /tmp/bazarlar_backup.sql
SET session_replication_role = DEFAULT; -- Включить триггеры
REINDEX DATABASE bazarlar_prod; -- Пересоздать индексы
EOF
```

---

## После импорта

### 1. Обновите последовательности (sequences)

```sql
-- Если после импорта ID не работают правильно
SELECT 'SELECT SETVAL(' ||
       quote_literal(quote_ident(sequence_namespace.nspname) || '.' || quote_ident(class_sequence.relname)) ||
       ', COALESCE(MAX(' ||quote_ident(pg_attribute.attname)|| '), 1) ) FROM ' ||
       quote_ident(table_namespace.nspname)|| '.'||quote_ident(class_table.relname)|| ';'
FROM pg_depend
    INNER JOIN pg_class AS class_sequence
        ON class_sequence.oid = pg_depend.objid
            AND class_sequence.relkind = 'S'
    INNER JOIN pg_class AS class_table
        ON class_table.oid = pg_depend.refobjid
    INNER JOIN pg_attribute
        ON pg_attribute.attrelid = class_table.oid
            AND pg_depend.refobjsubid = pg_attribute.attnum
    INNER JOIN pg_namespace as table_namespace
        ON table_namespace.oid = class_table.relnamespace
    INNER JOIN pg_namespace AS sequence_namespace
        ON sequence_namespace.oid = class_sequence.relnamespace;
```

### 2. Проверьте права доступа

```bash
# Проверьте права на таблицы
psql -h localhost -U bazarlar_user -d bazarlar_prod -c "\dp"

# Проверьте права на схемы
psql -h localhost -U bazarlar_user -d bazarlar_prod -c "\dn+"
```

### 3. Запустите ANALYZE

```sql
-- Обновите статистику для оптимизатора запросов
ANALYZE;
```

### 4. Проверьте данные

```bash
# Сравните количество записей
psql -h localhost -U bazarlar_user -d bazarlar_prod -c "
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
"
```

---

## Автоматизация: Скрипт для полного экспорта и импорта

Создайте файл `migrate-database.sh`:

```bash
#!/bin/bash

# Конфигурация
SOURCE_HOST="localhost"
SOURCE_USER="bazarlar_user"
SOURCE_DB="bazarlar_claude"
TARGET_HOST="your_server_ip"
TARGET_USER="bazarlar_user"
TARGET_DB="bazarlar_prod"
BACKUP_FILE="/tmp/bazarlar_migration_$(date +%Y%m%d_%H%M%S).sql"

echo "=== PostgreSQL Database Migration ==="
echo ""

# 1. Экспорт
echo "1. Exporting database from $SOURCE_DB..."
pg_dump -h $SOURCE_HOST -U $SOURCE_USER -d $SOURCE_DB --no-owner --no-acl -f $BACKUP_FILE
echo "✓ Export completed: $BACKUP_FILE"
echo ""

# 2. Копирование на сервер
echo "2. Copying backup to server..."
scp $BACKUP_FILE $TARGET_USER@$TARGET_HOST:/tmp/
echo "✓ Copy completed"
echo ""

# 3. Импорт на сервере
echo "3. Importing to $TARGET_DB..."
ssh $TARGET_USER@$TARGET_HOST "psql -h localhost -U $TARGET_USER -d $TARGET_DB -f /tmp/$(basename $BACKUP_FILE)"
echo "✓ Import completed"
echo ""

# 4. Очистка
echo "4. Cleaning up..."
rm $BACKUP_FILE
ssh $TARGET_USER@$TARGET_HOST "rm /tmp/$(basename $BACKUP_FILE)"
echo "✓ Cleanup completed"
echo ""

echo "=== Migration completed successfully! ==="
```

Использование:

```bash
chmod +x migrate-database.sh
./migrate-database.sh
```

---

## Полезные команды

```bash
# Узнать размер базы данных
psql -c "SELECT pg_size_pretty(pg_database_size('bazarlar_prod'));"

# Узнать размер всех таблиц
psql -d bazarlar_prod -c "
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Проверить активные подключения
psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'bazarlar_prod';"

# Завершить все подключения к базе (перед удалением)
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'bazarlar_prod' AND pid <> pg_backend_pid();"
```

---

**Готово!** Ваша база данных должна быть успешно перенесена на production сервер.
