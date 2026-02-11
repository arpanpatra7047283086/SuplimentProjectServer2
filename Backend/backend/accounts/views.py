"""
API views for authentication, profile, referrals, and leaderboard.
"""

from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PointTransaction, Referral
from .serializers import (
    LeaderboardSerializer,
    LoginSerializer,
    PointTransactionSerializer,
    ReferralSerializer,
    SignupSerializer,
    UserProfileSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------


class SignupView(generics.CreateAPIView):
    """
    POST /api/auth/signup/
    Body: { username, email, password, password2, referral_code? }
    """

    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for immediate login
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Account created successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "referral_code": user.referral_code,
                    "points": user.points,
                },
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/auth/login/
    Body: { username, password }
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "referral_code": user.referral_code,
                    "points": user.points,
                },
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            }
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Body: { refresh }   – blacklists the refresh token.
    """

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"message": "Logged out (token already expired or invalid)."},
                status=status.HTTP_200_OK,
            )


# ---------------------------------------------------------------------------
# Profile & Dashboard views
# ---------------------------------------------------------------------------


class ProfileView(generics.RetrieveAPIView):
    """
    GET /api/auth/profile/
    Returns the authenticated user's full profile with referral stats.
    """

    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class MyReferralsView(generics.ListAPIView):
    """
    GET /api/auth/referrals/
    Lists everyone the authenticated user has referred.
    """

    serializer_class = ReferralSerializer

    def get_queryset(self):
        return Referral.objects.filter(referrer=self.request.user)


class PointHistoryView(generics.ListAPIView):
    """
    GET /api/auth/points/history/
    Full ledger of point transactions for the authenticated user.
    """

    serializer_class = PointTransactionSerializer

    def get_queryset(self):
        return PointTransaction.objects.filter(user=self.request.user)


# ---------------------------------------------------------------------------
# Public views
# ---------------------------------------------------------------------------


class LeaderboardView(generics.ListAPIView):
    """
    GET /api/auth/leaderboard/
    Top 50 users by points (public).
    """

    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.order_by("-points")[:50]


class ValidateReferralCodeView(APIView):
    """
    GET /api/auth/validate-referral/?code=XXXXXX
    Checks if a referral code is valid (public, used during signup form).
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get("code", "")
        if not code:
            return Response(
                {"valid": False, "error": "No code provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(referral_code=code)
            return Response(
                {"valid": True, "referrer_username": user.username}
            )
        except User.DoesNotExist:
            return Response({"valid": False, "error": "Invalid referral code."})
