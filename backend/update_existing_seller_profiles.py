"""
Script to update existing seller profiles with avatar and banner from User table
"""
import asyncio
from sqlalchemy import text

from app.database.session import engine


async def update_existing_profiles():
    """Copy avatar/banner from User to existing SellerProfiles that don't have them"""

    async with engine.begin() as conn:
        # Update existing seller profiles that have empty logo_url/banner_url
        result = await conn.execute(
            text("""
                UPDATE seller_profiles sp
                SET
                    logo_url = COALESCE(sp.logo_url, u.avatar),
                    banner_url = COALESCE(sp.banner_url, u.banner)
                FROM users u
                WHERE sp.user_id = u.id
                AND (sp.logo_url IS NULL OR sp.banner_url IS NULL)
                AND (u.avatar IS NOT NULL OR u.banner IS NOT NULL)
                RETURNING sp.user_id, u.full_name
            """)
        )

        updated_profiles = result.fetchall()

        if not updated_profiles:
            print("✓ No seller profiles need updating")
            return

        print(f"✓ Updated {len(updated_profiles)} seller profiles with avatar/banner from User")
        for user_id, full_name in updated_profiles:
            print(f"  - {full_name or user_id}")


async def main():
    print("Updating existing seller profiles with avatar/banner")
    print("=" * 60)

    try:
        await update_existing_profiles()
        print("\n" + "=" * 60)
        print("Update completed successfully!")
    except Exception as e:
        print(f"\n❌ Update failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
