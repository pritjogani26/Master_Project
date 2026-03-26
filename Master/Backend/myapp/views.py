import token

from django.shortcuts import render
from rest_framework.views import APIView
from django.db import connection
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status   
from .authentication import CookieJWTAuthentication
from .serializers import CreateModuleSerializer, LoginSerializer
from .services import moduleService, userService
from .services import  get_user_frontend_permissions, insert_refresh_token
from django.contrib.auth.hashers import check_password
import uuid
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .utils import get_user_role
from .pagination import CustomPagination



    
    

class Projects(APIView):
    permission_classes = []  # Allow unrestricted access to this view
    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM projects")
            projects = cursor.fetchall()   
            return Response(projects)


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
                    "role":role,
                    "token": str(refresh_token),
                    
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








# module views


def getallmodules(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM modules")
        modules=dictfetchall(cursor)
        return modules
    
from .services import dictfetchall
from rest_framework import generics
class ModuleView(generics.ListCreateAPIView):
    serializer_class = CreateModuleSerializer
    permission_classes=[]
    pagination_class = CustomPagination
    def get_queryset(self):
        return getallmodules(self.request)
    
    def list(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(page)

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
        
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        moduleservice = moduleService()

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        module=moduleservice.insert_module_db(serializer.validated_data)
        return Response({ "message": "Module created successfully", "module": module }, status=status.HTTP_201_CREATED)




