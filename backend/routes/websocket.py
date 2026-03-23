"""
WebSocket endpoint — streams live robot state to all connected browser clients.
Polls RefreshFeedback() every 500 ms while at least one client is connected.
"""

import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from robot.session import robot
from routes.status import _ARM_STATE_MAP

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []
        self._poll_task: asyncio.Task | None = None

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        if self._poll_task is None or self._poll_task.done():
            self._poll_task = asyncio.create_task(self._poll_loop())

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)

    async def _poll_loop(self):
        loop = asyncio.get_running_loop()
        while self.active:
            if robot.connected:
                try:
                    arm_state = await loop.run_in_executor(None, robot.base.GetArmState)
                    raw_state = arm_state.active_state
                    status = _ARM_STATE_MAP.get(raw_state, "idle")

                    payload = {
                        "status": status,
                        "battery": 100,
                        "connection": "connected",
                        "currentTask": "Idle" if status == "idle" else "Running",
                    }
                except Exception as e:
                    payload = {
                        "status": "error",
                        "battery": 0,
                        "connection": "disconnected",
                        "currentTask": str(e),
                    }
            else:
                payload = {
                    "status": "idle",
                    "battery": 0,
                    "connection": "disconnected",
                    "currentTask": "Idle",
                }

            await self.broadcast(payload)
            await asyncio.sleep(0.5)

        self._poll_task = None


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep connection alive; browser can send pings
    except WebSocketDisconnect:
        manager.disconnect(ws)
