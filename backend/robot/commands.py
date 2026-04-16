"""
Low-level helpers that translate frontend command types into Kortex API calls.
All functions are synchronous — run them in a thread pool from async routes.
"""

from kortex_api.autogen.messages import Base_pb2

from robot.session import robot


# ── Direct control ────────────────────────────────────────────────────────────

def send_twist(linear_x=0.0, linear_y=0.0, linear_z=0.0,
               angular_x=0.0, angular_y=0.0, angular_z=0.0):
    """Send a Cartesian velocity command. Call with all zeros (or stop()) to halt."""
    command = Base_pb2.TwistCommand()
    command.reference_frame = Base_pb2.CARTESIAN_REFERENCE_FRAME_MIXED
    command.duration = 0  # 0 = run until next command

    command.twist.linear_x  = linear_x
    command.twist.linear_y  = linear_y
    command.twist.linear_z  = linear_z
    command.twist.angular_x = angular_x
    command.twist.angular_y = angular_y
    command.twist.angular_z = angular_z

    robot.base.SendTwistCommand(command)


def stop():
    """Immediately stop all motion."""
    robot.base.Stop()


def _supported_action_types() -> list[tuple[int, str]]:
    """
    Return action categories we can enumerate from Kortex.
    We probe attributes defensively because enum availability can vary by SDK build.
    """
    out: list[tuple[int, str]] = []

    if hasattr(Base_pb2, "REACH_JOINT_ANGLES"):
        out.append((Base_pb2.REACH_JOINT_ANGLES, "REACH_JOINT_ANGLES"))
    if hasattr(Base_pb2, "REACH_POSE"):
        out.append((Base_pb2.REACH_POSE, "REACH_POSE"))
    if hasattr(Base_pb2, "SEND_GRIPPER_COMMAND"):
        out.append((Base_pb2.SEND_GRIPPER_COMMAND, "SEND_GRIPPER_COMMAND"))

    return out


def list_saved_actions() -> list[dict]:
    """List saved actions visible to the current session."""
    actions: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for action_type_value, action_type_name in _supported_action_types():
        req = Base_pb2.RequestedActionType()
        req.action_type = action_type_value
        action_list = robot.base.ReadAllActions(req)

        for action in action_list.action_list:
            key = (action.name, action_type_name)
            if key in seen:
                continue
            seen.add(key)

            actions.append(
                {
                    "name": action.name,
                    "category": action_type_name,
                    "handle_identifier": int(getattr(action.handle, "identifier", 0)),
                }
            )

    actions.sort(key=lambda a: (a["name"].lower(), a["category"]))
    return actions


def execute_saved_action(action_name: str):
    """
    Execute a saved action by name (case-insensitive) across supported categories.
    Raises ValueError if not found.
    """
    for action_type_value, _ in _supported_action_types():
        req = Base_pb2.RequestedActionType()
        req.action_type = action_type_value
        action_list = robot.base.ReadAllActions(req)
        handle = next(
            (a.handle for a in action_list.action_list if a.name.lower() == action_name.lower()),
            None,
        )
        if handle is not None:
            robot.base.ExecuteActionFromReference(handle)
            return

    raise ValueError(f"No '{action_name}' action found on the robot.")


def go_home():
    """Execute the pre-programmed 'Home' action stored on the robot."""
    execute_saved_action("Home")


def rotate_base(speed: float):
    """
    Rotate around world Z axis (= J1/base joint) by using the BASE reference frame
    so angular_z is in world space, not end-effector space.
    speed: deg/s, positive = CCW, negative = CW
    """
    command = Base_pb2.TwistCommand()
    command.reference_frame = Base_pb2.CARTESIAN_REFERENCE_FRAME_BASE
    command.duration = 0
    command.twist.angular_z = speed
    robot.base.SendTwistCommand(command)


def gripper_command(value: float):
    """
    Open or close the gripper.
    value: 0.0 = fully open, 1.0 = fully closed
    """
    gripper_command = Base_pb2.GripperCommand()
    gripper_command.mode = Base_pb2.GRIPPER_POSITION

    finger = gripper_command.gripper.finger.add()
    finger.finger_identifier = 1
    finger.value = max(0.0, min(1.0, value))

    robot.base.SendGripperCommand(gripper_command)


# ── Sequence execution ────────────────────────────────────────────────────────

SPEED         = 0.05   # m/s for linear moves
ANGULAR_SPEED = 15.0   # deg/s for rotational moves

DURATION_TO_TWIST_MAP = {
    "move_forward":  dict(linear_x=SPEED),
    "move_backward": dict(linear_x=-SPEED),
    "move_up":       dict(linear_z=SPEED),
    "move_down":     dict(linear_z=-SPEED),
    "rotate_left":   dict(angular_z=ANGULAR_SPEED),
    "rotate_right":  dict(angular_z=-ANGULAR_SPEED),
    "tilt_up":       dict(angular_y=ANGULAR_SPEED),
    "tilt_down":     dict(angular_y=-ANGULAR_SPEED),
    "roll_left":     dict(angular_x=ANGULAR_SPEED),
    "roll_right":    dict(angular_x=-ANGULAR_SPEED),
}


def execute_sequence(tasks: list[dict]):
    """
    Execute a list of task dicts from TaskBuilder.
    Each task: { "action": str, "duration": float }
    Blocks until the full sequence is complete.
    """
    import time

    for task in tasks:
        action  = task["action"]
        duration = float(task["duration"])

        if action == "wait":
            time.sleep(duration)

        elif action == "go_home":
            go_home()
            time.sleep(duration)

        elif action == "gripper_open":
            gripper_command(0.0)
            time.sleep(duration)

        elif action == "gripper_close":
            gripper_command(1.0)
            time.sleep(duration)

        elif action in DURATION_TO_TWIST_MAP:
            kwargs = DURATION_TO_TWIST_MAP[action]
            send_twist(**kwargs)
            time.sleep(duration)
            stop()
            time.sleep(0.2)  # brief settle between steps

        else:
            print(f"[Robot] Unknown action '{action}', skipping.")
