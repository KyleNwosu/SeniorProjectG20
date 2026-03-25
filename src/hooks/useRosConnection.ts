import { useEffect, useState } from "react";
import { ros, subscribeToJointStates, type JointState } from "@/services/rosApi";

export type RosStatus = "connecting" | "connected" | "disconnected";

/**
 * Opens the rosbridge WebSocket and streams live joint states.
 * Call once at the app root alongside useRobotSocket.
 */
export const useRosConnection = () => {
  const [rosStatus, setRosStatus] = useState<RosStatus>("connecting");
  const [jointStates, setJointStates] = useState<JointState | null>(null);

  useEffect(() => {
    const onConnect    = () => setRosStatus("connected");
    const onError      = () => setRosStatus("disconnected");
    const onClose      = () => setRosStatus("disconnected");

    ros.on("connection", onConnect);
    ros.on("error",      onError);
    ros.on("close",      onClose);

    const unsubscribe = subscribeToJointStates(setJointStates);

    return () => {
      unsubscribe();
      ros.off("connection", onConnect);
      ros.off("error",      onError);
      ros.off("close",      onClose);
    };
  }, []);

  return { rosStatus, jointStates };
};
