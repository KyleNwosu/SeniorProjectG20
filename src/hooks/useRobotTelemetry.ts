import { useEffect } from "react";
import { useRobotStore } from "@/store/useRobotStore";
import { BRIDGE_WS_URL, fetchRobotStatus } from "@/services/robotApi";

/**
 * Bridge telemetry in one place: initial REST snapshot, then live WebSocket frames.
 * Keeps connection logic out of route components (separation of concerns).
 */
export const useRobotTelemetry = () => {
  const setConnection = useRobotStore((s) => s.setConnection);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await fetchRobotStatus();
        if (!cancelled) {
          useRobotStore.getState().updateFromFrame(status);
        }
      } catch {
        console.warn("[robot] Initial /api/status fetch failed; live updates rely on WebSocket.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      setConnection("connecting");
      ws = new WebSocket(BRIDGE_WS_URL);

      ws.onopen = () => {
        setConnection("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          useRobotStore.getState().updateFromFrame(data);
        } catch {
          console.warn("[robot] Dropped malformed WebSocket frame");
        }
      };

      ws.onclose = () => {
        setConnection("disconnected");
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setConnection("disconnected");
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [setConnection]);
};
