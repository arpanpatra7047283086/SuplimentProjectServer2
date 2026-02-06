"""
Serializers for authentication, user profile, and referral system.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from .models import PointTransaction, Referral

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth serializers
# ---------------------------------------------------------------------------


class SignupSerializer(serializers.ModelSerializer):
    """
    Register a new user.
    Accepts an optional `referral_code` – if valid, both users earn points.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm password")
    referral_code = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Referral code of the person who invited you.",
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "password2",
            "referral_code",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password2": "Passwords do not match."}
            )
        return attrs

    def validate_referral_code(self, value):
        """Make sure the referral code belongs to an existing user."""
        if value:
            if not User.objects.filter(referral_code=value).exists():
                raise serializers.ValidationError(
                    "Invalid referral code. No user found with this code."
                )
        return value

    @transaction.atomic
    def create(self, validated_data):
        referral_code = validated_data.pop("referral_code", None)
        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

        # ---- Referral logic ----
        if referral_code:
            referrer = User.objects.select_for_update().get(referral_code=referral_code)

            referrer_pts = getattr(settings, "REFERRAL_POINTS_FOR_REFERRER", 4)
            referred_pts = getattr(settings, "REFERRAL_POINTS_FOR_REFERRED", 2)

            # Link the new user to the referrer
            user.referred_by = referrer
            user.points += referred_pts
            user.save(update_fields=["referred_by", "points"])

            # Award points to the referrer
            referrer.points += referrer_pts
            referrer.save(update_fields=["points"])

            # Create the referral record
            Referral.objects.create(
                referrer=referrer,
                referred_user=user,
                referrer_points_awarded=referrer_pts,
                referred_points_awarded=referred_pts,
            )

            # Audit transactions
            PointTransaction.objects.create(
                user=referrer,
                amount=referrer_pts,
                transaction_type=PointTransaction.TransactionType.REFERRAL_BONUS,
                description=f"Referral bonus: {user.username} signed up with your code.",
            )
            PointTransaction.objects.create(
                user=user,
                amount=referred_pts,
                transaction_type=PointTransaction.TransactionType.SIGNUP_BONUS,
                description=f"Welcome bonus: signed up via {referrer.username}'s referral.",
            )

        return user


class LoginSerializer(serializers.Serializer):
    """Accept username + password, validated in the view."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


# ---------------------------------------------------------------------------
# Profile / Dashboard serializers
# ---------------------------------------------------------------------------


class UserProfileSerializer(serializers.ModelSerializer):
    """Full profile with referral stats."""

    total_referrals = serializers.SerializerMethodField()
    referred_by_username = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "referral_code",
            "points",
            "referred_by_username",
            "total_referrals",
            "created_at",
        )
        read_only_fields = fields

    def get_total_referrals(self, obj):
        return obj.referrals.count()

    def get_referred_by_username(self, obj):
        return obj.referred_by.username if obj.referred_by else None


class ReferralSerializer(serializers.ModelSerializer):
    """Shows who a user has referred."""

    referred_username = serializers.CharField(source="referred_user.username")
    referred_email = serializers.CharField(source="referred_user.email")

    class Meta:
        model = Referral
        fields = (
            "id",
            "referred_username",
            "referred_email",
            "referrer_points_awarded",
            "referred_points_awarded",
            "created_at",
        )


class PointTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointTransaction
        fields = (
            "id",
            "amount",
            "transaction_type",
            "description",
            "created_at",
        )


class LeaderboardSerializer(serializers.ModelSerializer):
    """Public leaderboard entry."""

    class Meta:
        model = User
        fields = ("id", "username", "points")
