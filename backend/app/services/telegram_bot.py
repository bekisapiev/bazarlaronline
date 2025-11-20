"""
Telegram Bot Service
"""
import aiohttp
import secrets
import string
from typing import Optional
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

    async def verify_telegram_data(self, init_data: str) -> Optional[dict]:
        """
        Verify Telegram WebApp init data

        Args:
            init_data: Telegram WebApp initData string

        Returns:
            Parsed and verified user data or None
        """
        # TODO: Implement Telegram WebApp data verification
        # https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        pass


telegram_bot_service = TelegramBotService()
