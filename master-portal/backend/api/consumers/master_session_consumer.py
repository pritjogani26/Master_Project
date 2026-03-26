import json
from urllib.parse import parse_qs


from api.db.master_session_db import is_master_session_active_db


class MasterSessionConsumer():
    async def connect(self):
        query_string = self.scope["query_string"].decode()
        params = parse_qs(query_string)

        master_user_id = params.get("master_user_id", [None])[0]
        session_token = params.get("session_token", [None])[0]

        if not master_user_id or not session_token:
            await self.close()
            return

        try:
            master_user_id = int(master_user_id)
        except ValueError:
            await self.close()
            return

        self.group_name = f"master_session_{session_token}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "connected",
            "message": "WebSocket connected",
        }))

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def force_logout(self, event):
        await self.send(text_data=json.dumps({
            "type": "force_logout",
            "message": "Master session logged out",
        }))