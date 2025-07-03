from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

class JWTAuthMiddleware:
    """
    Custom middleware that takes JWT token from query string (?token=...)
    and authenticates user for Channels.
    """
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return JWTAuthMiddlewareInstance(scope, self)

class JWTAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.scope = dict(scope)
        self.middleware = middleware

    async def __call__(self, receive, send):
        # Pobierz token z query stringa
        query_string = self.scope.get("query_string", b"").decode()
        token = None
        if query_string:
            params = parse_qs(query_string)
            token_list = params.get("token")
            if token_list:
                token = token_list[0]
        self.scope["user"] = await self.get_user(token)
        inner = self.middleware.inner(self.scope)
        return await inner(receive, send)

    @database_sync_to_async
    def get_user(self, token):
        if not token:
            return AnonymousUser()
        try:
            validated_token = UntypedToken(token)
            jwt_auth = JWTAuthentication()
            user = jwt_auth.get_user(validated_token)
            return user
        except Exception:
            return AnonymousUser()

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
