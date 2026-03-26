from django.db import connection


def dictfetchone(cursor):
    row = cursor.fetchone()
    if not row:
        return None
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))


def dictfetchall(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def get_module_by_id(module_id):
    with connection.cursor() as cur:
        cur.execute("SELECT * FROM fn_get_master_module_by_id(%s)", [module_id])
        return dictfetchone(cur)


def get_module_by_key(module_key):
    with connection.cursor() as cur:
        cur.execute("SELECT * FROM fn_get_master_module_by_key(%s)", [module_key])
        return dictfetchone(cur)


def create_master_module(data):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT * FROM fn_create_master_module(%s, %s, %s, %s, %s, %s, %s)
        """, [
            data["module_name"],
            data["module_key"],
            data["base_url"],
            data.get("backend_url"),
            data.get("icon"),
            data.get("description"),
            data.get("sort_order", 0),
        ])
        return dictfetchone(cur)


def update_master_module(module_id, data):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT * FROM fn_update_master_module(%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, [
            module_id,
            data["module_name"],
            data["module_key"],
            data["base_url"],
            data.get("backend_url"),
            data.get("icon"),
            data.get("description"),
            data.get("sort_order", 0),
            data.get("is_active", True),
        ])
        return dictfetchone(cur)


def deactivate_master_module(module_id):
    with connection.cursor() as cur:
        cur.execute("SELECT * FROM fn_deactivate_master_module(%s)", [module_id])
        return dictfetchone(cur)


def list_all_master_modules(include_inactive=False):
    with connection.cursor() as cur:
        cur.execute("SELECT * FROM fn_list_master_modules(%s)", [include_inactive])
        return dictfetchall(cur)