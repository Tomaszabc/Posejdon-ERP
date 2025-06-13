import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "tu_wklej_swoj_super_tajny_klucz")
DEBUG = os.getenv("DEBUG") == "True"
DEBUG = True
ALLOWED_HOSTS = ['localhost', "posejdon.fly.dev", "127.0.0.1"]
HEADLESS_ONLY = True

HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "http://localhost:3000",
    "account_reset_password_from_key": "http://localhost:3000",
    "account_signup": "http://localhost:3000",
    "socialaccount_login_error": "http://localhost:3000",
}

CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]  # lub Twój port

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # jeśli React działa lokalnie
    # Dodaj tu inne domeny frontendu, jeśli masz (np. produkcyjne)
]

CORS_ALLOW_CREDENTIALS = True

# --------------------------------------
# 1) Dodaj django.contrib.sites i allauth
INSTALLED_APPS = [
    "corsheaders",
    # domyślne Django:
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # potrzebne dla allauth:
    "django.contrib.sites",
    # Twoje appki:
    "inventory",
    # allauth:
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    # dopisz tu providerów, np.:
    # 'allauth.socialaccount.providers.google',
    "crispy_forms",
    "crispy_bootstrap5",
    'rest_framework',
    "dj_rest_auth",
    'rest_framework.authtoken',
    'channels',
    
]
# --------------------------------------

SITE_ID = 1

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # allauth middleware (opcjonalne, ale zalecane)
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "warehouse_manager.urls"

# --------------------------------------
# 2) Ustaw TEMPLATES z request context
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",  # <-- konieczne dla allauth
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
# --------------------------------------

WSGI_APPLICATION = "warehouse_manager.wsgi.application"
ASGI_APPLICATION = "warehouse_manager.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "cyfryzacja_db"),
        "USER": os.getenv("DB_USER", "posejdonkoks"),
        "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    }
# }

# --------------------------------------
# 3) Dodaj.backends, by allauth brał udział w auth
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",  # Django admin
    "allauth.account.auth_backends.AuthenticationBackend",  # allauth
]
# --------------------------------------

# przekierowania po login/logout
LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

LANGUAGE_CODE = "pl"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CRISPY_TEMPLATE_PACK = "bootstrap5"
CRISPY_ALLOWED_TEMPLATE_PACKS = ["bootstrap5"]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

REST_USE_JWT = True

SIMPLE_JWT = {
    "AUTH_HEADER_TYPES": ("Bearer",),
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=10),  # np. 2 godziny
    "REFRESH_TOKEN_LIFETIME": timedelta(days=20),  # np. 7 dni
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",  # do testów, do produkcji użyj Redis
    },
}