import re
from rest_framework import serializers


class MasterModuleSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    module_name = serializers.CharField(max_length=150)
    module_key = serializers.CharField(max_length=50)
    base_url = serializers.URLField(max_length=500)
    backend_url = serializers.URLField(
        max_length=500, required=False, allow_null=True, allow_blank=True
    )
    icon = serializers.CharField(
        max_length=255, required=False, allow_null=True, allow_blank=True
    )
    description = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )
    sort_order = serializers.IntegerField(required=False, default=0)
    is_active = serializers.BooleanField(required=False)

    def validate_module_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Module name is required")
        return value

    def validate_module_key(self, value):
        value = value.strip().upper()

        if not value:
            raise serializers.ValidationError("Module key is required")

        if not re.match(r"^[A-Z0-9_]+$", value):
            raise serializers.ValidationError(
                "Module key must contain only uppercase letters, numbers, and underscores"
            )

        return value

    def validate_sort_order(self, value):
        if value < 0:
            raise serializers.ValidationError("Sort order cannot be negative")
        return value


class AssignModuleSerializer(serializers.Serializer):
    module_id = serializers.IntegerField()

    def validate_module_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Valid module_id is required")
        return value