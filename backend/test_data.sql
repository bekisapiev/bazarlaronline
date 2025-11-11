-- Тестовые данные для Bazarlar Online
-- Запуск: psql -U postgres -d bazarlar_claude -f test_data.sql

-- Города
INSERT INTO cities (id, name, slug) VALUES
(1, 'Бишкек', 'bishkek'),
(2, 'Ош', 'osh'),
(3, 'Джалал-Абад', 'jalal-abad'),
(4, 'Каракол', 'karakol'),
(5, 'Токмок', 'tokmok')
ON CONFLICT (id) DO NOTHING;

-- Рынки в Бишкеке
INSERT INTO markets (id, city_id, name, slug, address, latitude, longitude) VALUES
(1, 1, 'Дордой', 'dordoy', 'ул. Шабдан Баатыра', 42.8924, 74.6340),
(2, 1, 'Ошский рынок', 'oshskiy', 'ул. Киевская', 42.8746, 74.6122),
(3, 1, 'Ортосайский рынок', 'ortosay', 'ул. Ахунбаева', 42.8544, 74.6206),
(4, 1, 'Аламединский рынок', 'alamedinsky', 'ул. Ибраимова', 42.8489, 74.5899),
(5, 1, 'Ак-Эмир', 'ak-emir', 'ул. Горького', 42.8704, 74.5946)
ON CONFLICT (id) DO NOTHING;

-- Рынки в Оше
INSERT INTO markets (id, city_id, name, slug, address) VALUES
(6, 2, 'Жайма', 'jayma', 'Ошский базар'),
(7, 2, 'Кара-Суу', 'kara-suu', 'Кара-Суйский рынок')
ON CONFLICT (id) DO NOTHING;

-- Категории уровня 1
INSERT INTO categories (id, parent_id, name, slug, level, icon, sort_order, is_active) VALUES
(1, NULL, 'Одежда', 'clothing', 1, '👕', 1, true),
(2, NULL, 'Обувь', 'shoes', 1, '👟', 2, true),
(3, NULL, 'Электроника', 'electronics', 1, '📱', 3, true),
(4, NULL, 'Продукты питания', 'food', 1, '🍎', 4, true),
(5, NULL, 'Товары для дома', 'home', 1, '🏠', 5, true),
(6, NULL, 'Косметика', 'beauty', 1, '💄', 6, true),
(7, NULL, 'Детские товары', 'kids', 1, '🧸', 7, true),
(8, NULL, 'Спорт', 'sport', 1, '⚽', 8, true)
ON CONFLICT (id) DO NOTHING;

-- Категории уровня 2 (Одежда)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active) VALUES
(11, 1, 'Мужская одежда', 'men-clothing', 2, 1, true),
(12, 1, 'Женская одежда', 'women-clothing', 2, 2, true),
(13, 1, 'Верхняя одежда', 'outerwear', 2, 3, true),
(14, 1, 'Аксессуары', 'accessories', 2, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Категории уровня 2 (Электроника)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active) VALUES
(31, 3, 'Смартфоны', 'smartphones', 2, 1, true),
(32, 3, 'Ноутбуки', 'laptops', 2, 2, true),
(33, 3, 'Бытовая техника', 'appliances', 2, 3, true),
(34, 3, 'Аудио', 'audio', 2, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Категории уровня 3 (Смартфоны)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active) VALUES
(311, 31, 'iPhone', 'iphone', 3, 1, true),
(312, 31, 'Samsung', 'samsung', 3, 2, true),
(313, 31, 'Xiaomi', 'xiaomi', 3, 3, true),
(314, 31, 'Другие бренды', 'other-phones', 3, 4, true)
ON CONFLICT (id) DO NOTHING;

-- Тестовый админ (замените email на свой)
-- Пароль нужно будет установить через OAuth
INSERT INTO users (id, email, full_name, role, tariff, created_at, is_banned)
VALUES (
    gen_random_uuid(),
    'admin@bazarlar.online',
    'Администратор',
    'admin',
    'business',
    NOW(),
    false
)
ON CONFLICT (email) DO NOTHING;

-- Тестовый продавец
INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
VALUES (
    gen_random_uuid(),
    'seller@bazarlar.online',
    'Тестовый Продавец',
    '+996555123456',
    'seller',
    'pro',
    NOW(),
    false
)
ON CONFLICT (email) DO NOTHING;

-- Примечание: После запуска этого скрипта таблицы будут заполнены базовыми данными
-- Для создания товаров, используйте API endpoints через Swagger UI

COMMIT;
