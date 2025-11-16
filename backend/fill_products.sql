-- Заполнение таблицы products тестовыми данными
-- Запуск: docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude -f fill_products.sql
-- или: Get-Content fill_products.sql | docker exec -i bazarlar_postgres psql -U bazarlar_user -d bazarlar_claude

DO $$
DECLARE
    seller_ids UUID[];
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
BEGIN
    -- Получаем существующих продавцов из базы (первые 10)
    SELECT ARRAY(SELECT id FROM users WHERE role='seller' ORDER BY created_at LIMIT 10) INTO seller_ids;

    -- Если продавцов меньше 10, используем те что есть
    IF array_length(seller_ids, 1) >= 1 THEN seller1_id := seller_ids[1]; END IF;
    IF array_length(seller_ids, 1) >= 2 THEN seller2_id := seller_ids[2]; END IF;
    IF array_length(seller_ids, 1) >= 3 THEN seller3_id := seller_ids[3]; END IF;
    IF array_length(seller_ids, 1) >= 4 THEN seller4_id := seller_ids[4]; END IF;
    IF array_length(seller_ids, 1) >= 5 THEN seller5_id := seller_ids[5]; END IF;
    IF array_length(seller_ids, 1) >= 6 THEN seller6_id := seller_ids[6]; END IF;
    IF array_length(seller_ids, 1) >= 7 THEN seller7_id := seller_ids[7]; END IF;
    IF array_length(seller_ids, 1) >= 8 THEN seller8_id := seller_ids[8]; END IF;
    IF array_length(seller_ids, 1) >= 9 THEN seller9_id := seller_ids[9]; END IF;
    IF array_length(seller_ids, 1) >= 10 THEN seller10_id := seller_ids[10]; END IF;

    -- Товары продавца 1 (Одежда)
    IF seller1_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller1_id, 'Мужская футболка polo', 'Качественная хлопковая футболка с воротником polo', 11, 1200, 999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"M, L, XL"},{"name":"Цвет","value":"Белый, Черный, Синий"},{"name":"Материал","value":"100% хлопок"}]', '["https://placehold.co/600x400/4A90E2/FFF?text=Polo+Shirt"]', 'active', 145, NOW()),
        (gen_random_uuid(), seller1_id, 'Женское платье летнее', 'Легкое летнее платье из натуральной ткани', 12, 2500, 1999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"S, M, L"},{"name":"Цвет","value":"Розовый, Голубой"},{"name":"Материал","value":"Лен"}]', '["https://placehold.co/600x400/FF6B9D/FFF?text=Summer+Dress"]', 'active', 238, NOW()),
        (gen_random_uuid(), seller1_id, 'Джинсы мужские классические', 'Плотные джинсы прямого кроя', 11, 3500, 2999, 'paid', '["taxi"]', '[{"name":"Размер","value":"30-36"},{"name":"Цвет","value":"Синий, Черный"}]', '["https://placehold.co/600x400/2C3E50/FFF?text=Jeans"]', 'active', 189, NOW()),
        (gen_random_uuid(), seller1_id, 'Зимняя куртка', 'Теплая зимняя куртка с капюшоном', 13, 5500, 4999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"M, L, XL, XXL"},{"name":"Цвет","value":"Черный, Темно-синий"}]', '["https://placehold.co/600x400/34495E/FFF?text=Winter+Jacket"]', 'active', 276, NOW()),
        (gen_random_uuid(), seller1_id, 'Шарф кашемировый', 'Мягкий кашемировый шарф', 14, 1800, NULL, 'paid', '["taxi"]', '[{"name":"Цвет","value":"Бежевый, Серый, Бордовый"}]', '["https://placehold.co/600x400/95A5A6/FFF?text=Scarf"]', 'active', 92, NOW());
    END IF;

    -- Товары продавца 2 (Электроника)
    IF seller2_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller2_id, 'iPhone 15 Pro 256GB', 'Новый iPhone 15 Pro с титановым корпусом', 311, 85000, 82000, 'free', '["express", "courier"]', '[{"name":"Память","value":"256GB"},{"name":"Цвет","value":"Титан"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/000000/FFF?text=iPhone+15+Pro"]', 'active', 512, NOW()),
        (gen_random_uuid(), seller2_id, 'Samsung Galaxy S24 Ultra', 'Флагманский смартфон Samsung с S Pen', 312, 75000, 72000, 'free', '["express", "courier"]', '[{"name":"Память","value":"512GB"},{"name":"Цвет","value":"Черный"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/1428A0/FFF?text=Galaxy+S24"]', 'active', 445, NOW()),
        (gen_random_uuid(), seller2_id, 'Xiaomi Redmi Note 13 Pro', 'Смартфон с отличной камерой', 313, 22000, 19999, 'free', '["express", "courier"]', '[{"name":"Память","value":"256GB"},{"name":"Цвет","value":"Синий, Черный"}]', '["https://placehold.co/600x400/FF6900/FFF?text=Redmi+Note"]', 'active', 678, NOW()),
        (gen_random_uuid(), seller2_id, 'MacBook Pro 14 M3', 'Ноутбук для профессионалов', 32, 120000, 115000, 'free', '["courier"]', '[{"name":"Процессор","value":"Apple M3"},{"name":"Память","value":"16GB RAM, 512GB SSD"},{"name":"Цвет","value":"Space Gray"}]', '["https://placehold.co/600x400/A2AAAD/FFF?text=MacBook+Pro"]', 'active', 389, NOW()),
        (gen_random_uuid(), seller2_id, 'AirPods Pro 2', 'Беспроводные наушники с шумоподавлением', 34, 18000, 16999, 'free', '["express", "courier"]', '[{"name":"Особенности","value":"ANC, Прозрачный режим"},{"name":"Состояние","value":"Новый"}]', '["https://placehold.co/600x400/FFFFFF/000?text=AirPods+Pro"]', 'active', 234, NOW());
    END IF;

    -- Товары продавца 3 (Продукты)
    IF seller3_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller3_id, 'Молоко домашнее 1л', 'Свежее коровье молоко от фермеров', 4, 80, NULL, 'pickup', '[]', '[{"name":"Объем","value":"1 литр"},{"name":"Жирность","value":"3.2%"}]', '["https://placehold.co/600x400/FFFFFF/000?text=Milk"]', 'active', 567, NOW()),
        (gen_random_uuid(), seller3_id, 'Яйца куриные 10 шт', 'Свежие домашние яйца', 4, 120, 100, 'pickup', '[]', '[{"name":"Количество","value":"10 штук"},{"name":"Категория","value":"С1"}]', '["https://placehold.co/600x400/F4E4C1/000?text=Eggs"]', 'active', 423, NOW()),
        (gen_random_uuid(), seller3_id, 'Помидоры свежие 1кг', 'Свежие тепличные помидоры', 4, 150, NULL, 'pickup', '["taxi"]', '[{"name":"Вес","value":"1 кг"}]', '["https://placehold.co/600x400/FF6347/FFF?text=Tomatoes"]', 'active', 312, NOW()),
        (gen_random_uuid(), seller3_id, 'Огурцы 1кг', 'Свежие хрустящие огурцы', 4, 100, 90, 'pickup', '["taxi"]', '[{"name":"Вес","value":"1 кг"}]', '["https://placehold.co/600x400/90EE90/000?text=Cucumbers"]', 'active', 289, NOW());
    END IF;

    -- Товары продавца 4 (Обувь)
    IF seller4_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller4_id, 'Кроссовки Nike Air Max', 'Спортивные кроссовки для бега', 2, 6500, 5999, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"39-45"},{"name":"Цвет","value":"Черный, Белый"},{"name":"Материал","value":"Текстиль, резина"}]', '["https://placehold.co/600x400/000000/FFF?text=Nike+Air+Max"]', 'active', 445, NOW()),
        (gen_random_uuid(), seller4_id, 'Туфли женские классические', 'Элегантные туфли на каблуке', 2, 3500, 2999, 'paid', '["taxi"]', '[{"name":"Размер","value":"36-40"},{"name":"Цвет","value":"Черный, Бежевый"},{"name":"Высота каблука","value":"7см"}]', '["https://placehold.co/600x400/000000/FFF?text=Heels"]', 'active', 334, NOW()),
        (gen_random_uuid(), seller4_id, 'Ботинки зимние мужские', 'Теплые зимние ботинки', 2, 4500, 3999, 'paid', '["taxi"]', '[{"name":"Размер","value":"40-46"},{"name":"Цвет","value":"Черный, Коричневый"}]', '["https://placehold.co/600x400/8B4513/FFF?text=Winter+Boots"]', 'active', 267, NOW());
    END IF;

    -- Товары продавца 5 (Косметика)
    IF seller5_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller5_id, 'Тональный крем Estee Lauder', 'Стойкий тональный крем 24 часа', 6, 3500, 3199, 'free', '["express", "courier"]', '[{"name":"Оттенок","value":"Ivory, Beige, Tan"},{"name":"Объем","value":"30ml"}]', '["https://placehold.co/600x400/FFE4B5/000?text=Foundation"]', 'active', 523, NOW()),
        (gen_random_uuid(), seller5_id, 'Корейская тканевая маска набор 10шт', 'Увлажняющие маски для лица', 6, 800, 699, 'paid', '["taxi", "express"]', '[{"name":"Тип","value":"Увлажняющая"},{"name":"Количество","value":"10 штук"}]', '["https://placehold.co/600x400/FFB6C1/000?text=Face+Masks"]', 'active', 678, NOW()),
        (gen_random_uuid(), seller5_id, 'Помада MAC матовая', 'Стойкая матовая помада', 6, 2200, 1999, 'paid', '["express"]', '[{"name":"Оттенок","value":"Red, Pink, Nude"}]', '["https://placehold.co/600x400/DC143C/FFF?text=Lipstick"]', 'active', 445, NOW());
    END IF;

    -- Товары продавца 6 (Детские товары)
    IF seller6_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller6_id, 'Коляска прогулочная Babytime', 'Легкая прогулочная коляска', 7, 8500, 7999, 'paid', '["cargo"]', '[{"name":"Вес","value":"6.5 кг"},{"name":"Цвет","value":"Серый, Синий"}]', '["https://placehold.co/600x400/708090/FFF?text=Stroller"]', 'active', 234, NOW()),
        (gen_random_uuid(), seller6_id, 'Конструктор LEGO Classic', 'Набор для творчества 500 деталей', 7, 3500, 2999, 'paid', '["taxi", "express"]', '[{"name":"Возраст","value":"4+"},{"name":"Детали","value":"500 шт"}]', '["https://placehold.co/600x400/FFD700/000?text=LEGO"]', 'active', 567, NOW()),
        (gen_random_uuid(), seller6_id, 'Детский комбинезон зимний', 'Теплый зимний комбинезон', 7, 4500, 3999, 'paid', '["taxi"]', '[{"name":"Размер","value":"80-110см"},{"name":"Цвет","value":"Синий, Розовый"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Overalls"]', 'active', 345, NOW());
    END IF;

    -- Товары продавца 7 (Спорт)
    IF seller7_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller7_id, 'Гантели разборные 20кг', 'Пара разборных гантелей', 8, 3500, NULL, 'paid', '["cargo"]', '[{"name":"Вес","value":"2x10 кг"}]', '["https://placehold.co/600x400/696969/FFF?text=Dumbbells"]', 'active', 178, NOW()),
        (gen_random_uuid(), seller7_id, 'Коврик для йоги', 'Нескользящий коврик для занятий', 8, 1200, 999, 'paid', '["taxi"]', '[{"name":"Размер","value":"180x60см"},{"name":"Цвет","value":"Фиолетовый, Зеленый"}]', '["https://placehold.co/600x400/9370DB/FFF?text=Yoga+Mat"]', 'active', 234, NOW()),
        (gen_random_uuid(), seller7_id, 'Скакалка профессиональная', 'Скакалка для кроссфита', 8, 600, 499, 'paid', '["taxi"]', '[{"name":"Длина","value":"3 метра"}]', '["https://placehold.co/600x400/FF4500/FFF?text=Jump+Rope"]', 'active', 145, NOW());
    END IF;

    -- Товары продавца 8 (Товары для дома - Ош)
    IF seller8_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller8_id, 'Постельное белье сатин', 'Комплект постельного белья 2-спальный', 5, 2500, 2199, 'paid', '["taxi"]', '[{"name":"Размер","value":"2-спальный"},{"name":"Материал","value":"Сатин"}]', '["https://placehold.co/600x400/E6E6FA/000?text=Bedding"]', 'active', 267, NOW()),
        (gen_random_uuid(), seller8_id, 'Набор полотенец 3шт', 'Махровые полотенца', 5, 1200, 999, 'paid', '["taxi"]', '[{"name":"Размер","value":"50x90, 70x140"},{"name":"Цвет","value":"Белый, Бежевый"}]', '["https://placehold.co/600x400/F5F5DC/000?text=Towels"]', 'active', 189, NOW()),
        (gen_random_uuid(), seller8_id, 'Шторы блэкаут', 'Светонепроницаемые шторы', 5, 3500, 2999, 'paid', '["cargo"]', '[{"name":"Размер","value":"270x280см"},{"name":"Цвет","value":"Серый, Бежевый"}]', '["https://placehold.co/600x400/808080/FFF?text=Curtains"]', 'active', 234, NOW());
    END IF;

    -- Товары продавца 9 (Одежда - Ош)
    IF seller9_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller9_id, 'Национальное платье элечек', 'Традиционное кыргызское платье', 12, 4500, NULL, 'paid', '["taxi", "express"]', '[{"name":"Размер","value":"S, M, L"},{"name":"Цвет","value":"Красный, Синий"}]', '["https://placehold.co/600x400/DC143C/FFF?text=Traditional+Dress"]', 'active', 156, NOW()),
        (gen_random_uuid(), seller9_id, 'Кыргызский калпак', 'Традиционный войлочный головной убор', 14, 1500, 1299, 'paid', '["taxi"]', '[{"name":"Размер","value":"56-60"}]', '["https://placehold.co/600x400/F0F8FF/000?text=Kalpak"]', 'active', 198, NOW());
    END IF;

    -- Товары продавца 10 (Электроника - Джалал-Абад)
    IF seller10_id IS NOT NULL THEN
        INSERT INTO products (id, seller_id, title, description, category_id, price, discount_price, delivery_type, delivery_methods, characteristics, images, status, views_count, created_at)
        VALUES
        (gen_random_uuid(), seller10_id, 'Наушники JBL Tune 500', 'Накладные наушники с отличным звуком', 34, 2500, 2199, 'paid', '["taxi", "express"]', '[{"name":"Цвет","value":"Черный, Белый"},{"name":"Тип","value":"Проводные"}]', '["https://placehold.co/600x400/000000/FFF?text=JBL+Headphones"]', 'active', 234, NOW()),
        (gen_random_uuid(), seller10_id, 'Powerbank 20000mAh', 'Внешний аккумулятор быстрая зарядка', 34, 1800, 1499, 'paid', '["taxi", "express"]', '[{"name":"Емкость","value":"20000mAh"},{"name":"Порты","value":"USB-C, USB-A"}]', '["https://placehold.co/600x400/4169E1/FFF?text=Powerbank"]', 'active', 312, NOW());
    END IF;

    RAISE NOTICE 'Товары успешно добавлены для % продавцов', COALESCE(array_length(seller_ids, 1), 0);

END $$;

COMMIT;
