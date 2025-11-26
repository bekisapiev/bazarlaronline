-- ============================================================
-- Миграция категорий: удаление старых и применение новых
-- Bazarlar Online - Полная структура категорий для Кыргызстана
-- ============================================================

BEGIN;

-- ШАГ 1: Отвязываем все продукты от категорий
-- (сохраняем продукты, но убираем связи с категориями)
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;
-- Отвязаны все продукты от категорий

-- ШАГ 2: Отвязываем профили продавцов от категорий
UPDATE seller_profiles SET category_id = NULL WHERE category_id IS NOT NULL;
-- Отвязаны все профили продавцов от категорий

-- ШАГ 3: Удаляем все старые категории
DELETE FROM categories;
-- Удалены все старые категории

-- ШАГ 4: Сбрасываем sequence
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
-- Сброшен счётчик ID категорий

-- ============================================================
-- ШАГ 5: Вставляем новые категории
-- ============================================================

-- Начинаем вставку новых категорий...

-- ============================================================
-- УРОВЕНЬ 1: ОСНОВНЫЕ КАТЕГОРИИ
-- ============================================================

-- 1. ТОВАРЫ
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1, 'Товары', 'tovary', 1, 'shopping_bag', 0, true, NULL);

-- 2. УСЛУГИ
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (2, 'Услуги', 'uslugi', 1, 'work', 1, true, NULL);

-- Созданы основные категории: Товары и Услуги

-- ============================================================
-- УРОВЕНЬ 2 и 3: ТОВАРЫ
-- ============================================================

-- ЭЛЕКТРОНИКА (id: 10)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (10, 'Электроника', 'elektronika', 2, 'devices', 0, true, 1);

-- Подкатегории Электроники
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(101, 'Телефоны и аксессуары', 'telefony-aksessuary', 3, NULL, 0, true, 10),
(102, 'Ноутбуки и компьютеры', 'noutbuki-kompyutery', 3, NULL, 1, true, 10),
(103, 'Планшеты и электронные книги', 'planshety-eknigi', 3, NULL, 2, true, 10),
(104, 'ТВ, аудио, видео', 'tv-audio-video', 3, NULL, 3, true, 10),
(105, 'Фото и видеокамеры', 'foto-videokamery', 3, NULL, 4, true, 10),
(106, 'Игровые приставки', 'igrovye-pristavki', 3, NULL, 5, true, 10),
(107, 'Техника для дома', 'tekhnika-dlya-doma', 3, NULL, 6, true, 10),
(108, 'Климатическая техника', 'klimaticheskaya-tekhnika', 3, NULL, 7, true, 10),
(109, 'Аксессуары и комплектующие', 'aksessuary-komplektuyushchie', 3, NULL, 8, true, 10),
(110, 'Умная электроника', 'umnaya-elektronika', 3, NULL, 9, true, 10);

-- ОДЕЖДА И ОБУВЬ (id: 20)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (20, 'Одежда и обувь', 'odezhda-obuv', 2, 'checkroom', 1, true, 1);

-- Подкатегории Одежды и обуви
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(201, 'Женская одежда', 'zhenskaya-odezhda', 3, NULL, 0, true, 20),
(202, 'Мужская одежда', 'muzhskaya-odezhda', 3, NULL, 1, true, 20),
(203, 'Детская одежда', 'detskaya-odezhda', 3, NULL, 2, true, 20),
(204, 'Женская обувь', 'zhenskaya-obuv', 3, NULL, 3, true, 20),
(205, 'Мужская обувь', 'muzhskaya-obuv', 3, NULL, 4, true, 20),
(206, 'Детская обувь', 'detskaya-obuv', 3, NULL, 5, true, 20),
(207, 'Аксессуары', 'aksessuary', 3, NULL, 6, true, 20),
(208, 'Сумки и чемоданы', 'sumki-chemodany', 3, NULL, 7, true, 20),
(209, 'Украшения и бижутерия', 'ukrasheniya-bizhuteria', 3, NULL, 8, true, 20),
(210, 'Часы', 'chasy', 3, NULL, 9, true, 20);

-- СПОРТ И ОТДЫХ (id: 30)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (30, 'Спорт и отдых', 'sport-otdykh', 2, 'sports_tennis', 2, true, 1);

-- Подкатегории Спорта и отдыха
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(301, 'Тренажеры', 'trenazhery', 3, NULL, 0, true, 30),
(302, 'Велосипеды', 'velosipedy', 3, NULL, 1, true, 30),
(303, 'Спортивная одежда и обувь', 'sportivnaya-odezhda-obuv', 3, NULL, 2, true, 30),
(304, 'Туризм и кемпинг', 'turizm-kemping', 3, NULL, 3, true, 30),
(305, 'Рыбалка и охота', 'rybalka-okhota', 3, NULL, 4, true, 30),
(306, 'Зимний спорт', 'zimniy-sport', 3, NULL, 5, true, 30),
(307, 'Водный спорт', 'vodnyy-sport', 3, NULL, 6, true, 30),
(308, 'Единоборства', 'edinoborstva', 3, NULL, 7, true, 30),
(309, 'Командные виды спорта', 'komandnye-vidy-sporta', 3, NULL, 8, true, 30),
(310, 'Настольные игры', 'nastolnye-igry', 3, NULL, 9, true, 30);

-- КРАСОТА И ЗДОРОВЬЕ (id: 40)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (40, 'Красота и здоровье', 'krasota-zdorovie', 2, 'favorite', 3, true, 1);

-- Подкатегории Красоты и здоровья
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(401, 'Парфюмерия', 'parfyumeriya', 3, NULL, 0, true, 40),
(402, 'Косметика', 'kosmetika', 3, NULL, 1, true, 40),
(403, 'Уход за лицом', 'ukhod-za-litsom', 3, NULL, 2, true, 40),
(404, 'Уход за телом', 'ukhod-za-telom', 3, NULL, 3, true, 40),
(405, 'Уход за волосами', 'ukhod-za-volosami', 3, NULL, 4, true, 40),
(406, 'Медицинская техника', 'meditsinskaya-tekhnika', 3, NULL, 5, true, 40),
(407, 'БАДы и витамины', 'bady-vitaminy', 3, NULL, 6, true, 40),
(408, 'Средства гигиены', 'sredstva-gigieny', 3, NULL, 7, true, 40),
(409, 'Маникюр и педикюр', 'manikyur-pedikyur', 3, NULL, 8, true, 40),
(410, 'Массажеры', 'massazhery', 3, NULL, 9, true, 40);

-- ДОМ И ИНТЕРЬЕР (id: 50)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (50, 'Дом и интерьер', 'dom-interer', 2, 'home', 4, true, 1);

-- Подкатегории Дома и интерьера
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(501, 'Мебель', 'mebel', 3, NULL, 0, true, 50),
(502, 'Текстиль и ковры', 'tekstil-kovry', 3, NULL, 1, true, 50),
(503, 'Посуда и кухонные принадлежности', 'posuda-kukhonnye-prinadlezhnosti', 3, NULL, 2, true, 50),
(504, 'Освещение и декор', 'osveshchenie-dekor', 3, NULL, 3, true, 50),
(505, 'Хозяйственные товары', 'khozyaystvennye-tovary', 3, NULL, 4, true, 50),
(506, 'Инструменты', 'instrumenty', 3, NULL, 5, true, 50),
(507, 'Сад и огород', 'sad-ogorod', 3, NULL, 6, true, 50),
(508, 'Товары для ремонта', 'tovary-dlya-remonta', 3, NULL, 7, true, 50),
(509, 'Сантехника', 'santekhnika', 3, NULL, 8, true, 50),
(510, 'Системы безопасности', 'sistemy-bezopasnosti', 3, NULL, 9, true, 50);

-- ДЕТСКИЕ ТОВАРЫ (id: 60)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (60, 'Детские товары', 'detskie-tovary', 2, 'child_care', 5, true, 1);

-- Подкатегории Детских товаров
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(601, 'Коляски и автокресла', 'kolyaski-avtokresla', 3, NULL, 0, true, 60),
(602, 'Игрушки', 'igrushki', 3, NULL, 1, true, 60),
(603, 'Детская мебель', 'detskaya-mebel', 3, NULL, 2, true, 60),
(604, 'Детское питание', 'detskoe-pitanie', 3, NULL, 3, true, 60),
(605, 'Товары для новорожденных', 'tovary-dlya-novorozhdennykh', 3, NULL, 4, true, 60),
(606, 'Детская гигиена', 'detskaya-gigiena', 3, NULL, 5, true, 60),
(607, 'Школьные товары', 'shkolnye-tovary', 3, NULL, 6, true, 60),
(608, 'Развивающие игры', 'razvivayushchie-igry', 3, NULL, 7, true, 60),
(609, 'Детский транспорт', 'detskiy-transport', 3, NULL, 8, true, 60),
(610, 'Одежда для беременных', 'odezhda-dlya-beremennykh', 3, NULL, 9, true, 60);

-- КНИГИ И ХОББИ (id: 70)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (70, 'Книги и хобби', 'knigi-khobbi', 2, 'menu_book', 6, true, 1);

-- Подкатегории Книг и хобби
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(701, 'Книги', 'knigi', 3, NULL, 0, true, 70),
(702, 'Журналы и газеты', 'zhurnaly-gazety', 3, NULL, 1, true, 70),
(703, 'Канцелярия', 'kantselyariya', 3, NULL, 2, true, 70),
(704, 'Музыкальные инструменты', 'muzykalnye-instrumenty', 3, NULL, 3, true, 70),
(705, 'Творчество и рукоделие', 'tvorchestvo-rukodelie', 3, NULL, 4, true, 70),
(706, 'Коллекционирование', 'kollektsionirovanie', 3, NULL, 5, true, 70),
(707, 'Антиквариат', 'antikvariat', 3, NULL, 6, true, 70),
(708, 'Винил и аудиотехника', 'vinil-audiotekhnika', 3, NULL, 7, true, 70),
(709, 'Фотография', 'fotografiya', 3, NULL, 8, true, 70),
(710, 'Художественные материалы', 'khudozhestvennye-materialy', 3, NULL, 9, true, 70);

-- ПРОДУКТЫ ПИТАНИЯ (id: 80)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (80, 'Продукты питания', 'produkty-pitaniya', 2, 'restaurant', 7, true, 1);

-- Подкатегории Продуктов питания
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(801, 'Молочные продукты', 'molochnye-produkty', 3, NULL, 0, true, 80),
(802, 'Мясо и птица', 'myaso-ptitsa', 3, NULL, 1, true, 80),
(803, 'Рыба и морепродукты', 'ryba-moreprodukty', 3, NULL, 2, true, 80),
(804, 'Хлебобулочные изделия', 'khlebobulochnye-izdeliya', 3, NULL, 3, true, 80),
(805, 'Кондитерские изделия', 'konditerskie-izdeliya', 3, NULL, 4, true, 80),
(806, 'Фрукты и овощи', 'frukty-ovoshchi', 3, NULL, 5, true, 80),
(807, 'Бакалея', 'bakaleya', 3, NULL, 6, true, 80),
(808, 'Напитки', 'napitki', 3, NULL, 7, true, 80),
(809, 'Органические продукты', 'organicheskie-produkty', 3, NULL, 8, true, 80),
(810, 'Готовая еда', 'gotovaya-eda', 3, NULL, 9, true, 80);

-- АВТО И МОТО (id: 90)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (90, 'Авто и мото', 'avto-moto', 2, 'directions_car', 8, true, 1);

-- Подкатегории Авто и мото
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(901, 'Легковые автомобили', 'legkovye-avtomobili', 3, NULL, 0, true, 90),
(902, 'Грузовые автомобили', 'gruzovye-avtomobili', 3, NULL, 1, true, 90),
(903, 'Мотоциклы и мототехника', 'mototsikly-mototekhnika', 3, NULL, 2, true, 90),
(904, 'Автозапчасти', 'avtozapchasti', 3, NULL, 3, true, 90),
(905, 'Шины и диски', 'shiny-diski', 3, NULL, 4, true, 90),
(906, 'Автоэлектроника', 'avtoelektronika', 3, NULL, 5, true, 90),
(907, 'Автоаксессуары', 'avtoaksessuary', 3, NULL, 6, true, 90),
(908, 'Автохимия и масла', 'avtokhimiya-masla', 3, NULL, 7, true, 90),
(909, 'Прицепы и спецтехника', 'pritsey-spetstekhnika', 3, NULL, 8, true, 90),
(910, 'Велосипеды и самокаты', 'velosipedy-samokaty', 3, NULL, 9, true, 90);

-- НЕДВИЖИМОСТЬ (id: 100)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (100, 'Недвижимость', 'nedvizhimost', 2, 'apartment', 9, true, 1);

-- Подкатегории Недвижимости
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(1001, 'Квартиры', 'kvartiry', 3, NULL, 0, true, 100),
(1002, 'Дома и дачи', 'doma-dachi', 3, NULL, 1, true, 100),
(1003, 'Коммерческая недвижимость', 'kommercheskaya-nedvizhimost', 3, NULL, 2, true, 100),
(1004, 'Земельные участки', 'zemelnye-uchastki', 3, NULL, 3, true, 100),
(1005, 'Гаражи и парковки', 'garazhi-parkovki', 3, NULL, 4, true, 100),
(1006, 'Аренда квартир', 'arenda-kvartir', 3, NULL, 5, true, 100),
(1007, 'Аренда домов', 'arenda-domov', 3, NULL, 6, true, 100),
(1008, 'Аренда коммерческой недвижимости', 'arenda-kommercheskoy-nedvizhimosti', 3, NULL, 7, true, 100),
(1009, 'Посуточная аренда', 'posutochnaya-arenda', 3, NULL, 8, true, 100),
(1010, 'Зарубежная недвижимость', 'zarubezhnaya-nedvizhimost', 3, NULL, 9, true, 100);

-- РАБОТА (id: 110)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (110, 'Работа', 'rabota', 2, 'work', 10, true, 1);

-- Подкатегории Работы
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(1101, 'Вакансии', 'vakansii', 3, NULL, 0, true, 110),
(1102, 'Резюме', 'rezyume', 3, NULL, 1, true, 110),
(1103, 'Подработка', 'podrabotka', 3, NULL, 2, true, 110),
(1104, 'Стажировки', 'stazhirovki', 3, NULL, 3, true, 110),
(1105, 'Удаленная работа', 'udalennaya-rabota', 3, NULL, 4, true, 110),
(1106, 'Вахтовый метод', 'vakhtovyy-metod', 3, NULL, 5, true, 110),
(1107, 'Работа за рубежом', 'rabota-za-rubezhom', 3, NULL, 6, true, 110),
(1108, 'Волонтерство', 'volonterstvo', 3, NULL, 7, true, 110),
(1109, 'Бизнес и партнерство', 'biznes-partnerstvo', 3, NULL, 8, true, 110),
(1110, 'Образование и курсы', 'obrazovanie-kursy', 3, NULL, 9, true, 110);

-- ЖИВОТНЫЕ (id: 120)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (120, 'Животные', 'zhivotnye', 2, 'pets', 11, true, 1);

-- Подкатегории Животных
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(1201, 'Собаки', 'sobaki', 3, NULL, 0, true, 120),
(1202, 'Кошки', 'koshki', 3, NULL, 1, true, 120),
(1203, 'Птицы', 'ptitsy', 3, NULL, 2, true, 120),
(1204, 'Аквариумные рыбки', 'akvariumnye-rybki', 3, NULL, 3, true, 120),
(1205, 'Грызуны', 'gryzuny', 3, NULL, 4, true, 120),
(1206, 'Сельскохозяйственные животные', 'selskokhozyaystvennye-zhivotnye', 3, NULL, 5, true, 120),
(1207, 'Экзотические животные', 'ekzoticheskie-zhivotnye', 3, NULL, 6, true, 120),
(1208, 'Товары для животных', 'tovary-dlya-zhivotnykh', 3, NULL, 7, true, 120),
(1209, 'Корма для животных', 'korma-dlya-zhivotnykh', 3, NULL, 8, true, 120),
(1210, 'Ветеринария', 'veterinariya', 3, NULL, 9, true, 120);

-- Созданы все категории товаров

-- ============================================================
-- УРОВЕНЬ 2 и 3: УСЛУГИ
-- ============================================================

-- IT И ИНТЕРНЕТ (id: 210)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (210, 'IT и интернет', 'it-internet', 2, 'computer', 0, true, 2);

-- Подкатегории IT и интернет
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2101, 'Разработка сайтов', 'razrabotka-saytov', 3, NULL, 0, true, 210),
(2102, 'Разработка мобильных приложений', 'razrabotka-mobilnykh-prilozheniy', 3, NULL, 1, true, 210),
(2103, 'Дизайн и графика', 'dizayn-grafika', 3, NULL, 2, true, 210),
(2104, 'SEO и продвижение', 'seo-prodvizhenie', 3, NULL, 3, true, 210),
(2105, 'Настройка рекламы', 'nastroyka-reklamy', 3, NULL, 4, true, 210),
(2106, 'Администрирование серверов', 'administrirovanie-serverov', 3, NULL, 5, true, 210),
(2107, 'Ремонт компьютеров', 'remont-kompyuterov', 3, NULL, 6, true, 210),
(2108, 'IT-консалтинг', 'it-konsalting', 3, NULL, 7, true, 210),
(2109, 'Создание игр', 'sozdanie-igr', 3, NULL, 8, true, 210),
(2110, 'Обучение IT', 'obuchenie-it', 3, NULL, 9, true, 210);

-- СТРОИТЕЛЬСТВО И РЕМОНТ (id: 220)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (220, 'Строительство и ремонт', 'stroitelstvo-remont', 2, 'construction', 1, true, 2);

-- Подкатегории Строительства и ремонта
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2201, 'Ремонт квартир', 'remont-kvartir', 3, NULL, 0, true, 220),
(2202, 'Ремонт домов', 'remont-domov', 3, NULL, 1, true, 220),
(2203, 'Отделочные работы', 'otdelochnye-raboty', 3, NULL, 2, true, 220),
(2204, 'Сантехнические работы', 'santekhnicheskie-raboty', 3, NULL, 3, true, 220),
(2205, 'Электромонтажные работы', 'elektromontazhnye-raboty', 3, NULL, 4, true, 220),
(2206, 'Кровельные работы', 'krovelnye-raboty', 3, NULL, 5, true, 220),
(2207, 'Фасадные работы', 'fasadnye-raboty', 3, NULL, 6, true, 220),
(2208, 'Установка окон и дверей', 'ustanovka-okon-dverey', 3, NULL, 7, true, 220),
(2209, 'Ландшафтный дизайн', 'landshaftnyy-dizayn', 3, NULL, 8, true, 220),
(2210, 'Снос и демонтаж', 'snos-demontazh', 3, NULL, 9, true, 220);

-- БЫТОВЫЕ УСЛУГИ (id: 230)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (230, 'Бытовые услуги', 'bytovye-uslugi', 2, 'home_repair_service', 2, true, 2);

-- Подкатегории Бытовых услуг
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2301, 'Уборка помещений', 'uborka-pomeshcheniy', 3, NULL, 0, true, 230),
(2302, 'Химчистка', 'khimchistka', 3, NULL, 1, true, 230),
(2303, 'Ремонт бытовой техники', 'remont-bytovoy-tekhniki', 3, NULL, 2, true, 230),
(2304, 'Ремонт мебели', 'remont-mebeli', 3, NULL, 3, true, 230),
(2305, 'Ремонт одежды и обуви', 'remont-odezhdy-obuvi', 3, NULL, 4, true, 230),
(2306, 'Грузоперевозки', 'gruzoperevozki', 3, NULL, 5, true, 230),
(2307, 'Переезды', 'pereezdy', 3, NULL, 6, true, 230),
(2308, 'Курьерские услуги', 'kurerskie-uslugi', 3, NULL, 7, true, 230),
(2309, 'Мастер на час', 'master-na-chas', 3, NULL, 8, true, 230),
(2310, 'Сборка мебели', 'sborka-mebeli', 3, NULL, 9, true, 230);

-- КРАСОТА И ЗДОРОВЬЕ (услуги) (id: 240)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (240, 'Красота и здоровье', 'krasota-zdorovie-uslugi', 2, 'spa', 3, true, 2);

-- Подкатегории Красоты и здоровья (услуги)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2401, 'Парикмахерские услуги', 'parikmaherskie-uslugi', 3, NULL, 0, true, 240),
(2402, 'Маникюр и педикюр', 'manikyur-pedikyur-uslugi', 3, NULL, 1, true, 240),
(2403, 'Косметология', 'kosmetologiya', 3, NULL, 2, true, 240),
(2404, 'Массаж', 'massazh', 3, NULL, 3, true, 240),
(2405, 'Татуаж и перманентный макияж', 'tatuazh-permanentnyy-makiyazh', 3, NULL, 4, true, 240),
(2406, 'Эпиляция', 'epilyatsiya', 3, NULL, 5, true, 240),
(2407, 'Визаж и макияж', 'vizazh-makiyazh', 3, NULL, 6, true, 240),
(2408, 'SPA-процедуры', 'spa-protsedury', 3, NULL, 7, true, 240),
(2409, 'Стоматология', 'stomatologiya', 3, NULL, 8, true, 240),
(2410, 'Фитнес и тренировки', 'fitnes-trenirovki', 3, NULL, 9, true, 240);

-- ОБРАЗОВАНИЕ И КУРСЫ (id: 250)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (250, 'Образование и курсы', 'obrazovanie-kursy', 2, 'school', 4, true, 2);

-- Подкатегории Образования и курсов
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2501, 'Репетиторы', 'repetitory', 3, NULL, 0, true, 250),
(2502, 'Курсы иностранных языков', 'kursy-inostrannykh-yazykov', 3, NULL, 1, true, 250),
(2503, 'Компьютерные курсы', 'kompyuternye-kursy', 3, NULL, 2, true, 250),
(2504, 'Бизнес-тренинги', 'biznes-treningi', 3, NULL, 3, true, 250),
(2505, 'Курсы красоты', 'kursy-krasoty', 3, NULL, 4, true, 250),
(2506, 'Музыкальные школы', 'muzykalnye-shkoly', 3, NULL, 5, true, 250),
(2507, 'Танцы и хореография', 'tantsy-khoreografiya', 3, NULL, 6, true, 250),
(2508, 'Художественные курсы', 'khudozhestvennye-kursy', 3, NULL, 7, true, 250),
(2509, 'Курсы вождения', 'kursy-vozhdeniya', 3, NULL, 8, true, 250),
(2510, 'Профессиональные курсы', 'professionalnye-kursy', 3, NULL, 9, true, 250);

-- ФИНАНСОВЫЕ УСЛУГИ (id: 260)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (260, 'Финансовые услуги', 'finansovye-uslugi', 2, 'account_balance', 5, true, 2);

-- Подкатегории Финансовых услуг
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2601, 'Бухгалтерские услуги', 'bukhgalterskie-uslugi', 3, NULL, 0, true, 260),
(2602, 'Аудиторские услуги', 'auditorskie-uslugi', 3, NULL, 1, true, 260),
(2603, 'Юридические услуги', 'yuridicheskie-uslugi', 3, NULL, 2, true, 260),
(2604, 'Кредиты и займы', 'kredity-zaymy', 3, NULL, 3, true, 260),
(2605, 'Страхование', 'strakhovanie', 3, NULL, 4, true, 260),
(2606, 'Инвестиционный консалтинг', 'investitsionnyy-konsalting', 3, NULL, 5, true, 260),
(2607, 'Налоговое консультирование', 'nalogovoe-konsultirovanie', 3, NULL, 6, true, 260),
(2608, 'Регистрация бизнеса', 'registratsiya-biznesa', 3, NULL, 7, true, 260),
(2609, 'Финансовый анализ', 'finansovyy-analiz', 3, NULL, 8, true, 260),
(2610, 'Коллекторские услуги', 'kollektorskie-uslugi', 3, NULL, 9, true, 260);

-- АВТО УСЛУГИ (id: 270)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (270, 'Авто услуги', 'avto-uslugi', 2, 'car_repair', 6, true, 2);

-- Подкатегории Авто услуг
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2701, 'Ремонт автомобилей', 'remont-avtomobiley', 3, NULL, 0, true, 270),
(2702, 'Кузовной ремонт', 'kuzovnoy-remont', 3, NULL, 1, true, 270),
(2703, 'Покраска автомобилей', 'pokraska-avtomobiley', 3, NULL, 2, true, 270),
(2704, 'Автомойка', 'avtomoyka', 3, NULL, 3, true, 270),
(2705, 'Шиномонтаж', 'shinomontazh', 3, NULL, 4, true, 270),
(2706, 'Тонировка стекол', 'tonirovka-stekol', 3, NULL, 5, true, 270),
(2707, 'Установка сигнализаций', 'ustanovka-signalizatsiy', 3, NULL, 6, true, 270),
(2708, 'Диагностика автомобилей', 'diagnostika-avtomobiley', 3, NULL, 7, true, 270),
(2709, 'Эвакуация автомобилей', 'evakuatsiya-avtomobiley', 3, NULL, 8, true, 270),
(2710, 'Прокат автомобилей', 'prokat-avtomobiley', 3, NULL, 9, true, 270);

-- ОРГАНИЗАЦИЯ МЕРОПРИЯТИЙ (id: 280)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (280, 'Организация мероприятий', 'organizatsiya-meropriyatiy', 2, 'celebration', 7, true, 2);

-- Подкатегории Организации мероприятий
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2801, 'Свадьбы', 'svadby', 3, NULL, 0, true, 280),
(2802, 'Дни рождения', 'dni-rozhdeniya', 3, NULL, 1, true, 280),
(2803, 'Корпоративные мероприятия', 'korporativnye-meropriyatiya', 3, NULL, 2, true, 280),
(2804, 'Юбилеи', 'yubilei', 3, NULL, 3, true, 280),
(2805, 'Детские праздники', 'detskie-prazdniki', 3, NULL, 4, true, 280),
(2806, 'Фото и видеосъемка', 'foto-videosemka', 3, NULL, 5, true, 280),
(2807, 'Ведущие и тамада', 'vedushchie-tamada', 3, NULL, 6, true, 280),
(2808, 'Музыканты и DJ', 'muzykanty-dj', 3, NULL, 7, true, 280),
(2809, 'Аренда залов', 'arenda-zalov', 3, NULL, 8, true, 280),
(2810, 'Кейтеринг', 'keytering', 3, NULL, 9, true, 280);

-- ФОТО И ВИДЕО УСЛУГИ (id: 290)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (290, 'Фото и видео услуги', 'foto-video-uslugi', 2, 'photo_camera', 8, true, 2);

-- Подкатегории Фото и видео услуг
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(2901, 'Свадебная фотосъемка', 'svadebnaya-fotosemka', 3, NULL, 0, true, 290),
(2902, 'Портретная фотосъемка', 'portretnaya-fotosemka', 3, NULL, 1, true, 290),
(2903, 'Предметная фотосъемка', 'predmetnaya-fotosemka', 3, NULL, 2, true, 290),
(2904, 'Видеосъемка мероприятий', 'videosemka-meropriyatiy', 3, NULL, 3, true, 290),
(2905, 'Аэросъемка', 'aerosemka', 3, NULL, 4, true, 290),
(2906, 'Видеомонтаж', 'videomontazh', 3, NULL, 5, true, 290),
(2907, 'Обработка фотографий', 'obrabotka-fotografiy', 3, NULL, 6, true, 290),
(2908, 'Студийная съемка', 'studiynaya-semka', 3, NULL, 7, true, 290),
(2909, 'Семейная фотосъемка', 'semeynaya-fotosemka', 3, NULL, 8, true, 290),
(2910, 'Рекламная съемка', 'reklamnaya-semka', 3, NULL, 9, true, 290);

-- ТУРИЗМ И ПУТЕШЕСТВИЯ (id: 300)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (300, 'Туризм и путешествия', 'turizm-puteshestviya', 2, 'flight', 9, true, 2);

-- Подкатегории Туризма и путешествий
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(3001, 'Туристические туры', 'turisticheskie-tury', 3, NULL, 0, true, 300),
(3002, 'Авиабилеты', 'aviabilety', 3, NULL, 1, true, 300),
(3003, 'Гостиницы и отели', 'gostinitsy-oteli', 3, NULL, 2, true, 300),
(3004, 'Визовая поддержка', 'vizovaya-podderzhka', 3, NULL, 3, true, 300),
(3005, 'Экскурсии', 'ekskursii', 3, NULL, 4, true, 300),
(3006, 'Трансфер', 'transfer', 3, NULL, 5, true, 300),
(3007, 'Туристическое страхование', 'turisticheskoe-strakhovanie', 3, NULL, 6, true, 300),
(3008, 'Круизы', 'kruizy', 3, NULL, 7, true, 300),
(3009, 'Аренда жилья за рубежом', 'arenda-zhilya-za-rubezhom', 3, NULL, 8, true, 300),
(3010, 'Горящие туры', 'goryashchie-tury', 3, NULL, 9, true, 300);

-- УСЛУГИ ДЛЯ ЖИВОТНЫХ (id: 310)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (310, 'Услуги для животных', 'uslugi-dlya-zhivotnykh', 2, 'pets', 10, true, 2);

-- Подкатегории Услуг для животных
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(3101, 'Ветеринарные услуги', 'veterinarnye-uslugi', 3, NULL, 0, true, 310),
(3102, 'Груминг', 'gruming', 3, NULL, 1, true, 310),
(3103, 'Передержка животных', 'perederzyka-zhivotnykh', 3, NULL, 2, true, 310),
(3104, 'Дрессировка', 'dressirovka', 3, NULL, 3, true, 310),
(3105, 'Выгул собак', 'vygul-sobak', 3, NULL, 4, true, 310),
(3106, 'Вязка животных', 'vyazka-zhivotnykh', 3, NULL, 5, true, 310),
(3107, 'Зоотакси', 'zootaksi', 3, NULL, 6, true, 310),
(3108, 'Зоогостиницы', 'zoogostinitsy', 3, NULL, 7, true, 310),
(3109, 'Стерилизация и кастрация', 'sterilizatsiya-kastratsiya', 3, NULL, 8, true, 310),
(3110, 'Ветеринарная аптека', 'veterinarnaya-apteka', 3, NULL, 9, true, 310);

-- РЕКЛАМА И МАРКЕТИНГ (id: 320)
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (320, 'Реклама и маркетинг', 'reklama-marketing', 2, 'campaign', 11, true, 2);

-- Подкатегории Рекламы и маркетинга
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id) VALUES
(3201, 'Интернет-реклама', 'internet-reklama', 3, NULL, 0, true, 320),
(3202, 'Наружная реклама', 'naruzhnaya-reklama', 3, NULL, 1, true, 320),
(3203, 'Полиграфия', 'poligrafiya', 3, NULL, 2, true, 320),
(3204, 'SMM-продвижение', 'smm-prodvizhenie', 3, NULL, 3, true, 320),
(3205, 'Создание логотипов', 'sozdanie-logotipov', 3, NULL, 4, true, 320),
(3206, 'Брендинг', 'brending', 3, NULL, 5, true, 320),
(3207, 'Копирайтинг', 'kopiraiting', 3, NULL, 6, true, 320),
(3208, 'PR-услуги', 'pr-uslugi', 3, NULL, 7, true, 320),
(3209, 'Медиапланирование', 'mediaplanirovanie', 3, NULL, 8, true, 320),
(3210, 'Email-маркетинг', 'email-marketing', 3, NULL, 9, true, 320);

-- Созданы все категории услуг

-- ============================================================
-- ШАГ 6: Обновляем sequence до максимального ID + 1
-- ============================================================

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories) + 1);

-- ============================================================
-- ШАГ 7: Выводим статистику
-- ============================================================

-- Показываем количество категорий по уровням
SELECT
    level,
    COUNT(*) as count
FROM categories
GROUP BY level
ORDER BY level;

COMMIT;

-- Миграция завершена успешно!
-- Теперь в базе данных:
-- - 2 категории уровня 1 (Товары, Услуги)
-- - 24 категории уровня 2 (12 товаров + 12 услуг)
-- - 240 категорий уровня 3 (подкатегории)
