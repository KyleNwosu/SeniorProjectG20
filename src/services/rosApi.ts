import * as ROSLIB from "roslib";

const ROS_BRIDGE_URL = import.meta.env.VITE_ROS_BRIDGE_URL ?? "ws://10.26.97.174:9090";

// ── Connection ────────────────────────────────────────────────────────────────

export const ros = new ROSLIB.Ros({ url: ROS_BRIDGE_URL });

ros.on("connection", () => console.log("[ROS] Connected to rosbridge"));
ros.on("error",      (e) => console.error("[ROS] Error:", e));
ros.on("close",      () => console.log("[ROS] Disconnected from rosbridge"));

// ── Joint States ──────────────────────────────────────────────────────────────

export interface JointState {
  name: string[];
  position: number[];
  velocity: number[];
  effort: number[];
}

export function subscribeToJointStates(
  callback: (msg: JointState) => void
): () => void {
  const topic = new ROSLIB.Topic({
    ros,
    name: "/joint_states",
    messageType: "sensor_msgs/JointState",
  });
  topic.subscribe(callback as (msg: ROSLIB.Message) => void);
  return () => topic.unsubscribe();
}

// ── Twist (direct velocity control) ──────────────────────────────────────────

export function publishTwist(
  linearX = 0, linearY = 0, linearZ = 0,
  angularX = 0, angularY = 0, angularZ = 0
): void {
  const topic = new ROSLIB.Topic({
    ros,
    name: "/twist_controller/commands",
    messageType: "geometry_msgs/TwistStamped",
  });

  topic.publish(new ROSLIB.Message({
    header: { stamp: { sec: 0, nanosec: 0 }, frame_id: "" },
    twist: {
      linear:  { x: linearX,  y: linearY,  z: linearZ  },
      angular: { x: angularX, y: angularY, z: angularZ },
    },
  }));
}

export function stopArm(): void {
  publishTwist(0, 0, 0, 0, 0, 0);
}
