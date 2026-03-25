from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated 
from .serializers import LoginSerializer, RegiserSerializer,ForgotPasswordSerializer,ResetPasswordSerializer,ProjectCreateSerializer,TaskCreateSerializer,RoleRightUpdateSerializer
from django.contrib.auth.hashers import make_password,check_password
from .services import userService,generate_reset_link,Send_reset_link,verify_reset_token,mark_token_used,insert_refresh_token,get_user_frontend_permissions,getprojectlist,create_project_db
from django.db import DatabaseError
from rest_framework_simplejwt.tokens import RefreshToken
from .services import insert_role,assign_role,update_project_db,get_project_tasks,add_task_to_project_db,manage_role_right_db
from .utils import get_user_role
from rest_framework_simplejwt.exceptions import TokenError
import uuid
from myproject import settings;
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .permissions import HasScreenActionPermission,IsSuperAdmin# Import the bouncer
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from django.db import DatabaseError
from .pagination import CustomPageNumberPagination
from .serializers import CreateScreenSerializer,ToggleScreenActionSerializer,CreateActionSerializer
from .services import create_screen_service,toggle_screen_action_service,create_action_service
from .services import fetch_screens_metadata;
import json
from .services import Get_login_activity
from .utils import create_login_activity_pdf,create_login_activity_excel
from django.http import FileResponse

from rest_framework.views import APIView
from django.http import HttpResponse
# Make sure to import your functions here!
# Create your view
#  here.

class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RegiserSerializer
    
    
    def post(self, request):
        # Registration logic goes here
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        username = serializer.validated_data['username']
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        hashed_password = make_password(password)
        user_service = userService()
        user = user_service.RegisterUser(username, email, hashed_password)
        if not user:
            return Response({"error": "Registration failed"}, status=status.HTTP_400_BAD_REQUEST)
        print(user["register_user"])
        role_id=insert_role(user["register_user"]);
        
        
        
        return Response({"message": "User registered successfully", "user": user}, status=status.HTTP_201_CREATED)






class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT")
        print(ip_address)
        print(user_agent)

        user_service = userService()
        user = user_service.Get_user_by_username(username)

    
        if not user:
            print("User not found")
            user_service.log_login_activity(
                user_id=None,
                email=username,
                ip=ip_address,
                user_agent=user_agent,
                status_value="FAILED",
                reason="User not found"
            )
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not check_password(password, user["hashed_password"]):
            print("Password incorrect")
            user_service.log_login_activity(
                user_id=user["user_id"],
                email=username,
                ip=ip_address,
                user_agent=user_agent,
                status_value="FAILED",
                reason="Invalid password"
            )
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        session_id = str(uuid.uuid4())
        try:
            user_service.log_login_activity(
                user_id=user["user_id"],
              
                email=username,
                ip=ip_address,
                user_agent=user_agent,
                status_value="SUCCESS",
                reason=None,
                session_id=session_id
            )
        except Exception as e:
            print(f"Logging failed: {e}")
        print(user["user_id"])
        role=user_service.Get_user_role(user["user_id"])
        refresh = RefreshToken()
        refresh["user_id"] = user["user_id"]
        role = get_user_role(user["user_id"])
        refresh["role"] = role
        refresh["session_id"] = session_id
        refresh_token = str(refresh)
        
        try:
            insert_refresh_token(user["user_id"], refresh_token)
        except Exception as e:
            print(f"Token insert failed: {e}")
        
            return Response(
                {"error": "Internal server error during token generation."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 

     
        try:
            user_permissions = get_user_frontend_permissions(user["user_id"])
        except Exception as e:
            print(f"Error fetching permissions: {e}")
            user_permissions = {} # Fallback so login doesn't crash if DB fails

        access_token = refresh.access_token

      
        response = Response(
            {
                "message": "User logged in successfully",
                "user":{
                    "user_id":user["user_id"],
                    "name":username,
                    "role":role
                    },
                "permissions": user_permissions
            },
            status=status.HTTP_200_OK
        )

      
        response.set_cookie(
            key="access_token",
            value=str(access_token),
            httponly=True,
            secure=settings.JWT_COOKIE_SECURE,
            samesite=settings.JWT_COOKIE_SAMESITE,
            path="/"
        )

      
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=settings.JWT_COOKIE_SECURE,
            samesite=settings.JWT_COOKIE_SAMESITE,
            path="/"
        )
        print("cookies",response.cookies)

        return response




class UserManagementAPIView(APIView):
    # 1. Tell DRF to use our custom bouncer
    permission_classes = [HasScreenActionPermission]
    
    # 2. Tell the bouncer which Database Screen this API belongs to
    required_screen = "User Management" 

    def get(self, request):
        # The bouncer translates GET -> 'View'. 
        # If they don't have 'View' for 'User Management', DRF blocks them before this runs.
        return Response({"message": "Here is the user list!"})

    def post(self, request):
        # The bouncer translates POST -> 'Create'.
        return Response({"message": "User created!"}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        # The bouncer translates DELETE -> 'Delete'.
        # User 41 (Manager) will get a 403 Forbidden if they hit this!
        return Response({"message": "User deleted!"})



class ProjectsView(ListCreateAPIView):
    permission_classes = [HasScreenActionPermission]
    required_screen = "Dashboard"
    pagination_class = CustomPageNumberPagination
    serializer_class = ProjectCreateSerializer

    def get_queryset(self):
        # Generic views expect a queryset, but since you use a DB function:
        return getprojectlist()

    def list(self, request, *args, **kwargs):
        """
        Overriding list to handle the custom DB function with pagination.
        """
        queryset = self.get_queryset()
        
        # Apply the custom pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(page)

        return Response({"status": True, "data": queryset})

    def create(self, request, *args, **kwargs):
        """
        Overriding create to keep your PostgreSQL function logic.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            new_project_id = create_project_db(
                serializer.validated_data.get('name'),
                serializer.validated_data.get('description'),
                serializer.validated_data.get('start_date'),
                serializer.validated_data.get('end_date')
            )
            return Response(
                {"message": "Project created successfully", "project_id": new_project_id},
                status=status.HTTP_201_CREATED
            )
        except DatabaseError as e:
            return Response(
                {"error": str(e).split("\n")[0]}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ProjectDetailView(RetrieveUpdateDestroyAPIView):
    """
    Separate view for PUT/PATCH/DELETE which requires a <pk>
    """
    permission_classes = [HasScreenActionPermission]
    required_screen = "Dashboard"
    serializer_class = ProjectCreateSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        pk = kwargs.get('pk')
        serializer = self.get_serializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            updated_id = update_project_db(
                pk,
                serializer.validated_data.get('name'),
                serializer.validated_data.get('description'),
                serializer.validated_data.get('start_date'),
                serializer.validated_data.get('end_date')
            )
            return Response({
                "message": "Project updated successfully",
                "project_id": updated_id
            }, status=status.HTTP_200_OK)

        except DatabaseError as e:
            error_message = str(e).split("\n")[0]
            status_code = status.HTTP_404_NOT_FOUND if "does not exist" in error_message else status.HTTP_400_BAD_REQUEST
            return Response({"error": error_message}, status=status_code)




class Tasksview(APIView):
    permission_classes=[HasScreenActionPermission]
    required_screen = "Dashboard" 
   
    
    def get(self,request,id):
        
        try:
            tasks=get_project_tasks(id)
            return Response({"status":True,"data":tasks})
        except Exception as e:
            print(e)
            return Response({"message":"errorfetchiung the tasks"})
    
    def post(self, request, project_id):
        # 1. Validate incoming JSON
        serializer = TaskCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 2. Extract validated data (assigned_to is gone)
        title = serializer.validated_data.get('title')
        description = serializer.validated_data.get('description')
        status_val = serializer.validated_data.get('status')
        due_date = serializer.validated_data.get('due_date')

        # 3. Call the DB utility with callproc
        try:
            new_task_id = add_task_to_project_db(
                project_id, title, description, status_val, due_date
            )

            return Response(
                {
                    "message": "Task added to project successfully",
                    "task_id": new_task_id
                },
                status=status.HTTP_201_CREATED
            )
            
        except DatabaseError as e:
            error_message = str(e).split("\n")[0]
            if "does not exist" in error_message:
                return Response({"error": error_message}, status=status.HTTP_404_NOT_FOUND)
                
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)
        
        
    
class RoleRightsManagementView(APIView):
    # CRITICAL: Lock this view down to Super Admins only!
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Validate incoming data
        serializer = RoleRightUpdateSerializer(data=request.data['payload'])
        print(request.data['payload'])
        if not serializer.is_valid():
            print("inside invalid")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        print("valid")
        role_id = serializer.validated_data['role_id']
        screen_name = serializer.validated_data['screen_name']
        action_name = serializer.validated_data['action_name']
        grant_access = serializer.validated_data['grant_access']

        # 2. Execute the Database Toggle
        try:
            manage_role_right_db(role_id, screen_name, action_name, grant_access)
            
            action_text = "granted to" if grant_access else "revoked from"
            
            return Response(
                {
                    "message": f"'{action_name}' right for '{screen_name}' successfully {action_text} Role {role_id}."
                },
                status=status.HTTP_200_OK
            )

        except DatabaseError as e:
            error_message = str(e).split("\n")[0]
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)    
            
            
            

from django.db import transaction,connection
from .services import dictfetchall
class RolesView(APIView):
    permission_classes=[IsSuperAdmin]
    
    def get(self,request):
        try:
             with transaction.atomic():
                     with connection.cursor() as cursor:
                         cursor.execute("select * from roles;")
                         roles=dictfetchall(cursor)
                         return Response(roles)
        except Exception as e:
            print(e)
            return Response("error fetching the roles")


class Rolepermissions(APIView):
    permission_classes=[IsSuperAdmin]
    
    def get(self,request,id):
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute("select * from role_rights where role_id=%s;",[id])
                    rights=dictfetchall(cursor)
                    return Response(rights)
        except Exception as e:
            print(e)
            return Response("error fetching the rights");

                    
     
from .services import get_role_permissions_db
class RolePermissionsView(APIView):
    # CRITICAL: Only Super Admins should be snooping on role configurations
    permission_classes = [IsSuperAdmin]

    def get(self, request, role_id):
        """
        Retrieves the grouped dictionary of permissions for a specific role.
        """
        try:
            permissions = get_role_permissions_db(role_id)
            return Response(permissions, status=status.HTTP_200_OK)
            
        except DatabaseError as e:
            print(f"Database error fetching role permissions: {e}")
            return Response(
                {"error": "Failed to retrieve role permissions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
      




   
class ScreenView(APIView):
    permission_classes=[IsSuperAdmin]
    
    def get(self,request):
        screens=fetch_screens_metadata()
        formatted_data = json.loads(screens) if isinstance(screens, str) else screens
        return Response(formatted_data)
        


class AllActionsView(APIView):
    permission_classes=[IsSuperAdmin]
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name FROM actions ORDER BY name ASC;")
            rows = cursor.fetchall()
            data = [{"id": r[0], "name": r[1]} for r in rows]
        return Response(data)

class CreateScreenView(APIView):
    
    permission_classes=[IsSuperAdmin]
    def post(self, request):
        serializer = CreateScreenSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        name = serializer.validated_data['name']
        route = serializer.validated_data['route']

        try:
            new_id = create_screen_service(name, route)
            
            return Response(
                {"message": "Screen created successfully", "id": new_id}, 
                status=status.HTTP_201_CREATED
            )
            
        except DatabaseError as e:
            error_message = str(e).split("\n")[0]
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)





class ManageScreenActionsView(APIView):
   
    permission_classes=[IsSuperAdmin]
    def post(self, request, screen_id):
        
        serializer = ToggleScreenActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
        action_id = serializer.validated_data['action_id']
        link = serializer.validated_data['link']

        
        try:
            
            message = toggle_screen_action_service(screen_id, action_id, link)
            
            return Response({"message": message}, status=status.HTTP_200_OK)
            
        except DatabaseError as e:
            error_message = str(e).split("\n")[0]
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)







class CreateActionView(APIView):
    permission_classes=[IsSuperAdmin]
    def post(self, request):
        serializer = CreateActionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        name = serializer.validated_data['name']

        try:
            new_id = create_action_service(name)
            
            return Response(
                {"message": "Action created successfully", "id": new_id}, 
                status=status.HTTP_201_CREATED
            )
            
        except DatabaseError as e:
            error_message = str(e).split("\n")[0]
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)



class Getloginactivity(ListCreateAPIView):
    permission_classes=[IsAuthenticated]
    pagination_class=CustomPageNumberPagination
    def get_queryset(self):
        
        return Get_login_activity()
    
    def list(self,request):
        queryset = self.get_queryset()
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(page)

        return Response({"status": True, "data": queryset})


class get_login_report(APIView):
    permission_classes = [IsAuthenticated]
    
    
    def get(self, request):
        data = Get_login_activity()
        file_buffer = create_login_activity_pdf(data)
        response = HttpResponse(file_buffer.getvalue(), content_type='application/pdf')
        return response
        







class get_login_report_excel(APIView):
    permission_classes = []
    
    def get(self, request):
        # 1. Fetch the data
        data = Get_login_activity()
        
        # 2. Create the Excel file in memory
        file_buffer = create_login_activity_excel(data)
        
        # 3. Return it using the specific MIME type for modern .xlsx files
        response = HttpResponse(
            file_buffer.getvalue(), 
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
        # 4. Force the browser to download it and give it a name
        response['Content-Disposition'] = 'attachment; filename="login_activity.xlsx"'
        
        return response