"""
Migration script to create SellerProfile for existing Pro/Business users
who don't have a seller profile yet.
"""
import asyncio
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import engine
from app.models.user import User, SellerProfile


async def apply_migration():
    """Create seller profiles for Pro/Business users without profiles"""

    async with engine.begin() as conn:
        # Get all Pro/Business users with their avatar and banner
        result = await conn.execute(
            text("""
                SELECT id, full_name, phone, avatar, banner
                FROM users
                WHERE tariff IN ('pro', 'business')
                AND id NOT IN (SELECT user_id FROM seller_profiles)
            """)
        )

        users_without_profiles = result.fetchall()

        if not users_without_profiles:
            print("✓ All Pro/Business users already have seller profiles")
            return

        print(f"Found {len(users_without_profiles)} Pro/Business users without seller profiles")

        # Create seller profiles
        for user in users_without_profiles:
            user_id, full_name, phone, avatar, banner = user

            # Generate default shop name
            shop_name = full_name if full_name else f"Магазин {phone}"

            await conn.execute(
                text("""
                    INSERT INTO seller_profiles
                    (user_id, shop_name, description, logo_url, banner_url, seller_type, rating, reviews_count, is_verified, created_at, updated_at)
                    VALUES
                    (:user_id, :shop_name, '', :logo_url, :banner_url, 'shop', 0, 0, false, NOW(), NOW())
                """),
                {
                    "user_id": str(user_id),
                    "shop_name": shop_name,
                    "logo_url": avatar,
                    "banner_url": banner
                }
            )

            print(f"✓ Created seller profile for user {user_id}: {shop_name}")

        print(f"\n✓ Successfully created {len(users_without_profiles)} seller profiles")


async def main():
    print("Starting migration: Create seller profiles for Pro/Business users")
    print("=" * 60)

    try:
        await apply_migration()
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
