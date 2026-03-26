import requests
import jwt
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from django.conf import settings

from api.db.master_module_db import get_module_by_id


def get_module_launch_options_service(module_id):
    module = get_module_by_id(module_id)

    if not module:
        raise ValueError("Module not found")

    if not module.get("is_active", False):
        raise ValueError("This module is inactive")

    backend_url = (module.get("backend_url") or "").strip()
    if not backend_url:
        raise ValueError("Backend URL is not configured for this module")

    launch_options_url = f"{backend_url.rstrip('/')}/api/portal/launch-options/"

    try:
        response = requests.get(launch_options_url, timeout=5)
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        raise ValueError(f"Unable to fetch launch options from child module: {str(exc)}")

    return {
        "module_id": module["id"],
        "module_name": module["module_name"],
        "module_key": module["module_key"],
        "role_options": payload.get("role_options", []),
    }


def _get_dashboard_path(module_key, selected_role):
    module_key = (module_key or "").strip().lower()
    selected_role = (selected_role or "").strip().upper()

    if module_key == "tms":
        return {
            "USER": "/user",
            "ADMIN": "/admin/dashboard",
            "SUPERUSER": "/superuser",
        }.get(selected_role)

    return None


def _make_portal_launch_token(master_user, module, selected_role):
    now = datetime.now(timezone.utc)
    exp = now + timedelta(
        minutes=getattr(settings, "PORTAL_LAUNCH_EXP_MINUTES", 5)
    )

    payload = {
        "master_user_id": master_user.get("id"),
        "master_email": master_user.get("email"),
        "master_name": master_user.get("name"),
        "master_role": master_user.get("role"),
        "master_session_token": master_user.get("session_token"),
        "module_id": module["id"],
        "module_key": module["module_key"],
        "selected_role": selected_role,
        "type": "portal_launch",
        "iat": now,
        "exp": exp,
    }
    secret = getattr(settings, "PORTAL_LAUNCH_SECRET", settings.JWT_SECRET)
    alg = getattr(settings, "PORTAL_LAUNCH_ALG", settings.JWT_ALG)

    return jwt.encode(payload, secret, algorithm=alg)

def create_module_launch_service(module_id, master_user, selected_role):
    module = get_module_by_id(module_id)

    if not module:
        raise ValueError("Module not found")

    if not module.get("is_active", False):
        raise ValueError("This module is inactive")

    base_url = (module.get("base_url") or "").strip()
    if not base_url:
        raise ValueError("Base URL is not configured for this module")

    dashboard_path = _get_dashboard_path(module.get("module_key"), selected_role)
    if not dashboard_path:
        raise ValueError("Invalid role-to-dashboard mapping for this module")

    token = _make_portal_launch_token(master_user, module, selected_role)

    launch_url = (
    f"{base_url.rstrip('/')}/portal/consume-launch"
    f"?token={quote(token)}&next={quote(dashboard_path)}"
)

    return {
        "module_id": module["id"],
        "module_name": module["module_name"],
        "module_key": module["module_key"],
        "selected_role": selected_role,
        "launch_url": launch_url,
    }