"""
Telegram Bot Service
"""
import aiohttp
import secrets
import string
import hashlib
import hmac
from typing import Optional, Dict
from urllib.parse import parse_qsl
from app.core.config import settings


class TelegramBotService:
    """Service for Telegram Bot interactions"""

    def __init__(self):
        self.bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}"

    def generate_verification_code(self, length: int = 6) -> str:
        """
        Generate random verification code

        Args:
            length: Length of code (default 6)

        Returns:
            Random code string
        """
        return ''.join(secrets.choice(string.digits) for _ in range(length))

    async def send_verification_code(self, telegram_id: str, code: str) -> bool:
        """
        Send verification code to user via Telegram

        Args:
            telegram_id: Telegram user ID
            code: Verification code

        Returns:
            True if sent successfully, False otherwise
        """
        if not self.bot_token:
            print("⚠️ Telegram bot token not configured")
            return False

        message = f"""
🔐 *Код верификации Bazarlar Online*

Ваш код для входа: `{code}`

Код действителен в течение 10 минут.

_Если вы не запрашивали этот код, проигнорируйте это сообщение._
        """.strip()

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/sendMessage",
                    json={
                        "chat_id": telegram_id,
                        "text": message,
                        "parse_mode": "Markdown"
                    }
                ) as response:
                    if response.status == 200:
                        return True
                    else:
                        error_data = await response.json()
                        print(f"❌ Failed to send Telegram message: {error_data}")
                        return False
        except Exception as e:
            print(f"❌ Error sending Telegram message: {e}")
            return False

    async def get_user_info(self, telegram_id: str) -> Optional[dict]:
        """
        Get Telegram user info by ID

        Args:
            telegram_id: Telegram user ID

        Returns:
            User info dict or None
        """
        if not self.bot_token:
            return None

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/getChat",
                    json={"chat_id": telegram_id}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get('ok'):
                            user_data = data.get('result', {})
                            return {
                                'telegram_id': str(user_data.get('id')),
                                'username': user_data.get('username'),
                                'first_name': user_data.get('first_name'),
                                'last_name': user_data.get('last_name')
                            }
                    return None
        except Exception as e:
            print(f"❌ Error getting Telegram user info: {e}")
            return None

    def verify_telegram_login_widget(self, auth_data: Dict[str, str]) -> bool:
        """
        Verify data from Telegram Login Widget

        Telegram Login Widget sends data that must be verified using bot token.
        Algorithm: https://core.telegram.org/widgets/login#checking-authorization

        Args:
            auth_data: Dictionary with auth data (id, first_name, username, photo_url, auth_date, hash)

        Returns:
            True if data is valid, False otherwise
        """
        if not self.bot_token or 'hash' not in auth_data:
            return False

        # Extract hash from data
        received_hash = auth_data.pop('hash')

        # Create data check string
        data_check_arr = []
        for key in sorted(auth_data.keys()):
            if auth_data[key]:  # Skip None values
                data_check_arr.append(f"{key}={auth_data[key]}")
        data_check_string = '\n'.join(data_check_arr)

        # Create secret key from bot token
        secret_key = hashlib.sha256(self.bot_token.encode()).digest()

        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()

        # Put hash back for future use
        auth_data['hash'] = received_hash

        return calculated_hash == received_hash

    def verify_telegram_webapp_data(self, init_data: str) -> Optional[Dict]:
        """
        Verify Telegram WebApp init data

        Telegram WebApp sends initData that must be verified using bot token.
        Algorithm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

        Args:
            init_data: Telegram WebApp initData string (URL-encoded parameters)

        Returns:
            Parsed and verified user data dict or None if invalid
        """
        if not self.bot_token:
            return None

        try:
            # Parse init_data
            parsed_data = dict(parse_qsl(init_data))

            if 'hash' not in parsed_data:
                return None

            received_hash = parsed_data.pop('hash')

            # Create data check string
            data_check_arr = []
            for key in sorted(parsed_data.keys()):
                if parsed_data[key]:
                    data_check_arr.append(f"{key}={parsed_data[key]}")
            data_check_string = '\n'.join(data_check_arr)

            # Create secret key
            secret_key = hmac.new(
                b"WebAppData",
                self.bot_token.encode(),
                hashlib.sha256
            ).digest()

            # Calculate hash
            calculated_hash = hmac.new(
                secret_key,
                data_check_string.encode(),
                hashlib.sha256
            ).hexdigest()

            if calculated_hash != received_hash:
                return None

            # Parse user data from 'user' field
            import json
            if 'user' in parsed_data:
                user_data = json.loads(parsed_data['user'])
                return {
                    'telegram_id': str(user_data.get('id')),
                    'username': user_data.get('username'),
                    'first_name': user_data.get('first_name'),
                    'last_name': user_data.get('last_name'),
                    'language_code': user_data.get('language_code'),
                    'auth_date': parsed_data.get('auth_date')
                }
            return None
        except Exception as e:
            print(f"❌ Error verifying Telegram WebApp data: {e}")
            return None

    async def send_message(self, telegram_id: str, message: str, parse_mode: str = "Markdown") -> bool:
        """
        Send message to Telegram user

        Args:
            telegram_id: Telegram user ID
            message: Message text
            parse_mode: Parse mode (Markdown or HTML)

        Returns:
            True if sent successfully, False otherwise
        """
        if not self.bot_token:
            return False

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/sendMessage",
                    json={
                        "chat_id": telegram_id,
                        "text": message,
                        "parse_mode": parse_mode
                    }
                ) as response:
                    return response.status == 200
        except Exception as e:
            print(f"❌ Error sending message: {e}")
            return False

    async def set_webhook(self, webhook_url: str) -> bool:
        """
        Set webhook for Telegram bot

        Args:
            webhook_url: Full webhook URL (must be HTTPS)

        Returns:
            True if successful, False otherwise
        """
        if not self.bot_token:
            return False

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/setWebhook",
                    json={"url": webhook_url}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('ok', False)
                    return False
        except Exception as e:
            print(f"❌ Error setting webhook: {e}")
            return False

    async def delete_webhook(self) -> bool:
        """
        Delete webhook for Telegram bot

        Returns:
            True if successful, False otherwise
        """
        if not self.bot_token:
            return False

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/deleteWebhook"
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('ok', False)
                    return False
        except Exception as e:
            print(f"❌ Error deleting webhook: {e}")
            return False


telegram_bot_service = TelegramBotService()
