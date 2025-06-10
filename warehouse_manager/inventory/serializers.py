from rest_framework import serializers
from .models import Order, Component, DiffusorType, ProductToProduction, Merchandise




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

    class Meta:
        model = ProductToProduction
        fields = ['id', 'component', 'component_full_name', 'component_catalog_index', 'quantity', 'created_at', 'is_produced', 'produced_at']

class MerchandiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchandise
        fields = '__all__'