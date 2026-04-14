import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";

const BRIDGE = import.meta.env.VITE_BRIDGE_URL ?? "http://localhost:8000";

export const CameraPanel = () => {
  const [reloadKey, setReloadKey] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const streamUrl = useMemo(
    () => `${BRIDGE}/api/camera/stream?reload=${reloadKey}`,
    [reloadKey],
  );

  const loadCameraHealth = async () => {
    try {
      const response = await fetch(`${BRIDGE}/api/camera/health`, { method: "GET" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail = data?.detail;
        if (typeof detail === "string" && detail.trim().length > 0) {
          setErrorDetail(detail);
          return;
        }
        setErrorDetail(`Camera endpoint returned ${response.status}.`);
        return;
      }
      setErrorDetail(null);
    } catch {
      setErrorDetail("Cannot reach backend camera service.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Feed
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setHasError(false);
            setErrorDetail(null);
            setReloadKey((k) => k + 1);
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border bg-muted/20">
          {hasError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
              <p>Camera unavailable. Check backend camera settings and permissions, then press Refresh.</p>
              {errorDetail ? <p className="text-xs">{errorDetail}</p> : null}
            </div>
          ) : (
            <img
              src={streamUrl}
              alt="Live robot camera feed"
              className="h-64 w-full object-cover"
              onError={() => {
                setHasError(true);
                void loadCameraHealth();
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
