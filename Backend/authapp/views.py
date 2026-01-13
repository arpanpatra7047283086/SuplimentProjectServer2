import os
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import cloudinary
import cloudinary.uploader
from .utils import generate_tokens 

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserProfile
from .utils import generate_tokens
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from .authentication import CookieJWTAuthentication


# .......................................... CLOUDINARY CONFIG .............................
cloudinary.config(
    cloud_name=os.getenv("cloud_name"),
    api_key=os.getenv("api_key"),
    api_secret=os.getenv("api_secret"),
    secure=True,
)


# ....................................... TOKEN GENERATOR .................................
def generate_tokens(user):
    refresh = RefreshToken.for_user(user)
    print('Refresh token generated....')
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


# ................................................. SIGNUP .....................................
from .models import UserProfile  


@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    print('Hello')
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "").strip()
    name = request.data.get("name", "").strip()
    referral_code = request.data.get("referralCode", "").strip()  # optional

    # Debug prints
    print("Received:", username, email, password, name, referral_code)

    # Validation
    if not username or not email or not password:
        print("Validation failed: missing fields")
        return Response(
            {"error": "Username, email, and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        print("Validation failed: user exists")
        return Response(
            {"error": "User already exists"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name or "",
        )
        print("User created:", user.id)

        # Generate tokens
        tokens = generate_tokens(user)
        print("Tokens generated:", tokens)

        # Create UserProfile
        profile = UserProfile.objects.create(
            user=user,
            referral_code=referral_code or None,
            access_token=tokens["access"],
            refresh_token=tokens["refresh"],
        )
        print("UserProfile created:", profile.id)

        # Response
        response = Response(
            {
                "message": "Signup successful",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "name": user.first_name,
                    "referralCode": referral_code or None,
                },
            },
            status=status.HTTP_201_CREATED,
        )

        # Store tokens in cookies
        response.set_cookie("access", tokens["access"], httponly=True, samesite="Lax")
        response.set_cookie("refresh", tokens["refresh"], httponly=True, samesite="Lax")

        return response

    except Exception as e:
        print("Exception during signup:", str(e))
        return Response(
            {"error": "Internal server error: " + str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )



# ................................................... LOGIN ............................................
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    print(f'UserName : {username}')
    print(f'Password : {password}')

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {"error": "Invalid credentials"},
            status=401
        )

    tokens = generate_tokens(user)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.access_token = tokens["access"]
    profile.refresh_token = tokens["refresh"]
    profile.save()

    response = Response(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "referralCode": getattr(profile, "referral_code", None),
            },
        }
    )   
    #print(tokens["access"])
    #print(tokens["refresh"])

    response.set_cookie("access", tokens["access"], httponly=True, samesite="Lax")
    response.set_cookie("refresh", tokens["refresh"], httponly=True, samesite="Lax")

    return response

# ............................................................ ADMIN LOGIN .........................................
@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    print(f'Username : {username}')
    print(f'Password : {password}')

    user = authenticate(username=username, password=password)

    if not user or not user.is_staff:
        return Response(
            {"error": "Admin access denied"},
            status=status.HTTP_403_FORBIDDEN,
        )

    tokens = generate_tokens(user)

    response = Response(
        {
            "message": "Admin login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }
    )

    response.set_cookie("access", tokens["access"], httponly=True, samesite="Lax")
    response.set_cookie("refresh", tokens["refresh"], httponly=True, samesite="Lax")

    return response




        

# ................................ CURRENT USER ..............................
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .authentication import CookieJWTAuthentication

@api_view(["GET"])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def current_user(request):
    print('Response...')
    user = request.user
    print(user)
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isAdmin": user.is_staff,
    })







# ................................. LOGOUT ......................................
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    response = Response({"message": "Logout successful"})
    response.delete_cookie("access")
    response.delete_cookie("refresh")
    return response




#............................................ me to token refresh .................................
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(["POST"])
def token_refresh(request):
    print('Hello...RT')
    refresh_token = request.COOKIES.get("refresh")
    print("Refresh token:", refresh_token)

    if not refresh_token:
        return Response({"error": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)


        new_refresh_token = str(token)  

        response = Response({
            "access": access_token,
            "refresh": new_refresh_token,
        }, status=status.HTTP_200_OK)

   
        response.set_cookie(
            key="access",
            value=access_token,
            httponly=True,
            samesite="Lax",
            max_age=5*60  
        )
        response.set_cookie(
            key="refresh",
            value=new_refresh_token,
            httponly=True,
            samesite="Lax",
            max_age=7*24*60*60  
        )

        return response

    except Exception as e:
        print("Token refresh error:", e)
        return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

