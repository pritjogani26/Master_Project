from rest_framework.permissions import BasePermission


class IsMasterAuthenticated(BasePermission):
    message = "Master authentication required"

    def has_permission(self, request, view):
        return bool(getattr(request, "user_id", None))