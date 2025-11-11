"""
Wallet Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.database.session import get_db
from app.models.wallet import Wallet, Transaction, WithdrawalRequest

router = APIRouter()


@router.get("/balance")
async def get_balance(
    db: AsyncSession = Depends(get_db)
):
    """
    Get wallet balance for current user
    """
    # TODO: Implement with authentication
    return {
        "message": "Get balance - not implemented yet"
    }


@router.post("/topup")
async def topup_wallet(
    amount: float,
    db: AsyncSession = Depends(get_db)
):
    """
    Top up wallet balance
    """
    # TODO: Implement wallet top-up with payment gateway
    return {
        "message": "Top up - not implemented yet"
    }


@router.post("/withdraw")
async def withdraw_funds(
    db: AsyncSession = Depends(get_db)
):
    """
    Request withdrawal of referral balance
    """
    # TODO: Implement withdrawal request
    return {
        "message": "Withdraw - not implemented yet"
    }


@router.get("/transactions")
async def get_transactions(
    limit: int = 30,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get transaction history
    """
    # TODO: Implement with authentication
    return {
        "message": "Get transactions - not implemented yet"
    }
