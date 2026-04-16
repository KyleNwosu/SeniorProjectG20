import { create } from "zustand";
import type { RobotStatus, RobotOperationalStatus, RobotConnectionStatus } from "@/types";

interface RobotStore {
  robotStatus: RobotStatus;
  // Atomic update for WebSocket frames — replaces 4 individual setters
  updateFromFrame: (frame: Partial<RobotStatus>) => void;
  // Individual setters kept for optimistic UI updates (e.g. ControlPanel)
  setStatus: (status: RobotOperationalStatus) => void;
  setConnection: (connection: RobotConnectionStatus) => void;
  setCurrentTask: (task: string) => void;
}

// Not persisted — live telemetry must always come from the WebSocket,
// never from a stale localStorage snapshot.
export const useRobotStore = create<RobotStore>()((set) => ({
  robotStatus: {
    status: "idle",
    battery: 0,
    connection: "disconnected",
    currentTask: "",
    joints: [],
    latestBarcode: null,
    barcodeScannerRunning: false,
  },
  updateFromFrame: (frame) =>
    set((state) => ({ robotStatus: { ...state.robotStatus, ...frame } })),
  setStatus: (status) =>
    set((state) => ({ robotStatus: { ...state.robotStatus, status } })),
  setConnection: (connection) =>
    set((state) => ({ robotStatus: { ...state.robotStatus, connection } })),
  setCurrentTask: (task) =>
    set((state) => ({ robotStatus: { ...state.robotStatus, currentTask: task } })),
}));
