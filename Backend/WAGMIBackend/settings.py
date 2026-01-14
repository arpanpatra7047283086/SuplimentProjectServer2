"""
Django settings for WAGMI-Backend project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv()

# ======================
# CORE SECURITY
# ======================

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-dev-key")

DEBUG = True   # ✅ MUST be False on Render

ALLOWED_HOSTS = [
    "suplimentproject.onrender.com",
    "localhost",
    "127.0.0.1",
]

# ======================
# APPLICATIONS
# ======================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third-party
    "corsheaders",
    "rest_framework",

    # local apps
    "WAGMIBackend",
    "accounts",
    "authapp",
]

# ======================
# MIDDLEWARE (ORDER MATTERS)
# ======================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",

    # 🔥 CORS MUST BE FIRST
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ======================
# URL / WSGI
# ======================

ROOT_URLCONF = "WAGMIBackend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "WAGMIBackend.wsgi.application"

# ======================
# DATABASE
# ======================
# ⚠️ SQLite WILL RESET on Render restart
# For now keeping it, but production should use PostgreSQL

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ======================
# INTERNATIONALIZATION
# ======================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ======================
# STATIC & MEDIA
# ======================

STATIC_URL = "/static/"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ======================
# CORS CONFIG (VERY IMPORTANT)
# ======================

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    # local
    "http://localhost:3000",

    # production frontend
    "https://supliment-project.vercel.app",
]

CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
    "x-csrftoken",
    "accept",
    "origin",
    "user-agent",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

# ❌ DO NOT USE THIS WITH COOKIES
# CORS_ALLOW_ALL_ORIGINS = True

# ======================
# CSRF CONFIG (THIS FIXES 403)
# ======================

CSRF_TRUSTED_ORIGINS = [
    "https://supliment-project.vercel.app",
    "http://localhost:3000",
]


CSRF_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "None"

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "None"

# ======================
# DJANGO REST + JWT
# ======================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "WAGMIBackend.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# ======================
# EMAIL
# ======================

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
