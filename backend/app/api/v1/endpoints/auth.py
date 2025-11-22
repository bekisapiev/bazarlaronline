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
    TelegramVerifyRequest,
    TelegramLoginWidgetRequest,
    TelegramWebAppRequest,
    EmailRegisterRequest,
    EmailLoginRequest
)
from app.services.google_auth import google_auth_service
from app.services.telegram_bot import telegram_bot_service
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


@router.post("/telegram/widget", response_model=TokenResponse)
async def telegram_widget_auth(
    request: TelegramLoginWidgetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user with Telegram Login Widget

    This endpoint:
    1. Verifies data signature from Telegram Login Widget
    2. Creates user if doesn't exist (registration)
    3. Creates wallet for new users
    4. Returns JWT access and refresh tokens

    Telegram Login Widget: https://core.telegram.org/widgets/login
    """
    # Convert request to dict for verification
    auth_data = request.model_dump()

    # Verify data signature
    if not telegram_bot_service.verify_telegram_login_widget(auth_data):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram authentication data"
        )

    telegram_id = auth_data['id']

    # Check if user exists by telegram_id
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()

    # Create full name from first_name and last_name
    full_name = auth_data['first_name']
    if auth_data.get('last_name'):
        full_name += f" {auth_data['last_name']}"

    if not user:
        # Create new user
        user = User(
            telegram_id=telegram_id,
            telegram_username=auth_data.get('username'),
            full_name=full_name,
            email=f"telegram_{telegram_id}@bazarlar.online"  # Generate email from telegram_id
        )
        db.add(user)
        await db.flush()

        # Create wallet for new user
        wallet = Wallet(user_id=user.id)
        db.add(wallet)

        await db.commit()
        await db.refresh(user)
    else:
        # Update existing user info
        user.telegram_username = auth_data.get('username') or user.telegram_username
        if not user.full_name:
            user.full_name = full_name
        await db.commit()

    # Create JWT tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/telegram/webapp", response_model=TokenResponse)
async def telegram_webapp_auth(
    request: TelegramWebAppRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user with Telegram WebApp

    This endpoint:
    1. Verifies initData from Telegram WebApp
    2. Creates user if doesn't exist (registration)
    3. Creates wallet for new users
    4. Returns JWT access and refresh tokens

    Telegram WebApp: https://core.telegram.org/bots/webapps
    """
    # Verify and parse WebApp init data
    user_data = telegram_bot_service.verify_telegram_webapp_data(request.init_data)

    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram WebApp data"
        )

    telegram_id = user_data['telegram_id']

    # Check if user exists by telegram_id
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()

    # Create full name
    full_name = user_data['first_name']
    if user_data.get('last_name'):
        full_name += f" {user_data['last_name']}"

    if not user:
        # Create new user
        user = User(
            telegram_id=telegram_id,
            telegram_username=user_data.get('username'),
            full_name=full_name,
            email=f"telegram_{telegram_id}@bazarlar.online"
        )
        db.add(user)
        await db.flush()

        # Create wallet for new user
        wallet = Wallet(user_id=user.id)
        db.add(wallet)

        await db.commit()
        await db.refresh(user)
    else:
        # Update existing user info
        user.telegram_username = user_data.get('username') or user.telegram_username
        if not user.full_name:
            user.full_name = full_name
        await db.commit()

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

    # Create new user
    user = User(
        email=request.email,
        password_hash=password_hash,
        full_name=request.full_name
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
            detail="This email is registered with Google or Telegram. Please use that login method."
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
