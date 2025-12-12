-- =====================================================================
-- Скрипт 3: Тестовые данные (только товары)
-- =====================================================================
-- Описание: Загрузка тестовых данных для разработки и тестирования
-- ВАЖНО: Перед запуском убедитесь, что выполнены schema.sql и seed_data.sql
-- =====================================================================

BEGIN;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'СОЗДАНИЕ ТЕСТОВЫХ ДАННЫХ (ТОЛЬКО ТОВАРЫ)';
    RAISE NOTICE '========================================';
END $$;

-- Тестовый админ
INSERT INTO users (id, email, full_name, role, tariff, referral_id, created_at, is_banned)
VALUES (gen_random_uuid(), 'admin@bazarlar.online', 'Администратор', 'admin', 'business',
    upper(substr(md5(random()::text), 1, 12)), NOW(), false)
ON CONFLICT (email) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✓ Создан администратор'; END $$;

-- Продавцы и товары
DO $$
DECLARE
    seller1_id UUID;
    seller2_id UUID;
    seller3_id UUID;
    buyer1_id UUID;
    buyer2_id UUID;
    product1_id UUID;
    product2_id UUID;
    order1_id UUID;
BEGIN
    -- Продавец 1: Одежда
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id) VALUES
    ('seller1@test.com', 'Айгуль Асанова', '+996555111111', 'seller', 'pro', upper(substr(md5(random()::text), 1, 12)))
    ON CONFLICT (email) DO NOTHING;
    SELECT id INTO seller1_id FROM users WHERE email = 'seller1@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller1_id, 'Модный стиль', 'Женская и мужская одежда', 1, 1, 'market', 1, 'Дордой, к.456', 4.8, 127, true)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, stock_quantity, delivery_type, characteristics, images, status, views_count) VALUES
    (seller1_id, 'Мужская футболка polo', 'Хлопковая футболка', 111, 1200, 999, 50, 'paid', '[{"name":"Размер","value":"M,L,XL"}]', '["https://placehold.co/600x400/4A90E2/FFF?text=Polo"]', 'active', 145),
    (seller1_id, 'Женское платье', 'Летнее платье', 121, 2500, 1999, 30, 'paid', '[{"name":"Размер","value":"S,M,L"}]', '["https://placehold.co/600x400/FF6B9D/FFF?text=Dress"]', 'active', 238);

    -- Продавец 2: Электроника
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id) VALUES
    ('seller2@test.com', 'Тимур Бекмуратов', '+996555222222', 'seller', 'business', upper(substr(md5(random()::text), 1, 12)))
    ON CONFLICT (email) DO NOTHING;
    SELECT id INTO seller2_id FROM users WHERE email = 'seller2@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, address, rating, reviews_count, is_verified)
    VALUES (seller2_id, 'TechnoShop', 'Смартфоны и ноутбуки', 3, 1, 'boutique', 'ул. Чуй 156', 4.9, 245, true)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO products (seller_id, title, description, category_id, price, discount_price, stock_quantity, delivery_type, characteristics, images, status, views_count) VALUES
    (seller2_id, 'iPhone 15 Pro 256GB', 'Новый iPhone', 311, 85000, 82000, 10, 'free', '[{"name":"Память","value":"256GB"}]', '["https://placehold.co/600x400/000/FFF?text=iPhone"]', 'active', 512);

    -- Продавец 3: Продукты
    INSERT INTO users (email, full_name, phone, role, tariff, referral_id) VALUES
    ('seller3@test.com', 'Нургуль Токтогулова', '+996555333333', 'seller', 'free', upper(substr(md5(random()::text), 1, 12)))
    ON CONFLICT (email) DO NOTHING;
    SELECT id INTO seller3_id FROM users WHERE email = 'seller3@test.com';

    INSERT INTO seller_profiles (user_id, shop_name, description, category_id, city_id, seller_type, market_id, address, rating, reviews_count, is_verified)
    VALUES (seller3_id, 'Фермерские продукты', 'Свежие продукты', 4, 1, 'market', 2, 'Ошский рынок', 4.5, 89, true)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO products (seller_id, title, description, category_id, price, stock_quantity, delivery_type, characteristics, images, status, views_count) VALUES
    (seller3_id, 'Молоко домашнее 1л', 'Свежее молоко', 41, 80, 100, 'pickup', '[{"name":"Объем","value":"1л"}]', '["https://placehold.co/600x400/FFF/000?text=Milk"]', 'active', 567);

    RAISE NOTICE '✓ Создано 3 продавца и 4 товара';

    -- Покупатели
    INSERT INTO users (email, full_name, phone, role, referral_id) VALUES
    ('buyer1@test.com', 'Айнура Садыкова', '+996700111111', 'user', upper(substr(md5(random()::text), 1, 12))),
    ('buyer2@test.com', 'Бекзат Алиев', '+996700222222', 'user', upper(substr(md5(random()::text), 1, 12)))
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO buyer1_id FROM users WHERE email = 'buyer1@test.com';
    SELECT id INTO buyer2_id FROM users WHERE email = 'buyer2@test.com';
    SELECT id INTO product1_id FROM products WHERE seller_id = seller1_id LIMIT 1;

    RAISE NOTICE '✓ Создано 2 покупателя';

    -- Заказ
    INSERT INTO orders (order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES ('ORD-20250115-TEST01', buyer1_id, seller1_id,
        jsonb_build_array(jsonb_build_object('product_id', product1_id, 'quantity', 2, 'price', 1200, 'discount_price', 999)),
        1998.00, 'г. Бишкек, ул. Киевская 45', '+996700111111', 'wallet', 'completed',
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days')
    ON CONFLICT (order_number) DO NOTHING;

    SELECT id INTO order1_id FROM orders WHERE order_number = 'ORD-20250115-TEST01';

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment)
    VALUES (seller1_id, buyer1_id, order1_id, 9, 'Отличное качество!')
    ON CONFLICT (order_id, buyer_id) DO NOTHING;

    RAISE NOTICE '✓ Создан 1 заказ и 1 отзыв';
END $$;

COMMIT;

DO $$
DECLARE
    users_count INT;
    products_count INT;
    orders_count INT;
BEGIN
    SELECT COUNT(*) INTO users_count FROM users;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO orders_count FROM orders;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ТЕСТОВЫЕ ДАННЫЕ СОЗДАНЫ!';
    RAISE NOTICE 'Пользователей: %', users_count;
    RAISE NOTICE 'Товаров: %', products_count;
    RAISE NOTICE 'Заказов: %', orders_count;
    RAISE NOTICE '========================================';
END $$;
