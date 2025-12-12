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
    EmailRegisterRequest,
    EmailLoginRequest
)
from app.services.google_auth import google_auth_service
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    hash_password,
    verify_password
)
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
        # Handle referral code if provided
        referred_by_user_id = None
        referral_expires_at = None
        if request.ref_code:
            try:
                # ref_code is the referral_id (12-digit code), not UUID
                # Find referrer by their referral_id
                referrer_result = await db.execute(
                    select(User).where(User.referral_id == request.ref_code)
                )
                referrer = referrer_result.scalar_one_or_none()

                if referrer:
                    referred_by_user_id = referrer.id
                    # Set referral expiry to 1 year from now
                    from datetime import datetime, timedelta
                    referral_expires_at = datetime.utcnow() + timedelta(days=365)
                else:
                    print(f"Warning: Referrer with referral_id {request.ref_code} not found")
            except Exception as e:
                print(f"Error processing referral code: {e}")

        user = User(
            email=user_info['email'],
            full_name=user_info.get('name'),
            google_id=user_info['google_id'],
            referred_by=referred_by_user_id,
            referral_expires_at=referral_expires_at
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
        referral_id=current_user.referral_id,
        tariff=current_user.tariff,
        role=current_user.role,
        created_at=current_user.created_at
    )


@router.post("/register", response_model=TokenResponse)
async def register_with_email(
    request: EmailRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register new user with email and password

    This endpoint:
    1. Validates email format
    2. Checks if user already exists
    3. Hashes password
    4. Creates new user with wallet
    5. Returns JWT tokens valid for 1 year
    """
    # Check if user with this email already exists
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Validate password length
    if len(request.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )

    # Hash password
    password_hash = hash_password(request.password)

    # Check referral code if provided
    referrer_id = None
    if request.ref_code:
        referrer_result = await db.execute(
            select(User).where(User.referral_id == request.ref_code)
        )
        referrer = referrer_result.scalar_one_or_none()
        if referrer:
            referrer_id = referrer.id

    # Create new user
    user = User(
        email=request.email,
        password_hash=password_hash,
        full_name=request.full_name,
        referred_by=referrer_id,
        referral_expires_at=datetime.utcnow() + timedelta(days=365) if referrer_id else None
    )
    db.add(user)
    await db.flush()  # Flush to get user.id

    # Create wallet for new user
    wallet = Wallet(user_id=user.id)
    db.add(wallet)

    await db.commit()
    await db.refresh(user)

    # Create JWT tokens (valid for 1 year)
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/login", response_model=TokenResponse)
async def login_with_email(
    request: EmailLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password

    This endpoint:
    1. Finds user by email
    2. Verifies password
    3. Returns JWT tokens valid for 1 year
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user has password (might be OAuth-only user)
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This email is registered with Google. Please use Google login."
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if user is banned
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is banned. Reason: {user.ban_reason}"
        )

    # Create JWT tokens (valid for 1 year)
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )
