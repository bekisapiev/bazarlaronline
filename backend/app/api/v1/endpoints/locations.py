"""
Location Endpoints (Cities and Markets)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.database.session import get_db
from app.models.location import City, Market

router = APIRouter()


@router.get("/cities")
async def get_cities(
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all cities

    Returns cities ordered by sort_order
    """
    result = await db.execute(
        select(City).order_by(City.sort_order, City.name)
    )
    cities = result.scalars().all()

    return {
        "items": [
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "region": c.region
            }
            for c in cities
        ],
        "total": len(cities)
    }


@router.get("/cities/{city_id}")
async def get_city_details(
    city_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get city details including markets count

    Returns city information and number of markets
    """
    result = await db.execute(
        select(City).where(City.id == city_id)
    )
    city = result.scalar_one_or_none()

    if not city:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="City not found"
        )

    # Count markets in this city
    markets_count_result = await db.execute(
        select(func.count()).select_from(Market).where(Market.city_id == city_id)
    )
    markets_count = markets_count_result.scalar()

    return {
        "id": city.id,
        "name": city.name,
        "slug": city.slug,
        "region": city.region,
        "markets_count": markets_count or 0
    }


@router.get("/cities/{city_id}/markets")
async def get_city_markets(
    city_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get markets in a specific city

    Returns list of markets with their details
    """
    # Verify city exists
    city_result = await db.execute(
        select(City).where(City.id == city_id)
    )
    city = city_result.scalar_one_or_none()

    if not city:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="City not found"
        )

    # Get markets
    result = await db.execute(
        select(Market).where(Market.city_id == city_id).order_by(Market.name)
    )
    markets = result.scalars().all()

    return {
        "city_id": city_id,
        "city_name": city.name,
        "items": [
            {
                "id": m.id,
                "name": m.name,
                "address": m.address,
                "latitude": float(m.latitude) if m.latitude else None,
                "longitude": float(m.longitude) if m.longitude else None
            }
            for m in markets
        ],
        "total": len(markets)
    }


@router.get("/markets")
async def get_all_markets(
    city_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all markets

    Optionally filter by city_id
    """
    query = select(Market)

    if city_id:
        query = query.where(Market.city_id == city_id)

    query = query.order_by(Market.name)

    result = await db.execute(query)
    markets = result.scalars().all()

    return {
        "items": [
            {
                "id": m.id,
                "city_id": m.city_id,
                "name": m.name,
                "address": m.address,
                "latitude": float(m.latitude) if m.latitude else None,
                "longitude": float(m.longitude) if m.longitude else None
            }
            for m in markets
        ],
        "total": len(markets)
    }


@router.get("/markets/{market_id}")
async def get_market_details(
    market_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get market details

    Returns market information with city details
    """
    result = await db.execute(
        select(Market).where(Market.id == market_id)
    )
    market = result.scalar_one_or_none()

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Market not found"
        )

    # Get city info
    city_result = await db.execute(
        select(City).where(City.id == market.city_id)
    )
    city = city_result.scalar_one_or_none()

    # Count sellers in this market
    from app.models.user import SellerProfile
    sellers_count_result = await db.execute(
        select(func.count()).select_from(SellerProfile).where(SellerProfile.market_id == market_id)
    )
    sellers_count = sellers_count_result.scalar()

    return {
        "id": market.id,
        "city_id": market.city_id,
        "city_name": city.name if city else None,
        "name": market.name,
        "address": market.address,
        "latitude": float(market.latitude) if market.latitude else None,
        "longitude": float(market.longitude) if market.longitude else None,
        "sellers_count": sellers_count or 0
    }
