import jwt
from django.conf import settings

from api.db.master_session_db import logout_master_user_session_db


def logout_master_user_service(access_token: str) -> dict:
    if not access_token:
        raise ValueError("Access token is required")

    try:
        payload = jwt.decode(
            access_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG],
        )
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

    if payload.get("type") != "access":
        raise ValueError("Invalid token type")

    session_token = payload.get("session_token")
    if not session_token:
        raise ValueError("Session token missing in token")

    success = logout_master_user_session_db(session_token)

    return {
        "success": success,
        "message": "Logged out successfully" if success else "Session already inactive",
    }