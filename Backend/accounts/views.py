from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from .models import Referral
from .serializers import (
    LeaderboardSerializer,
    LoginSerializer,
    ReferralSerializer,
    SignupSerializer,
    UserProfileSerializer,
)

User = get_user_model()

# -------------------- WAKE UP --------------------
def wake_up(request):
    print("Server awake")
    return JsonResponse({"status": "backend awake"})


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------
class SignupView(APIView):
    """
    POST /api/signup/
    Body: { name, email, phone, password, confirmPassword, referralCode? }
    Returns the created user + JWT tokens.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/login/
    Body: { phone, password }
    Returns JWT tokens + user profile.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            phone=serializer.validated_data["phone"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"detail": "Invalid phone number or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            }
        )


# ---------------------------------------------------------------------------
# Profile & referral views
# ---------------------------------------------------------------------------
class ProfileView(generics.RetrieveAPIView):
    """
    GET /api/profile/
    Returns authenticated user's full profile including points.
    """

    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class MyReferralsView(generics.ListAPIView):
    """
    GET /api/referrals/
    Lists all referral records where the current user is the referrer.
    """

    serializer_class = ReferralSerializer

    def get_queryset(self):
        return Referral.objects.filter(referrer=self.request.user)


class LeaderboardView(generics.ListAPIView):
    """
    GET /api/leaderboard/
    Public endpoint - top 50 users ranked by points.
    """

    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.order_by("-points")[:50]
