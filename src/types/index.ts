export type RobotConnectionStatus = "connected" | "disconnected" | "connecting";

// Direct control commands — matches backend routes/commands.py CommandType enum exactly
export type CommandType =
  | "move_forward"
  | "move_backward"
  | "move_up"
  | "move_down"
  | "rotate_left"
  | "rotate_right"
  | "tilt_up"
  | "tilt_down"
  | "roll_left"
  | "roll_right"
  | "stop"
  | "go_home"
  | "gripper_open"
  | "gripper_close";

export type RobotOperationalStatus = "active" | "idle" | "paused" | "stopped" | "error";

export type ScheduledTask = "home" | "retract" | "custom";

export type ScheduleFrequency = "daily" | "weekdays" | "weekends" | "once";

export interface RobotStatus {
  status: RobotOperationalStatus;
  battery: number;
  connection: RobotConnectionStatus;
  currentTask: string;
  joints: number[];  // degrees, index 0–5 (base → wrist)
}

// Matches backend routes/sequences.py TaskAction enum exactly
export type RobotCommand =
  | "move_forward"
  | "move_backward"
  | "move_up"
  | "move_down"
  | "rotate_left"
  | "rotate_right"
  | "tilt_up"
  | "tilt_down"
  | "roll_left"
  | "roll_right"
  | "go_home"
  | "gripper_open"
  | "gripper_close"
  | "wait";

export interface Task {
  id: string;           // crypto.randomUUID()
  action: RobotCommand;
  duration: number;     // seconds (number, not string)
}

export interface Schedule {
  id: string;           // crypto.randomUUID()
  time: string;
  task: ScheduledTask;
  frequency: ScheduleFrequency;
}
