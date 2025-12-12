# База данных Bazarlar Online

## PostgreSQL 15

Проект использует PostgreSQL 15 для совместимости с VPS сервером beget.com.

## Структура

```
backend/database/
├── init.sql        # Инициализация: создание расширений
├── schema.sql      # Создание схемы БД (таблицы, индексы, constraints)
├── seed_data.sql   # Справочные данные (города, рынки, категории)
└── test_data.sql   # Тестовые данные (пользователи, товары, услуги, заказы)
```

## Быстрый старт

### 1. Запуск Docker контейнера

```bash
docker-compose up -d postgres
```

Файл `init.sql` автоматически выполнится при первом запуске и создаст необходимые расширения PostgreSQL.

### 2. Создание схемы БД

```bash
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql
```

Это создаст все таблицы, индексы и constraints.

### 3. Загрузка справочных данных

```bash
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/seed_data.sql
```

Это загрузит:
- 15 городов Кыргызстана
- 10 рынков
- 87 категорий (3 уровня)

### 4. Загрузка тестовых данных (опционально)

```bash
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/test_data.sql
```

Это создаст:
- 2 базовых пользователя (admin, seller)
- 5 продавцов товаров
- 4 продавца услуг
- 5 покупателей
- 10 товаров
- 8 услуг
- 5 заказов
- 5 записей на услуги
- 7 отзывов

## Полная переустановка БД

Если нужно полностью пересоздать базу данных:

```bash
# 1. Остановить контейнеры
docker-compose down

# 2. Удалить volume с данными PostgreSQL
docker volume rm bazarlaronline_postgres_data

# 3. Запустить PostgreSQL заново
docker-compose up -d postgres

# 4. Создать схему
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql

# 5. Загрузить справочные данные
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/seed_data.sql

# 6. (Опционально) Загрузить тестовые данные
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/test_data.sql
```

## Альтернативный способ через скрипт

Создайте файл `setup_db.sh`:

```bash
#!/bin/bash

echo "Создание схемы БД..."
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/schema.sql

echo "Загрузка справочных данных..."
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/seed_data.sql

echo "Загрузка тестовых данных..."
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/database/test_data.sql

echo "✓ База данных готова!"
```

Сделайте его исполняемым и запустите:

```bash
chmod +x setup_db.sh
./setup_db.sh
```

## Подключение к БД

### Из Docker контейнера

```bash
docker exec -it bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude
```

### С хоста (если порт 54320 открыт)

```bash
psql -h localhost -p 54320 -U bazarlar_user -d bazarlar_claude
```

Пароль: `bazarlar_pass` (из docker-compose.yml)

## Схема базы данных

### Таблицы

1. **Справочные данные**
   - `cities` - Города
   - `markets` - Рынки
   - `categories` - Категории (4 уровня)

2. **Пользователи**
   - `users` - Пользователи
   - `seller_profiles` - Профили продавцов
   - `wallets` - Кошельки

3. **Товары и услуги**
   - `products` - Товары и услуги
   - `auto_promotions` - Автопродвижение

4. **Заказы**
   - `orders` - Заказы товаров
   - `bookings` - Записи на услуги
   - `reviews` - Отзывы

5. **Транзакции**
   - `transactions` - Транзакции
   - `withdrawal_requests` - Заявки на вывод средств

6. **Взаимодействие**
   - `chats` - Чаты
   - `messages` - Сообщения
   - `notifications` - Уведомления

7. **Дополнительно**
   - `favorites` - Избранное
   - `view_history` - История просмотров
   - `reports` - Жалобы
   - `coupons` - Купоны
   - `coupon_usage` - Использование купонов

## Расширения PostgreSQL

Проект использует следующие расширения:

- `uuid-ossp` - Генерация UUID
- `pgcrypto` - Криптографические функции
- `pg_trgm` - Полнотекстовый поиск

Все расширения совместимы с PostgreSQL 15.

## Резервное копирование

### Создание бэкапа

```bash
docker exec bazarlar_postgres pg_dump -U bazarlar_user -d bazarlar_claude > backup.sql
```

### Восстановление из бэкапа

```bash
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backup.sql
```

## Production deployment (beget.com)

На production сервере beget.com:

1. Выполните только `schema.sql` и `seed_data.sql`
2. НЕ загружайте `test_data.sql` на production
3. Используйте безопасные пароли (измените в docker-compose.yml)

## Помощь

Если возникли проблемы:

1. Проверьте статус контейнера: `docker-compose ps`
2. Просмотрите логи: `docker-compose logs postgres`
3. Проверьте подключение: `docker exec bazarlar_postgres pg_isready`

Для получения полного списка таблиц:

```sql
\dt
```

Для просмотра структуры таблицы:

```sql
\d+ table_name
```
