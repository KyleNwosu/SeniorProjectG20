import type { RobotStatus, RobotCommand, CommandType, BarcodeScan } from "@/types";

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

// ── Barcode ───────────────────────────────────────────────────────────────────

export interface BarcodeStatus {
  running: boolean;
  pyzbar_available: boolean;
  scan_fps: number;
  confirm_frames: number;
  cooldown_sec: number;
  latest: BarcodeScan | null;
}

export const startBarcodeScanner = async (): Promise<void> => {
  const res = await fetch(`${BRIDGE}/api/barcode/start`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Failed to start barcode scanner");
  }
};

export const stopBarcodeScanner = async (): Promise<void> => {
  const res = await fetch(`${BRIDGE}/api/barcode/stop`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Failed to stop barcode scanner");
  }
};

export const fetchBarcodeStatus = async (): Promise<BarcodeStatus> => {
  const res = await fetch(`${BRIDGE}/api/barcode/status`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Failed to fetch barcode status");
  }
  return res.json();
};

export const fetchLatestBarcode = async (): Promise<BarcodeScan | null> => {
  const res = await fetch(`${BRIDGE}/api/barcode/latest`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Failed to fetch latest barcode");
  }
  const json = await res.json();
  return json.scan ?? null;
};

// ── WebSocket ─────────────────────────────────────────────────────────────────

export const BRIDGE_WS_URL = BRIDGE.replace(/^http/, "ws") + "/ws";
