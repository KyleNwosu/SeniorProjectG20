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


def go_home():
    """Execute the pre-programmed 'Home' action stored on the robot."""
    action_type = Base_pb2.RequestedActionType()
    action_type.action_type = Base_pb2.REACH_JOINT_ANGLES

    action_list = robot.base.ReadAllActions(action_type)
    home_handle = next(
        (a.handle for a in action_list.action_list if a.name.lower() == "home"),
        None,
    )
    if home_handle is None:
        raise ValueError("No 'Home' action found on the robot.")
    robot.base.ExecuteActionFromReference(home_handle)


def rotate_base(speed: float):
    """
    Rotate J1 (base joint) using joint-speed control.
    speed: positive = CCW, negative = CW (deg/s)
    """
    joint_speeds = Base_pb2.JointSpeeds()
    joint_speed  = joint_speeds.joint_speeds.add()
    joint_speed.joint_identifier = 0   # J1 is index 0
    joint_speed.value             = speed
    joint_speed.duration          = 0
    robot.base.SendJointSpeedsCommand(joint_speeds)


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
