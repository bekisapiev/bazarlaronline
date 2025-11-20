# Миграции базы данных

Этот каталог содержит SQL миграции для обновления схемы базы данных.

## Обзор изменений

### Миграция 001: Разделение товаров и услуг

**Файлы:**
- `001_add_product_type_and_bookings.sql` - основная миграция
- `002_update_existing_products.sql` - обновление существующих данных

**Что добавлено:**

1. **Поле `product_type` в таблице `products`**
   - Значения: `'product'` (товар) или `'service'` (услуга)
   - Значение по умолчанию: `'product'`
   - Индекс для быстрой фильтрации

2. **Таблица `bookings` для записей на услуги**
   - Информация о клиенте (имя, телефон)
   - Дата и время записи
   - Комментарий клиента
   - Статус: pending, confirmed, cancelled, completed
   - Связь с продавцом, услугой и покупателем (опционально)

**Логика работы:**

- **Товары** (product): Заказываются через таблицу `orders` (быстрый заказ или с корзиной)
- **Услуги** (service): Записи создаются в таблице `bookings` с указанием времени и даты

## Порядок применения миграций

**ВАЖНО:** Выполняйте миграции строго по порядку через `psql`!

### Шаг 1: Применить основную миграцию

```bash
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/001_add_product_type_and_bookings.sql
```

Эта миграция:
- Добавит поле `product_type` в таблицу `products`
- Создаст таблицу `bookings`
- Установит `product_type = 'product'` для всех существующих товаров

### Шаг 2 (опционально): Обновить существующие данные

Если после миграции были добавлены продукты без указания `product_type`:

```bash
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/migrations/002_update_existing_products.sql
```

### Шаг 3: Загрузить тестовые данные услуг

После применения миграции можно загрузить тестовые данные с услугами и записями:

```bash
docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/test_data_services_bookings.sql
```

Это добавит:
- 4 продавца услуг (парикмахер, репетитор, мастер маникюра, массажист)
- 8 услуг
- 10 записей на услуги

## Проверка после миграции

```sql
-- Проверить структуру таблицы products
\d products

-- Проверить структуру таблицы bookings
\d bookings

-- Посмотреть статистику
SELECT product_type, COUNT(*) FROM products GROUP BY product_type;

-- Посмотреть записи
SELECT status, COUNT(*) FROM bookings GROUP BY status;
```

## Откат миграции (если нужно)

**ВНИМАНИЕ:** Откат удалит все записи (bookings) и данные о типе продукта!

```sql
BEGIN;

-- Удалить таблицу bookings
DROP TABLE IF EXISTS bookings CASCADE;

-- Удалить поле product_type
ALTER TABLE products DROP COLUMN IF EXISTS product_type;

-- Удалить индексы
DROP INDEX IF EXISTS idx_products_product_type;

COMMIT;
```

## Структура таблицы bookings

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES products(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    buyer_id UUID REFERENCES users(id),  -- опционально
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    booking_datetime TIMESTAMP NOT NULL,
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
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

## Техническая поддержка

Если возникли проблемы:

1. Проверьте логи контейнера:
   ```bash
   docker logs bazarlar_postgres
   ```

2. Проверьте, что миграция применена:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'products' AND column_name = 'product_type';
   ```

3. Проверьте, что таблица bookings создана:
   ```sql
   SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_name = 'bookings'
   );
   ```

---

**Создано**: 2025-11-20
**Версия**: 1.0
