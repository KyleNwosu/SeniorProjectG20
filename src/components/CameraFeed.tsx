import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff } from "lucide-react";

const BRIDGE = import.meta.env.VITE_BRIDGE_URL ?? "http://localhost:8000";
const STREAM_URL = `${BRIDGE}/api/camera/stream`;

export const CameraFeed = () => {
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          {status === "live" ? (
            <Camera className="h-5 w-5" />
          ) : (
            <CameraOff className="h-5 w-5" />
          )}
          Camera Feed
        </CardTitle>
        <Badge
          variant={
            status === "live"
              ? "default"
              : status === "loading"
                ? "secondary"
                : "destructive"
          }
        >
          {status === "live" ? "Live" : status === "loading" ? "Connecting…" : "Offline"}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <CameraOff className="h-10 w-10" />
              <p className="text-sm">Camera feed unavailable</p>
              <p className="text-xs">Check that the backend is running and the robot is on the network.</p>
            </div>
          )}

          <img
            src={STREAM_URL}
            alt="Kinova camera feed"
            className="h-full w-full object-contain"
            onLoad={() => setStatus("live")}
            onError={() => setStatus("error")}
            style={{ display: status === "error" ? "none" : "block" }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
