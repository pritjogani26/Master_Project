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


def assign_module_to_master_user(master_user_id, module_id):
    with connection.cursor() as cur:
        cur.execute("""
            INSERT INTO master_user_modules (
                master_user_id,
                module_id,
                is_enabled
            )
            VALUES (%s, %s, TRUE)
            ON CONFLICT (master_user_id, module_id)
            DO UPDATE SET is_enabled = TRUE
            RETURNING id, master_user_id, module_id, is_enabled, created_at
        """, [master_user_id, module_id])
        return dictfetchone(cur)


def disable_module_for_master_user(master_user_id, module_id):
    with connection.cursor() as cur:
        cur.execute("""
            UPDATE master_user_modules
            SET is_enabled = FALSE
            WHERE master_user_id = %s AND module_id = %s
            RETURNING id, master_user_id, module_id, is_enabled, created_at
        """, [master_user_id, module_id])
        return dictfetchone(cur)


def list_assigned_active_modules_for_user(master_user_id):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT
                mm.id,
                mm.module_name,
                mm.module_key,
                mm.base_url,
                mm.backend_url,
                mm.icon,
                mm.description,
                mm.sort_order,
                mm.is_active,
                mum.is_enabled,
                mm.created_at,
                mm.updated_at
            FROM master_user_modules mum
            INNER JOIN master_modules mm
                ON mm.id = mum.module_id
            WHERE mum.master_user_id = %s
              AND mum.is_enabled = TRUE
              AND mm.is_active = TRUE
            ORDER BY mm.sort_order ASC, mm.module_name ASC
        """, [master_user_id])
        return dictfetchall(cur)


def is_module_assigned_to_user(master_user_id, module_id):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT 1
            FROM master_user_modules
            WHERE master_user_id = %s
              AND module_id = %s
              AND is_enabled = TRUE
            LIMIT 1
        """, [master_user_id, module_id])
        return cur.fetchone() is not None