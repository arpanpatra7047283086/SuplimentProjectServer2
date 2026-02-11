"""
URL routes for the accounts app.

All prefixed with /api/auth/ (set in config/urls.py).
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Auth
    path("signup/", views.SignupView.as_view(), name="signup"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # Profile & Dashboard
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("referrals/", views.MyReferralsView.as_view(), name="my-referrals"),
    path("points/history/", views.PointHistoryView.as_view(), name="point-history"),

    # Public
    path("leaderboard/", views.LeaderboardView.as_view(), name="leaderboard"),
    path("validate-referral/", views.ValidateReferralCodeView.as_view(), name="validate-referral"),
]
