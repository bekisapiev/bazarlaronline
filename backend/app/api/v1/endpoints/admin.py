"""
Admin Endpoints - System maintenance and cron jobs
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.services.tariff_renewal import check_and_renew_tariffs

router = APIRouter()

# Simple API key for cron authentication
CRON_API_KEY = "your-secret-cron-key-change-in-production"


@router.post("/cron/renew-tariffs")
async def cron_renew_tariffs(
    db: AsyncSession = Depends(get_db),
    x_api_key: str = Header(None)
):
    """
    Cron job endpoint: Check and renew/downgrade expired tariffs

    This should be called daily by a cron job or task scheduler

    Headers:
        X-API-Key: Secret API key for authentication
    """
    # Verify API key
    if x_api_key != CRON_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )

    try:
        stats = await check_and_renew_tariffs(db)

        return {
            "success": True,
            "message": "Tariff renewal check completed",
            "stats": stats
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing tariff renewals: {str(e)}"
        )
