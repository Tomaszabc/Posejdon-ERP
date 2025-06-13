from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers
from .views import (
    OrderViewSet, production_orders, produce_order, undo_produce_order,
    ComponentListCreateView, ComponentDetailView, import_components_csv,
    diffusor_types_list, components_for_order, ProductToProductionListCreateView,
     components_towar, check_materials_availability, ProductToProductionDetailView
)
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'orders', OrderViewSet)

router.register(r'parts-builder', views.PartsBuilderViewSet)

app_name = "inventory"

urlpatterns = [
    path("", views.index, name="index"),
    path("product-order/", views.product_order, name="product_order"),
    path("user/", views.user_profile, name="user_profile"),
    path("order/delete/<int:order_id>/", views.delete_order, name="delete_order"),
    path("product-production/", views.product_production, name="product_production"),
    
    # API endpoints
    path('api/production/orders/', production_orders),
    path('api/production/produce/', produce_order, name='produce_order'),
    path('api/production/undo/', undo_produce_order, name='undo_produce_order'),
    path("api/components/", ComponentListCreateView.as_view(), name="component-list-create"),
    path("api/components/<int:pk>/", ComponentDetailView.as_view(), name="component-detail"),
    path("api/components/import/", import_components_csv, name="component-import"),
    path('api/components-for-order/', components_for_order),
    path('api/materials-for-parts/', views.materials_for_parts, name='materials_for_parts'),
    path('api/product-recipe/<int:product_id>/', views.product_recipe, name='product_recipe'),
    path('api/calculate-production-needs/', views.calculate_production_needs, name='calculate_production_needs'),
    path('api/product-to-production/', ProductToProductionListCreateView.as_view(), name='product-to-production-list-create'),
    path('api/product-to-production/<int:pk>/', ProductToProductionDetailView.as_view()),
    path('api/production/produce/<int:order_id>/', views.produce_product_to_production, name='produce_product_to_production'),
    path('api/production/undo/<int:order_id>/', views.undo_product_to_production, name='undo_product_to_production'),
    path('api/product-parts/<int:component_id>/', views.product_parts),
   
    path('diffusor-types/', diffusor_types_list),
    path('api/components-towar/', components_towar, name='components-towar'),
    path('api/check-materials-availability/', check_materials_availability),
    
    
    # Router na końcu (obsługuje pozostałe ścieżki w tym parts-builder/)
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)