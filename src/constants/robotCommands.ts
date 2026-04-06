import type { CommandType, RobotCommand, RobotOperationalStatus } from "@/types";

export interface ControlCommandConfig {
  type: CommandType;
  label: string;
  status?: RobotOperationalStatus;
}

export const TASK_ACTION_LABELS: Record<RobotCommand, string> = {
  move_forward:  "Move Forward",
  move_backward: "Move Backward",
  move_up:       "Move Up",
  move_down:     "Move Down",
  rotate_left:   "Rotate Left (Base)",
  rotate_right:  "Rotate Right (Base)",
  tilt_up:       "Tilt Up (Wrist)",
  tilt_down:     "Tilt Down (Wrist)",
  roll_left:     "Roll Left (Wrist)",
  roll_right:    "Roll Right (Wrist)",
  go_home:       "Go Home",
  gripper_open:  "Open Gripper",
  gripper_close: "Close Gripper",
  wait:          "Wait",
};

export const CONTROL_COMMANDS = {
  moveForward:  { type: "move_forward",  label: "Moving Forward"  },
  moveBackward: { type: "move_backward", label: "Moving Backward" },
  moveUp:       { type: "move_up",       label: "Moving Up"       },
  moveDown:     { type: "move_down",     label: "Moving Down"     },
  rotateLeft:   { type: "rotate_left",   label: "Rotating Left"   },
  rotateRight:  { type: "rotate_right",  label: "Rotating Right"  },
  tiltUp:       { type: "tilt_up",       label: "Tilting Up"      },
  tiltDown:     { type: "tilt_down",     label: "Tilting Down"    },
  rollLeft:     { type: "roll_left",     label: "Rolling Left"    },
  rollRight:    { type: "roll_right",    label: "Rolling Right"   },
  stop:         { type: "stop",          label: "Stopped", status: "stopped" },
  goHome:       { type: "go_home",       label: "Going Home", status: "active" },
  gripperOpen:  { type: "gripper_open",  label: "Gripper Open"    },
  gripperClose: { type: "gripper_close", label: "Gripper Close"   },
} as const satisfies Record<string, ControlCommandConfig>;
