import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScanBarcode, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRobotStore } from "@/store/useRobotStore";
import {
  fetchBarcodeStatus,
  startBarcodeScanner,
  stopBarcodeScanner,
  type BarcodeStatus,
} from "@/services/robotApi";

export const BarcodeScannerPanel = () => {
  const { toast } = useToast();
  const { robotStatus } = useRobotStore();
  const latest = robotStatus.latestBarcode ?? null;
  const running = robotStatus.barcodeScannerRunning ?? false;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<BarcodeStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchBarcodeStatus();
        if (!cancelled) setStatus(s);
      } catch {
        // Non-blocking: websocket still updates running/latest states.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await startBarcodeScanner();
      const s = await fetchBarcodeStatus();
      setStatus(s);
      toast({
        title: "Barcode scanner started",
        description: s.pyzbar_available
          ? "Scanning with pyzbar + QR fallback."
          : "pyzbar unavailable: running QR fallback only.",
      });
    } catch (error) {
      toast({
        title: "Failed to start scanner",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await stopBarcodeScanner();
      const s = await fetchBarcodeStatus();
      setStatus(s);
      toast({ title: "Barcode scanner stopped" });
    } catch (error) {
      toast({
        title: "Failed to stop scanner",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <ScanBarcode className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
        <Badge variant={running ? "default" : "secondary"}>
          {running ? "Running" : "Stopped"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleStart} disabled={loading || running}>
            <ScanBarcode className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button variant="outline" onClick={handleStop} disabled={loading || !running}>
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Confirm frames: {status?.confirm_frames ?? "—"} | Cooldown: {status?.cooldown_sec ?? "—"}s
          {" | "}FPS: {status?.scan_fps ?? "—"}
        </div>

        {status && !status.pyzbar_available && (
          <p className="text-xs text-amber-600">
            pyzbar unavailable. Using OpenCV QR fallback only (QR codes).
          </p>
        )}

        <div className="rounded-md border p-3">
          <p className="text-sm font-medium mb-2">Latest confirmed scan</p>
          {latest ? (
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Code:</span> {latest.code}</p>
              <p><span className="text-muted-foreground">Type:</span> {latest.type}</p>
              <p><span className="text-muted-foreground">Source:</span> {latest.source}</p>
              <p><span className="text-muted-foreground">Preprocess:</span> {latest.preprocess}</p>
              <p><span className="text-muted-foreground">Time:</span> {new Date(latest.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No barcode confirmed yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
