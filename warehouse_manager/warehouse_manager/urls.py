from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

app_name = "inventory"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("inventory.urls")),
    path("accounts/", include("allauth.urls")),
    path("admin/", admin.site.urls),
    path("grappelli/", include("grappelli.urls")),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

admin.site.site_header = "E-Posejdon ERP – Panel administracyjny"
admin.site.site_title = "E-Posejdon ERP Admin"
admin.site.index_title = "Administracja stroną"
