from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path
from inventory.consumers import ChatConsumer, WarehouseConsumer

# Dodaj import custom middleware
from warehouse_manager.middleware import JWTAuthMiddlewareStack


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddlewareStack(
        URLRouter([
            path("ws/warehouse/", WarehouseConsumer.as_asgi()),
            path("ws/chat/", ChatConsumer.as_asgi()),
        ])
    ),
})
