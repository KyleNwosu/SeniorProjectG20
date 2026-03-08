export type RobotConnectionStatus = "connected" | "disconnected" | "connecting";

export type RobotOperationalStatus = "active" | "idle" | "paused" | "stopped" | "error";

export interface RobotStatus {
  status: RobotOperationalStatus;
  battery: number;
  connection: RobotConnectionStatus;
  currentTask: string;
}
