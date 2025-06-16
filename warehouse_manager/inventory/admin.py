from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Component, Product  # Dodaj Product tutaj



@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Component._meta.fields]
    search_fields = ["full_name", "catalog_index", "short_name"]
    list_filter = ["r", "unit", "producer"]