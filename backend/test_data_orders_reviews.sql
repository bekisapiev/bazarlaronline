-- Дополнительные тестовые данные: покупатели, заказы и отзывы
-- Запуск: psql -U bazarlar_user -d bazarlar_claude -f test_data_orders_reviews.sql
-- Или через Docker: docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude < backend/test_data_orders_reviews.sql

-- ВНИМАНИЕ: Этот скрипт требует, чтобы сначала был загружен test_data.sql с продавцами и товарами!

BEGIN;

-- Тестовые покупатели
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

    sellers_count INT;
    products_count INT;

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

    -- Проверяем наличие продавцов
    SELECT COUNT(*) INTO sellers_count FROM users WHERE role = 'seller';
    RAISE NOTICE 'Найдено продавцов: %', sellers_count;

    IF sellers_count = 0 THEN
        RAISE EXCEPTION 'ОШИБКА: В базе данных нет продавцов! Сначала загрузите test_data.sql';
    END IF;

    -- Проверяем наличие товаров
    SELECT COUNT(*) INTO products_count FROM products;
    RAISE NOTICE 'Найдено товаров: %', products_count;

    IF products_count = 0 THEN
        RAISE EXCEPTION 'ОШИБКА: В базе данных нет товаров! Сначала загрузите test_data.sql';
    END IF;

    -- Получаем ID продавцов из существующих данных
    RAISE NOTICE 'Получение ID продавцов...';

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

    IF seller1_id IS NULL THEN
        RAISE EXCEPTION 'ОШИБКА: Продавец seller1@test.com не найден! Сначала загрузите test_data.sql';
    END IF;

    RAISE NOTICE '✓ Продавцы найдены';

    -- Получаем ID товаров для заказов
    RAISE NOTICE 'Получение ID товаров...';

    SELECT id INTO product1_id FROM products WHERE seller_id = seller1_id LIMIT 1;
    SELECT id INTO product2_id FROM products WHERE seller_id = seller2_id LIMIT 1;
    SELECT id INTO product3_id FROM products WHERE seller_id = seller4_id LIMIT 1;
    SELECT id INTO product4_id FROM products WHERE seller_id = seller5_id LIMIT 1;
    SELECT id INTO product5_id FROM products WHERE seller_id = seller6_id LIMIT 1;

    RAISE NOTICE '✓ Товары найдены';
    RAISE NOTICE 'Создание заказов и отзывов...';

    -- Заказ 1: buyer1 покупает у seller1
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order1_id,
        'ORD-20250115-A1B2C3D4',
        buyer1_id,
        seller1_id,
        jsonb_build_array(jsonb_build_object('product_id', product1_id, 'quantity', 2, 'price', 1200, 'discount_price', 999)),
        1998.00,
        'г. Бишкек, ул. Киевская 45, кв. 12',
        '+996700111111',
        'wallet',
        'completed',
        NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '42 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller1_id, buyer1_id, order1_id, 9,
        'Отличное качество! Футболки очень приятные на ощупь, размер соответствует. Продавец быстро ответил на вопросы. Рекомендую!',
        NOW() - INTERVAL '40 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 2: buyer1 покупает у seller2
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order2_id,
        'ORD-20250120-E5F6G7H8',
        buyer1_id,
        seller2_id,
        jsonb_build_array(jsonb_build_object('product_id', product2_id, 'quantity', 1, 'price', 85000, 'discount_price', 82000)),
        82000.00,
        'г. Бишкек, ул. Киевская 45, кв. 12',
        '+996700111111',
        'mbank',
        'completed',
        NOW() - INTERVAL '35 days',
        NOW() - INTERVAL '33 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller2_id, buyer1_id, order2_id, 10,
        'Телефон в идеальном состоянии! Все как описано, запечатанный, оригинал. Доставка быстрая, продавец очень вежливый. Спасибо большое!',
        NOW() - INTERVAL '30 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 3: buyer2 покупает у seller4
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order3_id,
        'ORD-20250125-I9J0K1L2',
        buyer2_id,
        seller4_id,
        jsonb_build_array(jsonb_build_object('product_id', product3_id, 'quantity', 1, 'price', 6500, 'discount_price', 5999)),
        5999.00,
        'г. Бишкек, мкр. Асанбай 12-34',
        '+996700222222',
        'wallet',
        'completed',
        NOW() - INTERVAL '28 days',
        NOW() - INTERVAL '26 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller4_id, buyer2_id, order3_id, 8,
        'Кроссовки хорошие, удобные. Размер подошел. Доставка заняла чуть больше времени, чем обещали, но в целом все отлично.',
        NOW() - INTERVAL '24 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 4: buyer3 покупает у seller5
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order4_id,
        'ORD-20250128-M3N4O5P6',
        buyer3_id,
        seller5_id,
        jsonb_build_array(jsonb_build_object('product_id', product4_id, 'quantity', 1, 'price', 3500, 'discount_price', 3199)),
        3199.00,
        'г. Бишкек, ул. Манаса 102',
        '+996700333333',
        'wallet',
        'completed',
        NOW() - INTERVAL '22 days',
        NOW() - INTERVAL '20 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller5_id, buyer3_id, order4_id, 10,
        'Превосходно! Тональный крем оригинальный, подошел идеально. Упаковка красивая, есть чек. Продавец профессионал!',
        NOW() - INTERVAL '18 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 5: buyer4 покупает у seller6
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order5_id,
        'ORD-20250130-Q7R8S9T0',
        buyer4_id,
        seller6_id,
        jsonb_build_array(jsonb_build_object('product_id', product5_id, 'quantity', 1, 'price', 3500, 'discount_price', 2999)),
        2999.00,
        'г. Бишкек, мкр. Джал 15-67',
        '+996700444444',
        'mbank',
        'completed',
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '16 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller6_id, buyer4_id, order5_id, 9,
        'Ребенок в восторге! Конструктор оригинальный LEGO, все детали на месте. Упаковка целая. Спасибо!',
        NOW() - INTERVAL '14 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 6: buyer5 покупает у seller1
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order6_id,
        'ORD-20250202-U1V2W3X4',
        buyer5_id,
        seller1_id,
        '[]'::jsonb,
        4500.00,
        'г. Бишкек, ул. Боконбаева 200',
        '+996700555555',
        'wallet',
        'completed',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '13 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller1_id, buyer5_id, order6_id, 7,
        'Товар нормальный, но доставка задержалась на 2 дня. В остальном претензий нет.',
        NOW() - INTERVAL '11 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 7: buyer6 покупает у seller3
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order7_id,
        'ORD-20250205-Y5Z6A7B8',
        buyer6_id,
        seller3_id,
        '[]'::jsonb,
        450.00,
        'г. Бишкек, мкр. Кок-Жар 5-12',
        '+996700666666',
        'wallet',
        'completed',
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '11 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller3_id, buyer6_id, order7_id, 10,
        'Молоко и яйца всегда свежие! Покупаю постоянно. Очень довольна качеством!',
        NOW() - INTERVAL '10 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 8: buyer7 покупает у seller7
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order8_id,
        'ORD-20250207-C9D0E1F2',
        buyer7_id,
        seller7_id,
        '[]'::jsonb,
        1998.00,
        'г. Бишкек, ул. Ибраимова 45',
        '+996700777777',
        'mbank',
        'completed',
        NOW() - INTERVAL '9 days',
        NOW() - INTERVAL '8 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller7_id, buyer7_id, order8_id, 8,
        'Коврик для йоги отличный, не скользит. Доставка быстрая. Рекомендую!',
        NOW() - INTERVAL '7 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 9: buyer8 покупает у seller8
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order9_id,
        'ORD-20250209-G3H4I5J6',
        buyer8_id,
        seller8_id,
        '[]'::jsonb,
        2199.00,
        'г. Ош, ул. Ленина 123',
        '+996700888888',
        'wallet',
        'completed',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '5 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller8_id, buyer8_id, order9_id, 9,
        'Постельное белье высокого качества, сатин приятный. Упаковка хорошая. Спасибо!',
        NOW() - INTERVAL '4 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 10: buyer2 покупает у seller2
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order10_id,
        'ORD-20250210-K7L8M9N0',
        buyer2_id,
        seller2_id,
        '[]'::jsonb,
        16999.00,
        'г. Бишкек, мкр. Асанбай 12-34',
        '+996700222222',
        'wallet',
        'completed',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '4 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller2_id, buyer2_id, order10_id, 10,
        'AirPods супер! Звук чистый, шумоподавление работает отлично. Продавец топ!',
        NOW() - INTERVAL '3 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 11: buyer3 покупает у seller9
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order11_id,
        'ORD-20250212-O1P2Q3R4',
        buyer3_id,
        seller9_id,
        '[]'::jsonb,
        4500.00,
        'г. Ош, микрорайон 5, дом 12',
        '+996700333333',
        'mbank',
        'completed',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '3 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller9_id, buyer3_id, order11_id, 9,
        'Красивое национальное платье! Качество отличное, вышивка аккуратная. Очень довольна покупкой!',
        NOW() - INTERVAL '2 days'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 12: buyer1 покупает у seller4
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order12_id,
        'ORD-20250213-S5T6U7V8',
        buyer1_id,
        seller4_id,
        '[]'::jsonb,
        2999.00,
        'г. Бишкек, ул. Киевская 45, кв. 12',
        '+996700111111',
        'wallet',
        'completed',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '2 days'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller4_id, buyer1_id, order12_id, 8,
        'Туфли удобные, каблук устойчивый. Размер соответствует. Хорошая покупка!',
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 13: buyer5 покупает у seller10
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order13_id,
        'ORD-20250214-W9X0Y1Z2',
        buyer5_id,
        seller10_id,
        '[]'::jsonb,
        1499.00,
        'г. Джалал-Абад, ул. Эркиндик 56',
        '+996700555555',
        'wallet',
        'completed',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller10_id, buyer5_id, order13_id, 7,
        'Powerbank работает хорошо, заряжает быстро. Но корпус немного поцарапан был.',
        NOW() - INTERVAL '12 hours'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 14: buyer6 покупает у seller5
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order14_id,
        'ORD-20250215-A3B4C5D6',
        buyer6_id,
        seller5_id,
        '[]'::jsonb,
        699.00,
        'г. Бишкек, мкр. Кок-Жар 5-12',
        '+996700666666',
        'mbank',
        'completed',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '6 hours'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller5_id, buyer6_id, order14_id, 10,
        'Маски супер! Кожа стала мягкая и увлажненная. Беру уже не первый раз!',
        NOW() - INTERVAL '3 hours'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказ 15: buyer7 покупает у seller6
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order15_id,
        'ORD-20250216-E7F8G9H0',
        buyer7_id,
        seller6_id,
        '[]'::jsonb,
        3999.00,
        'г. Бишкек, ул. Ибраимова 45',
        '+996700777777',
        'wallet',
        'completed',
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '2 hours'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO reviews (seller_id, buyer_id, order_id, rating, comment, created_at)
    VALUES (
        seller6_id, buyer7_id, order15_id, 9,
        'Комбинезон теплый, качественный. Ребенку в самый раз. Спасибо за быструю доставку!',
        NOW() - INTERVAL '1 hour'
    ) ON CONFLICT (order_id, buyer_id) DO NOTHING;

    -- Заказы в процессе (без отзывов)
    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order16_id, 'ORD-20250217-I1J2K3L4', buyer8_id, seller1_id, '[]'::jsonb, 1999.00,
        'г. Бишкек, мкр. Аламедин-1', '+996700888888', 'wallet', 'processing',
        NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order17_id, 'ORD-20250217-M5N6O7P8', buyer4_id, seller2_id, '[]'::jsonb, 19999.00,
        'г. Бишкек, мкр. Джал 15-67', '+996700444444', 'mbank', 'processing',
        NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order18_id, 'ORD-20250218-Q9R0S1T2', buyer1_id, seller3_id, '[]'::jsonb, 340.00,
        'г. Бишкек, ул. Киевская 45, кв. 12', '+996700111111', 'wallet', 'pending',
        NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order19_id, 'ORD-20250218-U3V4W5X6', buyer3_id, seller7_id, '[]'::jsonb, 499.00,
        'г. Бишкек, ул. Манаса 102', '+996700333333', 'wallet', 'pending',
        NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'
    ) ON CONFLICT (order_number) DO NOTHING;

    INSERT INTO orders (id, order_number, buyer_id, seller_id, items, total_amount, delivery_address, phone_number, payment_method, status, created_at, updated_at)
    VALUES (
        order20_id, 'ORD-20250218-Y7Z8A9B0', buyer5_id, seller8_id, '[]'::jsonb, 2999.00,
        'г. Ош, ул. Курманжан Датка 78', '+996700555555', 'mbank', 'pending',
        NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'
    ) ON CONFLICT (order_number) DO NOTHING;

    RAISE NOTICE '✓ Создано 20 заказов';
    RAISE NOTICE '✓ Создано 15 отзывов';
    RAISE NOTICE 'Тестовые покупатели, заказы и отзывы успешно созданы!';

END $$;

COMMIT;

-- Проверка данных
SELECT 'Покупателей:' as info, COUNT(*) as count FROM users WHERE role = 'user'
UNION ALL
SELECT 'Заказов:', COUNT(*) FROM orders
UNION ALL
SELECT 'Отзывов:', COUNT(*) FROM reviews;
