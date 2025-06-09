from rest_framework import serializers
from .models import Order, Component, DiffusorType




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