"""
Seed script to populate initial data
Run with: python seed.py
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import engine, AsyncSessionLocal
from app.database.base import Base
from app.models.location import City, Market
from app.models.product import Category


async def create_tables():
    """Create all database tables"""
    print("🔨 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created successfully")


async def seed_cities(db: AsyncSession):
    """Seed cities"""
    print("🏙️  Seeding cities...")

    cities_data = [
        {"name": "Бишкек", "slug": "bishkek", "region": "Чуйская область", "sort_order": 1},
        {"name": "Ош", "slug": "osh", "region": "Ошская область", "sort_order": 2},
        {"name": "Джалал-Абад", "slug": "jalal-abad", "region": "Джалал-Абадская область", "sort_order": 3},
        {"name": "Каракол", "slug": "karakol", "region": "Иссык-Кульская область", "sort_order": 4},
        {"name": "Токмок", "slug": "tokmok", "region": "Чуйская область", "sort_order": 5},
        {"name": "Кара-Балта", "slug": "kara-balta", "region": "Чуйская область", "sort_order": 6},
        {"name": "Нарын", "slug": "naryn", "region": "Нарынская область", "sort_order": 7},
        {"name": "Талас", "slug": "talas", "region": "Таласская область", "sort_order": 8},
        {"name": "Баткен", "slug": "batken", "region": "Баткенская область", "sort_order": 9},
    ]

    cities = []
    for city_data in cities_data:
        city = City(**city_data)
        db.add(city)
        cities.append(city)

    await db.flush()
    print(f"✅ Added {len(cities)} cities")
    return cities


async def seed_markets(db: AsyncSession, cities: list):
    """Seed markets"""
    print("🏪 Seeding markets...")

    # Get cities by name for easy reference
    cities_dict = {city.name: city for city in cities}

    markets_data = [
        # Бишкек
        {"city": "Бишкек", "name": "Дордой", "address": "ул. Ыбырайым Абдрахманова"},
        {"city": "Бишкек", "name": "Ош базар", "address": "ул. Бейшеналиевой"},
        {"city": "Бишкек", "name": "Аламединский рынок", "address": "проспект Чингиза Айтматова"},
        {"city": "Бишкек", "name": "Орто-Сайский рынок", "address": "ул. Орто-Сайская"},
        {"city": "Бишкек", "name": "Кудайберген", "address": "ул. Жибек-Жолу"},

        # Ош
        {"city": "Ош", "name": "Жайма базар", "address": "ул. Ленина"},
        {"city": "Ош", "name": "Кара-Суу", "address": "г. Кара-Суу"},

        # Джалал-Абад
        {"city": "Джалал-Абад", "name": "Центральный рынок", "address": "ул. Эркиндик"},

        # Каракол
        {"city": "Каракол", "name": "Каракольский рынок", "address": "ул. Гебзе"},

        # Токмок
        {"city": "Токмок", "name": "Токмокский рынок", "address": "ул. Ленина"},
    ]

    markets = []
    for market_data in markets_data:
        city_name = market_data.pop("city")
        city = cities_dict.get(city_name)
        if city:
            market = Market(city_id=city.id, **market_data)
            db.add(market)
            markets.append(market)

    await db.flush()
    print(f"✅ Added {len(markets)} markets")
    return markets


async def seed_categories(db: AsyncSession):
    """Seed categories"""
    print("📦 Seeding categories...")

    # Level 1 categories (main categories)
    categories_l1 = [
        {"name": "Электроника", "slug": "electronics", "level": 1, "icon": "devices", "sort_order": 1},
        {"name": "Одежда и обувь", "slug": "clothing", "level": 1, "icon": "checkroom", "sort_order": 2},
        {"name": "Дом и сад", "slug": "home", "level": 1, "icon": "home", "sort_order": 3},
        {"name": "Детские товары", "slug": "kids", "level": 1, "icon": "child_care", "sort_order": 4},
        {"name": "Продукты питания", "slug": "food", "level": 1, "icon": "restaurant", "sort_order": 5},
        {"name": "Спорт и отдых", "slug": "sports", "level": 1, "icon": "sports", "sort_order": 6},
        {"name": "Красота и здоровье", "slug": "beauty", "level": 1, "icon": "spa", "sort_order": 7},
        {"name": "Автотовары", "slug": "auto", "level": 1, "icon": "directions_car", "sort_order": 8},
        {"name": "Хобби и творчество", "slug": "hobby", "level": 1, "icon": "palette", "sort_order": 9},
        {"name": "Услуги", "slug": "services", "level": 1, "icon": "handyman", "sort_order": 10},
    ]

    # Create level 1 categories
    l1_cats = {}
    for cat_data in categories_l1:
        cat = Category(**cat_data)
        db.add(cat)
        await db.flush()  # Flush to get IDs
        l1_cats[cat.slug] = cat

    print(f"✅ Added {len(l1_cats)} level 1 categories")

    # Level 2 categories (subcategories)
    categories_l2 = [
        # Электроника
        {"parent": "electronics", "name": "Телефоны и аксессуары", "slug": "phones", "level": 2, "sort_order": 1},
        {"parent": "electronics", "name": "Компьютеры и ноутбуки", "slug": "computers", "level": 2, "sort_order": 2},
        {"parent": "electronics", "name": "ТВ и аудио", "slug": "tv-audio", "level": 2, "sort_order": 3},

        # Одежда и обувь
        {"parent": "clothing", "name": "Женская одежда", "slug": "womens-clothing", "level": 2, "sort_order": 1},
        {"parent": "clothing", "name": "Мужская одежда", "slug": "mens-clothing", "level": 2, "sort_order": 2},
        {"parent": "clothing", "name": "Обувь", "slug": "shoes", "level": 2, "sort_order": 3},
        {"parent": "clothing", "name": "Аксессуары", "slug": "accessories", "level": 2, "sort_order": 4},

        # Дом и сад
        {"parent": "home", "name": "Мебель", "slug": "furniture", "level": 2, "sort_order": 1},
        {"parent": "home", "name": "Посуда и кухня", "slug": "kitchenware", "level": 2, "sort_order": 2},
        {"parent": "home", "name": "Текстиль", "slug": "textiles", "level": 2, "sort_order": 3},
        {"parent": "home", "name": "Инструменты", "slug": "tools", "level": 2, "sort_order": 4},

        # Продукты питания
        {"parent": "food", "name": "Овощи и фрукты", "slug": "fruits-vegetables", "level": 2, "sort_order": 1},
        {"parent": "food", "name": "Мясо и рыба", "slug": "meat-fish", "level": 2, "sort_order": 2},
        {"parent": "food", "name": "Молочные продукты", "slug": "dairy", "level": 2, "sort_order": 3},
        {"parent": "food", "name": "Бакалея", "slug": "grocery", "level": 2, "sort_order": 4},

        # Услуги
        {"parent": "services", "name": "Ремонт и строительство", "slug": "repair-construction", "level": 2, "sort_order": 1},
        {"parent": "services", "name": "Красота и здоровье", "slug": "beauty-health-services", "level": 2, "sort_order": 2},
        {"parent": "services", "name": "Образование", "slug": "education", "level": 2, "sort_order": 3},
        {"parent": "services", "name": "Доставка и перевозки", "slug": "delivery", "level": 2, "sort_order": 4},
    ]

    l2_count = 0
    for cat_data in categories_l2:
        parent_slug = cat_data.pop("parent")
        parent_cat = l1_cats.get(parent_slug)
        if parent_cat:
            cat = Category(parent_id=parent_cat.id, **cat_data)
            db.add(cat)
            l2_count += 1

    await db.flush()
    print(f"✅ Added {l2_count} level 2 categories")

    await db.commit()


async def seed_all():
    """Run all seed functions"""
    print("\n" + "="*60)
    print("🌱 Starting database seed process...")
    print("="*60 + "\n")

    # Create tables first
    await create_tables()

    # Create session
    async with AsyncSessionLocal() as db:
        try:
            # Check if data already exists
            from sqlalchemy import select, func

            cities_count = await db.scalar(select(func.count()).select_from(City))

            if cities_count > 0:
                print("\n⚠️  Database already contains data!")
                response = input("Do you want to continue and add more data? (y/N): ")
                if response.lower() != 'y':
                    print("❌ Seed cancelled")
                    return

            # Seed data
            cities = await seed_cities(db)
            markets = await seed_markets(db, cities)
            await seed_categories(db)

            await db.commit()

            print("\n" + "="*60)
            print("🎉 Seed completed successfully!")
            print("="*60)
            print(f"\n📊 Summary:")
            print(f"  - Cities: {len(cities)}")
            print(f"  - Markets: {len(markets)}")
            print(f"  - Categories: Added (check logs above)")
            print("\n✨ Your database is ready to use!")

        except Exception as e:
            await db.rollback()
            print(f"\n❌ Error during seed: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_all())
