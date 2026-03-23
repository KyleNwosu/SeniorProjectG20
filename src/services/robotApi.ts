import type { RobotStatus } from "@/types";

const BRIDGE = import.meta.env.VITE_BRIDGE_URL ?? "http://localhost:8000";

// ── Status ────────────────────────────────────────────────────────────────────

export const fetchRobotStatus = async (): Promise<RobotStatus> => {
  const res = await fetch(`${BRIDGE}/api/status`);
  if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
  return res.json();
};

// ── Commands ──────────────────────────────────────────────────────────────────

export type CommandType =
  | "move_forward"
  | "move_backward"
  | "move_left"
  | "move_right"
  | "move_up"
  | "move_down"
  | "rotate_left"
  | "rotate_right"
  | "stop"
  | "go_home"
  | "gripper_open"
  | "gripper_close";

export const sendCommand = async (
  type: CommandType,
  speed = 0.05,
): Promise<void> => {
  const res = await fetch(`${BRIDGE}/api/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, speed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Command failed");
  }
};

// ── Sequences ─────────────────────────────────────────────────────────────────

export interface SequenceTask {
  action: string;
  duration: number;
}

export const executeSequence = async (tasks: SequenceTask[]): Promise<void> => {
  const res = await fetch(`${BRIDGE}/api/sequence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tasks }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Sequence failed");
  }
};

// ── WebSocket ─────────────────────────────────────────────────────────────────

export const BRIDGE_WS_URL = BRIDGE.replace(/^http/, "ws") + "/ws";
