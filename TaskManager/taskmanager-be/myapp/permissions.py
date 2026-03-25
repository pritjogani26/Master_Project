from rest_framework.permissions import BasePermission
# Import the database function we wrote earlier!
from .services import get_user_frontend_permissions 

class HasScreenActionPermission(BasePermission):
    """
    Blocks API requests if the user does not have the corresponding 
    Action mapped to their Role for the requested Screen.
    """
    
    # 1. Map API HTTP Methods to your Database Action names
    METHOD_ACTION_MAP = {
        'GET': 'View',
        'POST': 'Create',
        'PUT': 'Update',
        'PATCH': 'Update',
        'DELETE': 'Delete',
    }

    def has_permission(self, request, view):
        # Reject unauthenticated users immediately
        # (Assuming you are validating that JWT token middleware!)
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. What Screen is this API View protecting?
        # We will require the developer to define 'required_screen' on the View
        required_screen = getattr(view, 'required_screen', None)
        if not required_screen:
            # DEFAULT DENY: If the developer forgot to assign a screen, block access!
            return False 

        # 3. What Action are they trying to perform?
        required_action = self.METHOD_ACTION_MAP.get(request.method)
        if not required_action:
            return False

        # 4. Fetch the user's permissions 
        # (Pro-Tip: In production, fetch this from a Redis cache, not the DB every time!)
        user_permissions = get_user_frontend_permissions(request.user.id)

        # 5. THE ULTIMATE CHECK
        # Does the requested screen exist in their allowed permissions?
        screen_data = user_permissions.get(required_screen)
        if not screen_data:
            return False # They don't have access to this screen at all

        # Do they have the specific action (e.g., 'Delete') for this screen?
        if required_action in screen_data.get("actions", []):
            return True # Allowed! Let the request through.

        return False # Blocked! They can see the screen, but can't perform this action.



from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    """
    Strictly limits access to users who have the Super Admin role.
    """
    def has_permission(self, request, view):
        # Reject unauthenticated users
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Check your custom user model or however you store the role!
        # Assuming request.user.role is a string like "Super Admin" or an ID like 1
        return getattr(request.user, 'role', None) == 'super admin'