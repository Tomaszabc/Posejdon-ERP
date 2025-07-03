import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs
import unicodedata
database_sync_to_async = sync_to_async

# Mapowanie nazw pokoi: wyświetlana -> techniczna
ROOM_NAME_MAP = {
    "Ogólny": "General",
    "Biuro": "Office",
    "Magazyn": "Warehouse",
    "General": "General",
    "Office": "Office",
    "Warehouse": "Warehouse",
}

# Odwrotne mapowanie: techniczna -> wyświetlana
ROOM_DISPLAY_MAP = {
    "General": "Ogólny",
    "Office": "Biuro",
    "Warehouse": "Magazyn",
}

class WarehouseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("warehouse", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("warehouse", self.channel_name)

    async def warehouse_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Pobierz pokój z query stringa (domyślnie "Ogólny")
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        requested_room = params.get("room", ["Ogólny"])[0]
        # Zamień na nazwę techniczną do bazy
        room_db_name = ROOM_NAME_MAP.get(requested_room, "General")
        room_display_name = ROOM_DISPLAY_MAP.get(room_db_name, requested_room)
        # Zamień na ASCII dla Channels
        safe_room = unicodedata.normalize('NFKD', room_db_name).encode('ascii', 'ignore').decode('ascii')
        safe_room = ''.join(c if c.isalnum() or c in '-_.' else '_' for c in safe_room)
        if not safe_room:
            safe_room = "General"
        self.room_db_name = room_db_name
        self.room_display_name = room_display_name
        self.room_group_name = f"chat_{safe_room}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        user = self.scope["user"]
        if user.is_authenticated:
            from .models import ChatMessage

            def get_last_msgs():
                return list(
                    ChatMessage.objects.filter(chat_group=self.room_db_name)
                    .order_by("-timestamp")
                    .values_list("user__username", "message")[:30][::-1]
                )

            last_msgs = await database_sync_to_async(get_last_msgs)()
            for username, message in last_msgs:
                await self.send(text_data=json.dumps({
                    "type": "chat",
                    "username": username,
                    "message": message,
                }))
            await self.send(text_data=json.dumps({
                "type": "info",
                "message": f"{user.username} dołączył do pokoju {self.room_display_name}."
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        user = self.scope["user"]
        data = json.loads(text_data)
        message = data.get("message")
        if user.is_authenticated and message:
            from .models import ChatMessage
            await database_sync_to_async(ChatMessage.objects.create)(
                user=user, message=message, chat_group=self.room_db_name
            )
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "username": user.username,
                    "message": message,
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat",
            "username": event["username"],
            "message": event["message"],
        }))