from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT auth to read access token from cookie
    """
    def authenticate(self, request):
        #print("Navigation comming for auth..")

        access_token = request.COOKIES.get("access")
        #print("Acess token for cokies:", access_token)
        raw_token = request.COOKIES.get('access')  
        if not raw_token:
            return None 

        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed("Invalid or expired token")

        return self.get_user(validated_token), validated_token
