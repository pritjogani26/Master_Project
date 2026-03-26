from api.db.master_module_db import (
    create_master_module,
    deactivate_master_module,
    get_module_by_id,
    get_module_by_key,
    list_all_master_modules,
    update_master_module,
)
from api.db.master_user_module_db import (
    assign_module_to_master_user,
    list_assigned_active_modules_for_user,
)


def _normalize_module_key(module_key):
    return module_key.strip().upper()


def list_logged_in_user_modules_service(master_user_id):
    return list_assigned_active_modules_for_user(master_user_id)


def register_master_module_service(data):
    module_key = _normalize_module_key(data["module_key"])

    existing = get_module_by_key(module_key)
    if existing:
        raise ValueError("Module key already exists")

    payload = {
        "module_name": data["module_name"].strip(),
        "module_key": module_key,
        "base_url": data["base_url"].strip(),
        "backend_url": data.get("backend_url"),
        "icon": data.get("icon"),
        "description": data.get("description"),
        "sort_order": data.get("sort_order", 0),
    }

    if payload["backend_url"]:
        payload["backend_url"] = payload["backend_url"].strip()

    if payload["icon"]:
        payload["icon"] = payload["icon"].strip()

    if payload["description"]:
        payload["description"] = payload["description"].strip()

    return create_master_module(payload)


def update_master_module_service(module_id, data):
    existing = get_module_by_id(module_id)
    if not existing:
        raise ValueError("Module not found")

    module_key = _normalize_module_key(data["module_key"])
    duplicate = get_module_by_key(module_key)
    if duplicate and duplicate["id"] != module_id:
        raise ValueError("Module key already exists")

    payload = {
        "module_name": data["module_name"].strip(),
        "module_key": module_key,
        "base_url": data["base_url"].strip(),
        "backend_url": data.get("backend_url"),
        "icon": data.get("icon"),
        "description": data.get("description"),
        "sort_order": data.get("sort_order", 0),
        "is_active": data.get("is_active", True),
    }

    if payload["backend_url"]:
        payload["backend_url"] = payload["backend_url"].strip()

    if payload["icon"]:
        payload["icon"] = payload["icon"].strip()

    if payload["description"]:
        payload["description"] = payload["description"].strip()

    updated = update_master_module(module_id, payload)
    if not updated:
        raise ValueError("Unable to update module")

    return updated


def deactivate_master_module_service(module_id):
    existing = get_module_by_id(module_id)
    if not existing:
        raise ValueError("Module not found")

    updated = deactivate_master_module(module_id)
    if not updated:
        raise ValueError("Unable to deactivate module")

    return updated


def assign_module_to_user_service(master_user_id, module_id):
    module = get_module_by_id(module_id)
    if not module:
        raise ValueError("Module not found")

    if not module["is_active"]:
        raise ValueError("Cannot assign an inactive module")

    return assign_module_to_master_user(master_user_id, module_id)


def list_all_master_modules_service(include_inactive=False):
    return list_all_master_modules(include_inactive=include_inactive)