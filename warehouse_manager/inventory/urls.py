from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers
from .views import (
    OrderViewSet, production_orders, produce_order, undo_produce_order,
    ComponentListCreateView, ComponentDetailView, import_components_csv,
    diffusor_types_list, components_for_order, ProductToProductionListCreateView,
    delete_product_to_production, import_merchandise_csv, MerchandiseViewSet
)

router = routers.DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'merchandise', MerchandiseViewSet, basename='merchandise')


app_name = "inventory"

urlpatterns = [
    path("", views.index, name="index"),
    path("product-order/", views.product_order, name="product_order"),
    path("user/", views.user_profile, name="user_profile"),
    path("order/delete/<int:order_id>/", views.delete_order, name="delete_order"),
    path("product-production/", views.product_production, name="product_production"),
    
    # Najpierw specyficzne ścieżki PRZED include(router.urls)
    path('api/production/orders/', production_orders),
    path('api/production/produce/', produce_order, name='produce_order'),
    path('api/production/undo/', undo_produce_order, name='undo_produce_order'),
    path("api/components/", ComponentListCreateView.as_view(), name="component-list-create"),
    path("api/components/<int:pk>/", ComponentDetailView.as_view(), name="component-detail"),
    path("api/components/import/", import_components_csv, name="component-import"),
    path('api/components-for-order/', components_for_order),
    path('api/product-to-production/', ProductToProductionListCreateView.as_view(), name='product-to-production-list-create'),
    path('api/product-to-production/<int:pk>/', delete_product_to_production, name='delete-product-to-production'),
    path('api/production/produce/<int:order_id>/', views.produce_product_to_production, name='produce_product_to_production'),
    path('api/production/undo/<int:order_id>/', views.undo_product_to_production, name='undo_product_to_production'),
    path("api/merchandise/import/", import_merchandise_csv, name="merchandise-import"),
    path('diffusor-types/', diffusor_types_list),
    
    # Router na końcu (będzie obsługiwał pozostałe ścieżki)
    path('api/', include(router.urls)),
]