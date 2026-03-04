"""Accounts app URL configuration."""
from django.urls import path

from . import viewsAdmin

urlpatterns = [
    #path("wake-up/", viewsAdmin.wake_up, name="wake_up"),  

    # Auth
    path('auth/login/', viewsAdmin.LoginView.as_view(), name='login'),
    path('auth/me/', viewsAdmin.MeView.as_view(), name='me'),

    # Dashboard
    path('dashboard/', viewsAdmin.DashboardView.as_view(), name='dashboard'),

    # Users
    path('users/', viewsAdmin.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<str:pk>/', viewsAdmin.UserDetailView.as_view(), name='user-detail'),
    path('users/<str:pk>/addresses/', viewsAdmin.UserAddressView.as_view(), name='user-addresses'),

    # Referrals
    path('referrals/', viewsAdmin.ReferralListCreateView.as_view(), name='referral-list-create'),
    path('referrals/<str:pk>/', viewsAdmin.ReferralDetailView.as_view(), name='referral-detail'),

    # Orders
    path('orders/', viewsAdmin.OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<str:pk>/', viewsAdmin.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<str:pk>/status/', viewsAdmin.OrderStatusView.as_view(), name='order-status'),

    # Products
    path('products/', viewsAdmin.ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<str:pk>/', viewsAdmin.ProductDetailView.as_view(), name='product-detail'),          
]
