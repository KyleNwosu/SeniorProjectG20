import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RobotStatus, RobotOperationalStatus, RobotConnectionStatus } from "@/types";

interface RobotStore {
  robotStatus: RobotStatus;
  setStatus: (status: RobotOperationalStatus) => void;
  setConnection: (connection: RobotConnectionStatus) => void;
  setBattery: (battery: number) => void;
  setCurrentTask: (task: string) => void;
}

export const useRobotStore = create<RobotStore>()(
  persist(
    (set) => ({
      robotStatus: {
        status: "idle",
        battery: 85,
        connection: "connected",
        currentTask: "Idle",
      },
      setStatus: (status) => set((state) => ({ robotStatus: { ...state.robotStatus, status } })),
      setConnection: (connection) => set((state) => ({ robotStatus: { ...state.robotStatus, connection } })),
      setBattery: (battery) => set((state) => ({ robotStatus: { ...state.robotStatus, battery } })),
      setCurrentTask: (task) => set((state) => ({ robotStatus: { ...state.robotStatus, currentTask: task } })),
    }),
    { name: "robot-status-storage" }
  )
);
