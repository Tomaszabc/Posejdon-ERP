from rest_framework import serializers
from .models import Order, Component, DiffusorType, ProductToProduction,  PartsBuilder

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = '__all__'

class DiffusorTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiffusorType
        fields = '__all__'

class ProductToProductionSerializer(serializers.ModelSerializer):
    component_full_name = serializers.CharField(source='component.full_name', read_only=True)
    component_catalog_index = serializers.CharField(source='component.catalog_index', read_only=True)
    component_r = serializers.CharField(source='component.r', read_only=True)

    class Meta:
        model = ProductToProduction
        fields = [
            'id', 'component', 'quantity', 'created_at', 'is_produced',
            'component_catalog_index', 'component_full_name', 'component_r', 'uwagi', 'pilne'
        ]


class PartsBuilderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.full_name', read_only=True)
    material_r = serializers.CharField(source='material.r', read_only=True)
    product_sku = serializers.CharField(source='product.catalog_index', read_only=True)
    material_name = serializers.CharField(source='material.full_name', read_only=True)
    material_unit = serializers.CharField(source='material.unit', read_only=True)
    material_price = serializers.DecimalField(source='material.purchase_price_net', max_digits=10, decimal_places=2, read_only=True)
    material_stock = serializers.DecimalField(source='material.stock', max_digits=10, decimal_places=3, read_only=True)
    total_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = PartsBuilder
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'material', 'material_name', 'material_unit', 'material_price', 'material_stock', 'material_r',
            'quantity_needed', 'total_cost', 'notes', 'created_at', 'updated_at'
        ]
        
    def get_total_cost(self, obj):
        return obj.total_cost()