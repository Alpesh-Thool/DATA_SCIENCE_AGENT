"""
WebSocket routes — real-time communication for analysis progress and chat.
"""

import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        print(f"🔌 WebSocket connected: {session_id}")

    def disconnect(self, session_id: str):
        self.active_connections.pop(session_id, None)
        print(f"🔌 WebSocket disconnected: {session_id}")

    async def send_event(self, session_id: str, event: str, data: dict[str, Any]):
        """Send a typed event to a specific session."""
        ws = self.active_connections.get(session_id)
        if ws:
            await ws.send_json({"event": event, "data": data})

    async def broadcast(self, event: str, data: dict[str, Any]):
        """Broadcast an event to all connected clients."""
        message = json.dumps({"event": event, "data": data})
        for ws in self.active_connections.values():
            await ws.send_text(message)


# Singleton connection manager
ws_manager = ConnectionManager()


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time updates.

    Events (server → client):
        - analysis:progress  — step-by-step agent progress
        - analysis:result    — final analysis result
        - execution:output   — code execution output
        - chat:message       — AI chat responses

    Events (client → server):
        - chat:message       — user chat input
    """
    await ws_manager.connect(session_id, websocket)

    try:
        while True:
            # Listen for client messages
            raw = await websocket.receive_text()
            try:
                message = json.loads(raw)
                event = message.get("event", "")
                data = message.get("data", {})

                if event == "chat:message":
                    # Echo back for now — will be handled by agent in Phase 2
                    await ws_manager.send_event(
                        session_id,
                        "chat:message",
                        {
                            "role": "assistant",
                            "content": f"🤖 Agent not yet connected (Phase 2). "
                            f"You said: {data.get('content', '')}",
                        },
                    )
                elif event == "ping":
                    await ws_manager.send_event(session_id, "pong", {})

            except json.JSONDecodeError:
                await ws_manager.send_event(
                    session_id, "error", {"message": "Invalid JSON"}
                )

    except WebSocketDisconnect:
        ws_manager.disconnect(session_id)
