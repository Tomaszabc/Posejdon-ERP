import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "tu_wklej_swoj_super_tajny_klucz")
DEBUG = os.getenv("DEBUG") == "True"
DEBUG = True
ALLOWED_HOSTS = ['localhost', "posejdon.fly.dev", "127.0.0.1", "192.168.55.75", "192.168.55.128"]
HEADLESS_ONLY = True

HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "http://localhost:3000",
    "account_reset_password_from_key": "http://localhost:3000",
    "account_signup": "http://localhost:3000",
    "socialaccount_login_error": "http://localhost:3000",
}

CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "http://192.168.55.75:3000", "http://192.168.55.128:3000"]  # lub Twój port

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  "http://192.168.55.75:3000", "http://192.168.55.128:3000"  # jeśli React działa lokalnie
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
OLD_PASSWORD_FIELD_ENABLED = True

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

JAZZMIN_SETTINGS = {
    "site_title": "E-Posejdon– Panel administracyjny",
    "site_header": "E-Posejdon– Panel administracyjny",
    "site_brand": "E-Posejdon",
    "welcome_sign": "Witaj w panelu E-Posejdon",
    
    "show_ui_builder": False,
    "show_sidebar": True,
    "navigation_expanded": True,

    # USUŃ LOGO
    "site_logo": None,
    "site_logo_classes": None,
    "site_icon": None,

    # POPRAWKA: Usuń duplikaty i ustaw jeden custom_css
    "custom_css": "css/custom-admin.css",
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {"auth.user": "collapsible", "auth.group": "vertical_tabs"},
    
    "show_recent_actions": True,
    "admin_name": "E-Posejdon",
    "language_chooser": False,
    
    # POPRAWKA: Ukryj auth aplikację całkowicie
    "hide_apps": [
        # "auth",              # Ukryj całą sekcję uwierzytelniania
        "account",           # Ukryj konta allauth
        "socialaccount",
        "authtoken",
        "sites",
    ],
    
    # POPRAWKA: Ukryj wszystkie modele auth
    "hide_models": [
        # "auth.user",
        "auth.group",
        "account.emailaddress",
        "account.emailconfirmation", 
        "socialaccount.socialaccount",
        "socialaccount.socialapp", 
        "socialaccount.socialtoken",
        "authtoken.token",
        "sites.site",
    ],
    
    # POPRAWKA: Usuń permissions z topmenu_links
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index"},
 
    ],
    
    # POPRAWKA: Zostaw tylko inventory
    "order_with_respect_to": ["inventory"],
    
    # POPRAWKA: Ikony tylko dla inventory
    "icons": {
        "inventory": "fas fa-boxes",
        "inventory.component": "fas fa-cube",
        "inventory.order": "fas fa-shopping-cart",
        "inventory.producttoproduction": "fas fa-tasks",
        "inventory.partsbuilder": "fas fa-cogs",
    },
    
    # POPRAWKA: Usuń custom_links z nieistniejącymi modelami
    "custom_links": {},
    
    "site_logo": None,
    "site_logo_classes": "img-circle", 
    "site_icon": None,
    "user_avatar": None,
    "show_footer": False,
    "show_powered_by": False,
    "show_jazzmin_version": False,
}

# Dodaj konfigurację UI
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-primary",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}