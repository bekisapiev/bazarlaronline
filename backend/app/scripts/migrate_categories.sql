-- ============================================================
-- Миграция категорий: удаление старых и применение новых
-- Bazarlar Online - Полная структура категорий для Кыргызстана
-- ============================================================

BEGIN;

-- ШАГ 1: Отвязываем все продукты от категорий
-- (сохраняем продукты, но убираем связи с категориями)
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;
RAISE NOTICE 'Отвязаны все продукты от категорий';

-- ШАГ 2: Отвязываем профили продавцов от категорий
UPDATE seller_profiles SET category_id = NULL WHERE category_id IS NOT NULL;
RAISE NOTICE 'Отвязаны все профили продавцов от категорий';

-- ШАГ 3: Удаляем все старые категории
DELETE FROM categories;
RAISE NOTICE 'Удалены все старые категории';

-- ШАГ 4: Сбрасываем sequence
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
RAISE NOTICE 'Сброшен счётчик ID категорий';

-- ============================================================
-- ШАГ 5: Вставляем новые категории
-- ============================================================

RAISE NOTICE 'Начинаем вставку новых категорий...';

-- ============================================================
-- УРОВЕНЬ 1: ОСНОВНЫЕ КАТЕГОРИИ
-- ============================================================

-- 1. ТОВАРЫ
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1, 'Товары', 'tovary', 1, 'shopping_bag', 0, true, NULL);

-- 2. УСЛУГИ
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (2, 'Услуги', 'uslugi', 1, 'work', 1, true, NULL);

RAISE NOTICE 'Созданы основные категории: Товары и Услуги';

-- ============================================================
-- УРОВЕНЬ 2 и 3: ТОВАРЫ
-- ============================================================

-- ЭЛЕКТРОНИКА (id: 10)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (10, 'Электроника', 'elektronika', 2, 'devices', 0, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(101, 'Телефоны и аксессуары', 'elektronika-telefony-i-aksessuary', 3, 0, true, 10),
(102, 'Ноутбуки и компьютеры', 'elektronika-noutbuki-i-kompyutery', 3, 1, true, 10),
(103, 'Планшеты и электронные книги', 'elektronika-planshety-i-elektronnye-knigi', 3, 2, true, 10),
(104, 'ТВ, аудио, видео', 'elektronika-tv-audio-video', 3, 3, true, 10),
(105, 'Фото и видеокамеры', 'elektronika-foto-i-videokamery', 3, 4, true, 10),
(106, 'Игровые приставки и игры', 'elektronika-igrovye-pristavki-i-igry', 3, 5, true, 10),
(107, 'Умные устройства и гаджеты', 'elektronika-umnye-ustroystva-i-gadzhety', 3, 6, true, 10),
(108, 'Комплектующие для ПК', 'elektronika-komplektuyuschie-dlya-pk', 3, 7, true, 10),
(109, 'Офисная техника', 'elektronika-ofisnaya-tehnika', 3, 8, true, 10);

-- ОДЕЖДА И ОБУВЬ (id: 20)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (20, 'Одежда и обувь', 'odezhda-i-obuv', 2, 'checkroom', 1, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(201, 'Женская одежда', 'odezhda-i-obuv-zhenskaya-odezhda', 3, 0, true, 20),
(202, 'Мужская одежда', 'odezhda-i-obuv-muzhskaya-odezhda', 3, 1, true, 20),
(203, 'Детская одежда', 'odezhda-i-obuv-detskaya-odezhda', 3, 2, true, 20),
(204, 'Женская обувь', 'odezhda-i-obuv-zhenskaya-obuv', 3, 3, true, 20),
(205, 'Мужская обувь', 'odezhda-i-obuv-muzhskaya-obuv', 3, 4, true, 20),
(206, 'Детская обувь', 'odezhda-i-obuv-detskaya-obuv', 3, 5, true, 20),
(207, 'Аксессуары и украшения', 'odezhda-i-obuv-aksessuary-i-ukrasheniya', 3, 6, true, 20),
(208, 'Сумки и рюкзаки', 'odezhda-i-obuv-sumki-i-ryukzaki', 3, 7, true, 20),
(209, 'Свадебные платья', 'odezhda-i-obuv-svadebnye-platya', 3, 8, true, 20);

-- ДОМ И САД (id: 30)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (30, 'Дом и сад', 'dom-i-sad', 2, 'home', 2, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(301, 'Мебель', 'dom-i-sad-mebel', 3, 0, true, 30),
(302, 'Посуда и кухонная утварь', 'dom-i-sad-posuda-i-kuhonnaya-utvar', 3, 1, true, 30),
(303, 'Бытовая техника', 'dom-i-sad-bytovaya-tehnika', 3, 2, true, 30),
(304, 'Ремонт и строительство', 'dom-i-sad-remont-i-stroitelstvo', 3, 3, true, 30),
(305, 'Текстиль и ковры', 'dom-i-sad-tekstil-i-kovry', 3, 4, true, 30),
(306, 'Освещение и электрика', 'dom-i-sad-osveschenie-i-elektrika', 3, 5, true, 30),
(307, 'Сантехника', 'dom-i-sad-santehnika', 3, 6, true, 30),
(308, 'Инструменты', 'dom-i-sad-instrumenty', 3, 7, true, 30),
(309, 'Растения и семена', 'dom-i-sad-rasteniya-i-semena', 3, 8, true, 30),
(310, 'Садовая техника и инвентарь', 'dom-i-sad-sadovaya-tehnika-i-inventar', 3, 9, true, 30);

-- ДЕТСКИЕ ТОВАРЫ (id: 40)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (40, 'Детские товары', 'detskie-tovary', 2, 'child_care', 3, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(401, 'Коляски и автокресла', 'detskie-tovary-kolyaski-i-avtokresla', 3, 0, true, 40),
(402, 'Игрушки', 'detskie-tovary-igrushki', 3, 1, true, 40),
(403, 'Детская мебель', 'detskie-tovary-detskaya-mebel', 3, 2, true, 40),
(404, 'Товары для новорожденных', 'detskie-tovary-tovary-dlya-novorozhdennyh', 3, 3, true, 40),
(405, 'Детское питание', 'detskie-tovary-detskoe-pitanie', 3, 4, true, 40),
(406, 'Школьные принадлежности', 'detskie-tovary-shkolnye-prinadlezhnosti', 3, 5, true, 40);

-- КРАСОТА И ЗДОРОВЬЕ (id: 50)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (50, 'Красота и здоровье', 'krasota-i-zdorovye', 2, 'spa', 4, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(501, 'Парфюмерия', 'krasota-i-zdorovye-parfyumeriya', 3, 0, true, 50),
(502, 'Косметика и уход', 'krasota-i-zdorovye-kosmetika-i-uhod', 3, 1, true, 50),
(503, 'Средства гигиены', 'krasota-i-zdorovye-sredstva-gigieny', 3, 2, true, 50),
(504, 'Медицинские товары', 'krasota-i-zdorovye-medicinskie-tovary', 3, 3, true, 50),
(505, 'БАДы и витамины', 'krasota-i-zdorovye-bady-i-vitaminy', 3, 4, true, 50),
(506, 'Массажёры и тренажёры', 'krasota-i-zdorovye-massazhyory-i-trenazhyory', 3, 5, true, 50);

-- СПОРТ И ОТДЫХ (id: 60)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (60, 'Спорт и отдых', 'sport-i-otdyh', 2, 'sports_soccer', 5, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(601, 'Спортивная одежда и обувь', 'sport-i-otdyh-sportivnaya-odezhda-i-obuv', 3, 0, true, 60),
(602, 'Тренажёры', 'sport-i-otdyh-trenazhyory', 3, 1, true, 60),
(603, 'Велосипеды', 'sport-i-otdyh-velosipedy', 3, 2, true, 60),
(604, 'Туризм и кемпинг', 'sport-i-otdyh-turizm-i-kemping', 3, 3, true, 60),
(605, 'Зимние виды спорта', 'sport-i-otdyh-zimnie-vidy-sporta', 3, 4, true, 60),
(606, 'Рыбалка и охота', 'sport-i-otdyh-rybalka-i-ohota', 3, 5, true, 60),
(607, 'Настольные игры и хобби', 'sport-i-otdyh-nastolnye-igry-i-hobbi', 3, 6, true, 60);

-- АВТО И МОТО (id: 70)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (70, 'Авто и мото', 'avto-i-moto', 2, 'directions_car', 6, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(701, 'Легковые автомобили', 'avto-i-moto-legkovye-avtomobili', 3, 0, true, 70),
(702, 'Грузовые автомобили', 'avto-i-moto-gruzovye-avtomobili', 3, 1, true, 70),
(703, 'Автобусы и микроавтобусы', 'avto-i-moto-avtobusy-i-mikroavtobusy', 3, 2, true, 70),
(704, 'Мотоциклы и мототехника', 'avto-i-moto-motocikly-i-mototehnika', 3, 3, true, 70),
(705, 'Водный транспорт', 'avto-i-moto-vodnyy-transport', 3, 4, true, 70),
(706, 'Запчасти и аксессуары', 'avto-i-moto-zapchasti-i-aksessuary', 3, 5, true, 70),
(707, 'Шины и диски', 'avto-i-moto-shiny-i-diski', 3, 6, true, 70),
(708, 'Автоэлектроника', 'avto-i-moto-avtoelektronika', 3, 7, true, 70),
(709, 'Автомобильная химия', 'avto-i-moto-avtomobilnaya-himiya', 3, 8, true, 70);

-- НЕДВИЖИМОСТЬ (id: 80)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (80, 'Недвижимость', 'nedvizhimost', 2, 'apartment', 7, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(801, 'Квартиры', 'nedvizhimost-kvartiry', 3, 0, true, 80),
(802, 'Комнаты', 'nedvizhimost-komnaty', 3, 1, true, 80),
(803, 'Дома и дачи', 'nedvizhimost-doma-i-dachi', 3, 2, true, 80),
(804, 'Земельные участки', 'nedvizhimost-zemelnye-uchastki', 3, 3, true, 80),
(805, 'Коммерческая недвижимость', 'nedvizhimost-kommercheskaya-nedvizhimost', 3, 4, true, 80),
(806, 'Гаражи и парковки', 'nedvizhimost-garazhi-i-parkovki', 3, 5, true, 80),
(807, 'Посуточная аренда', 'nedvizhimost-posutochnaya-arenda', 3, 6, true, 80);

-- ПРОДУКТЫ ПИТАНИЯ (id: 90)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (90, 'Продукты питания', 'produkty-pitaniya', 2, 'restaurant', 8, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(901, 'Мясо и птица', 'produkty-pitaniya-myaso-i-ptica', 3, 0, true, 90),
(902, 'Молочные продукты', 'produkty-pitaniya-molochnye-produkty', 3, 1, true, 90),
(903, 'Хлеб и выпечка', 'produkty-pitaniya-hleb-i-vypechka', 3, 2, true, 90),
(904, 'Фрукты и овощи', 'produkty-pitaniya-frukty-i-ovoschi', 3, 3, true, 90),
(905, 'Бакалея', 'produkty-pitaniya-bakaleya', 3, 4, true, 90),
(906, 'Напитки', 'produkty-pitaniya-napitki', 3, 5, true, 90),
(907, 'Кондитерские изделия', 'produkty-pitaniya-konditerskie-izdeliya', 3, 6, true, 90),
(908, 'Замороженные продукты', 'produkty-pitaniya-zamorozhennye-produkty', 3, 7, true, 90),
(909, 'Готовая еда', 'produkty-pitaniya-gotovaya-eda', 3, 8, true, 90);

-- КНИГИ (id: 100)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (100, 'Книги и учебная литература', 'knigi', 2, 'menu_book', 9, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(1001, 'Художественная литература', 'knigi-hudozhestvennaya-literatura', 3, 0, true, 100),
(1002, 'Учебники и пособия', 'knigi-uchebniki-i-posobiya', 3, 1, true, 100),
(1003, 'Детские книги', 'knigi-detskie-knigi', 3, 2, true, 100),
(1004, 'Научная литература', 'knigi-nauchnaya-literatura', 3, 3, true, 100),
(1005, 'Словари и энциклопедии', 'knigi-slovari-i-enciklopedii', 3, 4, true, 100);

-- ЖИВОТНЫЕ (id: 110)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (110, 'Животные', 'zhivotnye', 2, 'pets', 10, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(1101, 'Собаки', 'zhivotnye-sobaki', 3, 0, true, 110),
(1102, 'Кошки', 'zhivotnye-koshki', 3, 1, true, 110),
(1103, 'Птицы', 'zhivotnye-pticy', 3, 2, true, 110),
(1104, 'Аквариумные рыбки', 'zhivotnye-akvariumnye-rybki', 3, 3, true, 110),
(1105, 'Сельскохозяйственные животные', 'zhivotnye-selskohozyaystvennye-zhivotnye', 3, 4, true, 110),
(1106, 'Товары для животных', 'zhivotnye-tovary-dlya-zhivotnyh', 3, 5, true, 110);

-- БИЗНЕС И ОБОРУДОВАНИЕ (id: 120)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (120, 'Бизнес и оборудование', 'biznes-i-oborudovanie', 2, 'business_center', 11, true, 1);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(1201, 'Торговое оборудование', 'biznes-i-oborudovanie-torgovoe-oborudovanie', 3, 0, true, 120),
(1202, 'Промышленное оборудование', 'biznes-i-oborudovanie-promyshlennoe-oborudovanie', 3, 1, true, 120),
(1203, 'Оборудование для общепита', 'biznes-i-oborudovanie-oborudovanie-dlya-obschepita', 3, 2, true, 120),
(1204, 'Медицинское оборудование', 'biznes-i-oborudovanie-medicinskoe-oborudovanie', 3, 3, true, 120),
(1205, 'Сельхозтехника', 'biznes-i-oborudovanie-selhoztehn

ika', 3, 4, true, 120),
(1206, 'Готовый бизнес', 'biznes-i-oborudovanie-gotovyy-biznes', 3, 5, true, 120);

RAISE NOTICE 'Созданы все категории товаров';

-- ============================================================
-- УРОВЕНЬ 2 и 3: УСЛУГИ
-- ============================================================

-- СТРОИТЕЛЬСТВО И РЕМОНТ (id: 210)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (210, 'Строительство и ремонт', 'stroitelstvo-i-remont', 2, 'construction', 0, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2101, 'Строительство домов', 'stroitelstvo-i-remont-stroitelstvo-domov', 3, 0, true, 210),
(2102, 'Ремонт квартир', 'stroitelstvo-i-remont-remont-kvartir', 3, 1, true, 210),
(2103, 'Отделочные работы', 'stroitelstvo-i-remont-otdelochnye-raboty', 3, 2, true, 210),
(2104, 'Кровельные работы', 'stroitelstvo-i-remont-krovelnye-raboty', 3, 3, true, 210),
(2105, 'Электромонтажные работы', 'stroitelstvo-i-remont-elektromontazhnye-raboty', 3, 4, true, 210),
(2106, 'Сантехнические работы', 'stroitelstvo-i-remont-santehnicheskie-raboty', 3, 5, true, 210),
(2107, 'Установка окон и дверей', 'stroitelstvo-i-remont-ustanovka-okon-i-dverey', 3, 6, true, 210),
(2108, 'Ландшафтный дизайн', 'stroitelstvo-i-remont-landshaftnyy-dizayn', 3, 7, true, 210);

-- КРАСОТА И ЗДОРОВЬЕ (услуги) (id: 220)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (220, 'Красота и здоровье', 'uslugi-krasoty', 2, 'spa', 1, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2201, 'Парикмахерские услуги', 'uslugi-krasoty-parikmаherskie-uslugi', 3, 0, true, 220),
(2202, 'Маникюр и педикюр', 'uslugi-krasoty-manikyur-i-pedikyur', 3, 1, true, 220),
(2203, 'Косметология', 'uslugi-krasoty-kosmetologiya', 3, 2, true, 220),
(2204, 'Массаж', 'uslugi-krasoty-massazh', 3, 3, true, 220),
(2205, 'Стоматология', 'uslugi-krasoty-stomatologiya', 3, 4, true, 220),
(2206, 'Медицинские услуги', 'uslugi-krasoty-medicinskie-uslugi', 3, 5, true, 220),
(2207, 'Фитнес и йога', 'uslugi-krasoty-fitnes-i-yoga', 3, 6, true, 220);

-- ТРАНСПОРТНЫЕ УСЛУГИ (id: 230)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (230, 'Транспортные услуги', 'transportnye-uslugi', 2, 'local_shipping', 2, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2301, 'Грузоперевозки', 'transportnye-uslugi-gruzoperevozki', 3, 0, true, 230),
(2302, 'Пассажирские перевозки', 'transportnye-uslugi-passazhirskie-perevozki', 3, 1, true, 230),
(2303, 'Услуги такси', 'transportnye-uslugi-uslugi-taksi', 3, 2, true, 230),
(2304, 'Переезды и грузчики', 'transportnye-uslugi-pereezdy-i-gruzchiki', 3, 3, true, 230),
(2305, 'Курьерские услуги', 'transportnye-uslugi-kurerskie-uslugi', 3, 4, true, 230),
(2306, 'Эвакуатор', 'transportnye-uslugi-evakuator', 3, 5, true, 230);

-- РЕМОНТ ТЕХНИКИ (id: 240)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (240, 'Ремонт техники', 'remont-tehniki', 2, 'build', 3, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2401, 'Ремонт телефонов', 'remont-tehniki-remont-telefonov', 3, 0, true, 240),
(2402, 'Ремонт компьютеров', 'remont-tehniki-remont-kompyuterov', 3, 1, true, 240),
(2403, 'Ремонт бытовой техники', 'remont-tehniki-remont-bytovoy-tehniki', 3, 2, true, 240),
(2404, 'Ремонт автомобилей', 'remont-tehniki-remont-avtomobiley', 3, 3, true, 240),
(2405, 'Ремонт электроники', 'remont-tehniki-remont-elektroniki', 3, 4, true, 240);

-- ОБРАЗОВАНИЕ И КУРСЫ (id: 250)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (250, 'Образование и курсы', 'obrazovanie', 2, 'school', 4, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2501, 'Репетиторы', 'obrazovanie-repetitory', 3, 0, true, 250),
(2502, 'Языковые курсы', 'obrazovanie-yazykovye-kursy', 3, 1, true, 250),
(2503, 'Компьютерные курсы', 'obrazovanie-kompyuternye-kursy', 3, 2, true, 250),
(2504, 'Музыкальные занятия', 'obrazovanie-muzykalnye-zanyatiya', 3, 3, true, 250),
(2505, 'Детские кружки', 'obrazovanie-detskie-kruzhki', 3, 4, true, 250),
(2506, 'Профессиональные курсы', 'obrazovanie-professionalnye-kursy', 3, 5, true, 250);

-- ОРГАНИЗАЦИЯ МЕРОПРИЯТИЙ (id: 260)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (260, 'Организация мероприятий', 'meropriyatiya', 2, 'celebration', 5, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2601, 'Тамада и ведущие', 'meropriyatiya-tamada-i-veduschie', 3, 0, true, 260),
(2602, 'Фото и видеосъёмка', 'meropriyatiya-foto-i-videosyomka', 3, 1, true, 260),
(2603, 'Музыканты и диджеи', 'meropriyatiya-muzykanty-i-didzhei', 3, 2, true, 260),
(2604, 'Аренда залов', 'meropriyatiya-arenda-zalov', 3, 3, true, 260),
(2605, 'Кейтеринг', 'meropriyatiya-keytering', 3, 4, true, 260),
(2606, 'Украшение залов', 'meropriyatiya-ukrashenie-zalov', 3, 5, true, 260),
(2607, 'Свадебные услуги', 'meropriyatiya-svadebnye-uslugi', 3, 6, true, 260);

-- БЫТОВЫЕ УСЛУГИ (id: 270)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (270, 'Бытовые услуги', 'bytovye-uslugi', 2, 'home_repair_service', 6, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2701, 'Уборка помещений', 'bytovye-uslugi-uborka-pomescheniy', 3, 0, true, 270),
(2702, 'Химчистка', 'bytovye-uslugi-himchistka', 3, 1, true, 270),
(2703, 'Ремонт одежды и обуви', 'bytovye-uslugi-remont-odezhdy-i-obuvi', 3, 2, true, 270),
(2704, 'Няни и сиделки', 'bytovye-uslugi-nyani-i-sidelki', 3, 3, true, 270),
(2705, 'Ремонт мебели', 'bytovye-uslugi-remont-mebeli', 3, 4, true, 270);

-- IT И ИНТЕРНЕТ (id: 280)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (280, 'IT и интернет', 'it-uslugi', 2, 'computer', 7, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2801, 'Разработка сайтов', 'it-uslugi-razrabotka-saytov', 3, 0, true, 280),
(2802, 'Разработка приложений', 'it-uslugi-razrabotka-prilozheniy', 3, 1, true, 280),
(2803, 'SEO продвижение', 'it-uslugi-seo-prodvizhenie', 3, 2, true, 280),
(2804, 'Настройка компьютеров', 'it-uslugi-nastroyka-kompyuterov', 3, 3, true, 280),
(2805, 'Восстановление данных', 'it-uslugi-vosstanovlenie-dannyh', 3, 4, true, 280),
(2806, 'IT консультации', 'it-uslugi-it-konsultacii', 3, 5, true, 280);

-- РЕКЛАМА И МАРКЕТИНГ (id: 290)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (290, 'Реклама и маркетинг', 'reklama-i-marketing', 2, 'campaign', 8, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(2901, 'Наружная реклама', 'reklama-i-marketing-naruzhnaya-reklama', 3, 0, true, 290),
(2902, 'Интернет-реклама', 'reklama-i-marketing-internet-reklama', 3, 1, true, 290),
(2903, 'Полиграфия', 'reklama-i-marketing-poligrafiya', 3, 2, true, 290),
(2904, 'Дизайн и брендинг', 'reklama-i-marketing-dizayn-i-brending', 3, 3, true, 290),
(2905, 'SMM продвижение', 'reklama-i-marketing-smm-prodvizhenie', 3, 4, true, 290);

-- ЮРИДИЧЕСКИЕ УСЛУГИ (id: 300)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (300, 'Юридические услуги', 'yuridicheskie-uslugi', 2, 'gavel', 9, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(3001, 'Юридические консультации', 'yuridicheskie-uslugi-yuridicheskie-konsultacii', 3, 0, true, 300),
(3002, 'Регистрация бизнеса', 'yuridicheskie-uslugi-registraciya-biznesa', 3, 1, true, 300),
(3003, 'Составление договоров', 'yuridicheskie-uslugi-sostavlenie-dogovorov', 3, 2, true, 300),
(3004, 'Представительство в суде', 'yuridicheskie-uslugi-predstavitelstvo-v-sude', 3, 3, true, 300);

-- ФИНАНСОВЫЕ УСЛУГИ (id: 310)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (310, 'Финансовые услуги', 'finansovye-uslugi', 2, 'account_balance', 10, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(3101, 'Бухгалтерские услуги', 'finansovye-uslugi-buhgalterskie-uslugi', 3, 0, true, 310),
(3102, 'Аудит', 'finansovye-uslugi-audit', 3, 1, true, 310),
(3103, 'Кредитование', 'finansovye-uslugi-kreditovanie', 3, 2, true, 310),
(3104, 'Страхование', 'finansovye-uslugi-strahovanie', 3, 3, true, 310);

-- ТУРИЗМ И ОТДЫХ (id: 320)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (320, 'Туризм и отдых', 'turizm', 2, 'flight', 11, true, 2);

INSERT INTO categories (id, name, slug, level, sort_order, is_active, parent_id) VALUES
(3201, 'Туристические путёвки', 'turizm-turisticheskie-putyovki', 3, 0, true, 320),
(3202, 'Визовая поддержка', 'turizm-vizovaya-podderzhka', 3, 1, true, 320),
(3203, 'Бронирование отелей', 'turizm-bronirovanie-oteley', 3, 2, true, 320),
(3204, 'Экскурсии', 'turizm-ekskursii', 3, 3, true, 320),
(3205, 'Аренда жилья для отдыха', 'turizm-arenda-zhilya-dlya-otdyha', 3, 4, true, 320);

RAISE NOTICE 'Созданы все категории услуг';

-- ============================================================
-- ФИНАЛИЗАЦИЯ
-- ============================================================

-- Обновляем sequence до максимального значения
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories) + 1, false);

COMMIT;

-- ============================================================
-- ИТОГИ
-- ============================================================

-- Показываем статистику
DO $$
DECLARE
    level1_count INTEGER;
    level2_count INTEGER;
    level3_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO level1_count FROM categories WHERE level = 1;
    SELECT COUNT(*) INTO level2_count FROM categories WHERE level = 2;
    SELECT COUNT(*) INTO level3_count FROM categories WHERE level = 3;
    SELECT COUNT(*) INTO total_count FROM categories;

    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '✅ МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Статистика категорий:';
    RAISE NOTICE '  • Категорий уровня 1 (основные): %', level1_count;
    RAISE NOTICE '  • Категорий уровня 2: %', level2_count;
    RAISE NOTICE '  • Категорий уровня 3: %', level3_count;
    RAISE NOTICE '  • ВСЕГО категорий: %', total_count;
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
END $$;
