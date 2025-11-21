"""
Telegram Bot Webhook Endpoint
"""
from fastapi import APIRouter, Request, HTTPException, status
from typing import Dict, Any
from app.services.telegram_bot import telegram_bot_service

router = APIRouter()


@router.post("/webhook")
async def telegram_webhook(request: Request):
    """
    Handle incoming updates from Telegram bot

    This endpoint processes:
    - /start command - welcome message
    - /help command - help information
    - /login command - send login link
    - Text messages - general response

    Telegram sends POST requests to this webhook URL when users interact with the bot.
    Set webhook URL: POST https://api.telegram.org/bot<TOKEN>/setWebhook
    """
    try:
        # Parse update from Telegram
        update: Dict[str, Any] = await request.json()

        # Extract message data
        message = update.get('message')
        if not message:
            return {"ok": True}

        chat_id = message.get('chat', {}).get('id')
        text = message.get('text', '').strip()
        user = message.get('from', {})

        if not chat_id:
            return {"ok": True}

        # Process commands
        if text == '/start':
            await handle_start_command(chat_id, user)
        elif text == '/help':
            await handle_help_command(chat_id)
        elif text == '/login':
            await handle_login_command(chat_id, user)
        else:
            # Handle regular text messages
            await handle_text_message(chat_id, text)

        return {"ok": True}

    except Exception as e:
        print(f"❌ Error processing webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process webhook"
        )


async def handle_start_command(chat_id: str, user: Dict):
    """Handle /start command"""
    first_name = user.get('first_name', 'друг')
    username = user.get('username', '')

    message = f"""
👋 Привет, {first_name}!

Добро пожаловать в *Bazarlar Online* - торговую площадку Кыргызстана!

🛍 *Что я умею:*
• Помогать с входом в систему
• Отправлять коды верификации
• Уведомлять о заказах и событиях

📱 *Для входа на сайт:*
Используйте кнопку "Login with Telegram" на сайте bazarlar.online

💬 *Команды:*
/help - показать справку
/login - получить ссылку для входа

_Telegram ID: {user.get('id')}_
    """.strip()

    await telegram_bot_service.send_message(str(chat_id), message)


async def handle_help_command(chat_id: str):
    """Handle /help command"""
    message = """
📖 *Справка Bazarlar Online*

*Доступные команды:*
/start - приветственное сообщение
/help - эта справка
/login - получить ссылку для входа

*Как войти на сайт:*
1. Перейдите на bazarlar.online
2. Нажмите "Login with Telegram"
3. Вы автоматически войдете в систему

*Коды верификации:*
Когда вы запрашиваете вход через телефон, я отправлю вам код для входа.

*Нужна помощь?*
Напишите нам: support@bazarlar.online
    """.strip()

    await telegram_bot_service.send_message(str(chat_id), message)


async def handle_login_command(chat_id: str, user: Dict):
    """Handle /login command"""
    telegram_id = user.get('id')

    message = f"""
🔐 *Вход в Bazarlar Online*

Ваш Telegram ID: `{telegram_id}`

*Способы входа:*

1️⃣ *Через сайт (рекомендуется):*
   • Перейдите на bazarlar.online
   • Нажмите кнопку "Login with Telegram"
   • Авторизуйтесь автоматически

2️⃣ *Через код верификации:*
   • Запросите код через сайт
   • Я отправлю вам 6-значный код
   • Введите код на сайте

_Никогда не делитесь своим кодом верификации с другими людьми!_
    """.strip()

    await telegram_bot_service.send_message(str(chat_id), message)


async def handle_text_message(chat_id: str, text: str):
    """Handle regular text messages"""
    message = """
Спасибо за сообщение!

Я бот Bazarlar Online. Используйте команды:
/start - начать работу
/help - получить справку
/login - войти на сайт

Для других вопросов обратитесь в поддержку: support@bazarlar.online
    """.strip()

    await telegram_bot_service.send_message(str(chat_id), message)


@router.post("/set-webhook")
async def set_telegram_webhook(webhook_url: str):
    """
    Set webhook URL for Telegram bot

    Args:
        webhook_url: Full HTTPS URL where Telegram will send updates

    Example:
        POST /api/v1/telegram/set-webhook?webhook_url=https://bazarlar.online/api/v1/telegram/webhook
    """
    success = await telegram_bot_service.set_webhook(webhook_url)

    if success:
        return {
            "ok": True,
            "message": f"Webhook set to {webhook_url}"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set webhook"
        )


@router.post("/delete-webhook")
async def delete_telegram_webhook():
    """
    Delete webhook for Telegram bot

    Use this to switch from webhook mode to polling mode.
    """
    success = await telegram_bot_service.delete_webhook()

    if success:
        return {
            "ok": True,
            "message": "Webhook deleted"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete webhook"
        )
