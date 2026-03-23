import type { CommandType, RobotCommand, RobotOperationalStatus } from "@/types";

export interface ControlCommandConfig {
  type: CommandType;
  label: string;
  status?: RobotOperationalStatus;
}

export const TASK_ACTION_LABELS: Record<RobotCommand, string> = {
  move_forward: "Move Forward",
  move_backward: "Move Backward",
  turn_left: "Turn Left",
  turn_right: "Turn Right",
  move_up: "Move Up",
  move_down: "Move Down",
  go_home: "Go Home",
  gripper_open: "Open Gripper",
  gripper_close: "Close Gripper",
  wait: "Wait",
};

export const CONTROL_COMMANDS = {
  moveForward: { type: "move_forward", label: "Moving Forward" },
  rotateLeft: { type: "rotate_left", label: "Rotating Left" },
  stop: { type: "stop", label: "Stopped", status: "stopped" },
  rotateRight: { type: "rotate_right", label: "Rotating Right" },
  moveBackward: { type: "move_backward", label: "Moving Backward" },
  moveUp: { type: "move_up", label: "Moving Up" },
  moveDown: { type: "move_down", label: "Moving Down" },
  goHome: { type: "go_home", label: "Going Home", status: "active" },
  gripperOpen: { type: "gripper_open", label: "Gripper Open" },
  gripperClose: { type: "gripper_close", label: "Gripper Close" },
} as const satisfies Record<string, ControlCommandConfig>;
