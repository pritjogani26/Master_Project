from django.db import connection


def get_portal_launch_roles_db():
    with connection.cursor() as cur:
        cur.execute("""
            SELECT role_code, label
            FROM portal_role_master
            WHERE is_active = TRUE
            ORDER BY id
        """)
        rows = cur.fetchall()

    return [{"role_code": row[0], "label": row[1]} for row in rows]


def is_role_active(role_code):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT EXISTS(
                SELECT 1
                FROM portal_role_master
                WHERE role_code = %s
                  AND is_active = TRUE
            )
        """, [role_code])
        row = cur.fetchone()

    return bool(row[0]) if row else False


def is_master_user_role_allowed(master_user_id, role_code):
    return True

def get_user_by_email(email):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT id, name, email, role
            FROM users
            WHERE email = %s
        """, [email])
        row = cur.fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "role": row[3],
    }


def create_portal_user(name, email, role):
    with connection.cursor() as cur:
        cur.execute("""
            INSERT INTO users (name, email, password_hash, role, password_set)
            VALUES (%s, %s, NULL, %s, FALSE)
            RETURNING id, name, email, role
        """, [name, email, role])
        row = cur.fetchone()

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "role": row[3],
    }


def update_user_role_by_email(email, role):
    with connection.cursor() as cur:
        cur.execute("""
            UPDATE users
            SET role = %s
            WHERE email = %s
            RETURNING id, name, email, role
        """, [role, email])
        row = cur.fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "role": row[3],
    }


def get_user_link_by_provider_and_external_id(provider, external_user_id):
    with connection.cursor() as cur:
        cur.execute("""
            SELECT
                ul.id,
                ul.user_id,
                ul.provider,
                ul.external_user_id,
                ul.external_email,
                ul.external_name,
                ul.external_role,
                u.name,
                u.email,
                u.role
            FROM user_links ul
            JOIN users u ON u.id = ul.user_id
            WHERE ul.provider = %s
              AND ul.external_user_id = %s
            LIMIT 1
        """, [provider, external_user_id])
        row = cur.fetchone()

    if not row:
        return None

    return {
        "link_id": row[0],
        "user_id": row[1],
        "provider": row[2],
        "external_user_id": row[3],
        "external_email": row[4],
        "external_name": row[5],
        "external_role": row[6],
        "user": {
            "id": row[1],
            "name": row[7],
            "email": row[8],
            "role": row[9],
        },
    }


def create_user_link(
    user_id,
    provider,
    external_user_id,
    external_email=None,
    external_name=None,
    external_role=None,
):
    with connection.cursor() as cur:
        cur.execute("""
            INSERT INTO user_links (
                user_id,
                provider,
                external_user_id,
                external_email,
                external_name,
                external_role,
                created_at,
                updated_at,
                last_login_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW())
            RETURNING id, user_id, provider, external_user_id
        """, [
            user_id,
            provider,
            external_user_id,
            external_email,
            external_name,
            external_role,
        ])
        row = cur.fetchone()

    return {
        "id": row[0],
        "user_id": row[1],
        "provider": row[2],
        "external_user_id": row[3],
    }


def touch_user_link_login(
    provider,
    external_user_id,
    external_email=None,
    external_name=None,
    external_role=None,
):
    with connection.cursor() as cur:
        cur.execute("""
            UPDATE user_links
            SET
                external_email = %s,
                external_name = %s,
                external_role = %s,
                updated_at = NOW(),
                last_login_at = NOW()
            WHERE provider = %s
              AND external_user_id = %s
            RETURNING id, user_id, provider, external_user_id
        """, [
            external_email,
            external_name,
            external_role,
            provider,
            external_user_id,
        ])
        row = cur.fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "user_id": row[1],
        "provider": row[2],
        "external_user_id": row[3],
    }


def update_user_role_by_id(user_id, role):
    with connection.cursor() as cur:
        cur.execute("""
            UPDATE users
            SET role = %s
            WHERE id = %s
            RETURNING id, name, email, role
        """, [role, user_id])
        row = cur.fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "role": row[3],
    }