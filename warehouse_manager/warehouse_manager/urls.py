from django.contrib import admin
from django.urls import path, include


app_name = "inventory"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("inventory.urls")),
    path("accounts/", include("allauth.urls")),
    path("admin/", admin.site.urls),
    path("grappelli/", include("grappelli.urls")),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
]

admin.site.site_header = "E-Posejdon ERP – Panel administracyjny"
admin.site.site_title = "E-Posejdon ERP Admin"
admin.site.index_title = "Administracja stroną"
