import os
from django.http import JsonResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .authentication import CookieJWTAuthentication
from .models import UserProfile
import cloudinary
from django.views.decorators.csrf import csrf_exempt

# .............................................. CLOUDINARY ...................................................
cloudinary.config(
    cloud_name=os.getenv("cloud_name"),
    api_key=os.getenv("api_key"),
    api_secret=os.getenv("api_secret"),
    secure=True,
)


# .................................................. Server WakeUp .............................................
def wake_up(request):
    print('WakeUp Server.....')
    return JsonResponse({"status": "backend awake"})




# ................................................. TOKEN GENERATOR ......................................................
def generate_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }

# ................................................... COOKIE CONFIG .............................................
COOKIE_SETTINGS = {
    "httponly": True,
    "secure": True,       
    "samesite": "None",     
    "path": "/",
}

# ...................................................... SIGNUP ...........................................................
@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "").strip()
    name = request.data.get("name", "").strip()
    referral_code = request.data.get("referralCode", "").strip()

    if not username or not email or not password:
        return Response({"error": "Missing fields"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=name,
    )

    UserProfile.objects.create(user=user, referral_code=referral_code or None)

    tokens = generate_tokens(user)

    response = Response({
        "message": "Signup successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    }, status=201)

    response.set_cookie("access", tokens["access"], **COOKIE_SETTINGS)
    response.set_cookie("refresh", tokens["refresh"], **COOKIE_SETTINGS)

    return response

# ........................................................... LOGIN ........................................................
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    tokens = generate_tokens(user)

    response = Response({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
    })

    response.set_cookie("access", tokens["access"], **COOKIE_SETTINGS)
    response.set_cookie("refresh", tokens["refresh"], **COOKIE_SETTINGS)

    return response

# ................................................. ADMIN LOGIN ..........................................................................
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

# ..................................................... CURRENT USER ...................................................................
@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def current_user(request):
    #print(" cookies from frontend:", request.COOKIES)
    #print(" AUTH HEADER:", request.headers.get("Authorization"))

    user = request.user
    #print(" AUTHENTICATED USER:", user)

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isAdmin": user.is_staff,
    })


# .................................................. LOGOUT .....................................................................
@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):
    response = Response({"message": "Logged out"})
    response.delete_cookie("access", path="/")
    response.delete_cookie("refresh", path="/")
    return response

# ....................................................... TOKEN REFRESH ....................................................
@api_view(["POST"])
def token_refresh(request):
    print("Refreash cookies:", request.COOKIES)

    refresh_token = request.COOKIES.get("refresh")
    print("Refresh Token:", refresh_token)

    if not refresh_token:
        #print("Not come..")
        return Response({"error": "No refresh token"}, status=401)

    try:
        token = RefreshToken(refresh_token)
        #print("RT valid....")

        access = str(token.access_token)
        response = Response({"access": access})
        response.set_cookie("access", access, httponly=True, samesite="Lax")
        return response

    except Exception as e:
        print("RT Invalid:", str(e))
        return Response({"error": "Invalid refresh token"}, status=401)
