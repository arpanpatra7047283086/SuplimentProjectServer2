"""Serializers for admin API views backed by MongoDB documents."""

from rest_framework import serializers


class _LooseDictSerializer(serializers.Serializer):
    """Accept arbitrary JSON object payloads and pass them through unchanged."""

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("Expected a JSON object.")
        return dict(data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, trim_whitespace=False)


class UserSerializer(_LooseDictSerializer):
    def validate(self, attrs):
        missing = [
            field for field in ("phone", "email", "name")
            if attrs.get(field) in (None, "")
        ]
        if missing:
            raise serializers.ValidationError(
                {field: ["This field is required."] for field in missing}
            )
        return attrs


class UserUpdateSerializer(_LooseDictSerializer):
    pass


class ReferralSerializer(_LooseDictSerializer):
    pass


class ReferralUpdateSerializer(_LooseDictSerializer):
    pass


class OrderSerializer(_LooseDictSerializer):
    pass


class OrderUpdateSerializer(_LooseDictSerializer):
    pass


class ProductSerializer(_LooseDictSerializer):
    pass


class ProductUpdateSerializer(_LooseDictSerializer):
    pass
