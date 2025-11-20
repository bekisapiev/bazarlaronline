# Миграции базы данных

## Структура миграций

### 001_create_tables.sql
**Создание всех таблиц базы данных** (DDL)

Включает:
- PostgreSQL расширения (uuid-ossp, pgcrypto)
- ENUM типы (report_status_enum, report_type_enum, и др.)
- 21 таблицу:
  - cities, markets, categories (справочники)
  - users, seller_profiles, wallets (пользователи)
  - products (товары и услуги с полем product_type)
  - orders, bookings (заказы и записи на услуги)
  - reviews (отзывы на товары и услуги)
  - chats, messages, notifications
  - favorites, view_history, auto_promotions
  - reports, coupons, coupon_usage
  - transactions, withdrawal_requests

### 002_reference_data.sql
**Справочные данные для Кыргызстана** (реальные, не тестовые)

Включает:
- **15 городов**: Бишкек, Ош, Джалал-Абад, Каракол, и др.
- **10 рынков**: Дордой, Ошский базар, и др. (с реальными адресами)
- **87 категорий** в 3-уровневой иерархии:
  - Уровень 1: Одежда, Электроника, Продукты питания, Услуги и др.
  - Уровень 2: подкатегории
  - Уровень 3: детальные категории

### 003_test_data.sql
**Тестовые данные для разработки**

Включает:
- Продавцов товаров (5 человек)
- Продавцов услуг (4 человека: парикмахер, репетитор, маникюр, массаж)
- Товары (30 шт, product_type='product')
- Услуги (8 шт, product_type='service')
- Покупателей (5 человек)
- Заказы товаров (20 шт)
- Записи на услуги (10 шт)
- Отзывы (25 шт - на товары и услуги)

## Способы запуска

### Вариант 1: Через Docker (psql)

```bash
# Все миграции сразу
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/001_create_tables.sql
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/002_reference_data.sql
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/003_test_data.sql
```

### Вариант 2: Через Python скрипт (рекомендуется)

**Установка зависимостей:**
```bash
pip install -r backend/migrations/requirements.txt
```

**Настройка .env:**
```bash
cp .env.example .env
# Отредактируйте DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

**Запуск:**
```bash
# Все миграции
python backend/migrations/run_migrations.py

# Только структура (таблицы)
python backend/migrations/run_migrations.py --schema-only

# Только данные
python backend/migrations/run_migrations.py --data-only

# Только тестовые данные
python backend/migrations/run_migrations.py --test-data-only
```

**Сброс БД:**
```bash
python backend/migrations/drop_all_tables.py
```

## Подробная документация

- [PYTHON_SETUP.md](./PYTHON_SETUP.md) - Детальная инструкция по запуску через Python

## Логика работы

### Товары vs Услуги

**Товары** (product_type='product'):
- Заказываются через таблицу `orders`
- Быстрый заказ или корзина
- После выполнения можно оставить отзыв (review с order_id)

**Услуги** (product_type='service'):
- Записываются через таблицу `bookings`
- Указываются: имя, телефон, дата/время, комментарий
- Могут быть от зарегистрированных и незарегистрированных пользователей
- После выполнения можно оставить отзыв (review с booking_id)

### Отзывы

Таблица `reviews` поддерживает отзывы для:
- Заказов товаров (order_id NOT NULL, booking_id NULL)
- Записей на услуги (booking_id NOT NULL, order_id NULL)

CHECK constraint гарантирует, что заполнен либо order_id, либо booking_id, но не оба сразу.

## Порядок выполнения

⚠️ **ВАЖНО**: Миграции должны выполняться строго по порядку:

1. Сначала `001_create_tables.sql` (структура)
2. Затем `002_reference_data.sql` (справочники)
3. Затем `003_test_data.sql` (тестовые данные)

Нарушение порядка приведет к ошибкам внешних ключей.

## Требования

- PostgreSQL 12+
- Права на создание таблиц, расширений и ENUM типов
- Пользователь и база данных должны быть созданы заранее

## Создание БД вручную

```sql
-- Подключитесь к PostgreSQL
psql -U postgres

-- Создайте пользователя и БД
CREATE USER bazarlar_user WITH PASSWORD 'bazarlar_pass';
CREATE DATABASE bazarlar_claude OWNER bazarlar_user;
GRANT ALL PRIVILEGES ON DATABASE bazarlar_claude TO bazarlar_user;

-- Выход
\q
```

## Использование в приложении

### Создание товара

```python
product = Product(
    seller_id=seller_id,
    product_type='product',  # товар
    title='iPhone 15 Pro',
    price=85000,
    # ... другие поля
)
```

### Создание услуги

```python
service = Product(
    seller_id=seller_id,
    product_type='service',  # услуга
    title='Стрижка мужская',
    price=500,
    # ... другие поля
)
```

### Создание записи на услугу

```python
booking = Booking(
    service_id=service_id,
    seller_id=seller_id,
    buyer_id=buyer_id,  # может быть NULL для незарегистрированных
    customer_name='Иван Иванов',
    customer_phone='+996555123456',
    booking_datetime=datetime(2025, 11, 25, 14, 0),  # дата и время записи
    comment='Хочу модельную стрижку',
    status='pending'
)
```

### Создание отзыва на товар

```python
review = Review(
    seller_id=seller_id,
    buyer_id=buyer_id,
    order_id=order_id,  # для товара
    booking_id=None,
    rating=9,
    comment='Отличный товар!'
)
```

### Создание отзыва на услугу

```python
review = Review(
    seller_id=seller_id,
    buyer_id=buyer_id,
    order_id=None,
    booking_id=booking_id,  # для услуги
    rating=10,
    comment='Замечательный мастер!'
)
```

## Проверка после миграции

```sql
-- Проверить структуру таблицы products
\d products

-- Проверить структуру таблицы bookings
\d bookings

-- Проверить структуру таблицы reviews
\d reviews

-- Посмотреть статистику
SELECT product_type, COUNT(*) FROM products GROUP BY product_type;

-- Посмотреть записи
SELECT status, COUNT(*) FROM bookings GROUP BY status;

-- Посмотреть отзывы
SELECT
    COUNT(*) FILTER (WHERE order_id IS NOT NULL) as reviews_on_products,
    COUNT(*) FILTER (WHERE booking_id IS NOT NULL) as reviews_on_services
FROM reviews;
```

---

**Создано**: 2025-11-20
**Версия**: 2.0
