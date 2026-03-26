from django.contrib.auth.hashers import check_password

from api.db.master_auth_db import get_master_user_by_email
from api.db.master_session_db import create_master_user_session_db
from api.utils.master_jwt import generate_master_token, generate_master_session_token


def login_master_user_service(email, password):
    user = get_master_user_by_email(email)

    if not user:
        raise ValueError("Invalid email or password")

    if not user["is_active"]:
        raise ValueError("Your account is inactive")

    if not check_password(password, user["password_hash"]):
        raise ValueError("Invalid email or password")

    session_token = generate_master_session_token()

    session_row = create_master_user_session_db(user["id"], session_token)
    if not session_row:
        raise ValueError("Failed to create master session")

    access = generate_master_token(user, session_token, "access")
    refresh = generate_master_token(user, session_token, "refresh")

    return {
        "access": access,
        "refresh": refresh,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
        "session_token": session_token,
    }