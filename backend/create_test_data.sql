-- =====================================================================
-- Полный набор тестовых данных для Bazarlar Online
-- =====================================================================
-- Включает: города, рынки, категории, продавцов, товары, покупателей, заказы и отзывы
-- Запуск: docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/create_test_data.sql
-- =====================================================================

BEGIN;

-- =====================================================================
-- СПРАВОЧНЫЕ ДАННЫЕ
-- =====================================================================

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

-- =====================================================================
-- ПОЛЬЗОВАТЕЛИ: Администраторы и базовые продавцы
-- =====================================================================

-- Тестовый админ
INSERT INTO users (id, email, full_name, role, tariff, referral_id, created_at, is_banned)
VALUES (
    gen_random_uuid(),
    'admin@bazarlar.online',
    'Администратор',
    'admin',
    'business',
    upper(substr(md5(random()::text), 1, 12)),
    NOW(),
    false
)
ON CONFLICT (email) DO NOTHING;

-- Тестовый продавец
INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
VALUES (
    gen_random_uuid(),
    'seller@bazarlar.online',
    'Тестовый Продавец',
    '+996555123456',
    'seller',
    'pro',
    upper(substr(md5(random()::text), 1, 12)),
    NOW(),
    false
)
ON CONFLICT (email) DO NOTHING;

-- =====================================================================
-- ПРОДАВЦЫ И ТОВАРЫ
-- =====================================================================

DO $$
DECLARE
    seller1_id UUID := gen_random_uuid();
    seller2_id UUID := gen_random_uuid();
    seller3_id UUID := gen_random_uuid();
    seller4_id UUID := gen_random_uuid();
    seller5_id UUID := gen_random_uuid();
    seller6_id UUID := gen_random_uuid();
    seller7_id UUID := gen_random_uuid();
    seller8_id UUID := gen_random_uuid();
    seller9_id UUID := gen_random_uuid();
    seller10_id UUID := gen_random_uuid();

BEGIN
    -- Продавец 1: Магазин одежды на Дордое
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller1_id, 'seller1@test.com', 'Айгуль Асанова', '+996555111111', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller1_id, 'Модный стиль', 'Женская и мужская одежда высокого качества', 1, 1, 'market', 1, 'Дордой, контейнер 456', 4.8, 127, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 2: Магазин электроники
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller2_id, 'seller2@test.com', 'Тимур Бекмуратов', '+996555222222', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller2_id, 'TechnoShop', 'Смартфоны, ноутбуки, аксессуары', 3, 1, 'boutique', NULL, 'ул. Чуй 156', 4.9, 245, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 3: Продукты питания
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller3_id, 'seller3@test.com', 'Нургуль Токтогулова', '+996555333333', 'seller', 'free', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller3_id, 'Фермерские продукты', 'Свежие овощи, фрукты, молочные продукты', 4, 1, 'market', 2, 'Ошский рынок, ряд 3', 4.5, 89, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 4: Обувь
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller4_id, 'seller4@test.com', 'Эрлан Шаршеев', '+996555444444', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller4_id, 'Обувной мир', 'Турецкая и итальянская обувь', 2, 1, 'shop', NULL, 'ТЦ Вефа, 2 этаж', 4.7, 156, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 5: Косметика
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller5_id, 'seller5@test.com', 'Жанара Исакова', '+996555555555', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller5_id, 'BeautyKG', 'Корейская и европейская косметика', 6, 1, 'office', NULL, 'ул. Токтогула 123, офис 45', 4.9, 312, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 6: Детские товары
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller6_id, 'seller6@test.com', 'Назира Абдиева', '+996555666666', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller6_id, 'Детский рай', 'Игрушки, одежда, коляски', 7, 1, 'shop', NULL, 'ТЦ Дордой Плаза', 4.6, 198, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 7: Спорттовары
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller7_id, 'seller7@test.com', 'Азамат Мураталиев', '+996555777777', 'seller', 'free', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller7_id, 'Спорт Лайф', 'Спортивная одежда и инвентарь', 8, 1, 'mobile', NULL, 'Доставка по всему городу', 4.3, 67, false)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 8: Товары для дома (Ош)
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller8_id, 'seller8@test.com', 'Гулнара Сыдыкова', '+996555888888', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller8_id, 'Уют и комфорт', 'Текстиль, посуда, декор', 5, 2, 'market', 6, 'Рынок Жайма, секция Б', 4.7, 134, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 9: Одежда (Ош)
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller9_id, 'seller9@test.com', 'Бактыгуль Жумабаева', '+996555999999', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller9_id, 'Silk Road Fashion', 'Традиционная и современная одежда', 1, 2, 'boutique', NULL, 'ул. Ленина 78', 4.8, 201, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 10: Электроника (Джалал-Абад)
    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES (seller10_id, 'seller10@test.com', 'Эмир Алиев', '+996555000000', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller10_id, 'Gadget Store', 'Гаджеты и аксессуары', 3, 3, 'shop', NULL, 'Центральный рынок', 4.5, 92, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Товары продавца 1 (Одежда)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller1_id, 'Мужская футболка polo', 'Качественная хлопковая футболка с воротником polo', 11, 1200, 999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"M, L, XL"},{"name":"Цвет","value":"Белый, Черный, Синий"},{"name":"Материал","value":"100% хлопок"}]', '["https://placehold.co/600x400/4A90E2/FFF?text=Polo+Shirt"]', 'active', 145, NOW()),
    (seller1_id, 'Женское платье летнее', 'Легкое летнее платье из натуральной ткани', 12, 2500, 1999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"S, M, L"},{"name":"Цвет","value":"Розовый, Голубой"},{"name":"Материал","value":"Лен"}]', '["https://placehold.co/600x400/FF6B9D/FFF?text=Summer+Dress"]', 'active', 238, NOW()),
    (seller1_id, 'Джинсы мужские классические', 'Плотные джинсы прямого кроя', 11, 3500, 2999, 'paid', '["taxi"]', '[{"name":"Размер","value":"30-36"},{"name":"Цвет","value":"Синий, Черный"}]', '["https://placehold.co/600x400/2C3E50/FFF?text=Jeans"]', 'active', 189, NOW()),
    (seller1_id, 'Зимняя куртка', 'Теплая зимняя куртка с капюшоном', 13, 5500, 4999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"M, L, XL, XXL"},{"name":"Цвет","value":"Черный, Темно-синий"}]', '["https://placehold.co/600x400/34495E/FFF?text=Winter+Jacket"]', 'active', 276, NOW()),
    (seller1_id, 'Шарф кашемировый', 'Мягкий кашемировый шарф', 14, 1800, NULL, 'paid', '["taxi"]', '[{"name":"Цвет","value":"Бежевый, Серый, Бордовый"}]', '["https://placehold.co/600x400/95A5A6/FFF?text=Scarf"]', 'active', 92, NOW());

    -- Товары продавца 2 (Электроника)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller2_id, 'iPhone 15 Pro 256GB', 'Новый iPhone 15 Pro с титановым корпусом', 311, 85000, 82000, 'free', '["express", "courier"]', '[{"name":"Память","value":"256GB"},{"name":"Цвет","value":"Титан"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/000000/FFF?text=iPhone+15+Pro"]', 'active', 512, NOW()),
    (seller2_id, 'Samsung Galaxy S24 Ultra', 'Флагманский смартфон Samsung с S Pen', 312, 75000, 72000, 'free', '["express", "courier"]', '[{"name":"Память","value":"512GB"},{"name":"Цвет","value":"Черный"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/1428A0/FFF?text=Galaxy+S24"]', 'active', 445, NOW()),
    (seller2_id, 'Xiaomi Redmi Note 13 Pro', 'Смартфон с отличной камерой', 313, 22000, 19999, 'free', '["express", "courier"]', '[{"name":"Память","value":"256GB"},{"name":"Цвет","value":"Синий, Черный"}]', '["https://placehold.co/600x400/FF6900/FFF?text=Redmi+Note"]', 'active', 678, NOW()),
    (seller2_id, 'MacBook Pro 14 M3', 'Ноутбук для профессионалов', 32, 120000, 115000, 'free', '["courier"]', '[{"name":"Процессор","value":"Apple M3"},{"name":"Память","value":"16GB RAM, 512GB SSD"},{"name":"Цвет","value":"Space Gray"}]', '["https://placehold.co/600x400/A2AAAD/FFF?text=MacBook+Pro"]', 'active', 389, NOW()),
    (seller2_id, 'AirPods Pro 2', 'Беспроводные наушники с шумоподавлением', 34, 18000, 16999, 'free', '["express", "courier"]', '[{"name":"Особенности","value":"ANC, Прозрачный режим"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/FFFFFF/000?text=AirPods+Pro"]', 'active', 234, NOW());

    -- Товары продавца 3 (Продукты)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller3_id, 'Молоко домашнее 1л', 'Свежее коровье молоко от фермеров', 4, 80, NULL, 'pickup', '[]', '[{"name":"Объем","value":"1 литр"},{"name":"Жирность","value":"3.2%"}]', '["https://placehold.co/600x400/FFFFFF/000?text=Milk"]', 'active', 567, NOW()),
    (seller3_id, 'Яйца куриные 10 шт', 'Свежие домашние яйца', 4, 120, 100, 'pickup', '[]', '[{"name":"Количество","value":"10 штук"},{"name":"Категория","value":"С1"}]', '["https://placehold.co/600x400/F4E4C1/000?text=Eggs"]', 'active', 423, NOW()),
    (seller3_id, 'Помидоры свежие 1кг', 'Свежие тепличные помидоры', 4, 150, NULL, 'pickup', '["taxi"]', '[{"name":"Вес","value":"1 кг"}]', '["https://placehold.co/600x400/FF6347/FFF?text=Tomatoes"]', 'active', 312, NOW()),
    (seller3_id, 'Огурцы 1кг', 'Свежие хрустящие огурцы', 4, 100, 90, 'pickup', '["taxi"]', '[{"name":"Вес","value":"1 кг"}]', '["https://placehold.co/600x400/90EE90/000?text=Cucumbers"]', 'active', 289, NOW());

    -- Товары продавца 4 (Обувь)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller4_id, 'Кроссовки Nike Air Max', 'Спортивные кроссовки для бега', 2, 6500, 5999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"39-45"},{"name":"Цвет","value":"Черный, Белый"},{"name":"Материал","value":"Текстиль, резина"}]', '["https://placehold.co/600x400/000000/FFF?text=Nike+Air+Max"]', 'active', 445, NOW()),
    (seller4_id, 'Туфли женские классические', 'Элегантные туфли на каблуке', 2, 3500, 2999, 'paid', '["taxi"]', '[{"name":"Размер","value":"36-40"},{"name":"Цвет","value":"Черный, Бежевый"},{"name":"Высота каблука","value":"7см"}]', '["https://placehold.co/600x400/000000/FFF?text=Heels"]', 'active', 334, NOW()),
    (seller4_id, 'Ботинки зимние мужские', 'Теплые зимние ботинки', 2, 4500, 3999, 'paid', '["taxi"]', '[{"name":"Размер","value":"40-46"},{"name":"Цвет","value":"Черный, Коричневый"}]', '["https://placehold.co/600x400/8B4513/FFF?text=Winter+Boots"]', 'active', 267, NOW());

    -- Товары продавца 5 (Косметика)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller5_id, 'Тональный крем Estee Lauder', 'Стойкий тональный крем 24 часа', 6, 3500, 3199, 'free', '["express", "courier"]', '[{"name":"Оттенок","value":"Ivory, Beige, Tan"},{"name":"Объем","value":"30ml"}]', '["https://placehold.co/600x400/FFE4B5/000?text=Foundation"]', 'active', 523, NOW()),
    (seller5_id, 'Корейская тканевая маска набор 10шт', 'Увлажняющие маски для лица', 6, 800, 699, 'paid', '["taxi", "express"]', '[{"name":"Тип","value":"Увлажняющая"},{"name":"Количество","value":"10 штук"}]', '["https://placehold.co/600x400/FFB6C1/000?text=Face+Masks"]', 'active', 678, NOW()),
    (seller5_id, 'Помада MAC матовая', 'Стойкая матовая помада', 6, 2200, 1999, 'paid', '["express"]', '[{"name":"Оттенок","value":"Red, Pink, Nude"}]', '["https://placehold.co/600x400/DC143C/FFF?text=Lipstick"]', 'active', 445, NOW());

    -- Товары продавца 6 (Детские товары)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller6_id, 'Коляска прогулочная Babytime', 'Легкая прогулочная коляска', 7, 8500, 7999, 'paid', '["cargo"]', '[{"name":"Вес","value":"6.5 кг"},{"name":"Цвет","value":"Серый, Синий"}]', '["https://placehold.co/600x400/708090/FFF?text=Stroller"]', 'active', 234, NOW()),
    (seller6_id, 'Конструктор LEGO Classic', 'Набор для творчества 500 деталей', 7, 3500, 2999, 'paid', '["taxi", "express"]', '[{"name":"Возраст","value":"4+"},{"name":"Детали","value":"500 шт"}]', '["https://placehold.co/600x400/FFD700/000?text=LEGO"]', 'active', 567, NOW()),
    (seller6_id, 'Детский комбинезон зимний', 'Теплый зимний комбинезон', 7, 4500, 3999, 'paid', '["taxi"]', '[{"name":"Размер","value":"80-110см"},{"name":"Цвет","value":"Синий, Розовый"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Overalls"]', 'active', 345, NOW());

    -- Товары продавца 7 (Спорт)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller7_id, 'Гантели разборные 20кг', 'Пара разборных гантелей', 8, 3500, NULL, 'paid', '["cargo"]', '[{"name":"Вес","value":"2x10 кг"}]', '["https://placehold.co/600x400/696969/FFF?text=Dumbbells"]', 'active', 178, NOW()),
    (seller7_id, 'Коврик для йоги', 'Нескользящий коврик для занятий', 8, 1200, 999, 'paid', '["taxi"]', '[{"name":"Размер","value":"180x60см"},{"name":"Цвет","value":"Фиолетовый, Зеленый"}]', '["https://placehold.co/600x400/9370DB/FFF?text=Yoga+Mat"]', 'active', 234, NOW()),
    (seller7_id, 'Скакалка профессиональная', 'Скакалка для кроссфита', 8, 600, 499, 'paid', '["taxi"]', '[{"name":"Длина","value":"3 метра"}]', '["https://placehold.co/600x400/FF4500/FFF?text=Jump+Rope"]', 'active', 145, NOW());

    -- Товары продавца 8 (Товары для дома - Ош)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller8_id, 'Постельное белье сатин', 'Комплект постельного белья 2-спальный', 5, 2500, 2199, 'paid', '["taxi"]', '[{"name":"Размер","value":"2-спальный"},{"name":"Материал","value":"Сатин"}]', '["https://placehold.co/600x400/E6E6FA/000?text=Bedding"]', 'active', 267, NOW()),
    (seller8_id, 'Набор полотенец 3шт', 'Махровые полотенца', 5, 1200, 999, 'paid', '["taxi"]', '[{"name":"Размер","value":"50x90, 70x140"},{"name":"Цвет","value":"Белый, Бежевый"}]', '["https://placehold.co/600x400/F5F5DC/000?text=Towels"]', 'active', 189, NOW()),
    (seller8_id, 'Шторы блэкаут', 'Светонепроницаемые шторы', 5, 3500, 2999, 'paid', '["cargo"]', '[{"name":"Размер","value":"270x280см"},{"name":"Цвет","value":"Серый, Бежевый"}]', '["https://placehold.co/600x400/808080/FFF?text=Curtains"]', 'active', 234, NOW());

    -- Товары продавца 9 (Одежда - Ош)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller9_id, 'Национальное платье элечек', 'Традиционное кыргызское платье', 12, 4500, NULL, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"S, M, L"},{"name":"Цвет","value":"Красный, Синий"}]', '["https://placehold.co/600x400/DC143C/FFF?text=Traditional+Dress"]', 'active', 156, NOW()),
    (seller9_id, 'Кыргызский калпак', 'Традиционный войлочный головной убор', 14, 1500, 1299, 'paid', '["taxi"]', '[{"name":"Размер","value":"56-60"}]', '["https://placehold.co/600x400/F0F8FF/000?text=Kalpak"]', 'active', 198, NOW());

    -- Товары продавца 10 (Электроника - Джалал-Абад)
    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller10_id, 'Наушники JBL Tune 500', 'Накладные наушники с отличным звуком', 34, 2500, 2199, 'paid', '["taxi", "express"]', '[{"name":"Цвет","value":"Черный, Белый"},{"name":"Тип","value":"Проводные"}]', '["https://placehold.co/600x400/000000/FFF?text=JBL+Headphones"]', 'active', 234, NOW()),
    (seller10_id, 'Powerbank 20000mAh', 'Внешний аккумулятор быстрая зарядка', 34, 1800, 1499, 'paid', '["taxi", "express"]', '[{"name":"Емкость","value":"20000mAh"},{"name":"Порты","value":"USB-C, USB-A"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Powerbank"]', 'active', 312, NOW());

    RAISE NOTICE '✓ Создано 10 продавцов и их профили';
    RAISE NOTICE '✓ Создано ~40 товаров';

END $$;

-- =====================================================================
-- ПОКУПАТЕЛИ, ЗАКАЗЫ И ОТЗЫВЫ
-- =====================================================================

DO $$
DECLARE
    buyer1_id UUID := gen_random_uuid();
    buyer2_id UUID := gen_random_uuid();
    buyer3_id UUID := gen_random_uuid();
    buyer4_id UUID := gen_random_uuid();
    buyer5_id UUID := gen_random_uuid();
    buyer6_id UUID := gen_random_uuid();
    buyer7_id UUID := gen_random_uuid();
    buyer8_id UUID := gen_random_uuid();

    seller1_id UUID;
    seller2_id UUID;
    seller3_id UUID;
    seller4_id UUID;
    seller5_id UUID;
    seller6_id UUID;
    seller7_id UUID;
    seller8_id UUID;
    seller9_id UUID;
    seller10_id UUID;

    product1_id UUID;
    product2_id UUID;
    product3_id UUID;
    product4_id UUID;
    product5_id UUID;

    order1_id UUID := gen_random_uuid();
    order2_id UUID := gen_random_uuid();
    order3_id UUID := gen_random_uuid();
    order4_id UUID := gen_random_uuid();
    order5_id UUID := gen_random_uuid();
    order6_id UUID := gen_random_uuid();
    order7_id UUID := gen_random_uuid();
    order8_id UUID := gen_random_uuid();
    order9_id UUID := gen_random_uuid();
    order10_id UUID := gen_random_uuid();
    order11_id UUID := gen_random_uuid();
    order12_id UUID := gen_random_uuid();
    order13_id UUID := gen_random_uuid();
    order14_id UUID := gen_random_uuid();
    order15_id UUID := gen_random_uuid();
    order16_id UUID := gen_random_uuid();
    order17_id UUID := gen_random_uuid();
    order18_id UUID := gen_random_uuid();
    order19_id UUID := gen_random_uuid();
    order20_id UUID := gen_random_uuid();

BEGIN
    -- Создаем покупателей
    RAISE NOTICE 'Создание тестовых покупателей...';

    INSERT INTO users (id, email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES
    (buyer1_id, 'buyer1@test.com', 'Айнура Садыкова', '+996700111111', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '3 months', false),
    (buyer2_id, 'buyer2@test.com', 'Бекзат Алиев', '+996700222222', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '2 months', false),
    (buyer3_id, 'buyer3@test.com', 'Гульнара Осмонова', '+996700333333', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '1 month', false),
    (buyer4_id, 'buyer4@test.com', 'Данияр Токтосунов', '+996700444444', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '20 days', false),
    (buyer5_id, 'buyer5@test.com', 'Елена Ким', '+996700555555', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '15 days', false),
    (buyer6_id, 'buyer6@test.com', 'Жамиля Бакирова', '+996700666666', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '10 days', false),
    (buyer7_id, 'buyer7@test.com', 'Замир Султанов', '+996700777777', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '5 days', false),
    (buyer8_id, 'buyer8@test.com', 'Ильяс Мамбетов', '+996700888888', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '2 days', false)
    ON CONFLICT (email) DO NOTHING;

    RAISE NOTICE '✓ Создано 8 покупателей';

    -- Получаем ID продавцов
    SELECT id INTO seller1_id FROM users WHERE email = 'seller1@test.com';
    SELECT id INTO seller2_id FROM users WHERE email = 'seller2@test.com';
    SELECT id INTO seller3_id FROM users WHERE email = 'seller3@test.com';
    SELECT id INTO seller4_id FROM users WHERE email = 'seller4@test.com';
    SELECT id INTO seller5_id FROM users WHERE email = 'seller5@test.com';
    SELECT id INTO seller6_id FROM users WHERE email = 'seller6@test.com';
    SELECT id INTO seller7_id FROM users WHERE email = 'seller7@test.com';
    SELECT id INTO seller8_id FROM users WHERE email = 'seller8@test.com';
    SELECT id INTO seller9_id FROM users WHERE email = 'seller9@test.com';
    SELECT id INTO seller10_id FROM users WHERE email = 'seller10@test.com';

    -- Получаем ID товаров для заказов
    SELECT id INTO product1_id FROM products WHERE seller_id = seller1_id LIMIT 1;
    SELECT id INTO product2_id FROM products WHERE seller_id = seller2_id LIMIT 1;
    SELECT id INTO product3_id FROM products WHERE seller_id = seller4_id LIMIT 1;
    SELECT id INTO product4_id FROM products WHERE seller_id = seller5_id LIMIT 1;
    SELECT id INTO product5_id FROM products WHERE seller_id = seller6_id LIMIT 1;

    RAISE NOTICE 'Создание заказов и отзывов...';

    -- Заказ 1: buyer1 покупает у seller1
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order1_id, 'ORD-20250115-A1B2C3D4', buyer1_id, seller1_id,
        jsonb_build_array(jsonb_build_object('product_id', product1_id, 'quantity', 2, 'price', 1200, 'discount_price', 999)),
        1998.00, 'г. Бишкек, ул. Киевская 45, кв. 12', '+996700111111', 'wallet', 'completed',
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '42 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller1_id, buyer1_id, order1_id, 9, 'Отличное качество! Футболки очень приятные на ощупь, размер соответствует. Продавец быстро ответил на вопросы. Рекомендую!', NOW() - INTERVAL '40 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 2
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order2_id, 'ORD-20250120-E5F6G7H8', buyer1_id, seller2_id,
        jsonb_build_array(jsonb_build_object('product_id', product2_id, 'quantity', 1, 'price', 85000, 'discount_price', 82000)),
        82000.00, 'г. Бишкек, ул. Киевская 45, кв. 12', '+996700111111', 'mbank', 'completed',
        NOW() - INTERVAL '35 days', NOW() - INTERVAL '33 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller2_id, buyer1_id, order2_id, 10, 'Телефон в идеальном состоянии! Все как описано, запечатанный, оригинал. Доставка быстрая, продавец очень вежливый. Спасибо большое!', NOW() - INTERVAL '30 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 3
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order3_id, 'ORD-20250125-I9J0K1L2', buyer2_id, seller4_id,
        jsonb_build_array(jsonb_build_object('product_id', product3_id, 'quantity', 1, 'price', 6500, 'discount_price', 5999)),
        5999.00, 'г. Бишкек, мкр. Асанбай 12-34', '+996700222222', 'wallet', 'completed',
        NOW() - INTERVAL '28 days', NOW() - INTERVAL '26 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller4_id, buyer2_id, order3_id, 8, 'Кроссовки хорошие, удобные. Размер подошел. Доставка заняла чуть больше времени, чем обещали, но в целом все отлично.', NOW() - INTERVAL '24 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 4
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order4_id, 'ORD-20250128-M3N4O5P6', buyer3_id, seller5_id,
        jsonb_build_array(jsonb_build_object('product_id', product4_id, 'quantity', 1, 'price', 3500, 'discount_price', 3199)),
        3199.00, 'г. Бишкек, ул. Манаса 102', '+996700333333', 'wallet', 'completed',
        NOW() - INTERVAL '22 days', NOW() - INTERVAL '20 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller5_id, buyer3_id, order4_id, 10, 'Превосходно! Тональный крем оригинальный, подошел идеально. Упаковка красивая, есть чек. Продавец профессионал!', NOW() - INTERVAL '18 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 5
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order5_id, 'ORD-20250130-Q7R8S9T0', buyer4_id, seller6_id,
        jsonb_build_array(jsonb_build_object('product_id', product5_id, 'quantity', 1, 'price', 3500, 'discount_price', 2999)),
        2999.00, 'г. Бишкек, мкр. Джал 15-67', '+996700444444', 'mbank', 'completed',
        NOW() - INTERVAL '18 days', NOW() - INTERVAL '16 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller6_id, buyer4_id, order5_id, 9, 'Ребенок в восторге! Конструктор оригинальный LEGO, все детали на месте. Упаковка целая. Спасибо!', NOW() - INTERVAL '14 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 6
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order6_id, 'ORD-20250202-U1V2W3X4', buyer5_id, seller1_id, '[]'::jsonb, 4500.00, 'г. Бишкек, ул. Боконбаева 200', '+996700555555', 'wallet', 'completed', NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller1_id, buyer5_id, order6_id, 7, 'Товар нормальный, но доставка задержалась на 2 дня. В остальном претензий нет.', NOW() - INTERVAL '11 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 7
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order7_id, 'ORD-20250205-Y5Z6A7B8', buyer6_id, seller3_id, '[]'::jsonb, 450.00, 'г. Бишкек, мкр. Кок-Жар 5-12', '+996700666666', 'wallet', 'completed', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller3_id, buyer6_id, order7_id, 10, 'Молоко и яйца всегда свежие! Покупаю постоянно. Очень довольна качеством!', NOW() - INTERVAL '10 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 8
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order8_id, 'ORD-20250207-C9D0E1F2', buyer7_id, seller7_id, '[]'::jsonb, 1998.00, 'г. Бишкек, ул. Ибраимова 45', '+996700777777', 'mbank', 'completed', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller7_id, buyer7_id, order8_id, 8, 'Коврик для йоги отличный, не скользит. Доставка быстрая. Рекомендую!', NOW() - INTERVAL '7 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 9
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order9_id, 'ORD-20250209-G3H4I5J6', buyer8_id, seller8_id, '[]'::jsonb, 2199.00, 'г. Ош, ул. Ленина 123', '+996700888888', 'wallet', 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller8_id, buyer8_id, order9_id, 9, 'Постельное белье высокого качества, сатин приятный. Упаковка хорошая. Спасибо!', NOW() - INTERVAL '4 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 10
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order10_id, 'ORD-20250210-K7L8M9N0', buyer2_id, seller2_id, '[]'::jsonb, 16999.00, 'г. Бишкек, мкр. Асанбай 12-34', '+996700222222', 'wallet', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller2_id, buyer2_id, order10_id, 10, 'AirPods супер! Звук чистый, шумоподавление работает отлично. Продавец топ!', NOW() - INTERVAL '3 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 11
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order11_id, 'ORD-20250212-O1P2Q3R4', buyer3_id, seller9_id, '[]'::jsonb, 4500.00, 'г. Ош, микрорайон 5, дом 12', '+996700333333', 'mbank', 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller9_id, buyer3_id, order11_id, 9, 'Красивое национальное платье! Качество отличное, вышивка аккуратная. Очень довольна покупкой!', NOW() - INTERVAL '2 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 12
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order12_id, 'ORD-20250213-S5T6U7V8', buyer1_id, seller4_id, '[]'::jsonb, 2999.00, 'г. Бишкек, ул. Киевская 45, кв. 12', '+996700111111', 'wallet', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller4_id, buyer1_id, order12_id, 8, 'Туфли удобные, каблук устойчивый. Размер соответствует. Хорошая покупка!', NOW() - INTERVAL '1 day')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 13
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order13_id, 'ORD-20250214-W9X0Y1Z2', buyer5_id, seller10_id, '[]'::jsonb, 1499.00, 'г. Джалал-Абад, ул. Эркиндик 56', '+996700555555', 'wallet', 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller10_id, buyer5_id, order13_id, 7, 'Powerbank работает хорошо, заряжает быстро. Но корпус немного поцарапан был.', NOW() - INTERVAL '12 hours')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 14
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order14_id, 'ORD-20250215-A3B4C5D6', buyer6_id, seller5_id, '[]'::jsonb, 699.00, 'г. Бишкек, мкр. Кок-Жар 5-12', '+996700666666', 'mbank', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller5_id, buyer6_id, order14_id, 10, 'Маски супер! Кожа стала мягкая и увлажненная. Беру уже не первый раз!', NOW() - INTERVAL '3 hours')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 15
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (order15_id, 'ORD-20250216-E7F8G9H0', buyer7_id, seller6_id, '[]'::jsonb, 3999.00, 'г. Бишкек, ул. Ибраимова 45', '+996700777777', 'wallet', 'completed', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '2 hours')
    ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller6_id, buyer7_id, order15_id, 9, 'Комбинезон теплый, качественный. Ребенку в самый раз. Спасибо за быструю доставку!', NOW() - INTERVAL '1 hour')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказы в процессе (без отзывов)
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES
    (order16_id, 'ORD-20250217-I1J2K3L4', buyer8_id, seller1_id, '[]'::jsonb, 1999.00, 'г. Бишкек, мкр. Аламедин-1', '+996700888888', 'wallet', 'processing', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
    (order17_id, 'ORD-20250217-M5N6O7P8', buyer4_id, seller2_id, '[]'::jsonb, 19999.00, 'г. Бишкек, мкр. Джал 15-67', '+996700444444', 'mbank', 'processing', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
    (order18_id, 'ORD-20250218-Q9R0S1T2', buyer1_id, seller3_id, '[]'::jsonb, 340.00, 'г. Бишкек, ул. Киевская 45, кв. 12', '+996700111111', 'wallet', 'pending', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
    (order19_id, 'ORD-20250218-U3V4W5X6', buyer3_id, seller7_id, '[]'::jsonb, 499.00, 'г. Бишкек, ул. Манаса 102', '+996700333333', 'wallet', 'pending', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
    (order20_id, 'ORD-20250218-Y7Z8A9B0', buyer5_id, seller8_id, '[]'::jsonb, 2999.00, 'г. Ош, ул. Курманжан Датка 78', '+996700555555', 'mbank', 'pending', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')
    ON CONFLICT (order_number) DO NOTHING;

    RAISE NOTICE '✓ Создано 20 заказов';
    RAISE NOTICE '✓ Создано 15 отзывов';

END $$;

COMMIT;

-- =====================================================================
-- ИТОГОВАЯ СТАТИСТИКА
-- =====================================================================

DO $$
DECLARE
    cities_count INT;
    markets_count INT;
    categories_count INT;
    sellers_count INT;
    products_count INT;
    buyers_count INT;
    orders_count INT;
    reviews_count INT;
BEGIN
    SELECT COUNT(*) INTO cities_count FROM cities;
    SELECT COUNT(*) INTO markets_count FROM markets;
    SELECT COUNT(*) INTO categories_count FROM categories;
    SELECT COUNT(*) INTO sellers_count FROM users WHERE role = 'seller';
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO buyers_count FROM users WHERE role = 'user';
    SELECT COUNT(*) INTO orders_count FROM orders;
    SELECT COUNT(*) INTO reviews_count FROM reviews;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ТЕСТОВЫЕ ДАННЫЕ УСПЕШНО СОЗДАНЫ!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Городов: %', cities_count;
    RAISE NOTICE 'Рынков: %', markets_count;
    RAISE NOTICE 'Категорий: %', categories_count;
    RAISE NOTICE 'Продавцов: %', sellers_count;
    RAISE NOTICE 'Товаров: %', products_count;
    RAISE NOTICE 'Покупателей: %', buyers_count;
    RAISE NOTICE 'Заказов: %', orders_count;
    RAISE NOTICE 'Отзывов: %', reviews_count;
    RAISE NOTICE '========================================';
END $$;
