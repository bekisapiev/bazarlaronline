"""
Seed script to populate sellers, products and services
Run with: python seed_sellers_products.py
"""
import asyncio
import sys
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.models.user import User, SellerProfile
from app.models.product import Product, Category
from app.models.location import City, Market
from app.models.wallet import Wallet


# Test sellers data
SELLERS_DATA = [
    {
        "email": "dordoy_electronics@test.com",
        "full_name": "Азамат Усенов",
        "phone": "+996555123456",
        "shop_name": "Электроника Дордой",
        "description": "Продажа телефонов, ноутбуков и электроники. Гарантия на все товары. Работаем с 2015 года.",
        "seller_type": "market",
        "city": "Бишкек",
        "market": "Дордой",
        "category": "electronics",
        "is_verified": True,
        "rating": 4.8,
        "reviews_count": 156,
    },
    {
        "email": "fashion_boutique@test.com",
        "full_name": "Айгуль Токтосунова",
        "phone": "+996777234567",
        "shop_name": "Модный Бутик",
        "description": "Женская одежда из Турции и Китая. Новые коллекции каждую неделю!",
        "seller_type": "boutique",
        "city": "Бишкек",
        "market": "Ош базар",
        "category": "clothing",
        "is_verified": True,
        "rating": 4.5,
        "reviews_count": 89,
    },
    {
        "email": "fresh_market@test.com",
        "full_name": "Мирлан Алымбеков",
        "phone": "+996700345678",
        "shop_name": "Свежие Продукты",
        "description": "Свежие овощи и фрукты каждый день. Доставка по городу бесплатно от 500 сом.",
        "seller_type": "market",
        "city": "Бишкек",
        "market": "Аламединский рынок",
        "category": "food",
        "is_verified": False,
        "rating": 4.2,
        "reviews_count": 45,
    },
    {
        "email": "repair_master@test.com",
        "full_name": "Нурлан Сыдыков",
        "phone": "+996550456789",
        "shop_name": "Мастер Ремонта",
        "description": "Ремонт квартир, домов, офисов. Опыт 10 лет. Качественно и в срок!",
        "seller_type": "office",
        "city": "Бишкек",
        "market": None,
        "category": "services",
        "is_verified": True,
        "rating": 4.9,
        "reviews_count": 203,
    },
    {
        "email": "home_furniture@test.com",
        "full_name": "Жаныл Асанова",
        "phone": "+996771567890",
        "shop_name": "Мебель для Дома",
        "description": "Качественная мебель на заказ. Собственное производство. Доставка и сборка бесплатно.",
        "seller_type": "warehouse",
        "city": "Бишкек",
        "market": None,
        "category": "home",
        "is_verified": True,
        "rating": 4.6,
        "reviews_count": 67,
    },
    {
        "email": "osh_tech@test.com",
        "full_name": "Бакыт Мамытов",
        "phone": "+996705678901",
        "shop_name": "Техно Центр Ош",
        "description": "Компьютеры, комплектующие, ремонт. Лучшие цены на юге!",
        "seller_type": "shop",
        "city": "Ош",
        "market": "Жайма базар",
        "category": "electronics",
        "is_verified": True,
        "rating": 4.7,
        "reviews_count": 92,
    },
    {
        "email": "beauty_salon@test.com",
        "full_name": "Гульмира Жунусова",
        "phone": "+996556789012",
        "shop_name": "Салон Красоты Жаннат",
        "description": "Парикмахерские услуги, маникюр, педикюр, макияж. Опытные мастера!",
        "seller_type": "office",
        "city": "Бишкек",
        "market": None,
        "category": "services",
        "is_verified": True,
        "rating": 4.8,
        "reviews_count": 134,
    },
    {
        "email": "kids_world@test.com",
        "full_name": "Нуржамал Токтогулова",
        "phone": "+996707890123",
        "shop_name": "Детский Мир",
        "description": "Игрушки, детская одежда, коляски, автокресла. Все для ваших детей!",
        "seller_type": "shop",
        "city": "Бишкек",
        "market": "Орто-Сайский рынок",
        "category": "kids",
        "is_verified": False,
        "rating": 4.3,
        "reviews_count": 56,
    },
    {
        "email": "mobile_delivery@test.com",
        "full_name": "Эрмек Бекболотов",
        "phone": "+996558901234",
        "shop_name": "Быстрая Доставка",
        "description": "Доставка грузов по всему Кыргызстану. Надежно и быстро!",
        "seller_type": "mobile",
        "city": "Бишкек",
        "market": None,
        "category": "services",
        "is_verified": True,
        "rating": 4.5,
        "reviews_count": 178,
    },
    {
        "email": "sport_shop@test.com",
        "full_name": "Алмаз Исаков",
        "phone": "+996709012345",
        "shop_name": "Спорт и Здоровье",
        "description": "Спортивная одежда, обувь, инвентарь. Оригинальные бренды по доступным ценам!",
        "seller_type": "shop",
        "city": "Бишкек",
        "market": "Кудайберген",
        "category": "sports",
        "is_verified": True,
        "rating": 4.6,
        "reviews_count": 87,
    },
]


# Products data (товары)
PRODUCTS_DATA = [
    # Электроника
    {"title": "iPhone 15 Pro Max 256GB", "category": "phones", "price": 125000, "discount_price": 119000, "description": "Новый, запечатанный. Гарантия 1 год. Все цвета в наличии."},
    {"title": "Samsung Galaxy S24 Ultra", "category": "phones", "price": 95000, "discount_price": 89000, "description": "Оригинал, гарантия, чехол в подарок!"},
    {"title": "MacBook Pro 14 M3", "category": "computers", "price": 185000, "description": "Новый MacBook Pro 14 с чипом M3. 16GB RAM, 512GB SSD. Официальная гарантия Apple."},
    {"title": "Asus TUF Gaming F15", "category": "computers", "price": 65000, "discount_price": 59000, "description": "Игровой ноутбук, RTX 3050, 16GB RAM, 512GB SSD. Отличное состояние!"},
    {"title": "Samsung TV 55 4K Smart", "category": "tv-audio", "price": 42000, "description": "Телевизор Samsung 55 дюймов, 4K, Smart TV. Гарантия 2 года."},

    # Одежда
    {"title": "Женское пальто зимнее", "category": "womens-clothing", "price": 8500, "discount_price": 6500, "description": "Теплое зимнее пальто, размеры S-XL. Турецкое качество!"},
    {"title": "Платье вечернее", "category": "womens-clothing", "price": 4500, "description": "Элегантное вечернее платье. Идеально для особых случаев. Размеры в наличии."},
    {"title": "Мужской костюм классический", "category": "mens-clothing", "price": 12000, "discount_price": 9500, "description": "Классический мужской костюм. Отличное качество, приятная ткань."},
    {"title": "Кроссовки Nike Air Max", "category": "shoes", "price": 7500, "description": "Оригинальные кроссовки Nike Air Max. Размеры 40-45."},
    {"title": "Сумка женская кожаная", "category": "accessories", "price": 3500, "description": "Элегантная кожаная сумка. Несколько отделений, удобная."},

    # Дом и сад
    {"title": "Диван 3-местный", "category": "furniture", "price": 28000, "discount_price": 24000, "description": "Удобный диван-книжка. Механизм трансформации. Доставка бесплатно!"},
    {"title": "Обеденный стол со стульями", "category": "furniture", "price": 15000, "description": "Обеденный стол + 4 стула. Массив дерева. Качество гарантируем!"},
    {"title": "Набор посуды 24 предмета", "category": "kitchenware", "price": 4500, "description": "Качественный набор посуды из нержавейки. 24 предмета."},
    {"title": "Комплект постельного белья", "category": "textiles", "price": 2500, "discount_price": 1990, "description": "Сатиновое постельное белье, евро размер. Яркие цвета!"},
    {"title": "Дрель ударная Bosch", "category": "tools", "price": 8500, "description": "Профессиональная ударная дрель Bosch. Гарантия 1 год."},

    # Продукты
    {"title": "Яблоки свежие 1кг", "category": "fruits-vegetables", "price": 120, "description": "Свежие сладкие яблоки. Доставка в день заказа!"},
    {"title": "Картофель домашний 10кг", "category": "fruits-vegetables", "price": 350, "description": "Домашний картофель из Иссык-Куля. Экологически чистый!"},
    {"title": "Баранина свежая 1кг", "category": "meat-fish", "price": 450, "description": "Свежая баранина, халяль. Доставка бесплатно от 2кг."},
    {"title": "Молоко домашнее 1л", "category": "dairy", "price": 80, "description": "Натуральное домашнее молоко. Привоз каждое утро!"},
    {"title": "Рис премиум 5кг", "category": "grocery", "price": 550, "description": "Рис высшего сорта. Пакистан. Идеален для плова!"},

    # Детские товары
    {"title": "Коляска 3 в 1", "category": "kids", "price": 18000, "discount_price": 15000, "description": "Коляска-трансформер 3в1. Люлька, прогулочный блок, автокресло."},
    {"title": "Конструктор LEGO City", "category": "kids", "price": 4500, "description": "Оригинальный LEGO City. Для детей от 6 лет."},
    {"title": "Велосипед детский", "category": "kids", "price": 8500, "description": "Детский велосипед для возраста 5-8 лет. Яркие цвета!"},

    # Спорт
    {"title": "Беговая дорожка электрическая", "category": "sports", "price": 35000, "description": "Складная беговая дорожка. Макс вес 120кг. Гарантия 1 год."},
    {"title": "Гантели разборные 20кг", "category": "sports", "price": 3500, "description": "Набор разборных гантелей 2х10кг. Удобные грифы."},
]


# Services data (услуги)
SERVICES_DATA = [
    {"title": "Ремонт квартир под ключ", "category": "repair-construction", "price": 350, "description": "Качественный ремонт квартир любой сложности. Цена за м². Гарантия 2 года на все работы!"},
    {"title": "Электромонтажные работы", "category": "repair-construction", "price": 500, "description": "Замена проводки, установка розеток, светильников. Опыт 15 лет!"},
    {"title": "Сантехнические услуги", "category": "repair-construction", "price": 800, "description": "Установка сантехники, замена труб, устранение протечек. Быстро и качественно!"},
    {"title": "Стрижка женская", "category": "beauty-health-services", "price": 500, "description": "Профессиональная женская стрижка от опытного мастера. Современные техники!"},
    {"title": "Маникюр с покрытием гель-лак", "category": "beauty-health-services", "price": 400, "description": "Качественный маникюр + покрытие гель-лаком. Держится до 3 недель!"},
    {"title": "Массаж лечебный 1 сеанс", "category": "beauty-health-services", "price": 1200, "description": "Лечебный массаж спины и шеи. Снятие болей и напряжения. Сертифицированный специалист!"},
    {"title": "Репетитор по математике", "category": "education", "price": 600, "description": "Опытный репетитор по математике. Подготовка к ОРТ, НЦТ. Результат гарантирован!"},
    {"title": "Курсы английского языка", "category": "education", "price": 4500, "description": "Интенсивные курсы английского языка. Групповые занятия 3 раза в неделю. Длительность 2 месяца."},
    {"title": "Доставка по городу", "category": "delivery", "price": 200, "description": "Быстрая доставка грузов по Бишкеку. От продуктов до мебели!"},
    {"title": "Грузоперевозки межгород", "category": "delivery", "price": 15, "description": "Перевозка грузов между городами Кыргызстана. Цена за км. Опытные водители, застрахован груз!"},
]


async def get_or_create_city(db: AsyncSession, city_name: str):
    """Get city by name"""
    result = await db.execute(select(City).where(City.name == city_name))
    return result.scalar_one_or_none()


async def get_or_create_market(db: AsyncSession, market_name: str):
    """Get market by name"""
    if not market_name:
        return None
    result = await db.execute(select(Market).where(Market.name == market_name))
    return result.scalar_one_or_none()


async def get_category_by_slug(db: AsyncSession, slug: str):
    """Get category by slug"""
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def seed_sellers(db: AsyncSession):
    """Create test sellers"""
    print("👥 Creating test sellers...")

    sellers = []

    for seller_data in SELLERS_DATA:
        # Create user
        user = User(
            email=seller_data["email"],
            full_name=seller_data["full_name"],
            phone=seller_data["phone"],
            role="user",
            tariff="free" if not seller_data["is_verified"] else "pro",
        )
        db.add(user)
        await db.flush()  # Get user ID

        # Create wallet for user
        wallet = Wallet(user_id=user.id, balance=0)
        db.add(wallet)

        # Get city
        city = await get_or_create_city(db, seller_data["city"])

        # Get market if specified
        market = await get_or_create_market(db, seller_data["market"]) if seller_data["market"] else None

        # Get category
        category = await get_category_by_slug(db, seller_data["category"])

        # Create seller profile
        seller_profile = SellerProfile(
            user_id=user.id,
            shop_name=seller_data["shop_name"],
            description=seller_data["description"],
            seller_type=seller_data["seller_type"],
            city_id=city.id if city else None,
            market_id=market.id if market else None,
            category_id=category.id if category else None,
            is_verified=seller_data["is_verified"],
            rating=Decimal(str(seller_data["rating"])),
            reviews_count=seller_data["reviews_count"],
        )
        db.add(seller_profile)

        sellers.append({
            "user": user,
            "profile": seller_profile,
            "category_slug": seller_data["category"]
        })

    await db.flush()
    print(f"✅ Created {len(sellers)} test sellers")
    return sellers


async def seed_products(db: AsyncSession, sellers: list):
    """Create test products"""
    print("📦 Creating test products...")

    # Get all products categories for matching
    categories_map = {}
    for product_data in PRODUCTS_DATA:
        cat_slug = product_data["category"]
        if cat_slug not in categories_map:
            category = await get_category_by_slug(db, cat_slug)
            categories_map[cat_slug] = category

    products_count = 0

    for product_data in PRODUCTS_DATA:
        # Find appropriate seller
        category_slug = product_data["category"]

        # Try to match seller by category hierarchy
        # Electronics products -> electronics sellers
        # Clothing products -> clothing sellers
        # etc.
        parent_category_map = {
            "phones": "electronics",
            "computers": "electronics",
            "tv-audio": "electronics",
            "womens-clothing": "clothing",
            "mens-clothing": "clothing",
            "shoes": "clothing",
            "accessories": "clothing",
            "furniture": "home",
            "kitchenware": "home",
            "textiles": "home",
            "tools": "home",
            "fruits-vegetables": "food",
            "meat-fish": "food",
            "dairy": "food",
            "grocery": "food",
        }

        target_category = parent_category_map.get(category_slug, category_slug)

        # Find seller with matching category
        suitable_sellers = [s for s in sellers if s["category_slug"] == target_category]

        if not suitable_sellers:
            # Fallback to first seller
            suitable_sellers = [sellers[0]]

        seller = random.choice(suitable_sellers)
        category = categories_map.get(category_slug)

        if not category:
            continue

        # Create product
        product = Product(
            seller_id=seller["user"].id,
            title=product_data["title"],
            description=product_data["description"],
            category_id=category.id,
            price=Decimal(str(product_data["price"])),
            discount_price=Decimal(str(product_data["discount_price"])) if "discount_price" in product_data else None,
            status="active",
            is_promoted=random.choice([True, False, False]),  # 33% chance promoted
            images=[f"https://picsum.photos/800/600?random={products_count}"],
            views_count=random.randint(10, 500),
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90)),
        )
        db.add(product)
        products_count += 1

    await db.flush()
    print(f"✅ Created {products_count} test products")


async def seed_services(db: AsyncSession, sellers: list):
    """Create test services"""
    print("🛠️  Creating test services...")

    # Get service categories
    categories_map = {}
    for service_data in SERVICES_DATA:
        cat_slug = service_data["category"]
        if cat_slug not in categories_map:
            category = await get_category_by_slug(db, cat_slug)
            categories_map[cat_slug] = category

    # Get service sellers
    service_sellers = [s for s in sellers if s["category_slug"] == "services"]

    if not service_sellers:
        print("⚠️  No service sellers found, using random sellers")
        service_sellers = sellers[:3]

    services_count = 0

    for service_data in SERVICES_DATA:
        seller = random.choice(service_sellers)
        category = categories_map.get(service_data["category"])

        if not category:
            continue

        # Create service
        service = Product(
            seller_id=seller["user"].id,
            title=service_data["title"],
            description=service_data["description"],
            category_id=category.id,
            price=Decimal(str(service_data["price"])),
            status="active",
            is_promoted=random.choice([True, False, False, False]),  # 25% chance
            images=[f"https://picsum.photos/800/600?random=service_{services_count}"],
            views_count=random.randint(5, 300),
            delivery_type=None,  # Services don't have delivery
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
        )
        db.add(service)
        services_count += 1

    await db.flush()
    print(f"✅ Created {services_count} test services")


async def seed_all():
    """Run all seed functions"""
    print("\n" + "="*60)
    print("🌱 Seeding sellers, products and services...")
    print("="*60 + "\n")

    async with AsyncSessionLocal() as db:
        try:
            # Check if sellers already exist
            result = await db.execute(select(User).limit(1))
            existing_users = result.scalar_one_or_none()

            if existing_users:
                print("⚠️  Database already contains users!")
                response = input("Do you want to add more test data? (y/N): ")
                if response.lower() != 'y':
                    print("❌ Seed cancelled")
                    return

            # Seed data
            sellers = await seed_sellers(db)
            await seed_products(db, sellers)
            await seed_services(db, sellers)

            await db.commit()

            print("\n" + "="*60)
            print("🎉 Seed completed successfully!")
            print("="*60)
            print(f"\n📊 Summary:")
            print(f"  - Sellers: {len(sellers)}")
            print(f"  - Products: {len(PRODUCTS_DATA)}")
            print(f"  - Services: {len(SERVICES_DATA)}")
            print("\n✨ Test data is ready!")
            print("\n👤 Test seller logins (email):")
            for seller_data in SELLERS_DATA[:5]:
                print(f"  - {seller_data['email']} ({seller_data['shop_name']})")
            print("  - ... и другие")

        except Exception as e:
            await db.rollback()
            print(f"\n❌ Error during seed: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    asyncio.run(seed_all())
