export type RobotConnectionStatus = "connected" | "disconnected" | "connecting";

export type RobotOperationalStatus = "active" | "idle" | "paused" | "stopped" | "error";

export interface RobotStatus {
  status: RobotOperationalStatus;
  battery: number;
  connection: RobotConnectionStatus;
  currentTask: string;
}

export type RobotCommand =
  | "move-forward"
  | "move-backward"
  | "turn-left"
  | "turn-right"
  | "wait";

export interface Task {
  id: number;
  action: RobotCommand;
  duration: string;
}