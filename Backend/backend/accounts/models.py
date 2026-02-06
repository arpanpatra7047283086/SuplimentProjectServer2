"""
Custom User model with referral system and coin/points tracking.
"""

import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Extended user with:
      - A unique referral_code (auto-generated)
      - points balance
      - Link to the user who referred them
    """

    referral_code = models.CharField(
        max_length=12,
        unique=True,
        blank=True,
        help_text="Unique code this user shares to invite others.",
    )
    points = models.PositiveIntegerField(
        default=0,
        help_text="Total coin/points balance.",
    )
    referred_by = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="referrals",
        help_text="The user who referred this account.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        """Auto-generate a referral code on first save."""
        if not self.referral_code:
            self.referral_code = uuid.uuid4().hex[:10].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} (pts: {self.points})"


class Referral(models.Model):
    """
    Tracks each individual referral event for audit purposes.
    """

    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_referrals",
        help_text="User who shared the referral link.",
    )
    referred_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_referral",
        help_text="User who signed up via the referral link.",
    )
    referrer_points_awarded = models.PositiveIntegerField(
        default=0,
        help_text="Points given to the referrer for this referral.",
    )
    referred_points_awarded = models.PositiveIntegerField(
        default=0,
        help_text="Points given to the referred user for this referral.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("referrer", "referred_user")

    def __str__(self):
        return f"{self.referrer.username} -> {self.referred_user.username}"


class PointTransaction(models.Model):
    """
    Ledger of every point credit/debit for full auditability.
    """

    class TransactionType(models.TextChoices):
        REFERRAL_BONUS = "REFERRAL_BONUS", "Referral Bonus"
        SIGNUP_BONUS = "SIGNUP_BONUS", "Signup Bonus"
        DEBIT = "DEBIT", "Debit"
        CREDIT = "CREDIT", "Credit"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="point_transactions",
    )
    amount = models.IntegerField(
        help_text="Positive = credit, negative = debit.",
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
    )
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.amount:+d} ({self.transaction_type})"
