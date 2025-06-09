from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers
from .views import OrderViewSet, production_orders, produce_order, undo_produce_order
from .views import ComponentListCreateView
from .views import ComponentDetailView
from .views import import_components_csv
from .views import diffusor_types_list
from .views import components_for_order
from .views import ProductToProductionListCreateView
from .views import delete_product_to_production





router = routers.DefaultRouter()
router.register(r'orders', OrderViewSet)

app_name = "inventory"

urlpatterns = [
    path("", views.index, name="index"),
    path("product-order/", views.product_order, name="product_order"),
    path("user/", views.user_profile, name="user_profile"),
    path("order/delete/<int:order_id>/", views.delete_order, name="delete_order"),
    path("product-production/", views.product_production, name="product_production"),
    path('api/', include(router.urls)),
    path('api/production/orders/', production_orders),
    path('api/production/produce/', produce_order, name='produce_order'),
    path('api/production/undo/', undo_produce_order, name='undo_produce_order'),
    path("api/components/", ComponentListCreateView.as_view(), name="component-list-create"),
    path("api/components/<int:pk>/", ComponentDetailView.as_view(), name="component-detail"),
    path("api/components/import/", import_components_csv, name="component-import"),
    path('diffusor-types/', diffusor_types_list),
    path('api/components-for-order/', components_for_order),
    path('api/product-to-production/', ProductToProductionListCreateView.as_view(), name='product-to-production-list-create'),
    path('api/product-to-production/<int:pk>/', delete_product_to_production, name='delete-product-to-production'),


    
    # Dodaj inne widoki jeśli są potrzebne:
    # path('products/', views.products, name='products'),
    # path('categories/', views.categories, name='categories'),
    # path('reports/', views.reports, name='reports'),
    # path('settings/', views.settings, name='settings'),
]
