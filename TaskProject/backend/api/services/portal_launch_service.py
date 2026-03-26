import jwt
from django.conf import settings

from api.db.portal_launch_db import (
    get_portal_launch_roles_db,
    is_role_active,
    is_master_user_role_allowed,
    get_user_by_email,
    create_portal_user,
    update_user_role_by_email,
    get_user_link_by_provider_and_external_id,
    create_user_link,
    touch_user_link_login,
    update_user_role_by_id,
)
from api.services.permission_service import (
    get_effective_permissions,
    get_allowed_pages,
)
from api.utils.jwt_tokens import make_access, make_refresh
from api.db.auth_db import get_user_by_id


SSO_PROVIDER = "MASTER_PORTAL"


def get_portal_launch_options_service():
    return {
        "role_options": get_portal_launch_roles_db()
    }


def _get_redirect_url_for_role(role):
    role = (role or "").strip().upper()

    mapping = {
        "USER": "/user",
        "ADMIN": "/admin/dashboard",
        "SUPERUSER": "/superuser",
    }

    return mapping.get(role)


def consume_portal_launch_service(token, next_path=None):
    secret = getattr(settings, "PORTAL_LAUNCH_SECRET", settings.JWT_SECRET)
    alg = getattr(settings, "PORTAL_LAUNCH_ALG", settings.JWT_ALG)
    expected_module_key = getattr(settings, "PORTAL_MODULE_KEY", "TMS")

    try:
        payload = jwt.decode(token, secret, algorithms=[alg])
    except jwt.ExpiredSignatureError:
        raise ValueError("Launch token expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid launch token")

    if payload.get("type") != "portal_launch":
        raise ValueError("Invalid launch token type")

    if payload.get("module_key") != expected_module_key:
        raise ValueError("Module mismatch")

    master_user_id = payload.get("master_user_id")
    master_email = (payload.get("master_email") or "").strip().lower()
    master_name = (payload.get("master_name") or "").strip()
    master_role = (payload.get("master_role") or "").strip()
    selected_role = (payload.get("selected_role") or "").strip().upper()
    master_session_token = payload.get("master_session_token")

    if not master_user_id or not master_email or not selected_role:
        raise ValueError("Invalid launch token payload")

    if not is_role_active(selected_role):
        raise ValueError("Requested role does not exist or is inactive")

    if not is_master_user_role_allowed(master_user_id, selected_role):
        raise ValueError("Access not allowed for this role")

    launched_user = None

    existing_link = get_user_link_by_provider_and_external_id(
        provider=SSO_PROVIDER,
        external_user_id=master_user_id,
    )

    if existing_link:
        launched_user = update_user_role_by_id(
            user_id=existing_link["user_id"],
            role=selected_role,
        )

        if not launched_user:
            raise ValueError("Linked child user not found")

        touch_user_link_login(
            provider=SSO_PROVIDER,
            external_user_id=master_user_id,
            external_email=master_email,
            external_name=master_name,
            external_role=master_role,
        )
    else:
        existing_user = get_user_by_email(master_email)

        if existing_user:
            launched_user = update_user_role_by_email(
                email=master_email,
                role=selected_role,
            )
        else:
            display_name = master_name or master_email.split("@")[0]
            launched_user = create_portal_user(
                name=display_name,
                email=master_email,
                role=selected_role,
            )

        if not launched_user:
            raise ValueError("Failed to provision child user")

        create_user_link(
            user_id=launched_user["id"],
            provider=SSO_PROVIDER,
            external_user_id=master_user_id,
            external_email=master_email,
            external_name=master_name,
            external_role=master_role,
        )

    redirect_url = next_path or _get_redirect_url_for_role(selected_role)
    if not redirect_url:
        raise ValueError("Unable to resolve dashboard route")

    access_token = make_access(launched_user["id"], launched_user["role"])
    refresh_token = make_refresh(launched_user["id"], launched_user["role"])

    permissions = get_effective_permissions(
        launched_user["id"],
        launched_user["role"],
    )
    pages = get_allowed_pages(launched_user)

    return {
        "message": "Launch validated successfully",
        "redirect_url": redirect_url,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": launched_user,
        "permissions": permissions,
        "pages": pages,
        "master_user_id": master_user_id,
        "master_session_token": master_session_token,
    }

def consume_launch_token_service(launch_token: str, next_path: str = None) -> dict:
    try:
        payload = jwt.decode(
            launch_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALG],
        )
    except jwt.ExpiredSignatureError:
        raise ValueError("Launch token expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid launch token")

    if payload.get("type") != "portal_launch":
        raise ValueError("Invalid launch token type")

    selected_role = payload.get("selected_role")
    master_user_id = payload.get("master_user_id")
    master_session_token = payload.get("master_session_token")

    if not selected_role:
        raise ValueError("Selected role missing")

    if not master_session_token:
        raise ValueError("Master session token missing")

    #  map master user → child user (your logic may differ)
    user = get_user_by_id(master_user_id)

    if not user:
        raise ValueError("User not found")

    access_token = make_access(
        user["id"],
        selected_role,
        master_session_token=master_session_token,
    )

    refresh_token = make_refresh(
        user["id"],
        selected_role,
        master_session_token=master_session_token,
    )

    redirect_url = next_path or "/user"

    return {
        "message": "Launch successful",
        "redirect_url": redirect_url,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": selected_role,
        },
        "permissions": {},
        "pages": {},
        "master_user_id": master_user_id,
        "master_session_token": master_session_token,
    }