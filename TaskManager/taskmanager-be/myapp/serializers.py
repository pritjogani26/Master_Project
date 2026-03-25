import rest_framework.serializers as serializers

class RegiserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
  


class ProjectCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=True, allow_blank=False)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=False, allow_null=True)

    def validate(self, data):
        """
        Mirroring your database logic to catch date errors early.
        """
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date cannot be before start date."
            })
            
        return data



class TaskCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=True, allow_blank=False)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    status = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)


class RoleRightUpdateSerializer(serializers.Serializer):
    role_id = serializers.IntegerField(required=True)
    screen_name = serializers.CharField(max_length=255, required=True)
    action_name = serializers.CharField(max_length=50, required=True)
    grant_access = serializers.BooleanField(required=True)



class CreateScreenSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=True)
    route = serializers.CharField(max_length=255, required=True)
    
    

class ToggleScreenActionSerializer(serializers.Serializer):
    action_id = serializers.IntegerField(required=True)
    link = serializers.BooleanField(required=True)

from rest_framework import serializers

class CreateActionSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, required=True)
    