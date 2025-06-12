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