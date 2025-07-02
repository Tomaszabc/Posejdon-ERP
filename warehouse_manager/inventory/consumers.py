import json
from channels.generic.websocket import AsyncWebsocketConsumer

class WarehouseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Dołącz do grupy "warehouse"
        await self.channel_layer.group_add("warehouse", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Opuść grupę "warehouse"
        await self.channel_layer.group_discard("warehouse", self.channel_name)

    # Odbierz event od grupy i wyślij do klienta
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