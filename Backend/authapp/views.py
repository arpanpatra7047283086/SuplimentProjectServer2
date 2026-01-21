import os
import uuid
import cloudinary
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .authentication import CookieJWTAuthentication
from .models import UserProfile, UserWallet, Referral
from .serializers import SignupSerializer
from django.views.decorators.csrf import csrf_exempt

# -------------------- CLOUDINARY CONFIG --------------------
cloudinary.config(
    cloud_name=os.getenv("cloud_name"),
    api_key=os.getenv("api_key"),
    api_secret=os.getenv("api_secret"),
    secure=True,
)

# -------------------- COOKIE SETTINGS --------------------
COOKIE_SETTINGS = {
    "httponly": True,
    "secure": True,       # Use False if testing on localhost http
    "samesite": "None",
    "path": "/",
}

# -------------------- HELPER: GENERATE TOKENS --------------------
def generate_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }

# -------------------- WAKE UP --------------------
def wake_up(request):
    print("Server awake")
    return JsonResponse({"status": "backend awake"})

# -------------------- SIGNUP --------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Signup successful"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------- LOGIN --------------------
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    phone = request.data.get("phone") or request.data.get("username")
    password = request.data.get("password")

    if not phone or not password:
        return Response({"error": "Phone and password required"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=phone, password=password)
    if not user:
        return Response({"error": "Invalid phone or password"}, status=status.HTTP_401_UNAUTHORIZED)

    tokens = generate_tokens(user)
    response = Response({
        "message": "Login successful",
        "user": {"id": user.id, "username": user.username, "email": user.email},
    }, status=status.HTTP_200_OK)

    response.set_cookie("access", tokens["access"], **COOKIE_SETTINGS)
    response.set_cookie("refresh", tokens["refresh"], **COOKIE_SETTINGS)
    return response

# -------------------- ADMIN LOGIN --------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if not user or not user.is_staff:
        return Response({"error": "Admin denied"}, status=403)

    tokens = generate_tokens(user)
    response = Response({"message": "Admin login successful"})
    response.set_cookie("access", tokens["access"], **COOKIE_SETTINGS)
    response.set_cookie("refresh", tokens["refresh"], **COOKIE_SETTINGS)
    return response

# -------------------- CURRENT USER --------------------
@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isAdmin": user.is_staff,
    })

# -------------------- LOGOUT --------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):
    response = Response({"message": "Logged out"})
    response.delete_cookie("access", path="/")
    response.delete_cookie("refresh", path="/")
    return response

# -------------------- TOKEN REFRESH --------------------
@api_view(["POST"])
def token_refresh(request):
    refresh_token = request.COOKIES.get("refresh")
    if not refresh_token:
        return Response({"error": "No refresh token"}, status=401)
    try:
        token = RefreshToken(refresh_token)
        access = str(token.access_token)
        response = Response({"access": access})
        response.set_cookie("access", access, **COOKIE_SETTINGS)
        return response
    except Exception as e:
        return Response({"error": "Invalid refresh token"}, status=401)

# -------------------- GENERATE REFERRAL --------------------
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Referral
import uuid
from .authentication import CookieJWTAuthentication  # ✅ your custom auth class

@api_view(["POST"])
@authentication_classes([CookieJWTAuthentication])  # ✅ important!
@permission_classes([IsAuthenticated])
def generate_referral(request):
    user = request.user

    # Check if unused referral already exists
    existing = Referral.objects.filter(referrer=user, is_used=False).first()
    if existing:
        return Response({
            "code": existing.code,
            "whatsapp_url": f"https://wa.me/?text=Join%20using%20my%20referral%20code:%20{existing.code}"
        }, status=200)

    # Generate new code
    code = str(uuid.uuid4().hex[:8].upper())
    referral = Referral.objects.create(referrer=user, code=code)

    return Response({
        "code": referral.code,
        "whatsapp_url": f"https://wa.me/?text=Join%20using%20my%20referral%20code:%20{referral.code}"
    }, status=201)



# -------------------- MY REFERRAL --------------------
@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def my_referral(request):
    profile = UserProfile.objects.get(user=request.user)
    wallet, _ = UserWallet.objects.get_or_create(user=request.user)
    referrals = Referral.objects.filter(referrer=request.user)

    return Response({
        "username": request.user.username,
        "referral_code": profile.referral_code,
        "coins": wallet.coins,
        "total_referrals": referrals.count(),
    })

# -------------------- MY WALLET --------------------
@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def my_wallet(request):
    wallet, _ = UserWallet.objects.get_or_create(user=request.user)
    return Response({
        "coins": wallet.coins,
        "points": getattr(wallet, "points", 0)
    })



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def use_referral(request):
    """
    Use a referral code for the logged-in user
    """
    code = request.data.get("code")
    if not code:
        return Response({"error": "Referral code required"}, status=400)

    try:
        referral = Referral.objects.get(code=code, is_used=False)
    except Referral.DoesNotExist:
        return Response({"error": "Invalid or already used referral code"}, status=400)

    # Mark referral as used
    referral.referee = request.user
    referral.is_used = True
    referral.save()


    referrer_wallet = referral.referrer.wallet
    referrer_wallet.coins += 10
    referrer_wallet.save()

    user_wallet = request.user.wallet
    user_wallet.coins += 10
    user_wallet.save()

    return Response({"message": "Referral applied successfully"})