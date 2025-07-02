import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
database_sync_to_async = sync_to_async

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
        self.room_group_name = "global_chat"
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
                    ChatMessage.objects.order_by("-timestamp").values_list("user__username", "message")[:30][::-1]
                )

            last_msgs = await database_sync_to_async(get_last_msgs)()
            for username, message in last_msgs:
                await self.send(text_data=json.dumps({
                    "type": "chat",
                    "username": username,
                    "message": message,
                }))
            await self.send(text_data=json.dumps({"type": "info", "message": f"{user.username} dołączył do czatu."}))

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
            # Import modelu tutaj!
            from .models import ChatMessage
            await database_sync_to_async(ChatMessage.objects.create)(
                user=user, message=message
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