from rest_framework import serializers


class PortalLaunchRoleOptionSerializer(serializers.Serializer):
    role_code = serializers.CharField()
    label = serializers.CharField()


class PortalLaunchOptionsResponseSerializer(serializers.Serializer):
    role_options = PortalLaunchRoleOptionSerializer(many=True)


class ConsumePortalLaunchRequestSerializer(serializers.Serializer):
    launch_token = serializers.CharField(required=True, allow_blank=False)

    def validate_launch_token(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("launch_token is required")
        return value


class ConsumePortalLaunchResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    redirect_url = serializers.CharField()
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = serializers.DictField()
    permissions = serializers.DictField()
    pages = serializers.DictField()
    master_user_id = serializers.IntegerField(allow_null=True)
    master_session_token = serializers.CharField(allow_null=True, allow_blank=True)