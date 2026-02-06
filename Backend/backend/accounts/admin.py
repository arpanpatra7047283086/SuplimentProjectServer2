"""
Admin configuration for User, Referral, and PointTransaction models.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import PointTransaction, Referral, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "username",
        "email",
        "referral_code",
        "points",
        "referred_by",
        "date_joined",
    )
    list_filter = ("is_staff", "is_active", "date_joined")
    search_fields = ("username", "email", "referral_code")
    readonly_fields = ("referral_code", "created_at", "updated_at")

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Referral System",
            {
                "fields": (
                    "referral_code",
                    "points",
                    "referred_by",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = (
        "referrer",
        "referred_user",
        "referrer_points_awarded",
        "referred_points_awarded",
        "created_at",
    )
    list_filter = ("created_at",)
    search_fields = (
        "referrer__username",
        "referred_user__username",
    )
    readonly_fields = ("created_at",)


@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "amount",
        "transaction_type",
        "description",
        "created_at",
    )
    list_filter = ("transaction_type", "created_at")
    search_fields = ("user__username", "description")
    readonly_fields = ("created_at",)
