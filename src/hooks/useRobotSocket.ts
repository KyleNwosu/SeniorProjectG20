import { useEffect } from "react";
import { useRobotStore } from "@/store/useRobotStore";
import { BRIDGE_WS_URL } from "@/services/robotApi";

/**
 * Opens a WebSocket to the bridge server and streams live arm state
 * into the robot store. Automatically reconnects on disconnect.
 * Call once at the app root (Index.tsx).
 */
export const useRobotSocket = () => {
  const { updateFromFrame, setConnection } = useRobotStore();

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
          updateFromFrame(data);
        } catch {
          // malformed frame — ignore
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
