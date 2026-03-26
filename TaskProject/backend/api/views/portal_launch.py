from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers.portal_launch_serializer import (
    PortalLaunchOptionsResponseSerializer,
    ConsumePortalLaunchRequestSerializer,
    ConsumePortalLaunchResponseSerializer,
)
from api.services.portal_launch_service import (
    get_portal_launch_options_service,
    consume_portal_launch_service,
)
from api.services.portal_launch_service import consume_launch_token_service


class PortalLaunchOptionsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
        data = get_portal_launch_options_service()
        serializer = PortalLaunchOptionsResponseSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConsumePortalLaunchView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        try:
            request_serializer = ConsumePortalLaunchRequestSerializer(data=request.data)
            request_serializer.is_valid(raise_exception=True)

            token = request_serializer.validated_data["launch_token"]
            next_path = request.query_params.get("next")

            data = consume_portal_launch_service(token=token, next_path=next_path)
            response_serializer = ConsumePortalLaunchResponseSerializer(data)

            return Response(response_serializer.data, status=status.HTTP_200_OK)

        except ValueError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            return Response(
                {"message": "Failed to consume launch token", "detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        

class ConsumeLaunchView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        launch_token = request.data.get("launch_token", "")
        next_path = request.GET.get("next")

        try:
            data = consume_launch_token_service(launch_token, next_path)
            return Response(data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)