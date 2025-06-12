from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path
from inventory.consumers import WarehouseConsumer

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # <-- DODAJ TO!
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/warehouse/", WarehouseConsumer.as_asgi()),
        ])
    ),
})