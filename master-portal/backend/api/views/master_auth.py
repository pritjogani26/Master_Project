from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.serializers.master_auth_serializer import MasterLoginSerializer
from api.services.master_auth_service import login_master_user_service


class MasterLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = MasterLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = login_master_user_service(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        return Response(result, status=status.HTTP_200_OK)