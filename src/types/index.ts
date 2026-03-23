export type RobotConnectionStatus = "connected" | "disconnected" | "connecting";

export type RobotOperationalStatus = "active" | "idle" | "paused" | "stopped" | "error";

export type ScheduledTask = "home" | "retract" | "custom";

export type ScheduleFrequency = "daily" | "weekdays" | "weekends" | "once";

export interface RobotStatus {
  status: RobotOperationalStatus;
  battery: number;
  connection: RobotConnectionStatus;
  currentTask: string;
}

// Matches backend routes/sequences.py TaskAction enum exactly
export type RobotCommand =
  | "move_forward"
  | "move_backward"
  | "turn_left"
  | "turn_right"
  | "move_up"
  | "move_down"
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
