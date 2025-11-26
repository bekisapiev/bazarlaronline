-- Скрипт заполнения категорий для Bazarlar Online
-- Категории для Кыргызстана

BEGIN;

-- Основная категория: Товары
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1000, 'Товары', 'tovary', 1, 'shopping_bag', 0, true, NULL);

-- Подкатегория: Товары → Электроника
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1001, 'Электроника', 'elektronika', 2, 'devices', 0, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1002, 'Телефоны и аксессуары', 'elektronika-telefony-i-aksessuary', 3, NULL, 0, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1003, 'Ноутбуки и компьютеры', 'elektronika-noutbuki-i-kompyutery', 3, NULL, 1, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1004, 'Планшеты и электронные книги', 'elektronika-planshety-i-elektronnye-knigi', 3, NULL, 2, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1005, 'ТВ, аудио, видео', 'elektronika-tv-audio-video', 3, NULL, 3, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1006, 'Фото и видеокамеры', 'elektronika-foto-i-videokamery', 3, NULL, 4, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1007, 'Игровые приставки и игры', 'elektronika-igrovye-pristavki-i-igry', 3, NULL, 5, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1008, 'Умные устройства и гаджеты', 'elektronika-umnye-ustroystva-i-gadzhety', 3, NULL, 6, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1009, 'Комплектующие для ПК', 'elektronika-komplektuyuschie-dlya-pk', 3, NULL, 7, true, 1001);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1010, 'Офисная техника', 'elektronika-ofisnaya-tehnika', 3, NULL, 8, true, 1001);

-- Подкатегория: Товары → Одежда и обувь
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1011, 'Одежда и обувь', 'odezhda-i-obuv', 2, 'checkroom', 1, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1012, 'Женская одежда', 'odezhda-i-obuv-zhenskaya-odezhda', 3, NULL, 0, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1013, 'Мужская одежда', 'odezhda-i-obuv-muzhskaya-odezhda', 3, NULL, 1, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1014, 'Детская одежда', 'odezhda-i-obuv-detskaya-odezhda', 3, NULL, 2, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1015, 'Женская обувь', 'odezhda-i-obuv-zhenskaya-obuv', 3, NULL, 3, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1016, 'Мужская обувь', 'odezhda-i-obuv-muzhskaya-obuv', 3, NULL, 4, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1017, 'Детская обувь', 'odezhda-i-obuv-detskaya-obuv', 3, NULL, 5, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1018, 'Аксессуары и украшения', 'odezhda-i-obuv-aksessuary-i-ukrasheniya', 3, NULL, 6, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1019, 'Сумки и рюкзаки', 'odezhda-i-obuv-sumki-i-ryukzaki', 3, NULL, 7, true, 1011);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1020, 'Свадебные платья', 'odezhda-i-obuv-svadebnye-platya', 3, NULL, 8, true, 1011);

-- Подкатегория: Товары → Дом и сад
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1021, 'Дом и сад', 'dom-i-sad', 2, 'home', 2, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1022, 'Мебель', 'dom-i-sad-mebel', 3, NULL, 0, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1023, 'Посуда и кухонная утварь', 'dom-i-sad-posuda-i-kuhonnaya-utvar', 3, NULL, 1, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1024, 'Бытовая техника', 'dom-i-sad-bytovaya-tehnika', 3, NULL, 2, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1025, 'Ремонт и строительство', 'dom-i-sad-remont-i-stroitelstvo', 3, NULL, 3, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1026, 'Текстиль и ковры', 'dom-i-sad-tekstil-i-kovry', 3, NULL, 4, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1027, 'Освещение и электрика', 'dom-i-sad-osveschenie-i-elektrika', 3, NULL, 5, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1028, 'Сантехника', 'dom-i-sad-santehnika', 3, NULL, 6, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1029, 'Инструменты', 'dom-i-sad-instrumenty', 3, NULL, 7, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1030, 'Растения и семена', 'dom-i-sad-rasteniya-i-semena', 3, NULL, 8, true, 1021);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1031, 'Садовая техника и инвентарь', 'dom-i-sad-sadovaya-tehnika-i-inventar', 3, NULL, 9, true, 1021);

-- Подкатегория: Товары → Детские товары
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1032, 'Детские товары', 'detskie-tovary', 2, 'child_care', 3, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1033, 'Коляски и автокресла', 'detskie-tovary-kolyaski-i-avtokresla', 3, NULL, 0, true, 1032);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1034, 'Игрушки', 'detskie-tovary-igrushki', 3, NULL, 1, true, 1032);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1035, 'Детская мебель', 'detskie-tovary-detskaya-mebel', 3, NULL, 2, true, 1032);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1036, 'Товары для новорожденных', 'detskie-tovary-tovary-dlya-novorozhdennyh', 3, NULL, 3, true, 1032);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1037, 'Детское питание', 'detskie-tovary-detskoe-pitanie', 3, NULL, 4, true, 1032);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1038, 'Школьные принадлежности', 'detskie-tovary-shkolnye-prinadlezhnosti', 3, NULL, 5, true, 1032);

-- Подкатегория: Товары → Красота и здоровье
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1039, 'Красота и здоровье', 'krasota-i-zdorovye', 2, 'spa', 4, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1040, 'Парфюмерия', 'krasota-i-zdorovye-parfyumeriya', 3, NULL, 0, true, 1039);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1041, 'Косметика и уход', 'krasota-i-zdorovye-kosmetika-i-uhod', 3, NULL, 1, true, 1039);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1042, 'Средства гигиены', 'krasota-i-zdorovye-sredstva-gigieny', 3, NULL, 2, true, 1039);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1043, 'Медицинские товары', 'krasota-i-zdorovye-meditsinskie-tovary', 3, NULL, 3, true, 1039);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1044, 'БАДы и витамины', 'krasota-i-zdorovye-bady-i-vitaminy', 3, NULL, 4, true, 1039);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1045, 'Массажёры и тренажёры', 'krasota-i-zdorovye-massazhery-i-trenazhery', 3, NULL, 5, true, 1039);

-- Подкатегория: Товары → Спорт и отдых
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1046, 'Спорт и отдых', 'sport-i-otdyh', 2, 'sports_soccer', 5, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1047, 'Спортивная одежда и обувь', 'sport-i-otdyh-sportivnaya-odezhda-i-obuv', 3, NULL, 0, true, 1046);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1048, 'Тренажёры', 'sport-i-otdyh-trenazhery', 3, NULL, 1, true, 1046);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1049, 'Велосипеды', 'sport-i-otdyh-velosipedy', 3, NULL, 2, true, 1046);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1050, 'Туризм и кемпинг', 'sport-i-otdyh-turizm-i-kemping', 3, NULL, 3, true, 1046);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1051, 'Зимние виды спорта', 'sport-i-otdyh-zimnie-vidy-sporta', 3, NULL, 4, true, 1046);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1052, 'Рыбалка и охота', 'sport-i-otdyh-rybalka-i-ohota', 3, NULL, 5, true, 1046);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1053, 'Настольные игры и хобби', 'sport-i-otdyh-nastolnye-igry-i-hobbi', 3, NULL, 6, true, 1046);

-- Подкатегория: Товары → Авто и мото
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1054, 'Авто и мото', 'avto-i-moto', 2, 'directions_car', 6, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1055, 'Легковые автомобили', 'avto-i-moto-legkovye-avtomobili', 3, NULL, 0, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1056, 'Грузовые автомобили', 'avto-i-moto-gruzovye-avtomobili', 3, NULL, 1, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1057, 'Автобусы и микроавтобусы', 'avto-i-moto-avtobusy-i-mikroavtobusy', 3, NULL, 2, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1058, 'Мотоциклы и мототехника', 'avto-i-moto-mototsikly-i-mototehnika', 3, NULL, 3, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1059, 'Водный транспорт', 'avto-i-moto-vodnyy-transport', 3, NULL, 4, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1060, 'Запчасти и аксессуары', 'avto-i-moto-zapchasti-i-aksessuary', 3, NULL, 5, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1061, 'Шины и диски', 'avto-i-moto-shiny-i-diski', 3, NULL, 6, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1062, 'Автоэлектроника', 'avto-i-moto-avtoelektronika', 3, NULL, 7, true, 1054);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1063, 'Автомобильная химия', 'avto-i-moto-avtomobilnaya-himiya', 3, NULL, 8, true, 1054);

-- Подкатегория: Товары → Недвижимость
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1064, 'Недвижимость', 'nedvizhimost', 2, 'apartment', 7, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1065, 'Квартиры', 'nedvizhimost-kvartiry', 3, NULL, 0, true, 1064);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1066, 'Комнаты', 'nedvizhimost-komnaty', 3, NULL, 1, true, 1064);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1067, 'Дома и дачи', 'nedvizhimost-doma-i-dachi', 3, NULL, 2, true, 1064);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1068, 'Земельные участки', 'nedvizhimost-zemelnye-uchastki', 3, NULL, 3, true, 1064);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1069, 'Коммерческая недвижимость', 'nedvizhimost-kommercheskaya-nedvizhimost', 3, NULL, 4, true, 1064);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1070, 'Гаражи и парковки', 'nedvizhimost-garazhi-i-parkovki', 3, NULL, 5, true, 1064);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1071, 'Посуточная аренда', 'nedvizhimost-posutochnaya-arenda', 3, NULL, 6, true, 1064);

-- Подкатегория: Товары → Продукты питания
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1072, 'Продукты питания', 'produkty-pitaniya', 2, 'restaurant', 8, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1073, 'Мясо и птица', 'produkty-pitaniya-myaso-i-ptitsa', 3, NULL, 0, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1074, 'Молочные продукты', 'produkty-pitaniya-molochnye-produkty', 3, NULL, 1, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1075, 'Хлеб и выпечка', 'produkty-pitaniya-hleb-i-vypechka', 3, NULL, 2, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1076, 'Фрукты и овощи', 'produkty-pitaniya-frukty-i-ovoschi', 3, NULL, 3, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1077, 'Бакалея', 'produkty-pitaniya-bakaleya', 3, NULL, 4, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1078, 'Напитки', 'produkty-pitaniya-napitki', 3, NULL, 5, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1079, 'Кондитерские изделия', 'produkty-pitaniya-konditerskie-izdeliya', 3, NULL, 6, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1080, 'Замороженные продукты', 'produkty-pitaniya-zamorozhennye-produkty', 3, NULL, 7, true, 1072);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1081, 'Готовая еда', 'produkty-pitaniya-gotovaya-eda', 3, NULL, 8, true, 1072);

-- Подкатегория: Товары → Книги и учебная литература
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1082, 'Книги и учебная литература', 'knigi', 2, 'menu_book', 9, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1083, 'Художественная литература', 'knigi-hudozhestvennaya-literatura', 3, NULL, 0, true, 1082);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1084, 'Учебники и пособия', 'knigi-uchebniki-i-posobiya', 3, NULL, 1, true, 1082);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1085, 'Детские книги', 'knigi-detskie-knigi', 3, NULL, 2, true, 1082);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1086, 'Научная литература', 'knigi-nauchnaya-literatura', 3, NULL, 3, true, 1082);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1087, 'Словари и энциклопедии', 'knigi-slovari-i-entsiklopedii', 3, NULL, 4, true, 1082);

-- Подкатегория: Товары → Животные
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1088, 'Животные', 'zhivotnye', 2, 'pets', 10, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1089, 'Собаки', 'zhivotnye-sobaki', 3, NULL, 0, true, 1088);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1090, 'Кошки', 'zhivotnye-koshki', 3, NULL, 1, true, 1088);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1091, 'Птицы', 'zhivotnye-ptitsy', 3, NULL, 2, true, 1088);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1092, 'Аквариумные рыбки', 'zhivotnye-akvariumnye-rybki', 3, NULL, 3, true, 1088);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1093, 'Сельскохозяйственные животные', 'zhivotnye-selskohozyaystvennye-zhivotnye', 3, NULL, 4, true, 1088);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1094, 'Товары для животных', 'zhivotnye-tovary-dlya-zhivotnyh', 3, NULL, 5, true, 1088);

-- Подкатегория: Товары → Бизнес и оборудование
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1095, 'Бизнес и оборудование', 'biznes-i-oborudovanie', 2, 'business_center', 11, true, 1000);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1096, 'Торговое оборудование', 'biznes-i-oborudovanie-torgovoe-oborudovanie', 3, NULL, 0, true, 1095);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1097, 'Промышленное оборудование', 'biznes-i-oborudovanie-promyshlennoe-oborudovanie', 3, NULL, 1, true, 1095);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1098, 'Оборудование для общепита', 'biznes-i-oborudovanie-oborudovanie-dlya-obschepita', 3, NULL, 2, true, 1095);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1099, 'Медицинское оборудование', 'biznes-i-oborudovanie-meditsinskoe-oborudovanie', 3, NULL, 3, true, 1095);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1100, 'Сельхозтехника', 'biznes-i-oborudovanie-selhoztehnika', 3, NULL, 4, true, 1095);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1101, 'Готовый бизнес', 'biznes-i-oborudovanie-gotovyy-biznes', 3, NULL, 5, true, 1095);

-- Основная категория: Услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1102, 'Услуги', 'uslugi', 1, 'work', 0, true, NULL);

-- Подкатегория: Услуги → Строительство и ремонт
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1103, 'Строительство и ремонт', 'stroitelstvo-i-remont', 2, 'construction', 0, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1104, 'Строительство домов', 'stroitelstvo-i-remont-stroitelstvo-domov', 3, NULL, 0, true, 1103);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1105, 'Ремонт квартир', 'stroitelstvo-i-remont-remont-kvartir', 3, NULL, 1, true, 1103);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1106, 'Отделочные работы', 'stroitelstvo-i-remont-otdelochnye-raboty', 3, NULL, 2, true, 1103);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1107, 'Кровельные работы', 'stroitelstvo-i-remont-krovelnye-raboty', 3, NULL, 3, true, 1103);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1108, 'Электромонтажные работы', 'stroitelstvo-i-remont-elektromontazhnye-raboty', 3, NULL, 4, true, 1103);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1109, 'Сантехнические работы', 'stroitelstvo-i-remont-santehnicheskie-raboty', 3, NULL, 5, true, 1103);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1110, 'Установка окон и дверей', 'stroitelstvo-i-remont-ustanovka-okon-i-dverey', 3, NULL, 6, true, 1103);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1111, 'Ландшафтный дизайн', 'stroitelstvo-i-remont-landshaftnyy-dizayn', 3, NULL, 7, true, 1103);

-- Подкатегория: Услуги → Красота и здоровье
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1112, 'Красота и здоровье', 'uslugi-krasoty', 2, 'spa', 1, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1113, 'Парикмахерские услуги', 'uslugi-krasoty-parikmaherskie-uslugi', 3, NULL, 0, true, 1112);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1114, 'Маникюр и педикюр', 'uslugi-krasoty-manikyur-i-pedikyur', 3, NULL, 1, true, 1112);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1115, 'Косметология', 'uslugi-krasoty-kosmetologiya', 3, NULL, 2, true, 1112);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1116, 'Массаж', 'uslugi-krasoty-massazh', 3, NULL, 3, true, 1112);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1117, 'Стоматология', 'uslugi-krasoty-stomatologiya', 3, NULL, 4, true, 1112);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1118, 'Медицинские услуги', 'uslugi-krasoty-meditsinskie-uslugi', 3, NULL, 5, true, 1112);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1119, 'Фитнес и йога', 'uslugi-krasoty-fitnes-i-yoga', 3, NULL, 6, true, 1112);

-- Подкатегория: Услуги → Транспортные услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1120, 'Транспортные услуги', 'transportnye-uslugi', 2, 'local_shipping', 2, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1121, 'Грузоперевозки', 'transportnye-uslugi-gruzoperevozki', 3, NULL, 0, true, 1120);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1122, 'Пассажирские перевозки', 'transportnye-uslugi-passazhirskie-perevozki', 3, NULL, 1, true, 1120);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1123, 'Услуги такси', 'transportnye-uslugi-uslugi-taksi', 3, NULL, 2, true, 1120);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1124, 'Переезды и грузчики', 'transportnye-uslugi-pereezdy-i-gruzchiki', 3, NULL, 3, true, 1120);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1125, 'Курьерские услуги', 'transportnye-uslugi-kurerskie-uslugi', 3, NULL, 4, true, 1120);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1126, 'Эвакуатор', 'transportnye-uslugi-evakuator', 3, NULL, 5, true, 1120);

-- Подкатегория: Услуги → Ремонт техники
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1127, 'Ремонт техники', 'remont-tehniki', 2, 'build', 3, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1128, 'Ремонт телефонов', 'remont-tehniki-remont-telefonov', 3, NULL, 0, true, 1127);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1129, 'Ремонт компьютеров', 'remont-tehniki-remont-kompyuterov', 3, NULL, 1, true, 1127);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1130, 'Ремонт бытовой техники', 'remont-tehniki-remont-bytovoy-tehniki', 3, NULL, 2, true, 1127);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1131, 'Ремонт автомобилей', 'remont-tehniki-remont-avtomobiley', 3, NULL, 3, true, 1127);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1132, 'Ремонт электроники', 'remont-tehniki-remont-elektroniki', 3, NULL, 4, true, 1127);

-- Подкатегория: Услуги → Образование и курсы
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1133, 'Образование и курсы', 'obrazovanie', 2, 'school', 4, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1134, 'Репетиторы', 'obrazovanie-repetitory', 3, NULL, 0, true, 1133);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1135, 'Языковые курсы', 'obrazovanie-yazykovye-kursy', 3, NULL, 1, true, 1133);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1136, 'Компьютерные курсы', 'obrazovanie-kompyuternye-kursy', 3, NULL, 2, true, 1133);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1137, 'Музыкальные занятия', 'obrazovanie-muzykalnye-zanyatiya', 3, NULL, 3, true, 1133);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1138, 'Детские кружки', 'obrazovanie-detskie-kruzhki', 3, NULL, 4, true, 1133);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1139, 'Профессиональные курсы', 'obrazovanie-professionalnye-kursy', 3, NULL, 5, true, 1133);

-- Подкатегория: Услуги → Организация мероприятий
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1140, 'Организация мероприятий', 'meropriyatiya', 2, 'celebration', 5, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1141, 'Тамада и ведущие', 'meropriyatiya-tamada-i-veduschie', 3, NULL, 0, true, 1140);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1142, 'Фото и видеосъёмка', 'meropriyatiya-foto-i-videosemka', 3, NULL, 1, true, 1140);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1143, 'Музыканты и диджеи', 'meropriyatiya-muzykanty-i-didzhei', 3, NULL, 2, true, 1140);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1144, 'Аренда залов', 'meropriyatiya-arenda-zalov', 3, NULL, 3, true, 1140);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1145, 'Кейтеринг', 'meropriyatiya-keytering', 3, NULL, 4, true, 1140);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1146, 'Украшение залов', 'meropriyatiya-ukrashenie-zalov', 3, NULL, 5, true, 1140);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1147, 'Свадебные услуги', 'meropriyatiya-svadebnye-uslugi', 3, NULL, 6, true, 1140);

-- Подкатегория: Услуги → Бытовые услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1148, 'Бытовые услуги', 'bytovye-uslugi', 2, 'home_repair_service', 6, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1149, 'Уборка помещений', 'bytovye-uslugi-uborka-pomescheniy', 3, NULL, 0, true, 1148);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1150, 'Химчистка', 'bytovye-uslugi-himchistka', 3, NULL, 1, true, 1148);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1151, 'Ремонт одежды и обуви', 'bytovye-uslugi-remont-odezhdy-i-obuvi', 3, NULL, 2, true, 1148);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1152, 'Няни и сиделки', 'bytovye-uslugi-nyani-i-sidelki', 3, NULL, 3, true, 1148);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1153, 'Ремонт мебели', 'bytovye-uslugi-remont-mebeli', 3, NULL, 4, true, 1148);

-- Подкатегория: Услуги → IT и интернет
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1154, 'IT и интернет', 'it-uslugi', 2, 'computer', 7, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1155, 'Разработка сайтов', 'it-uslugi-razrabotka-saytov', 3, NULL, 0, true, 1154);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1156, 'Разработка приложений', 'it-uslugi-razrabotka-prilozheniy', 3, NULL, 1, true, 1154);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1157, 'SEO продвижение', 'it-uslugi-seo-prodvizhenie', 3, NULL, 2, true, 1154);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1158, 'Настройка компьютеров', 'it-uslugi-nastroyka-kompyuterov', 3, NULL, 3, true, 1154);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1159, 'Восстановление данных', 'it-uslugi-vosstanovlenie-dannyh', 3, NULL, 4, true, 1154);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1160, 'IT консультации', 'it-uslugi-it-konsultatsii', 3, NULL, 5, true, 1154);

-- Подкатегория: Услуги → Реклама и маркетинг
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1161, 'Реклама и маркетинг', 'reklama-i-marketing', 2, 'campaign', 8, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1162, 'Наружная реклама', 'reklama-i-marketing-naruzhnaya-reklama', 3, NULL, 0, true, 1161);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1163, 'Интернет-реклама', 'reklama-i-marketing-internet-reklama', 3, NULL, 1, true, 1161);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1164, 'Полиграфия', 'reklama-i-marketing-poligrafiya', 3, NULL, 2, true, 1161);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1165, 'Дизайн и брендинг', 'reklama-i-marketing-dizayn-i-brending', 3, NULL, 3, true, 1161);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1166, 'SMM продвижение', 'reklama-i-marketing-smm-prodvizhenie', 3, NULL, 4, true, 1161);

-- Подкатегория: Услуги → Юридические услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1167, 'Юридические услуги', 'yuridicheskie-uslugi', 2, 'gavel', 9, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1168, 'Юридические консультации', 'yuridicheskie-uslugi-yuridicheskie-konsultatsii', 3, NULL, 0, true, 1167);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1169, 'Регистрация бизнеса', 'yuridicheskie-uslugi-registratsiya-biznesa', 3, NULL, 1, true, 1167);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1170, 'Составление договоров', 'yuridicheskie-uslugi-sostavlenie-dogovorov', 3, NULL, 2, true, 1167);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1171, 'Представительство в суде', 'yuridicheskie-uslugi-predstavitelstvo-v-sude', 3, NULL, 3, true, 1167);

-- Подкатегория: Услуги → Финансовые услуги
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1172, 'Финансовые услуги', 'finansovye-uslugi', 2, 'account_balance', 10, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1173, 'Бухгалтерские услуги', 'finansovye-uslugi-buhgalterskie-uslugi', 3, NULL, 0, true, 1172);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1174, 'Аудит', 'finansovye-uslugi-audit', 3, NULL, 1, true, 1172);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1175, 'Кредитование', 'finansovye-uslugi-kreditovanie', 3, NULL, 2, true, 1172);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1176, 'Страхование', 'finansovye-uslugi-strahovanie', 3, NULL, 3, true, 1172);

-- Подкатегория: Услуги → Туризм и отдых
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1177, 'Туризм и отдых', 'turizm', 2, 'flight', 11, true, 1102);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1178, 'Туристические путёвки', 'turizm-turisticheskie-putevki', 3, NULL, 0, true, 1177);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1179, 'Визовая поддержка', 'turizm-vizovaya-podderzhka', 3, NULL, 1, true, 1177);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1180, 'Бронирование отелей', 'turizm-bronirovanie-oteley', 3, NULL, 2, true, 1177);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1181, 'Экскурсии', 'turizm-ekskursii', 3, NULL, 3, true, 1177);
INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
VALUES (1182, 'Аренда жилья для отдыха', 'turizm-arenda-zhilya-dlya-otdyha', 3, NULL, 4, true, 1177);

-- Обновляем sequence для id
SELECT setval('categories_id_seq', 1183, false);

COMMIT;