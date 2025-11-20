-- =====================================================================
-- Скрипт 3: Тестовые данные
-- =====================================================================
-- Описание: Загрузка тестовых данных для разработки и тестирования
-- Запуск: python backend/migrations/run_migrations.py --test-data-only
--
-- ВАЖНО: Перед запуском убедитесь, что:
-- 1. Выполнен скрипт 001_create_tables.sql (создание таблиц)
-- 2. Выполнен скрипт 002_reference_data.sql (справочные данные)
-- =====================================================================

BEGIN;

-- =====================================================================
-- Вывод заголовка
-- =====================================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'СОЗДАНИЕ ТЕСТОВЫХ ДАННЫХ';
    RAISE NOTICE '========================================';
END $$;

-- =====================================================================
-- АДМИНИСТРАТОР И БАЗОВЫЙ ПРОДАВЕЦ
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
-- ПРОДАВЦЫ ТОВАРОВ И ИХ ТОВАРЫ
-- =====================================================================

DO $$
DECLARE
    -- Продавцы товаров
    seller1_id UUID;
    seller2_id UUID;
    seller3_id UUID;
    seller4_id UUID;
    seller5_id UUID;

    -- Продавцы услуг
    service_seller1_id UUID;
    service_seller2_id UUID;
    service_seller3_id UUID;
    service_seller4_id UUID;

    -- Покупатели
    buyer1_id UUID;
    buyer2_id UUID;
    buyer3_id UUID;
    buyer4_id UUID;
    buyer5_id UUID;

    -- Товары (для заказов)
    product1_id UUID;
    product2_id UUID;
    product3_id UUID;
    product4_id UUID;
    product5_id UUID;

    -- Услуги
    service1_id UUID;
    service2_id UUID;
    service3_id UUID;
    service4_id UUID;
    service5_id UUID;
    service6_id UUID;
    service7_id UUID;
    service8_id UUID;

    -- Заказы
    order1_id UUID;
    order2_id UUID;
    order3_id UUID;
    order4_id UUID;
    order5_id UUID;

BEGIN
    RAISE NOTICE '✓ Создан администратор и базовый продавец';
    RAISE NOTICE 'Создание продавцов товаров...';

    -- =====================================================================
    -- ПРОДАВЕЦ 1: Одежда
    -- =====================================================================
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('seller1@test.com', 'Айгуль Асанова', '+996555111111', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO seller1_id FROM users WHERE email = 'seller1@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller1_id, 'Модный стиль', 'Женская и мужская одежда высокого качества', 1, 1, 'market', 1, 'Дордой, контейнер 456', 4.8, 127, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Товары продавца 1
    INSERT INTO products (seller_id, product_type, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller1_id, 'product', 'Мужская футболка polo', 'Качественная хлопковая футболка с воротником polo', 11, 1200, 999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"M, L, XL"},{"name":"Цвет","value":"Белый, Черный, Синий"}]', '["https://placehold.co/600x400/4A90E2/FFF?text=Polo"]', 'active', 145, NOW()),
    (seller1_id, 'product', 'Женское платье летнее', 'Легкое летнее платье из натуральной ткани', 12, 2500, 1999, 'paid', '["taxi"]', '[{"name":"Размер","value":"S, M, L"},{"name":"Цвет","value":"Розовый, Голубой"}]', '["https://placehold.co/600x400/FF6B9D/FFF?text=Dress"]', 'active', 238, NOW()),
    (seller1_id, 'product', 'Джинсы мужские классические', 'Плотные джинсы прямого кроя', 11, 3500, 2999, 'paid', '["taxi"]', '[{"name":"Размер","value":"30-36"},{"name":"Цвет","value":"Синий, Черный"}]', '["https://placehold.co/600x400/2C3E50/FFF?text=Jeans"]', 'active', 189, NOW());

    -- =====================================================================
    -- ПРОДАВЕЦ 2: Электроника
    -- =====================================================================
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('seller2@test.com', 'Тимур Бекмуратов', '+996555222222', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO seller2_id FROM users WHERE email = 'seller2@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (seller2_id, 'TechnoShop', 'Смартфоны, ноутбуки, аксессуары', 3, 1, 'boutique', 'ул. Чуй 156', 4.9, 245, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Товары продавца 2
    INSERT INTO products (seller_id, product_type, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller2_id, 'product', 'iPhone 15 Pro 256GB', 'Новый iPhone 15 Pro с титановым корпусом', 311, 85000, 82000, 'free', '["express", "courier"]', '[{"name":"Память","value":"256GB"},{"name":"Цвет","value":"Титан"}]', '["https://placehold.co/600x400/000000/FFF?text=iPhone"]', 'active', 512, NOW()),
    (seller2_id, 'product', 'MacBook Pro 14 M3', 'Ноутбук для профессионалов', 32, 120000, 115000, 'free', '["courier"]', '[{"name":"Процессор","value":"Apple M3"},{"name":"Память","value":"16GB/512GB"}]', '["https://placehold.co/600x400/A2AAAD/FFF?text=MacBook"]', 'active', 389, NOW());

    -- =====================================================================
    -- ПРОДАВЕЦ 3: Продукты питания
    -- =====================================================================
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('seller3@test.com', 'Нургуль Токтогулова', '+996555333333', 'seller', 'free', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO seller3_id FROM users WHERE email = 'seller3@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller3_id, 'Фермерские продукты', 'Свежие овощи, фрукты, молочные продукты', 4, 1, 'market', 2, 'Ошский рынок, ряд 3', 4.5, 89, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Товары продавца 3
    INSERT INTO products (seller_id, product_type, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller3_id, 'product', 'Молоко домашнее 1л', 'Свежее коровье молоко от фермеров', 4, 80, NULL, 'pickup', '[]', '[{"name":"Объем","value":"1 литр"}]', '["https://placehold.co/600x400/FFFFFF/000?text=Milk"]', 'active', 567, NOW()),
    (seller3_id, 'product', 'Яйца куриные 10 шт', 'Свежие домашние яйца', 4, 120, 100, 'pickup', '[]', '[{"name":"Количество","value":"10 штук"}]', '["https://placehold.co/600x400/F4E4C1/000?text=Eggs"]', 'active', 423, NOW());

    -- =====================================================================
    -- ПРОДАВЕЦ 4: Обувь
    -- =====================================================================
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('seller4@test.com', 'Эрлан Шаршеев', '+996555444444', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO seller4_id FROM users WHERE email = 'seller4@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (seller4_id, 'Обувной мир', 'Турецкая и итальянская обувь', 2, 1, 'shop', 'ТЦ Вефа, 2 этаж', 4.7, 156, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Товары продавца 4
    INSERT INTO products (seller_id, product_type, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller4_id, 'product', 'Кроссовки Nike Air Max', 'Оригинальные кроссовки Nike', 21, 8500, 7999, 'paid', '["express"]', '[{"name":"Размер","value":"40-45"},{"name":"Цвет","value":"Черный, Белый"}]', '["https://placehold.co/600x400/FF6B00/FFF?text=Nike"]', 'active', 345, NOW());

    -- =====================================================================
    -- ПРОДАВЕЦ 5: Косметика
    -- =====================================================================
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('seller5@test.com', 'Жанара Исакова', '+996555555555', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO seller5_id FROM users WHERE email = 'seller5@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (seller5_id, 'BeautyKG', 'Корейская и европейская косметика', 6, 1, 'office', 'ул. Токтогула 123, офис 45', 4.9, 312, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Товары продавца 5
    INSERT INTO products (seller_id, product_type, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
    VALUES
    (seller5_id, 'product', 'Крем для лица корейский', 'Увлажняющий крем с гиалуроновой кислотой', 6, 1500, 1299, 'paid', '["taxi", "express"]', '[{"name":"Объем","value":"50ml"}]', '["https://placehold.co/600x400/FFB6C1/000?text=Cream"]', 'active', 234, NOW());

    RAISE NOTICE '✓ Создано 5 продавцов товаров и 10 товаров';

    -- =====================================================================
    -- ПРОДАВЦЫ УСЛУГ
    -- =====================================================================

    RAISE NOTICE 'Создание продавцов услуг...';

    -- Продавец услуг 1: Парикмахер
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('hairdresser@test.com', 'Айжан Токтомушева', '+996555111222', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO service_seller1_id FROM users WHERE email = 'hairdresser@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller1_id, 'Салон красоты "Стиль"', 'Профессиональные услуги парикмахера', 9, 1, 'office', 'ул. Чуй 120, офис 5', 4.9, 87, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец услуг 2: Репетитор
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('tutor@test.com', 'Асель Бекова', '+996555222333', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO service_seller2_id FROM users WHERE email = 'tutor@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller2_id, 'Репетитор по математике', 'Подготовка к ОРТ', 9, 1, 'mobile', 'Выезд на дом', 5.0, 45, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец услуг 3: Маникюр
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('nails@test.com', 'Гульмира Алиева', '+996555333444', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO service_seller3_id FROM users WHERE email = 'nails@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller3_id, 'Nail Studio', 'Маникюр, педикюр', 9, 1, 'office', 'мкр. Джал, ТЦ Bishkek Park', 4.8, 156, true)
    ON CONFLICT (user_id) DO NOTHING;

    -- Продавец услуг 4: Массаж
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES ('massage@test.com', 'Талант Кадыров', '+996555444555', 'seller', 'free', upper(substr(md5(random()::text), 1, 12)), NOW(), false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO service_seller4_id FROM users WHERE email = 'massage@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (service_seller4_id, 'Лечебный массаж', 'Классический и спортивный массаж', 9, 1, 'mobile', 'Выезд на дом', 4.7, 34, false)
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE '✓ Создано 4 продавца услуг';

    -- =====================================================================
    -- УСЛУГИ
    -- =====================================================================

    RAISE NOTICE 'Создание услуг...';

    INSERT INTO products (seller_id, product_type, title, description, category_id, price, discount_price, characteristics, images, status, views_count, created_at)
    VALUES
    (service_seller1_id, 'service', 'Женская стрижка', 'Профессиональная женская стрижка', 9, 800, 700, '[{"name":"Длительность","value":"60 минут"}]', '["https://placehold.co/600x400/FF69B4/FFF?text=Haircut"]', 'active', 89, NOW()),
    (service_seller1_id, 'service', 'Окрашивание волос', 'Окрашивание профессиональными красками', 9, 2500, 2200, '[{"name":"Длительность","value":"2-3 часа"}]', '["https://placehold.co/600x400/9370DB/FFF?text=Color"]', 'active', 123, NOW()),
    (service_seller2_id, 'service', 'Занятие по математике', 'Индивидуальное занятие (60 минут)', 9, 600, 500, '[{"name":"Длительность","value":"60 минут"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Math"]', 'active', 67, NOW()),
    (service_seller2_id, 'service', 'Подготовка к ОРТ', 'Комплексная подготовка (пакет 10 занятий)', 9, 5000, 4500, '[{"name":"Занятий","value":"10"}]', '["https://placehold.co/600x400/32CD32/FFF?text=ORT"]', 'active', 45, NOW()),
    (service_seller3_id, 'service', 'Маникюр классический', 'Классический маникюр с покрытием гель-лак', 9, 500, NULL, '[{"name":"Длительность","value":"90 минут"}]', '["https://placehold.co/600x400/FF1493/FFF?text=Manicure"]', 'active', 178, NOW()),
    (service_seller3_id, 'service', 'Педикюр аппаратный', 'Аппаратный педикюр с покрытием', 9, 700, 650, '[{"name":"Длительность","value":"120 минут"}]', '["https://placehold.co/600x400/FF69B4/FFF?text=Pedicure"]', 'active', 134, NOW()),
    (service_seller4_id, 'service', 'Классический массаж', 'Расслабляющий массаж спины и шеи', 9, 1000, 900, '[{"name":"Длительность","value":"60 минут"}]', '["https://placehold.co/600x400/87CEEB/FFF?text=Massage"]', 'active', 56, NOW()),
    (service_seller4_id, 'service', 'Антицеллюлитный массаж', 'Интенсивный антицеллюлитный массаж', 9, 1200, NULL, '[{"name":"Длительность","value":"90 минут"}]', '["https://placehold.co/600x400/FFA07A/FFF?text=Anti-cellulite"]', 'active', 43, NOW());

    SELECT id INTO service1_id FROM products WHERE seller_id = service_seller1_id AND title = 'Женская стрижка';
    SELECT id INTO service2_id FROM products WHERE seller_id = service_seller1_id AND title = 'Окрашивание волос';
    SELECT id INTO service3_id FROM products WHERE seller_id = service_seller2_id AND title = 'Занятие по математике';
    SELECT id INTO service4_id FROM products WHERE seller_id = service_seller2_id AND title = 'Подготовка к ОРТ';
    SELECT id INTO service5_id FROM products WHERE seller_id = service_seller3_id AND title = 'Маникюр классический';
    SELECT id INTO service6_id FROM products WHERE seller_id = service_seller3_id AND title = 'Педикюр аппаратный';
    SELECT id INTO service7_id FROM products WHERE seller_id = service_seller4_id AND title = 'Классический массаж';
    SELECT id INTO service8_id FROM products WHERE seller_id = service_seller4_id AND title = 'Антицеллюлитный массаж';

    RAISE NOTICE '✓ Создано 8 услуг';

    -- =====================================================================
    -- ПОКУПАТЕЛИ
    -- =====================================================================

    RAISE NOTICE 'Создание покупателей...';

    INSERT INTO users (email, full_name, phone, role, tariff, referral_id, created_at, is_banned)
    VALUES
    ('buyer1@test.com', 'Айнура Садыкова', '+996700111111', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '3 months', false),
    ('buyer2@test.com', 'Бекзат Алиев', '+996700222222', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '2 months', false),
    ('buyer3@test.com', 'Гульнара Осмонова', '+996700333333', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '1 month', false),
    ('buyer4@test.com', 'Данияр Токтосунов', '+996700444444', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '20 days', false),
    ('buyer5@test.com', 'Елена Ким', '+996700555555', 'user', 'free', upper(substr(md5(random()::text), 1, 12)), NOW() - INTERVAL '15 days', false)
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO buyer1_id FROM users WHERE email = 'buyer1@test.com';
    SELECT id INTO buyer2_id FROM users WHERE email = 'buyer2@test.com';
    SELECT id INTO buyer3_id FROM users WHERE email = 'buyer3@test.com';
    SELECT id INTO buyer4_id FROM users WHERE email = 'buyer4@test.com';
    SELECT id INTO buyer5_id FROM users WHERE email = 'buyer5@test.com';

    RAISE NOTICE '✓ Создано 5 покупателей';

    -- Получаем ID товаров для заказов
    SELECT id INTO product1_id FROM products WHERE seller_id = seller1_id AND product_type = 'product' LIMIT 1;
    SELECT id INTO product2_id FROM products WHERE seller_id = seller2_id AND product_type = 'product' LIMIT 1;
    SELECT id INTO product3_id FROM products WHERE seller_id = seller3_id AND product_type = 'product' LIMIT 1;
    SELECT id INTO product4_id FROM products WHERE seller_id = seller4_id AND product_type = 'product' LIMIT 1;
    SELECT id INTO product5_id FROM products WHERE seller_id = seller5_id AND product_type = 'product' LIMIT 1;

    -- =====================================================================
    -- ЗАКАЗЫ И ОТЗЫВЫ НА ТОВАРЫ
    -- =====================================================================

    RAISE NOTICE 'Создание заказов...';

    -- Заказ 1
    INSERT INTO orders (order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES ('ORD-20250115-A1B2C3D4', buyer1_id, seller1_id,
        jsonb_build_array(jsonb_build_object('product_id', product1_id, 'quantity', 2, 'price', 1200, 'discount_price', 999)),
        1998.00, 'г. Бишкек, ул. Киевская 45, кв. 12', '+996700111111', 'wallet', 'completed',
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '42 days')
    ON CONFLICT (order_number) DO NOTHING;

    SELECT id INTO order1_id FROM orders WHERE order_number = 'ORD-20250115-A1B2C3D4';

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller1_id, buyer1_id, order1_id, 9, 'Отличное качество! Футболки очень приятные на ощупь.', NOW() - INTERVAL '40 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 2
    INSERT INTO orders (order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES ('ORD-20250120-E5F6G7H8', buyer1_id, seller2_id,
        jsonb_build_array(jsonb_build_object('product_id', product2_id, 'quantity', 1, 'price', 85000, 'discount_price', 82000)),
        82000.00, 'г. Бишкек, ул. Киевская 45, кв. 12', '+996700111111', 'mbank', 'completed',
        NOW() - INTERVAL '35 days', NOW() - INTERVAL '33 days')
    ON CONFLICT (order_number) DO NOTHING;

    SELECT id INTO order2_id FROM orders WHERE order_number = 'ORD-20250120-E5F6G7H8';

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller2_id, buyer1_id, order2_id, 10, 'Телефон в идеальном состоянии! Все как описано.', NOW() - INTERVAL '30 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 3
    INSERT INTO orders (order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES ('ORD-20250125-I9J0K1L2', buyer2_id, seller4_id,
        jsonb_build_array(jsonb_build_object('product_id', product4_id, 'quantity', 1, 'price', 8500, 'discount_price', 7999)),
        7999.00, 'г. Бишкек, мкр. Асанбай 12-45', '+996700222222', 'wallet', 'completed',
        NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days')
    ON CONFLICT (order_number) DO NOTHING;

    SELECT id INTO order3_id FROM orders WHERE order_number = 'ORD-20250125-I9J0K1L2';

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller4_id, buyer2_id, order3_id, 8, 'Кроссовки оригинальные, качество хорошее.', NOW() - INTERVAL '20 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 4
    INSERT INTO orders (order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES ('ORD-20250128-M3N4O5P6', buyer3_id, seller5_id,
        jsonb_build_array(jsonb_build_object('product_id', product5_id, 'quantity', 1, 'price', 1500, 'discount_price', 1299)),
        1299.00, 'г. Бишкек, ул. Манаса 102', '+996700333333', 'wallet', 'completed',
        NOW() - INTERVAL '18 days', NOW() - INTERVAL '16 days')
    ON CONFLICT (order_number) DO NOTHING;

    SELECT id INTO order4_id FROM orders WHERE order_number = 'ORD-20250128-M3N4O5P6';

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller5_id, buyer3_id, order4_id, 9, 'Крем супер! Очень увлажняет кожу.', NOW() - INTERVAL '14 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 5
    INSERT INTO orders (order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES ('ORD-20250130-Q7R8S9T0', buyer4_id, seller3_id,
        jsonb_build_array(jsonb_build_object('product_id', product3_id, 'quantity', 5, 'price', 80)),
        400.00, 'г. Бишкек, мкр. Джал 15-67', '+996700444444', 'wallet', 'completed',
        NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days')
    ON CONFLICT (order_number) DO NOTHING;

    SELECT id INTO order5_id FROM orders WHERE order_number = 'ORD-20250130-Q7R8S9T0';

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (seller3_id, buyer4_id, order5_id, 10, 'Свежее молоко, отличное!', NOW() - INTERVAL '8 days')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    RAISE NOTICE '✓ Создано 5 заказов и 5 отзывов на товары';

    -- =====================================================================
    -- ЗАПИСИ НА УСЛУГИ
    -- =====================================================================

    RAISE NOTICE 'Создание записей на услуги...';

    -- Запись 1: Женская стрижка
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES (service1_id, service_seller1_id, buyer1_id, 'Айнура Садыкова', '+996700111111',
            NOW() + INTERVAL '2 days' + INTERVAL '10 hours', 'Хочу обновить стрижку', 'confirmed', NOW() - INTERVAL '3 days');

    -- Запись 2: Окрашивание волос
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES (service2_id, service_seller1_id, buyer2_id, 'Бекзат Алиев', '+996700222222',
            NOW() + INTERVAL '5 days' + INTERVAL '14 hours', NULL, 'pending', NOW() - INTERVAL '1 day');

    -- Запись 3: Занятие по математике
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES (service3_id, service_seller2_id, buyer3_id, 'Гульнара Осмонова', '+996700333333',
            NOW() + INTERVAL '1 day' + INTERVAL '16 hours', 'Подготовка к экзамену', 'confirmed', NOW() - INTERVAL '5 days');

    -- Запись 4: Маникюр (завершена, с отзывом)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, status, created_at)
    VALUES (service5_id, service_seller3_id, buyer4_id, 'Данияр Токтосунов', '+996700444444',
            NOW() - INTERVAL '10 days' + INTERVAL '11 hours', 'completed', NOW() - INTERVAL '15 days');

    -- Запись 5: Массаж (завершена, с отзывом)
    INSERT INTO bookings (service_id, seller_id, buyer_id, customer_name, customer_phone, booking_datetime, comment, status, created_at)
    VALUES (service7_id, service_seller4_id, buyer5_id, 'Елена Ким', '+996700555555',
            NOW() - INTERVAL '7 days' + INTERVAL '18 hours', 'Болит спина', 'completed', NOW() - INTERVAL '12 days');

    RAISE NOTICE '✓ Создано 5 записей на услуги';

    -- =====================================================================
    -- ОТЗЫВЫ НА УСЛУГИ
    -- =====================================================================

    RAISE NOTICE 'Создание отзывов на услуги...';

    -- Отзыв на маникюр
    INSERT INTO reviews (seller_id, buyer_id, booking_id, rating, comment, created_at)
    SELECT service_seller3_id, buyer4_id, b.id, 10, 'Отличная работа! Маникюр держится уже 2 недели.', NOW() - INTERVAL '8 days'
    FROM bookings b
    WHERE b.service_id = service5_id AND b.buyer_id = buyer4_id
    LIMIT 1
    ON CONFLICT (booking_id, buyer_id) DO NOTHING;

    -- Отзыв на массаж
    INSERT INTO reviews (seller_id, buyer_id, booking_id, rating, comment, created_at)
    SELECT service_seller4_id, buyer5_id, b.id, 9, 'Мастер знает свое дело, спина больше не болит!', NOW() - INTERVAL '5 days'
    FROM bookings b
    WHERE b.service_id = service7_id AND b.buyer_id = buyer5_id
    LIMIT 1
    ON CONFLICT (booking_id, buyer_id) DO NOTHING;

    RAISE NOTICE '✓ Создано 2 отзыва на услуги';

END $$;

COMMIT;

-- =====================================================================
-- ИТОГОВАЯ СТАТИСТИКА
-- =====================================================================

DO $$
DECLARE
    users_count INT;
    sellers_count INT;
    products_count INT;
    services_count INT;
    buyers_count INT;
    orders_count INT;
    bookings_count INT;
    reviews_count INT;
BEGIN
    SELECT COUNT(*) INTO users_count FROM users;
    SELECT COUNT(*) INTO sellers_count FROM users WHERE role = 'seller';
    SELECT COUNT(*) INTO products_count FROM products WHERE product_type = 'product';
    SELECT COUNT(*) INTO services_count FROM products WHERE product_type = 'service';
    SELECT COUNT(*) INTO buyers_count FROM users WHERE role = 'user';
    SELECT COUNT(*) INTO orders_count FROM orders;
    SELECT COUNT(*) INTO bookings_count FROM bookings;
    SELECT COUNT(*) INTO reviews_count FROM reviews;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ТЕСТОВЫЕ ДАННЫЕ УСПЕШНО СОЗДАНЫ!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Пользователей всего: %', users_count;
    RAISE NOTICE 'Продавцов: %', sellers_count;
    RAISE NOTICE 'Покупателей: %', buyers_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Товаров: %', products_count;
    RAISE NOTICE 'Услуг: %', services_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Заказов товаров: %', orders_count;
    RAISE NOTICE 'Записей на услуги: %', bookings_count;
    RAISE NOTICE 'Отзывов: %', reviews_count;
    RAISE NOTICE '========================================';
END $$;
