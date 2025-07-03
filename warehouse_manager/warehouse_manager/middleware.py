from urllib.parse import parse_qs
from channels.db import database_sync_to_async

class JWTAuthMiddleware:
    """
    Custom middleware that takes JWT token from query string (?token=...)
    and authenticates user for Channels.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        instance = JWTAuthMiddlewareInstance(scope, self)
        return await instance(receive, send)

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
        from channels.auth import AuthMiddlewareStack
        # Poprawka: wywołaj inner jako ASGI app
        return await self.middleware.inner(self.scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        # Importy Django TYLKO tutaj!
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.authentication import JWTAuthentication
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
    from channels.auth import AuthMiddlewareStack
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
