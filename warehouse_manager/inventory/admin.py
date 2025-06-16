from django.contrib import admin
from .models import Product
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

admin.site.register(Product)
