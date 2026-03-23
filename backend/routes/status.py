from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from robot.session import robot

router = APIRouter()


class RobotStatusResponse(BaseModel):
    status: str
    battery: int
    connection: str
    currentTask: str


# Maps Kortex ArmState integer values to frontend status strings
_ARM_STATE_MAP = {
    0: "idle",    # ARMSTATE_UNSPECIFIED
    1: "idle",    # ARMSTATE_INITIALIZATION
    2: "idle",    # ARMSTATE_SERVOING_READY
    3: "active",  # ARMSTATE_REFER_TO_SUB_FUNCTION_STATE
    4: "active",  # ARMSTATE_SERVOING_LOW_LEVEL
    5: "active",  # ARMSTATE_SERVOING_HIGH_LEVEL (if present)
    6: "error",   # ARMSTATE_IN_FAULT
    7: "idle",    # ARMSTATE_MAINTENANCE
}


@router.get("/api/status", response_model=RobotStatusResponse)
def get_status():
    if not robot.connected:
        raise HTTPException(status_code=503, detail="Robot not connected")

    try:
        feedback = robot.base_cyclic.RefreshFeedback()
        arm_state = robot.base.GetArmState()

        raw_state = arm_state.active_state
        status = _ARM_STATE_MAP.get(raw_state, "idle")

        # Battery is not exposed in the standard Kortex v2 API.
        # Replace with a real DeviceConfig call if your firmware supports it.
        battery = 100

        return RobotStatusResponse(
            status=status,
            battery=battery,
            connection="connected",
            currentTask="Idle" if status == "idle" else "Running",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
