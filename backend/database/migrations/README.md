# Миграции базы данных

Этот каталог содержит SQL миграции для обновления структуры базы данных.

## Как применить миграцию

### Вариант 1: Через Docker (рекомендуется)

```bash
# Применить миграцию в Docker контейнере
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/migrations/remove_telegram_fields.sql
```

### Вариант 2: Локально

```bash
# Применить миграцию локально
psql -U bazarlar_user -d bazarlar_claude < backend/database/migrations/remove_telegram_fields.sql
```

### Вариант 3: Через pgAdmin или другой GUI клиент

1. Откройте файл миграции
2. Скопируйте содержимое
3. Выполните в SQL редакторе вашего GUI клиента

## Список миграций

### remove_telegram_fields.sql
**Дата:** 2025-12-12
**Описание:** Удаляет поля `telegram_id` и `telegram_username` из таблицы `users`, так как Telegram авторизация больше не поддерживается.

**Изменения:**
- Удаляет столбец `telegram_id` из таблицы `users`
- Удаляет столбец `telegram_username` из таблицы `users`

**Откат (если нужно):**
```sql
ALTER TABLE users ADD COLUMN telegram_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN telegram_username VARCHAR(255);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
```

## Важно

- Всегда делайте резервную копию базы данных перед применением миграций
- Миграции должны применяться в порядке их создания
- Миграции идемпотентны - их можно применять повторно без ошибок
