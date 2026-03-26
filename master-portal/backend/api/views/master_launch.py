from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers.master_launch_serializer import (
    ModuleLaunchOptionsResponseSerializer,
    LaunchModuleRequestSerializer,
    LaunchModuleResponseSerializer,
)
from api.services.master_launch_service import (
    get_module_launch_options_service,
    create_module_launch_service,
)

from api.authentication import MasterJWTAuthentication
from api.permissions import IsMasterAuthenticated


class ModuleLaunchOptionsView(APIView):
    authentication_classes = [MasterJWTAuthentication]
    permission_classes = [IsMasterAuthenticated]

    def post(self, request, module_id, *args, **kwargs):
        try:
            data = get_module_launch_options_service(module_id)
            serializer = ModuleLaunchOptionsResponseSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ValueError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response(
                {"message": "Failed to fetch launch options", "detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ModuleLaunchView(APIView):
    authentication_classes = [MasterJWTAuthentication]
    permission_classes = [IsMasterAuthenticated]

    def post(self, request, module_id, *args, **kwargs):
        try:
            request_serializer = LaunchModuleRequestSerializer(data=request.data)
            request_serializer.is_valid(raise_exception=True)

            selected_role = request_serializer.validated_data["selected_role"]

            master_user = {
                "id": (
                    request.user.get("user_id")
                    or request.user.get("id")
                    if isinstance(request.user, dict)
                    else getattr(request.user, "id", None)
                ),
                "email": (
                    request.user.get("email")
                    if isinstance(request.user, dict)
                    else getattr(request.user, "email", None)
                ),
                "name": (
                    request.user.get("name")
                    if isinstance(request.user, dict)
                    else getattr(request.user, "name", None)
                ),
                "role": (
                    request.user.get("role")
                    if isinstance(request.user, dict)
                    else getattr(request.user, "role", None)
                ),
                 "session_token": (
                    request.user.get("session_token")
                    if isinstance(request.user, dict)
                    else getattr(request.user, "session_token", None)
                ),
                        }

            if not master_user["id"] or not master_user["email"] or not master_user["role"]:
                return Response(
                    {"message": "Authenticated master user context is missing"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            data = create_module_launch_service(
                module_id=module_id,
                master_user=master_user,
                selected_role=selected_role,
            )

            response_serializer = LaunchModuleResponseSerializer(data)
            return Response(response_serializer.data, status=status.HTTP_200_OK)

        except ValueError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response(
                {"message": "Failed to launch module", "detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )