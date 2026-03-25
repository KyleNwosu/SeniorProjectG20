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
    MOVE_UP       = "move_up"
    MOVE_DOWN     = "move_down"
    ROTATE_LEFT   = "rotate_left"
    ROTATE_RIGHT  = "rotate_right"
    TILT_UP       = "tilt_up"
    TILT_DOWN     = "tilt_down"
    ROLL_LEFT     = "roll_left"
    ROLL_RIGHT    = "roll_right"
    STOP          = "stop"
    GO_HOME       = "go_home"
    GRIPPER_OPEN  = "gripper_open"
    GRIPPER_CLOSE = "gripper_close"


class CommandRequest(BaseModel):
    type: CommandType
    speed: float = Field(default=0.05, ge=0.0, le=0.5)  # m/s, capped for safety


# Maps command type to twist kwargs (unit vectors scaled by speed at dispatch)
_TWIST_MAP = {
    CommandType.MOVE_FORWARD:  dict(linear_x=1.0),
    CommandType.MOVE_BACKWARD: dict(linear_x=-1.0),
    CommandType.MOVE_UP:       dict(linear_z=1.0),
    CommandType.MOVE_DOWN:     dict(linear_z=-1.0),
    CommandType.ROTATE_LEFT:   dict(angular_z=1.0),
    CommandType.ROTATE_RIGHT:  dict(angular_z=-1.0),
    CommandType.TILT_UP:       dict(angular_y=1.0),
    CommandType.TILT_DOWN:     dict(angular_y=-1.0),
    CommandType.ROLL_LEFT:     dict(angular_x=1.0),
    CommandType.ROLL_RIGHT:    dict(angular_x=-1.0),
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
            unit = _TWIST_MAP[body.type]
            # Angular axes are in deg/s — needs a much larger scale than linear (m/s)
            kwargs = {
                k: v * (body.speed * 300 if k.startswith("angular") else body.speed)
                for k, v in unit.items()
            }
            await loop.run_in_executor(None, lambda: cmd.send_twist(**kwargs))

        else:
            raise HTTPException(status_code=400, detail=f"Unknown command: {body.type}")

        return {"ok": True, "command": body.type}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
