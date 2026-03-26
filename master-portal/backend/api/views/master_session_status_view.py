from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.services.master_session_status_service import master_session_service


class MasterSessionStatusView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        session_token = request.GET.get("session_token", "").strip()

        try:
            data = master_session_service(session_token)
            return Response(data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)