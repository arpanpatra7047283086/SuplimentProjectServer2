from rest_framework import serializers
from .models import User



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['phone_number', 'password']



from rest_framework import serializers
from django.contrib.auth.models import User

class SignupSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["phone", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        phone = validated_data["phone"]
        password = validated_data["password"]

        if User.objects.filter(username=phone).exists():
            raise serializers.ValidationError({"phone": "Phone already registered"})

        user = User.objects.create_user(
            username=phone,  
            password=password
        )
        return user




