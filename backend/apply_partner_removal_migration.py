"""
Apply migration: Remove Partner Program
Removes partner_percent from products and partner-related fields from orders
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import async_engine

async def apply_migration():
    """Apply the partner program removal migration"""

    # Read migration SQL
    migration_file = Path(__file__).parent / "migrations" / "005_remove_partner_program.sql"

    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        return False

    with open(migration_file, 'r') as f:
        migration_sql = f.read()

    print("🔄 Applying migration: Remove Partner Program...")
    print("=" * 60)

    try:
        async with async_engine.begin() as conn:
            # Split by semicolon and execute each statement
            statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]

            for statement in statements:
                if statement:
                    print(f"Executing: {statement[:80]}...")
                    await conn.execute(statement)

        print("=" * 60)
        print("✅ Migration applied successfully!")
        print("\nChanges:")
        print("  - Removed 'partner_percent' column from products table")
        print("  - Removed 'referral_id' column from orders table")
        print("  - Removed 'referral_commission' column from orders table")
        print("  - Removed 'platform_commission' column from orders table")
        print("  - Dropped 'check_partner_percent' constraint")
        return True

    except Exception as e:
        print("=" * 60)
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(apply_migration())
    sys.exit(0 if success else 1)
