"""
ASGI config for warehouse_manager project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/stable/howto/deployment/asgi/
"""

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "warehouse_manager.settings")
from warehouse_manager.routing import application
from django.core.asgi import get_asgi_application
from channels.routing import get_default_application



django_asgi_app = get_asgi_application()

import warehouse_manager.routing

application = warehouse_manager.routing.application