from rest_framework import serializers


class LaunchRoleOptionSerializer(serializers.Serializer):
    role_code = serializers.CharField()
    label = serializers.CharField()


class ModuleLaunchOptionsResponseSerializer(serializers.Serializer):
    module_id = serializers.IntegerField()
    module_name = serializers.CharField()
    module_key = serializers.CharField()
    role_options = LaunchRoleOptionSerializer(many=True)


class LaunchModuleRequestSerializer(serializers.Serializer):
    selected_role = serializers.CharField(required=True)

    def validate_selected_role(self, value):
        value = value.strip().upper()
        if not value:
            raise serializers.ValidationError("selected_role is required")
        return value


class LaunchModuleResponseSerializer(serializers.Serializer):
    module_id = serializers.IntegerField()
    module_name = serializers.CharField()
    module_key = serializers.CharField()
    selected_role = serializers.CharField()
    launch_url = serializers.CharField()