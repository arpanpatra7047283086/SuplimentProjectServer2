from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId

from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from mongo.collections import users_col, referrals_col
from utils.password import hash_password, verify_password
from utils.jwt import generate_tokens_for_user
from utils.jwt_helper import decode_token


# ================== HEALTH CHECK ==================
def wake_up(request):
    return JsonResponse({"status": "backend awake"})


# ================== SIGNUP ==================
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        phone = data.get("phone")
        password = data.get("password")
        name = data.get("name")
        email = data.get("email")
        referral_code = data.get("referralCode")  # optional

        if not phone or not password or not name:
            return Response({"detail": "Required fields missing"}, status=400)

        if users_col.find_one({"phone": phone}):
            return Response({"detail": "Phone already registered"}, status=400)

        # --- Create new user ---
        user_doc = {
            "phone": phone,
            "email": email,
            "name": name,
            "password": hash_password(password),
            "points": 0,  # start with 0 points
            "created_at": datetime.utcnow(),
        }
        result = users_col.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # --- REFERRAL LOGIC ---
        if referral_code:
            try:
                referrer = users_col.find_one({"_id": ObjectId(referral_code)})
            except InvalidId:
                referrer = None

            if referrer and str(referrer["_id"]) != user_id:
                # Update points
                users_col.update_one(
                    {"_id": referrer["_id"]}, {"$inc": {"points": 4}}
                )
                users_col.update_one(
                    {"_id": ObjectId(user_id)}, {"$inc": {"points": 2}}
                )

                # Save referral record
                referrals_col.insert_one({
                    "referrer_id": str(referrer["_id"]),
                    "referred_user": {
                        "id": user_id,
                        "name": name,
                        "phone": phone,
                        "email": email,
                    },
                    "referrer_points": 4,
                    "referee_points": 2,
                    "created_at": datetime.utcnow(),
                })

        # --- Generate JWT tokens ---
        tokens = generate_tokens_for_user(user_id)
        user = users_col.find_one({"_id": ObjectId(user_id)})

        return Response({
            "user": {
                "id": user_id,
                "name": user["name"],
                "phone": user["phone"],
                "email": user.get("email"),
                "points": user.get("points", 0),
            },
            "tokens": tokens,
        }, status=201)


# ================== LOGIN ==================
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        if not phone or not password:
            return Response({"detail": "Phone and password required"}, status=400)

        user = users_col.find_one({"phone": phone})
        if not user or not verify_password(password, user["password"]):
            return Response({"detail": "Invalid credentials"}, status=401)

        tokens = generate_tokens_for_user(str(user["_id"]))

        return Response({
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "phone": user["phone"],
                "email": user.get("email"),
                "points": user.get("points", 0),
            },
            "tokens": tokens,
        })


# ================== PROFILE ==================
class ProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return Response({"detail": "Unauthorized"}, status=401)

        try:
            token = auth.replace("Bearer ", "")
            payload = decode_token(token)
            user = users_col.find_one({"_id": ObjectId(payload["user_id"])})
            if not user:
                return Response({"detail": "User not found"}, status=404)

            return Response({
                "id": str(user["_id"]),
                "name": user["name"],
                "phone": user["phone"],
                "email": user.get("email"),
                "points": user.get("points", 0),
                "referral_code": str(user["_id"]),
            })
        except Exception as e:
            print("PROFILE ERROR:", e)
            return Response({"detail": "Invalid token"}, status=401)


# ================== MY REFERRALS ==================
class MyReferralsView(APIView):
    def get(self, request):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return Response([], status=200)

        try:
            token = auth.replace("Bearer ", "")
            payload = decode_token(token)

            referrals = referrals_col.find({"referrer_id": payload["user_id"]})

            return Response([
                {
                    "id": str(r["_id"]),
                    "referee_name": r["referred_user"]["name"],
                    "referee_phone": r["referred_user"]["phone"],
                    "referrer_points": r["referrer_points"],
                    "referee_points": r["referee_points"],
                    "created_at": r["created_at"],
                }
                for r in referrals
            ], status=200)
        except Exception as e:
            print("REFERRAL ERROR:", e)
            return Response([], status=200)


# ================== LEADERBOARD ==================
class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = users_col.find().sort("points", -1).limit(50)

        return Response([
            {
                "id": str(u["_id"]),
                "name": u["name"],
                "points": u.get("points", 0),
            }
            for u in users
        ])
