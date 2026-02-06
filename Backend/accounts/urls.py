"""Accounts app URL configuration."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path("wake-up/", views.wake_up, name="wake_up"),
    path("signup/", views.SignupView.as_view(), name="signup"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Profile & referrals
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("referrals/", views.MyReferralsView.as_view(), name="my_referrals"),
    path("leaderboard/", views.LeaderboardView.as_view(), name="leaderboard"),
]
