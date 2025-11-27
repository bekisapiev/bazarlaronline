#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт миграции категорий с поддержкой 4-х уровней
Запускать: python migrate_categories_4level.py
"""

import asyncio
import asyncpg
from typing import List, Tuple, Dict, Union

# Данные для подключения к базе
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "bazarlar_claude",
    "user": "postgres",
    "password": "postgres"  # ИЗМЕНИТЕ НА ВАШ ПАРОЛЬ!
}

# Структура категорий с поддержкой 4-х уровней
CATEGORIES = {
    "products": {
        "id": 1,
        "name": "Товары",
        "slug": "tovary",
        "icon": "shopping_bag",
        "children": [
            {
                "id": 10,
                "name": "Электроника",
                "slug": "elektronika",
                "icon": "devices",
                "subcategories": [
                    {
                        "name": "Телефоны и аксессуары",
                        "slug": "telefony-aksessuary",
                        "level4": [
                            ("Смартфоны", "smartfony"),
                            ("Кнопочные телефоны", "knopochnye-telefony"),
                            ("Чехлы и бамперы", "chekhly-bampery"),
                            ("Защитные стекла и пленки", "zashchitnye-stekla"),
                            ("Зарядные устройства", "zaryadnye-ustroystva"),
                            ("Наушники и гарнитуры", "naushniki-garnitury"),
                            ("Powerbank", "powerbank"),
                            ("Держатели и подставки", "derzhateli-podstavki"),
                            ("Кабели и адаптеры", "kabeli-adaptery"),
                            ("Запчасти для телефонов", "zapchasti-telefonov"),
                        ]
                    },
                    {
                        "name": "Ноутбуки и компьютеры",
                        "slug": "noutbuki-kompyutery",
                        "level4": [
                            ("Ноутбуки", "noutbuki"),
                            ("Настольные компьютеры", "nastolnye-kompyutery"),
                            ("Моноблоки", "monobloki"),
                            ("Мониторы", "monitory"),
                            ("Клавиатуры", "klaviatury"),
                            ("Мыши и коврики", "myshi-kovriki"),
                            ("Веб-камеры", "veb-kamery"),
                            ("Сумки для ноутбуков", "sumki-noutbukov"),
                            ("Комплектующие", "komplektuyushchie"),
                            ("Серверное оборудование", "servernoe-oborudovanie"),
                        ]
                    },
                    ("Планшеты и электронные книги", "planshety-eknigi"),
                    ("ТВ, аудио, видео", "tv-audio-video"),
                    ("Фото и видеокамеры", "foto-videokamery"),
                    ("Игровые приставки", "igrovye-pristavki"),
                    ("Техника для дома", "tekhnika-dlya-doma"),
                    ("Климатическая техника", "klimaticheskaya-tekhnika"),
                    ("Аксессуары и комплектующие", "aksessuary-komplektuyushchie"),
                    ("Умная электроника", "umnaya-elektronika"),
                ]
            },
            {
                "id": 20,
                "name": "Одежда и обувь",
                "slug": "odezhda-obuv",
                "icon": "checkroom",
                "subcategories": [
                    {
                        "name": "Женская одежда",
                        "slug": "zhenskaya-odezhda",
                        "level4": [
                            ("Платья", "platya"),
                            ("Блузки и рубашки", "bluzki-rubashki"),
                            ("Юбки", "yubki"),
                            ("Брюки", "bryuki"),
                            ("Джинсы", "dzhinsy"),
                            ("Пиджаки и жакеты", "pidzhaki-zhakety"),
                            ("Верхняя одежда", "verkhnyaya-odezhda-zhen"),
                            ("Трикотаж и свитера", "trikotazh-svitera-zhen"),
                            ("Спортивная одежда", "sportivnaya-odezhda-zhen"),
                            ("Белье и купальники", "belie-kupalniki"),
                        ]
                    },
                    {
                        "name": "Мужская одежда",
                        "slug": "muzhskaya-odezhda",
                        "level4": [
                            ("Рубашки", "rubashki"),
                            ("Футболки и поло", "futbolki-polo"),
                            ("Брюки и чиносы", "bryuki-chinosy"),
                            ("Джинсы", "dzhinsy-muzh"),
                            ("Костюмы", "kostyumy"),
                            ("Пиджаки и блейзеры", "pidzhaki-bleyzery"),
                            ("Верхняя одежда", "verkhnyaya-odezhda-muzh"),
                            ("Свитера и кардиганы", "svitera-kardigany"),
                            ("Спортивная одежда", "sportivnaya-odezhda-muzh"),
                            ("Нижнее белье", "nizhnee-belie-muzh"),
                        ]
                    },
                    ("Детская одежда", "detskaya-odezhda"),
                    ("Женская обувь", "zhenskaya-obuv"),
                    ("Мужская обувь", "muzhskaya-obuv"),
                    ("Детская обувь", "detskaya-obuv"),
                    ("Аксессуары", "aksessuary-odezhda"),
                    ("Сумки и рюкзаки", "sumki-ryukzaki"),
                    ("Ювелирные изделия", "yuvelirnye-izdeliya"),
                    ("Часы", "chasy"),
                ]
            },
            {
                "id": 30,
                "name": "Спорт и отдых",
                "slug": "sport-otdykh",
                "icon": "sports_soccer",
                "subcategories": [
                    ("Тренажеры", "trenazhery"),
                    ("Велосипеды", "velosipedy"),
                    ("Спортивная одежда и обувь", "sportivnaya-odezhda-obuv"),
                    ("Туристическое снаряжение", "turisticheskoe-snaryazhenie"),
                    ("Рыбалка и охота", "rybalka-okhota"),
                    ("Зимний спорт", "zimniy-sport"),
                    ("Водный спорт", "vodnyy-sport"),
                    ("Командные виды спорта", "komandnye-vidy-sporta"),
                    ("Единоборства", "edinoborstva"),
                    ("Активный отдых", "aktivnyy-otdykh"),
                ]
            },
            {
                "id": 40,
                "name": "Красота и здоровье",
                "slug": "krasota-zdorovie",
                "icon": "spa",
                "subcategories": [
                    ("Косметика", "kosmetika"),
                    ("Парфюмерия", "parfyumeriya"),
                    ("Уход за волосами", "ukhod-volosami"),
                    ("Уход за кожей", "ukhod-kozhey"),
                    ("Уход за телом", "ukhod-telom"),
                    ("Маникюр и педикюр", "manikyur-pedikyur"),
                    ("Массажеры", "massazhery"),
                    ("Медицинские товары", "meditsinskie-tovary"),
                    ("БАДы и витамины", "bady-vitaminy"),
                    ("Средства гигиены", "sredstva-gigieny"),
                ]
            },
            {
                "id": 50,
                "name": "Дом и интерьер",
                "slug": "dom-interer",
                "icon": "home",
                "subcategories": [
                    ("Мебель для дома", "mebel-doma"),
                    ("Мебель для офиса", "mebel-ofisa"),
                    ("Освещение", "osveshchenie"),
                    ("Текстиль", "tekstil"),
                    ("Посуда", "posuda"),
                    ("Кухонные принадлежности", "kukhonnye-prinadlezhnosti"),
                    ("Декор", "dekor"),
                    ("Ковры и напольные покрытия", "kovry-napolnye-pokrytiya"),
                    ("Хранение и организация", "khranenie-organizatsiya"),
                    ("Растения и цветы", "rasteniya-tsvety"),
                ]
            },
            {
                "id": 60,
                "name": "Детские товары",
                "slug": "detskie-tovary",
                "icon": "child_care",
                "subcategories": [
                    ("Коляски и автокресла", "kolyaski-avtokresla"),
                    ("Детская мебель", "detskaya-mebel"),
                    ("Товары для новорожденных", "tovary-novorozhdennykh"),
                    ("Игрушки", "igrushki"),
                    ("Конструкторы", "konstruktory"),
                    ("Развивающие игры", "razvivayushchie-igry"),
                    ("Детская одежда и обувь", "detskaya-odezhda-obuv-tovar"),
                    ("Школьные товары", "shkolnye-tovary"),
                    ("Детское питание", "detskoe-pitanie"),
                    ("Подгузники и гигиена", "podguzniki-gigiena"),
                ]
            },
            {
                "id": 70,
                "name": "Книги и хобби",
                "slug": "knigi-khobbi",
                "icon": "menu_book",
                "subcategories": [
                    ("Книги", "knigi"),
                    ("Журналы и газеты", "zhurnaly-gazety"),
                    ("Канцелярия", "kantselyariya"),
                    ("Музыкальные инструменты", "muzykalnye-instrumenty"),
                    ("Творчество и рукоделие", "tvorchestvo-rukodelie"),
                    ("Коллекционирование", "kollektsionirovanie"),
                    ("Антиквариат", "antikvariat"),
                    ("Винил и аудиотехника", "vinil-audiotekhnika"),
                    ("Фотография", "fotografiya"),
                    ("Художественные материалы", "khudozhestvennye-materialy"),
                ]
            },
            {
                "id": 80,
                "name": "Продукты питания",
                "slug": "produkty-pitaniya",
                "icon": "restaurant",
                "subcategories": [
                    ("Молочные продукты", "molochnye-produkty"),
                    ("Мясо и птица", "myaso-ptitsa"),
                    ("Рыба и морепродукты", "ryba-moreprodukty"),
                    ("Хлебобулочные изделия", "khlebobulochnye-izdeliya"),
                    ("Кондитерские изделия", "konditerskie-izdeliya"),
                    ("Фрукты и овощи", "frukty-ovoshchi"),
                    ("Бакалея", "bakaleya"),
                    ("Напитки", "napitki"),
                    ("Органические продукты", "organicheskie-produkty"),
                    ("Готовая еда", "gotovaya-eda"),
                ]
            },
            {
                "id": 90,
                "name": "Авто и мото",
                "slug": "avto-moto",
                "icon": "directions_car",
                "subcategories": [
                    {
                        "name": "Легковые автомобили",
                        "slug": "legkovye-avtomobili",
                        "level4": [
                            ("Седаны", "sedany"),
                            ("Хэтчбеки", "khetehbeki"),
                            ("Универсалы", "universaly"),
                            ("Внедорожники", "vnedorozhniki"),
                            ("Кроссоверы", "krossovery"),
                            ("Минивэны", "miniveny"),
                            ("Купе", "kupe"),
                            ("Кабриолеты", "kabriolety"),
                            ("Электромобили", "elektromobili"),
                            ("Гибриды", "gibridy"),
                        ]
                    },
                    ("Грузовые автомобили", "gruzovye-avtomobili"),
                    ("Мотоциклы и мототехника", "mototsikly-mototekhnika"),
                    ("Автозапчасти", "avtozapchasti"),
                    ("Шины и диски", "shiny-diski"),
                    ("Автоэлектроника", "avtoelektronika"),
                    ("Автоаксессуары", "avtoaksessuary"),
                    ("Автохимия и масла", "avtokhimiya-masla"),
                    ("Прицепы и спецтехника", "pritsey-spetstekhnika"),
                    ("Велосипеды и самокаты", "velosipedy-samokaty"),
                ]
            },
            {
                "id": 100,
                "name": "Недвижимость",
                "slug": "nedvizhimost",
                "icon": "apartment",
                "subcategories": [
                    ("Квартиры", "kvartiry"),
                    ("Дома и дачи", "doma-dachi"),
                    ("Коммерческая недвижимость", "kommercheskaya-nedvizhimost"),
                    ("Земельные участки", "zemelnye-uchastki"),
                    ("Гаражи и парковки", "garazhi-parkovki"),
                    ("Аренда квартир", "arenda-kvartir"),
                    ("Аренда домов", "arenda-domov"),
                    ("Аренда коммерческой недвижимости", "arenda-kommercheskoy-nedvizhimosti"),
                    ("Посуточная аренда", "posutochnaya-arenda"),
                    ("Зарубежная недвижимость", "zarubezhnaya-nedvizhimost"),
                ]
            },
            {
                "id": 120,
                "name": "Животные",
                "slug": "zhivotnye",
                "icon": "pets",
                "subcategories": [
                    ("Собаки", "sobaki"),
                    ("Кошки", "koshki"),
                    ("Птицы", "ptitsy"),
                    ("Аквариумные рыбки", "akvariumnye-rybki"),
                    ("Грызуны", "gryzuny"),
                    ("Сельскохозяйственные животные", "selskokhozyaystvennye-zhivotnye"),
                    ("Экзотические животные", "ekzoticheskie-zhivotnye"),
                    ("Товары для животных", "tovary-dlya-zhivotnykh"),
                    ("Корма для животных", "korma-dlya-zhivotnykh"),
                    ("Ветеринария", "veterinariya"),
                ]
            },
            {
                "id": 130,
                "name": "Работа",
                "slug": "rabota",
                "icon": "work",
                "subcategories": [
                    ("Вакансии", "vakansii"),
                    ("Резюме", "rezyume"),
                    ("Подработка", "podrabotka"),
                    ("Стажировки", "stazhirovki"),
                    ("Удаленная работа", "udalennaya-rabota"),
                    ("Вахтовый метод", "vakhtovyy-metod"),
                    ("Работа за рубежом", "rabota-za-rubezhom"),
                    ("Волонтерство", "volonterstvo"),
                    ("Бизнес и партнерство", "biznes-partnerstvo"),
                    ("Обучение и тренинги", "obuchenie-treningi"),
                ]
            },
        ]
    },
    "services": {
        "id": 2,
        "name": "Услуги",
        "slug": "uslugi",
        "icon": "room_service",
        "children": [
            {
                "id": 210,
                "name": "IT и интернет",
                "slug": "it-internet",
                "icon": "computer",
                "subcategories": [
                    {
                        "name": "Разработка сайтов",
                        "slug": "razrabotka-saytov",
                        "level4": [
                            ("Лендинги", "lendingi"),
                            ("Корпоративные сайты", "korporativnye-sayty"),
                            ("Интернет-магазины", "internet-magaziny"),
                            ("Блоги и порталы", "blogi-portaly"),
                            ("Web-приложения", "web-prilozheniya"),
                            ("WordPress", "wordpress"),
                            ("CMS разработка", "cms-razrabotka"),
                            ("Frontend разработка", "frontend-razrabotka"),
                            ("Backend разработка", "backend-razrabotka"),
                            ("Full-stack разработка", "fullstack-razrabotka"),
                        ]
                    },
                    {
                        "name": "Разработка мобильных приложений",
                        "slug": "razrabotka-mobilnykh-prilozheniy",
                        "level4": [
                            ("iOS приложения", "ios-prilozheniya"),
                            ("Android приложения", "android-prilozheniya"),
                            ("Кроссплатформенные приложения", "krossplatformennye-prilozheniya"),
                            ("React Native", "react-native"),
                            ("Flutter", "flutter"),
                            ("Ionic", "ionic"),
                            ("Xamarin", "xamarin"),
                            ("PWA приложения", "pwa-prilozheniya"),
                            ("Игры для мобильных", "igry-mobilnykh"),
                            ("Дизайн мобильных приложений", "dizayn-mobilnykh"),
                        ]
                    },
                    ("Веб-дизайн", "veb-dizayn"),
                    ("SEO продвижение", "seo-prodvizhenie"),
                    ("Контекстная реклама", "kontekstnaya-reklama"),
                    ("Системное администрирование", "sistemnoe-administrirovanie"),
                    ("Настройка компьютеров", "nastroyka-kompyuterov"),
                    ("Ремонт компьютеров", "remont-kompyuterov"),
                    ("Программирование", "programmirovanie"),
                    ("Базы данных", "bazy-dannykh"),
                ]
            },
            {
                "id": 220,
                "name": "Строительство и ремонт",
                "slug": "stroitelstvo-remont",
                "icon": "construction",
                "subcategories": [
                    ("Ремонт квартир", "remont-kvartir"),
                    ("Ремонт домов", "remont-domov"),
                    ("Отделочные работы", "otdelochnye-raboty"),
                    ("Сантехнические работы", "santekhnicheskie-raboty"),
                    ("Электромонтажные работы", "elektromontazhnye-raboty"),
                    ("Кровельные работы", "krovelnye-raboty"),
                    ("Фасадные работы", "fasadnye-raboty"),
                    ("Установка окон и дверей", "ustanovka-okon-dverey"),
                    ("Ландшафтный дизайн", "landshaftnyy-dizayn"),
                    ("Снос и демонтаж", "snos-demontazh"),
                ]
            },
            {
                "id": 230,
                "name": "Бытовые услуги",
                "slug": "bytovye-uslugi",
                "icon": "home_repair_service",
                "subcategories": [
                    ("Уборка помещений", "uborka-pomeshcheniy"),
                    ("Химчистка", "khimchistka"),
                    ("Ремонт бытовой техники", "remont-bytovoy-tekhniki"),
                    ("Ремонт мебели", "remont-mebeli"),
                    ("Ремонт одежды и обуви", "remont-odezhdy-obuvi"),
                    ("Грузоперевозки", "gruzoperevozki"),
                    ("Переезды", "pereezdy"),
                    ("Курьерские услуги", "kurerskie-uslugi"),
                    ("Мастер на час", "master-na-chas"),
                    ("Сборка мебели", "sborka-mebeli"),
                ]
            },
            {
                "id": 240,
                "name": "Красота и здоровье",
                "slug": "krasota-zdorovie-uslugi",
                "icon": "spa",
                "subcategories": [
                    ("Парикмахерские услуги", "parikmaherskie-uslugi"),
                    ("Маникюр и педикюр", "manikyur-pedikyur-uslugi"),
                    ("Косметология", "kosmetologiya"),
                    ("Массаж", "massazh"),
                    ("Татуаж и перманентный макияж", "tatuazh-permanentnyy-makiyazh"),
                    ("Эпиляция", "epilyatsiya"),
                    ("Визаж и макияж", "vizazh-makiyazh"),
                    ("SPA-процедуры", "spa-protsedury"),
                    ("Стоматология", "stomatologiya"),
                    ("Фитнес и тренировки", "fitnes-trenirovki"),
                ]
            },
            {
                "id": 250,
                "name": "Образование и курсы",
                "slug": "obrazovanie-kursy",
                "icon": "school",
                "subcategories": [
                    ("Репетиторы", "repetitory"),
                    ("Курсы иностранных языков", "kursy-inostrannykh-yazykov"),
                    ("Компьютерные курсы", "kompyuternye-kursy"),
                    ("Бизнес-тренинги", "biznes-treningi"),
                    ("Курсы красоты", "kursy-krasoty"),
                    ("Музыкальные школы", "muzykalnye-shkoly"),
                    ("Танцы и хореография", "tantsy-khoreografiya"),
                    ("Художественные курсы", "khudozhestvennye-kursy"),
                    ("Курсы вождения", "kursy-vozhdeniya"),
                    ("Профессиональные курсы", "professionalnye-kursy"),
                ]
            },
            {
                "id": 260,
                "name": "Финансовые услуги",
                "slug": "finansovye-uslugi",
                "icon": "account_balance",
                "subcategories": [
                    ("Бухгалтерские услуги", "bukhgalterskie-uslugi"),
                    ("Аудиторские услуги", "auditorskie-uslugi"),
                    ("Юридические услуги", "yuridicheskie-uslugi"),
                    ("Кредиты и займы", "kredity-zaymy"),
                    ("Страхование", "strakhovanie"),
                    ("Инвестиционный консалтинг", "investitsionnyy-konsalting"),
                    ("Налоговое консультирование", "nalogovoe-konsultirovanie"),
                    ("Регистрация бизнеса", "registratsiya-biznesa"),
                    ("Финансовый анализ", "finansovyy-analiz"),
                    ("Коллекторские услуги", "kollektorskie-uslugi"),
                ]
            },
            {
                "id": 270,
                "name": "Авто услуги",
                "slug": "avto-uslugi",
                "icon": "car_repair",
                "subcategories": [
                    ("Ремонт автомобилей", "remont-avtomobiley"),
                    ("Кузовной ремонт", "kuzovnoy-remont"),
                    ("Покраска автомобилей", "pokraska-avtomobiley"),
                    ("Автомойка", "avtomoyka"),
                    ("Шиномонтаж", "shinomontazh"),
                    ("Тонировка стекол", "tonirovka-stekol"),
                    ("Установка сигнализаций", "ustanovka-signalizatsiy"),
                    ("Диагностика автомобилей", "diagnostika-avtomobiley"),
                    ("Эвакуация автомобилей", "evakuatsiya-avtomobiley"),
                    ("Прокат автомобилей", "prokat-avtomobiley"),
                ]
            },
            {
                "id": 280,
                "name": "Организация мероприятий",
                "slug": "organizatsiya-meropriyatiy",
                "icon": "celebration",
                "subcategories": [
                    ("Свадьбы", "svadby"),
                    ("Дни рождения", "dni-rozhdeniya"),
                    ("Корпоративные мероприятия", "korporativnye-meropriyatiya"),
                    ("Юбилеи", "yubilei"),
                    ("Детские праздники", "detskie-prazdniki"),
                    ("Фото и видеосъемка", "foto-videosemka"),
                    ("Ведущие и тамада", "vedushchie-tamada"),
                    ("Музыканты и DJ", "muzykanty-dj"),
                    ("Аренда залов", "arenda-zalov"),
                    ("Кейтеринг", "keytering"),
                ]
            },
            {
                "id": 290,
                "name": "Фото и видео услуги",
                "slug": "foto-video-uslugi",
                "icon": "photo_camera",
                "subcategories": [
                    ("Свадебная фотосъемка", "svadebnaya-fotosemka"),
                    ("Портретная фотосъемка", "portretnaya-fotosemka"),
                    ("Предметная фотосъемка", "predmetnaya-fotosemka"),
                    ("Видеосъемка мероприятий", "videosemka-meropriyatiy"),
                    ("Аэросъемка", "aerosemka"),
                    ("Видеомонтаж", "videomontazh"),
                    ("Обработка фотографий", "obrabotka-fotografiy"),
                    ("Студийная съемка", "studiynaya-semka"),
                    ("Семейная фотосъемка", "semeynaya-fotosemka"),
                    ("Рекламная съемка", "reklamnaya-semka"),
                ]
            },
            {
                "id": 300,
                "name": "Туризм и путешествия",
                "slug": "turizm-puteshestviya",
                "icon": "flight",
                "subcategories": [
                    ("Туристические туры", "turisticheskie-tury"),
                    ("Авиабилеты", "aviabilety"),
                    ("Гостиницы и отели", "gostinitsy-oteli"),
                    ("Визовая поддержка", "vizovaya-podderzhka"),
                    ("Экскурсии", "ekskursii"),
                    ("Трансфер", "transfer"),
                    ("Туристическое страхование", "turisticheskoe-strakhovanie"),
                    ("Круизы", "kruizy"),
                    ("Аренда жилья за рубежом", "arenda-zhilya-za-rubezhom"),
                    ("Горящие туры", "goryashchie-tury"),
                ]
            },
            {
                "id": 310,
                "name": "Услуги для животных",
                "slug": "uslugi-dlya-zhivotnykh",
                "icon": "pets",
                "subcategories": [
                    ("Ветеринарные услуги", "veterinarnye-uslugi"),
                    ("Груминг", "gruming"),
                    ("Передержка животных", "perederzyka-zhivotnykh"),
                    ("Дрессировка", "dressirovka"),
                    ("Выгул собак", "vygul-sobak"),
                    ("Вязка животных", "vyazka-zhivotnykh"),
                    ("Зоотакси", "zootaksi"),
                    ("Зоогостиницы", "zoogostinitsy"),
                    ("Стерилизация и кастрация", "sterilizatsiya-kastratsiya"),
                    ("Ветеринарная аптека", "veterinarnaya-apteka"),
                ]
            },
            {
                "id": 320,
                "name": "Реклама и маркетинг",
                "slug": "reklama-marketing",
                "icon": "campaign",
                "subcategories": [
                    ("Интернет-реклама", "internet-reklama"),
                    ("Наружная реклама", "naruzhnaya-reklama"),
                    ("Полиграфия", "poligrafiya"),
                    ("SMM-продвижение", "smm-prodvizhenie"),
                    ("Создание логотипов", "sozdanie-logotipov"),
                    ("Брендинг", "brending"),
                    ("Копирайтинг", "kopiraiting"),
                    ("PR-услуги", "pr-uslugi"),
                    ("Медиапланирование", "mediaplanirovanie"),
                    ("Email-маркетинг", "email-marketing"),
                ]
            },
        ]
    }
}


def get_subcategory_id_range(parent_id: int) -> int:
    """Определяет начальный ID для подкатегорий уровня 3"""
    if 10 <= parent_id <= 90:
        return parent_id * 100 + 1
    elif parent_id == 100:
        return 10001
    elif parent_id == 120:
        return 12001
    elif parent_id == 130:
        return 13001
    elif 210 <= parent_id <= 320:
        # Используем 5-значные ID для услуг, чтобы избежать конфликтов с товарами
        return parent_id * 100 + 1
    else:
        raise ValueError(f"Unknown parent_id: {parent_id}")


def get_level4_id_range(parent_id: int) -> int:
    """Определяет начальный ID для подкатегорий уровня 4"""
    # Для 4-го уровня используем 6-значные ID: parent_id * 100 + 1
    # Например: 1001 -> 100101, 1002 -> 100201, и т.д.
    return parent_id * 100 + 1


async def migrate_categories():
    """Выполняет миграцию категорий"""
    print("=" * 60)
    print("МИГРАЦИЯ КАТЕГОРИЙ (4 УРОВНЯ)")
    print("=" * 60)
    print()

    # Подключаемся к базе
    print("🔌 Подключение к базе данных...")
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        print("✅ Подключение установлено")
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        return

    try:
        print("\n📦 Начало транзакции...")
        async with conn.transaction():
            # Шаг 1: Отвязываем продукты
            print("\n1️⃣  Отвязываем продукты от категорий...")
            result = await conn.execute(
                "UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL"
            )
            count = int(result.split()[-1])
            print(f"   ✅ Обновлено продуктов: {count}")

            # Шаг 2: Отвязываем профили продавцов
            print("\n2️⃣  Отвязываем профили продавцов от категорий...")
            result = await conn.execute(
                "UPDATE seller_profiles SET category_id = NULL WHERE category_id IS NOT NULL"
            )
            count = int(result.split()[-1])
            print(f"   ✅ Обновлено профилей: {count}")

            # Шаг 3: Очищаем таблицу
            print("\n3️⃣  Очищаем таблицу категорий...")
            await conn.execute("TRUNCATE TABLE categories RESTART IDENTITY CASCADE")
            print("   ✅ Таблица очищена")

            # Шаг 4: Вставляем основные категории
            print("\n4️⃣  Вставляем основные категории...")
            for main_type in ["products", "services"]:
                main_cat = CATEGORIES[main_type]
                await conn.execute(
                    """
                    INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """,
                    main_cat["id"],
                    main_cat["name"],
                    main_cat["slug"],
                    1,
                    main_cat["icon"],
                    0 if main_type == "products" else 1,
                    True,
                    None
                )
                print(f"   ✅ {main_cat['name']}")

            # Шаг 5: Вставляем категории уровня 2, 3 и 4
            print("\n5️⃣  Вставляем категории товаров и услуг...")

            total_level2 = 0
            total_level3 = 0
            total_level4 = 0

            for main_type, type_name in [("products", "Товары"), ("services", "Услуги")]:
                main_cat = CATEGORIES[main_type]
                print(f"\n   📂 {type_name}:")

                for idx, cat in enumerate(main_cat["children"]):
                    # Уровень 2
                    await conn.execute(
                        """
                        INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        """,
                        cat["id"],
                        cat["name"],
                        cat["slug"],
                        2,
                        cat["icon"],
                        idx,
                        True,
                        main_cat["id"]
                    )
                    total_level2 += 1

                    # Уровень 3
                    if "subcategories" in cat:
                        start_id = get_subcategory_id_range(cat["id"])
                        level3_count = 0
                        level4_count = 0

                        for sub_idx, subcat in enumerate(cat["subcategories"]):
                            sub_id = start_id + sub_idx

                            # Проверяем, является ли подкатегория словарем (с level4) или кортежем
                            if isinstance(subcat, dict):
                                # Есть 4-й уровень
                                sub_name = subcat["name"]
                                sub_slug = subcat["slug"]
                                has_level4 = True
                                level4_items = subcat.get("level4", [])
                            else:
                                # Нет 4-го уровня
                                sub_name, sub_slug = subcat
                                has_level4 = False
                                level4_items = []

                            # Вставляем категорию уровня 3
                            await conn.execute(
                                """
                                INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                """,
                                sub_id,
                                sub_name,
                                sub_slug,
                                3,
                                None,
                                sub_idx,
                                True,
                                cat["id"]
                            )
                            total_level3 += 1
                            level3_count += 1

                            # Вставляем категории уровня 4, если есть
                            if has_level4 and level4_items:
                                level4_start_id = get_level4_id_range(sub_id)
                                for level4_idx, (level4_name, level4_slug) in enumerate(level4_items):
                                    level4_id = level4_start_id + level4_idx
                                    await conn.execute(
                                        """
                                        INSERT INTO categories (id, name, slug, level, icon, sort_order, is_active, parent_id)
                                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                        """,
                                        level4_id,
                                        level4_name,
                                        level4_slug,
                                        4,
                                        None,
                                        level4_idx,
                                        True,
                                        sub_id
                                    )
                                    total_level4 += 1
                                    level4_count += 1

                        if level4_count > 0:
                            print(f"      ✅ {cat['name']} (+{level3_count} подкатегорий, +{level4_count} подподкатегорий)")
                        else:
                            print(f"      ✅ {cat['name']} (+{level3_count} подкатегорий)")

            # Шаг 6: Обновляем sequence
            print("\n6️⃣  Обновляем sequence...")
            max_id = await conn.fetchval("SELECT MAX(id) FROM categories")
            await conn.execute(f"SELECT setval('categories_id_seq', {max_id + 1})")
            print(f"   ✅ Sequence установлен на {max_id + 1}")

            # Статистика
            print("\n7️⃣  Проверяем результат...")
            stats = await conn.fetch(
                """
                SELECT level, COUNT(*) as count
                FROM categories
                GROUP BY level
                ORDER BY level
                """
            )

            print("\n   📊 Статистика:")
            for stat in stats:
                level_name = {
                    1: "Уровень 1 (основные)",
                    2: "Уровень 2 (категории)",
                    3: "Уровень 3 (подкатегории)",
                    4: "Уровень 4 (подподкатегории)"
                }.get(stat['level'], f"Уровень {stat['level']}")
                print(f"      • {level_name}: {stat['count']}")

            total = await conn.fetchval("SELECT COUNT(*) FROM categories")
            print(f"\n   ✅ Всего категорий: {total}")

            print("\n✅ Транзакция завершена успешно!")

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        print("\n⚠️  Транзакция откачена, база данных не изменена")
        raise
    finally:
        await conn.close()
        print("\n🔌 Соединение закрыто\n")


async def main():
    """Главная функция"""
    print("\n🚀 Запуск миграции категорий...\n")

    # Запрашиваем подтверждение
    print("⚠️  ВНИМАНИЕ: Скрипт удалит все существующие категории!")
    print("   Продукты и профили продавцов НЕ будут удалены,")
    print("   но будут отвязаны от категорий.\n")

    confirmation = input("Продолжить? (да/нет): ").strip().lower()
    if confirmation not in ["да", "yes", "y", "да"]:
        print("\n❌ Миграция отменена пользователем\n")
        return

    try:
        await migrate_categories()
        print("=" * 60)
        print("🎉 МИГРАЦИЯ УСПЕШНО ЗАВЕРШЕНА!")
        print("=" * 60)
        print()
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ Критическая ошибка: {e}")
        print("=" * 60)
        print()
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
