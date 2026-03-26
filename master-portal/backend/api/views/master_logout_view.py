from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.services.master_logout_service import logout_master_user_service


class MasterLogoutView(APIView):
    def post(self, request):
        auth_header = request.headers.get("Authorization", "")
        token = ""

        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

        try:
            data = logout_master_user_service(token)
            return Response(data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )