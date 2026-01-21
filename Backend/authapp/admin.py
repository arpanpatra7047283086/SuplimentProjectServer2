from django.contrib import admin
from .models import UserProfile, UserWallet, Referral

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "referral_code", "coins")
    search_fields = ("user__username", "referral_code")


@admin.register(UserWallet)
class UserWalletAdmin(admin.ModelAdmin):
    list_display = ("user", "coins", "points")
    search_fields = ("user__username",)


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ("referrer", "referee", "code", "is_used", "created_at")
    list_filter = ("is_used", "created_at")
    search_fields = ("referrer__username", "referee__username", "code")
