"""
Authentication Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.database.session import get_db
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.auth import (
    GoogleAuthRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    TelegramAuthRequest,
    TelegramVerifyRequest
)
from app.services.google_auth import google_auth_service
from app.services.telegram_bot import telegram_bot_service
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.dependencies import get_current_active_user
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    request: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user with Google OAuth token

    This endpoint:
    1. Verifies Google OAuth token
    2. Creates user if doesn't exist
    3. Creates wallet for new users
    4. Returns JWT access and refresh tokens
    """
    # Verify Google token
    user_info = await google_auth_service.verify_token(request.token)

    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == user_info['email'])
    )
    user = result.scalar_one_or_none()

    # Create new user if doesn't exist
    if not user:
        user = User(
            email=user_info['email'],
            full_name=user_info.get('name'),
            google_id=user_info['google_id']
        )
        db.add(user)
        await db.flush()  # Flush to get user.id

        # Create wallet for new user
        wallet = Wallet(user_id=user.id)
        db.add(wallet)

        await db.commit()
        await db.refresh(user)
    else:
        # Update google_id if not set
        if not user.google_id:
            user.google_id = user_info['google_id']
            await db.commit()

    # Create JWT tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token, token_type="refresh")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Check if user exists
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID"
        )

    result = await db.execute(
        select(User).where(User.id == user_uuid)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is banned"
        )

    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token
    )


@router.post("/logout")
async def logout():
    """
    Logout user

    Note: Since we're using stateless JWT tokens,
    the client should simply delete the tokens.
    This endpoint is here for completeness.
    """
    return {
        "message": "Logged out successfully"
    }


@router.post("/telegram/request-code")
async def telegram_request_code(
    request: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request verification code for Telegram authentication

    This endpoint:
    1. Generates a 6-digit verification code
    2. Sends it to user's Telegram via bot
    3. Saves code with expiration time in database
    """
    # Check if user with this telegram_id exists
    result = await db.execute(
        select(User).where(User.telegram_id == request.telegram_id)
    )
    user = result.scalar_one_or_none()

    # Also check by phone if provided
    if not user and request.phone:
        result = await db.execute(
            select(User).where(User.phone == request.phone)
        )
        user = result.scalar_one_or_none()

    # Generate verification code
    code = telegram_bot_service.generate_verification_code()

    # Set expiration time (10 minutes from now)
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    if user:
        # Update existing user with code
        user.phone_verification_code = code
        user.phone_verification_expires_at = expires_at
        if request.phone and not user.phone:
            user.phone = request.phone
        if request.telegram_id and not user.telegram_id:
            user.telegram_id = request.telegram_id
    else:
        # Create temporary user record with verification code
        user = User(
            telegram_id=request.telegram_id,
            phone=request.phone,
            phone_verification_code=code,
            phone_verification_expires_at=expires_at,
            email=f"telegram_{request.telegram_id}@temp.bazarlar.online"  # Temporary email
        )
        db.add(user)

    await db.commit()

    # Send verification code via Telegram
    sent = await telegram_bot_service.send_verification_code(request.telegram_id, code)

    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification code"
        )

    return {
        "message": "Verification code sent to Telegram",
        "expires_in_minutes": 10
    }


@router.post("/telegram/verify", response_model=TokenResponse)
async def telegram_verify(
    request: TelegramVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify Telegram code and authenticate user

    This endpoint:
    1. Verifies the code matches and hasn't expired
    2. Creates user if doesn't exist (registration)
    3. Creates wallet for new users
    4. Returns JWT access and refresh tokens
    """
    # Find user by telegram_id
    result = await db.execute(
        select(User).where(User.telegram_id == request.telegram_id)
    )
    user = result.scalar_one_or_none()

    # Also check by phone
    if not user and request.phone:
        result = await db.execute(
            select(User).where(User.phone == request.phone)
        )
        user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please request verification code first."
        )

    # Check if code matches
    if user.phone_verification_code != request.code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification code"
        )

    # Check if code has expired
    if not user.phone_verification_expires_at or user.phone_verification_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification code has expired"
        )

    # Update user information
    user.telegram_id = request.telegram_id
    user.phone = request.phone
    if request.telegram_username:
        user.telegram_username = request.telegram_username
    if request.full_name and not user.full_name:
        user.full_name = request.full_name

    # Update email if it was temporary
    if user.email.endswith("@temp.bazarlar.online"):
        user.email = f"telegram_{request.telegram_id}@bazarlar.online"

    # Clear verification code
    user.phone_verification_code = None
    user.phone_verification_expires_at = None

    # Check if user has wallet, create if not
    wallet_result = await db.execute(
        select(Wallet).where(Wallet.user_id == user.id)
    )
    wallet = wallet_result.scalar_one_or_none()

    if not wallet:
        wallet = Wallet(user_id=user.id)
        db.add(wallet)

    await db.commit()
    await db.refresh(user)

    # Create JWT tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user info
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        telegram_id=current_user.telegram_id,
        telegram_username=current_user.telegram_username,
        referral_id=current_user.referral_id,
        tariff=current_user.tariff,
        role=current_user.role,
        created_at=current_user.created_at
    )
