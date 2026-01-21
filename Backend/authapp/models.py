from django.db import models
from django.contrib.auth.models import User
import uuid

# ------------------- USER PROFILE -------------------
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    referral_code = models.CharField(max_length=10, unique=True, blank=True)
    coins = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4().hex[:8].upper())
        super().save(*args, **kwargs)


# ------------------- USER WALLET -------------------
class UserWallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="wallet")
    coins = models.IntegerField(default=0)
    points = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username


# ------------------- REFERRAL -------------------
class Referral(models.Model):
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="referrals_made")
    referee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="referrals_used")
    code = models.CharField(max_length=20, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code
