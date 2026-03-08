import type { RobotStatus } from "@/types";

export const fetchRobotStatus = async (): Promise<RobotStatus> => {
  return {
    status: "idle",
    battery: 85,
    connection: "connected",
    currentTask: "Idle",
  };
};
