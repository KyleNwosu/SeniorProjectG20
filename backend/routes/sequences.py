import asyncio
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from robot.session import robot
import robot.commands as cmd

router = APIRouter()


class TaskAction(str, Enum):
    MOVE_FORWARD  = "move_forward"
    MOVE_BACKWARD = "move_backward"
    MOVE_UP       = "move_up"
    MOVE_DOWN     = "move_down"
    ROTATE_LEFT   = "rotate_left"
    ROTATE_RIGHT  = "rotate_right"
    TILT_UP       = "tilt_up"
    TILT_DOWN     = "tilt_down"
    ROLL_LEFT     = "roll_left"
    ROLL_RIGHT    = "roll_right"
    GO_HOME       = "go_home"
    GRIPPER_OPEN  = "gripper_open"
    GRIPPER_CLOSE = "gripper_close"
    WAIT          = "wait"


class TaskItem(BaseModel):
    action: TaskAction
    duration: float = Field(ge=0.1, le=300.0)  # seconds, 0.1–300


class SequenceRequest(BaseModel):
    tasks: list[TaskItem] = Field(min_length=1)


@router.post("/api/sequence")
async def execute_sequence(body: SequenceRequest):
    if not robot.connected:
        raise HTTPException(status_code=503, detail="Robot not connected")

    tasks_dicts = [{"action": t.action, "duration": t.duration} for t in body.tasks]

    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, cmd.execute_sequence, tasks_dicts)
        return {"ok": True, "steps_executed": len(body.tasks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
