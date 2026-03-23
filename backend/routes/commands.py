import asyncio
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from robot.session import robot
import robot.commands as cmd

router = APIRouter()


class CommandType(str, Enum):
    MOVE_FORWARD  = "move_forward"
    MOVE_BACKWARD = "move_backward"
    MOVE_LEFT     = "move_left"
    MOVE_RIGHT    = "move_right"
    MOVE_UP       = "move_up"
    MOVE_DOWN     = "move_down"
    ROTATE_LEFT   = "rotate_left"
    ROTATE_RIGHT  = "rotate_right"
    STOP          = "stop"
    GO_HOME       = "go_home"
    GRIPPER_OPEN  = "gripper_open"
    GRIPPER_CLOSE = "gripper_close"


class CommandRequest(BaseModel):
    type: CommandType
    speed: float = Field(default=0.05, ge=0.0, le=0.5)  # m/s, capped for safety


# Maps command type to twist kwargs
_TWIST_MAP = {
    CommandType.MOVE_FORWARD:  dict(linear_x=1.0),
    CommandType.MOVE_BACKWARD: dict(linear_x=-1.0),
    CommandType.MOVE_LEFT:     dict(linear_y=1.0),
    CommandType.MOVE_RIGHT:    dict(linear_y=-1.0),
    CommandType.MOVE_UP:       dict(linear_z=1.0),
    CommandType.MOVE_DOWN:     dict(linear_z=-1.0),
    CommandType.ROTATE_LEFT:   dict(angular_z=1.0),
    CommandType.ROTATE_RIGHT:  dict(angular_z=-1.0),
}


@router.post("/api/command")
async def send_command(body: CommandRequest):
    if not robot.connected:
        raise HTTPException(status_code=503, detail="Robot not connected")

    loop = asyncio.get_event_loop()

    try:
        if body.type == CommandType.STOP:
            await loop.run_in_executor(None, cmd.stop)

        elif body.type == CommandType.GO_HOME:
            await loop.run_in_executor(None, cmd.go_home)

        elif body.type == CommandType.GRIPPER_OPEN:
            await loop.run_in_executor(None, cmd.gripper_command, 0.0)

        elif body.type == CommandType.GRIPPER_CLOSE:
            await loop.run_in_executor(None, cmd.gripper_command, 1.0)

        elif body.type in _TWIST_MAP:
            # Scale direction unit vector by requested speed
            unit = _TWIST_MAP[body.type]
            kwargs = {k: v * body.speed for k, v in unit.items()}
            await loop.run_in_executor(None, lambda: cmd.send_twist(**kwargs))

        else:
            raise HTTPException(status_code=400, detail=f"Unknown command: {body.type}")

        return {"ok": True, "command": body.type}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
