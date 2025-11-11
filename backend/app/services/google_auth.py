"""
Google OAuth Service
"""
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from typing import Optional, Dict


class GoogleAuthService:
    """Service for Google OAuth authentication"""

    @staticmethod
    async def verify_token(token: str) -> Optional[Dict[str, str]]:
        """
        Verify Google OAuth token and return user info

        Args:
            token: Google OAuth token

        Returns:
            Dict with user info (email, name, google_id) or None if invalid
        """
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            # Verify issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return None

            # Extract user info
            return {
                'email': idinfo.get('email'),
                'name': idinfo.get('name'),
                'google_id': idinfo.get('sub'),
                'picture': idinfo.get('picture')
            }

        except ValueError:
            # Invalid token
            return None
        except Exception as e:
            # Other errors
            print(f"Error verifying Google token: {e}")
            return None


google_auth_service = GoogleAuthService()
