from django.db import connections
from django.db import connection,transaction
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail  
from django.utils import timezone
from datetime import timedelta  
from django.contrib.auth.hashers import make_password




def makeDict(cursor, row):
    result=[]
    return dict((cursor.description[i][0], value) for i, value in enumerate(row))

def dictfetchall(cursor):
    """
    Returns all rows from a database cursor as a list of dictionaries.
    """
    # cursor.description contains the metadata about the query, 
    # where col[0] is the column name.
    columns = [col[0] for col in cursor.description]
    
    # zip() pairs the column names with the row values, and dict() maps them.
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

class userService:
    
    def RegisterUser(self, username, email, password):
        with connections['default'].cursor() as cursor:
            cursor.execute("select * from register_user(%s, %s, %s);", [username, email, password])
             
            row= cursor.fetchone()
            if row:
                 return makeDict(cursor, row)
            return None


   
        return True
    
    
    def Get_user_by_username(self, username):
        with connections['default'].cursor() as cursor:
            cursor.execute("select * from get_user_for_login(%s);", [username])
            row= cursor.fetchone()
            if row:
                 return makeDict(cursor, row)
            return None
        
    def get_user_by_id(self, user_id):

        query = "SELECT id, username FROM users WHERE id = %s"

        with connection.cursor() as cursor:
            cursor.execute(query, [user_id])
            row = cursor.fetchone()

        if not row:
            return None

        return {
        "id": row[0],
        "username": row[1],
        
            }
    def Get_user_role(self,user_id):
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute("select r.name from user_roles ur inner join roles r on ur.role_id=r.id where user_id=%s;",[user_id])
                    role=cursor.fetchone()
                    return role
        except Exception as e:
            print(e)
            return None
    def Get_user_by_email(self, email):
            query = "SELECT * FROM users WHERE email = %s"
            try:
                with connection.cursor() as cursor:
                    cursor.execute(query, [email])
                    row = cursor.fetchone()

                if not row:
                    return None

                return {
                "id": row[0],
                "username": row[1],
            
                }
            except Exception as e:
                print(e)
                return None 
    def reset_password(self, email, password):
        hash_password = make_password(password)
        query = "UPDATE users SET password_hash = %s WHERE email = %s"
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, [hash_password, email])
            return True
        except Exception as e:
            print(e)
            return False  
     # 🔎 RAW SQL LOGIN LOGGER
    def log_login_activity(self, user_id, email, ip, user_agent, status_value, reason, session_id):
        with connection.cursor() as cursor:
            cursor.execute("""
            INSERT INTO login_activity
            (user_id, email, ip_address, user_agent, status,
             failure_reason, session_id, login_time, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), TRUE)
        """, [user_id, email, ip, user_agent, status_value, reason, session_id])


def insert_role(user_id, role_id=3):
    """
    Assign role to user and return role_id
    Default role_id = 3 (employee)
    """

    query = """
        INSERT INTO user_roles (user_id, role_id)
        VALUES (%s, %s)
        ON CONFLICT (user_id) DO NOTHING
    """
    print(user_id)
    
    with transaction.atomic():
        with connection.cursor() as cursor:

            # Insert role
            cursor.execute(query, [user_id, role_id])

            # Fetch role
            cursor.execute(
                "SELECT get_user_role_id(%s)",
                [user_id]
            )

            role = cursor.fetchone()[0]

    return role
    

    



def assign_role(user_id: int, role_id: int) -> int:

    query = "SELECT assign_role(%s, %s);"
    
    
    with connection.cursor() as cursor:
        cursor.execute(query, [user_id, role_id])
        assigned_role = cursor.fetchone()[0]

    return assigned_role    
    
        

import secrets  

def generate_reset_link(user):
    print(user['id'])
   
    try:
        uid = urlsafe_base64_encode(force_bytes(user['id']))
        token =secrets.token_urlsafe(32)
        create_reset_token(user['id'], token)   
    except Exception as e:
        print(e)
        return None 

    print(token)


    reset_url = f"http://localhost:3000/reset-password/{uid}/{token}/"
    return reset_url
    
    
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

def Send_reset_link(email, reset_url):
    try:
        subject = "Password Reset"

        # Render HTML template
        html_content = render_to_string(
            "email/reset_password.html",
            {
                "reset_url": reset_url
            }
        )

        # Optional plain text fallback
        text_content = f"Click the link to reset your password: {reset_url}"

        email_message = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )

        email_message.attach_alternative(html_content, "text/html")
        email_message.send()

        return True

    except Exception as e:
        print(e)
        return False  
    
def create_reset_token(user_id, token):
    expires_at = timezone.now() + timedelta(minutes=15)

    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO password_reset_token (user_id, token, expires_at)
            VALUES (%s, %s, %s)
        """, [user_id, token, expires_at])

    return token



def verify_reset_token(token):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT user_id, expires_at, is_used
            FROM password_reset_token
            WHERE token = %s
        """, [token])

        row = cursor.fetchone()

    if not row:
        return None

    user_id, expires_at, is_used = row
    expires_at = timezone.make_aware(expires_at)
    print(expires_at)
    print(timezone.now()    )
    print(timezone.is_aware(expires_at))

    if is_used:
        return None
    print("here")
    if expires_at<timezone.now():
        return None

    return user_id





def mark_token_used(token):
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE password_reset_token
            SET is_used = TRUE
            WHERE token = %s
        """, [token])




import hashlib

def hash_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()





import uuid
from datetime import timedelta
from django.db import connection, transaction
from django.utils import timezone


def insert_refresh_token(user_id, refresh_token):
    """
    Store refresh token in DB
    """

    token_hash = hash_token(refresh_token)
    print(token_hash)
    query = """
        INSERT INTO refresh_tokens
        (id, user_id, token_hash, expires_at)
        VALUES (%s, %s, %s, %s)
    """

    expires_at = timezone.now() + timedelta(days=7)

    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute(query, [
                str(uuid.uuid4()),
                user_id,
                token_hash,
                expires_at
            ])


def validate_refresh_token(refresh_token):
    """
    Validate refresh token and return user_id
    """

    token_hash = hash_token(refresh_token)

    query = """
        SELECT user_id
        FROM refresh_tokens
        WHERE token_hash = %s
        AND revoked = FALSE
        AND expires_at > NOW()
    """

    with connection.cursor() as cursor:
        cursor.execute(query, [token_hash])

        result = cursor.fetchone()

    if not result:
        return None

    return result[0]




def revoke_all_user_tokens(user_id):
    """
    Logout user from all devices
    """

    query = """
        UPDATE refresh_tokens
        SET revoked = TRUE,
            revoked_at = NOW()
        WHERE user_id = %s
    """

    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute(query, [user_id])
            


from django.db import connection, transaction

def get_user_frontend_permissions(user_id: int) -> dict:
    """
    Calls the SP_getuser_screen_actions stored procedure safely.
    Uses transaction.atomic to ensure database consistency and callproc 
    to abstract the raw SQL.
    """
    frontend_permissions = {}

    # Wrap the database operation in an atomic transaction
    with transaction.atomic():
        with connection.cursor() as cursor:
            # callproc automatically handles the syntax for calling procedures/functions
            # It takes the procedure name and a list of parameters
            cursor.callproc('SP_getuser_screen_actions', [user_id])
            
            # Fetch the results returned by the procedure
            rows = cursor.fetchall()

    # Iterate through the rows and build the nested dictionary
    for screen_name, route, action_name in rows:
        
        # If this is the first time we are seeing this screen, initialize it
        if screen_name not in frontend_permissions:
            frontend_permissions[screen_name] = {
                "route": route,
                "actions": []
            }
        
        # Append the action to the screen's action list
        frontend_permissions[screen_name]["actions"].append(action_name)

    return frontend_permissions


def getprojectlist():
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.callproc("sp_get_all_projects",[])
            result=dictfetchall(cursor)
        return result


def create_project_db(name, description, start_date, end_date):
    """
    Executes the PostgreSQL function and returns the new project ID.
    """
    with connection.cursor() as cursor:
        # Pass parameters as a list to prevent SQL injection
        cursor.callproc("sp_create_project",[name, description, start_date, end_date])
        # Fetch the single returned value (new_project_id)
        result = cursor.fetchone()
        
        return result[0] if result else None

def update_project_db(project_id, name, description, start_date, end_date):
    """
    Executes the SP_update_project PostgreSQL function safely.
    """
    with transaction.atomic():
        with connection.cursor() as cursor:
            # Pass the ID as the first parameter
            cursor.callproc("SP_update_project",[project_id, name, description, start_date, end_date])
            result = cursor.fetchone()
            return result[0] if result else None

def get_project_tasks(id):
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.callproc('SP_get_project_tasks',[id])
            tasks=dictfetchall(cursor)
            return tasks


def add_task_to_project_db(project_id, title, description, status, due_date):
    """
    Executes the SP_add_task_to_project function using callproc.
    """
    with transaction.atomic():
        with connection.cursor() as cursor:
            # callproc takes the function name and a list of arguments
            cursor.callproc(
                'SP_add_task_to_project',
                [project_id, title, description, status, due_date]
            )
            
            # Fetch the returned ID
            result = cursor.fetchone()
            return result[0] if result else None



def manage_role_right_db(role_id, screen_name, action_name, grant_access):
    """
    Executes the SP_manage_role_right function to update RBAC mappings.
    """
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.callproc(
                'SP_manage_role_right',
                [role_id, screen_name, action_name, grant_access]
            )

from django.db import connection

def get_role_permissions_db(role_id: int):
    """
    Fetches rights by joining the role_rights mapping table 
    to the screen_actions (rights) table.
    """
    with connection.cursor() as cursor:
        cursor.callproc('SP_get_role_permissions', [role_id])

        raw_data = dictfetchall(cursor)

    # Format it for the React matrix
    formatted_permissions = {}
    for row in raw_data:
        screen = row['screen_name']
        action = row['action_name']
        
        if screen not in formatted_permissions:
            formatted_permissions[screen] = []
        formatted_permissions[screen].append(action)
        
    return formatted_permissions



from django.db import connection
import json

def fetch_screens_metadata():
    with connection.cursor() as cursor:
        cursor.execute("SELECT get_screens_with_actions();")
        row = cursor.fetchone()
        # row[0] is already a Python list/dict thanks to JSONB support
        return row[0] if row else []


from django.db import connection

def create_screen_service(name: str, route: str) -> int:
    """
    Calls the PostgreSQL UDF to insert a new screen.
    Returns the newly created Screen ID.
    """
    with connection.cursor() as cursor:
        cursor.callproc("SP_create_screen_db", [name, route])
        new_id = cursor.fetchone()[0]
        return new_id



def toggle_screen_action_service(screen_id: int, action_id: int, link: bool) -> str:
    """
    Calls the PostgreSQL UDF to link or unlink an action from a screen.
    """
    with connection.cursor() as cursor:
        cursor.callproc("toggle_screen_action_db",[screen_id, action_id, link])
        message = cursor.fetchone()[0]
        return message



from django.db import connection

def create_action_service(name: str):
    """
    Calls the PostgreSQL UDF to insert a new global action.
    Returns the newly created Action ID.
    """
    with connection.cursor() as cursor:
        cursor.callproc("create_action_db", [name])
        new_id = cursor.fetchone()[0]
        return new_id




def Get_login_activity():
    with connection.cursor() as cursor:
        cursor.callproc("SP_get_all_login_activity",[])
        return dictfetchall(cursor)
    




