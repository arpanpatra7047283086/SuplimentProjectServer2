from django.urls import path
from .views import login_user
from .views import logout
from . import views




from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView
)

urlpatterns = [
    path('signup/', views.signup, name="signup"),
    path('login/', views.login_user, name="login_user"),
    path('admin-login/', views.admin_login, name='admin_login'),
    path('me/', views.current_user, name='current_user'), 
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', views.token_refresh, name='token_refresh'), 

]