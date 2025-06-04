from django.contrib import admin
from django.urls import path, include
from . import views

app_name = "inventory"

urlpatterns = [
    path("", views.index, name="index"),
    path("product-order/", views.product_order, name="product_order"),
    path("user/", views.user_profile, name="user_profile"),
    path("order/delete/<int:order_id>/", views.delete_order, name="delete_order"),
    path("product-production/", views.product_production, name="product_production"),
    # Dodaj inne widoki jeśli są potrzebne:
    # path('products/', views.products, name='products'),
    # path('categories/', views.categories, name='categories'),
    # path('reports/', views.reports, name='reports'),
    # path('settings/', views.settings, name='settings'),
]
