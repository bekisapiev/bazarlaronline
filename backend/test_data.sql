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

-- Тестовые продавцы с разными профилями
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
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller1_id, 'seller1@test.com', 'Айгуль Асанова', '+996555111111', 'seller', 'pro', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller1_id, 'Модный стиль', 'Женская и мужская одежда высокого качества', 1, 1, 'market', 1, 'Дордой, контейнер 456', 4.8, 127, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 2: Магазин электроники
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller2_id, 'seller2@test.com', 'Тимур Бекмуратов', '+996555222222', 'seller', 'business', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller2_id, 'TechnoShop', 'Смартфоны, ноутбуки, аксессуары', 3, 1, 'boutique', NULL, 'ул. Чуй 156', 4.9, 245, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 3: Продукты питания
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller3_id, 'seller3@test.com', 'Нургуль Токтогулова', '+996555333333', 'seller', 'free', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller3_id, 'Фермерские продукты', 'Свежие овощи, фрукты, молочные продукты', 4, 1, 'market', 2, 'Ошский рынок, ряд 3', 4.5, 89, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 4: Обувь
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller4_id, 'seller4@test.com', 'Эрлан Шаршеев', '+996555444444', 'seller', 'pro', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller4_id, 'Обувной мир', 'Турецкая и итальянская обувь', 2, 1, 'shop', NULL, 'ТЦ Вефа, 2 этаж', 4.7, 156, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 5: Косметика
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller5_id, 'seller5@test.com', 'Жанара Исакова', '+996555555555', 'seller', 'business', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller5_id, 'BeautyKG', 'Корейская и европейская косметика', 6, 1, 'office', NULL, 'ул. Токтогула 123, офис 45', 4.9, 312, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 6: Детские товары
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller6_id, 'seller6@test.com', 'Назира Абдиева', '+996555666666', 'seller', 'pro', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller6_id, 'Детский рай', 'Игрушки, одежда, коляски', 7, 1, 'shop', NULL, 'ТЦ Дордой Плаза', 4.6, 198, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 7: Спорттовары
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller7_id, 'seller7@test.com', 'Азамат Мураталиев', '+996555777777', 'seller', 'free', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller7_id, 'Спорт Лайф', 'Спортивная одежда и инвентарь', 8, 1, 'mobile', NULL, 'Доставка по всему городу', 4.3, 67, false)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 8: Товары для дома (Ош)
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller8_id, 'seller8@test.com', 'Гулнара Сыдыкова', '+996555888888', 'seller', 'pro', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller8_id, 'Уют и комфорт', 'Текстиль, посуда, декор', 5, 2, 'market', 6, 'Рынок Жайма, секция Б', 4.7, 134, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 9: Одежда (Ош)
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller9_id, 'seller9@test.com', 'Бактыгуль Жумабаева', '+996555999999', 'seller', 'business', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller9_id, 'Silk Road Fashion', 'Традиционная и современная одежда', 1, 2, 'boutique', NULL, 'ул. Ленина 78', 4.8, 201, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец 10: Электроника (Джалал-Абад)
    INSERT INTO users (id, email, full_name, phone, role, tariff, created_at, is_banned)
    VALUES (seller10_id, 'seller10@test.com', 'Эмир Алиев', '+996555000000', 'seller', 'pro', NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller10_id, 'Gadget Store', 'Гаджеты и аксессуары', 3, 3, 'shop', NULL, 'Центральный рынок', 4.5, 92, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Тестовые товары для каждого продавца

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

END $$;

-- Примечание: После запуска этого скрипта таблицы будут заполнены тестовыми данными
-- Запуск: docker-compose exec postgres psql -U postgres -d bazarlar_claude -f /docker-entrypoint-initdb.d/test_data.sql
-- или: psql -U postgres -d bazarlar_claude -f backend/test_data.sql

COMMIT;
