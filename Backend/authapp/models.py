from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    referral_code = models.CharField(max_length=50, blank=True, null=True)
    access_token = models.TextField(blank=True, null=True)
    refresh_token = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username
