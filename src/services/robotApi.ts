import type { RobotStatus, RobotCommand, CommandType } from "@/types";

const BRIDGE = import.meta.env.VITE_BRIDGE_URL ?? "http://localhost:8000";

// ── Status ────────────────────────────────────────────────────────────────────

export const fetchRobotStatus = async (): Promise<RobotStatus> => {
  const res = await fetch(`${BRIDGE}/api/status`);
  if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
  return res.json();
};

// ── Commands ──────────────────────────────────────────────────────────────────

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
  action: RobotCommand;
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
