import asyncio

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from robot.session import robot
import robot.commands as cmd

router = APIRouter()


class ExecuteActionRequest(BaseModel):
    name: str = Field(min_length=1, max_length=128)


@router.get("/api/actions")
async def list_actions():
    if not robot.connected:
        raise HTTPException(status_code=503, detail="Robot not connected")

    loop = asyncio.get_event_loop()
    try:
        actions = await loop.run_in_executor(None, cmd.list_saved_actions)
        return {"actions": actions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/actions/execute")
async def execute_action(body: ExecuteActionRequest):
    if not robot.connected:
        raise HTTPException(status_code=503, detail="Robot not connected")

    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, cmd.execute_saved_action, body.name)
        return {"ok": True, "action": body.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
