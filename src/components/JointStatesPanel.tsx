import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRobotStore } from "@/store/useRobotStore";

const JOINTS = [
  { label: "J1 — Base Rotation",  min: -360,   max: 360   },
  { label: "J2 — Shoulder",       min: -128.9,  max: 128.9 },
  { label: "J3 — Elbow",          min: -360,   max: 360   },
  { label: "J4 — Forearm Roll",   min: -147.8,  max: 147.8 },
  { label: "J5 — Wrist Pitch",    min: -360,   max: 360   },
  { label: "J6 — Wrist Roll",     min: -120.3,  max: 120.3 },
];

export const JointStatesPanel = () => {
  const { robotStatus } = useRobotStore();
  const { joints, connection } = robotStatus;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Joint Positions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connection !== "connected" || joints.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {connection === "connected" ? "Waiting for joint data…" : "Robot not connected"}
          </p>
        ) : (
          JOINTS.map(({ label, min, max }, i) => {
            const deg = joints[i] ?? 0;
            const pct = Math.min(100, Math.max(0, ((deg - min) / (max - min)) * 100));

            return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-medium tabular-nums">{deg.toFixed(1)}°</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
