from rest_framework import generics, status
from rest_framework.response import Response

from api.authentication import MasterJWTAuthentication
from api.permissions import IsMasterAuthenticated
from api.serializers.master_module_serializer import (
    AssignModuleSerializer,
    MasterModuleSerializer,
)
from api.services.master_module_service import (
    assign_module_to_user_service,
    deactivate_master_module_service,
    list_all_master_modules_service,
    register_master_module_service,
    update_master_module_service,
)


class MasterModuleListCreateView(generics.GenericAPIView):
    authentication_classes = [MasterJWTAuthentication]
    permission_classes = [IsMasterAuthenticated]
    serializer_class = MasterModuleSerializer

    def get(self, request):
        modules = list_all_master_modules_service(include_inactive=False)
        return Response(
            {
                "message": "Registered modules fetched successfully",
                "data": modules,
            },
            status=status.HTTP_200_OK,
        )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = register_master_module_service(serializer.validated_data)
        return Response(
            {
                "message": "Module registered successfully",
                "data": result,
            },
            status=status.HTTP_201_CREATED,
        )


class MasterModuleDetailView(generics.GenericAPIView):
    authentication_classes = [MasterJWTAuthentication]
    permission_classes = [IsMasterAuthenticated]
    serializer_class = MasterModuleSerializer

    def put(self, request, module_id):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = update_master_module_service(
            module_id=module_id,
            data=serializer.validated_data,
        )
        return Response(
            {
                "message": "Module updated successfully",
                "data": result,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, module_id):
        result = deactivate_master_module_service(module_id)
        return Response(
            {
                "message": "Module deactivated successfully",
                "data": result,
            },
            status=status.HTTP_200_OK,
        )


class AssignModuleToUserView(generics.GenericAPIView):
    authentication_classes = [MasterJWTAuthentication]
    permission_classes = [IsMasterAuthenticated]
    serializer_class = AssignModuleSerializer

    def post(self, request, user_id):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = assign_module_to_user_service(
            master_user_id=user_id,
            module_id=serializer.validated_data["module_id"],
        )
        return Response(
            {
                "message": "Module assigned successfully",
                "data": result,
            },
            status=status.HTTP_200_OK,
        )
    
class ActivateModuleView(generics.GenericAPIView):
    authentication_classes = [MasterJWTAuthentication]
    permission_classes = [IsMasterAuthenticated]

    def post(self, request, module_id):
        try:
            result = update_master_module_service(
                module_id=module_id,
                data={
                    "module_name": request.data.get("module_name"),
                    "module_key": request.data.get("module_key"),
                    "base_url": request.data.get("base_url"),
                    "backend_url": request.data.get("backend_url"),
                    "icon": request.data.get("icon"),
                    "description": request.data.get("description"),
                    "sort_order": request.data.get("sort_order", 0),
                    "is_active": True,
                },
            )

            return Response(
                {
                    "message": "Module activated successfully",
                    "data": result,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )