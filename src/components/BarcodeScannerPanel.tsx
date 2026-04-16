import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScanBarcode, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRobotStore } from "@/store/useRobotStore";
import {
  fetchBarcodeStatus,
  resolveBarcodeText,
  startBarcodeScanner,
  stopBarcodeScanner,
  type BarcodeStatus,
} from "@/services/robotApi";
import type { BarcodeScan } from "@/types";

const looksLikeUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(" ")) {
    return false;
  }
  return trimmed.includes(".") && trimmed.includes("/");
};

export const BarcodeScannerPanel = () => {
  const { toast } = useToast();
  const { robotStatus } = useRobotStore();
  const latest = robotStatus.latestBarcode ?? null;
  const running = robotStatus.barcodeScannerRunning ?? false;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<BarcodeStatus | null>(null);
  const [displayScan, setDisplayScan] = useState<BarcodeScan | null>(null);
  const [resolvingText, setResolvingText] = useState(false);
  const lastResolvedKeyRef = useRef<string>("");

  useEffect(() => {
    if (!latest) {
      setDisplayScan(null);
      return;
    }

    let cancelled = false;
    const sourceCode = (latest.raw_code ?? latest.code).trim();
    const resolveKey = `${latest.timestamp}:${sourceCode}`;

    if (lastResolvedKeyRef.current === resolveKey) {
      setResolvingText(false);
      return;
    }
    lastResolvedKeyRef.current = resolveKey;

    if (!looksLikeUrl(sourceCode)) {
      setDisplayScan(latest);
      setResolvingText(false);
      return;
    }

    setDisplayScan(latest);
    setResolvingText(true);

    (async () => {
      try {
        const resolved = await resolveBarcodeText(sourceCode);
        if (cancelled) {
          return;
        }
        setDisplayScan({
          ...latest,
          ...resolved,
          code: typeof resolved.code === "string" && resolved.code.trim() ? resolved.code : latest.code,
          raw_code: resolved.raw_code ?? latest.raw_code ?? sourceCode,
        });
      } catch {
        if (!cancelled) {
          setDisplayScan(latest);
        }
      } finally {
        if (!cancelled) {
          setResolvingText(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [latest]);

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

  const scanToRender = displayScan ?? latest;

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
          {scanToRender ? (
            <div className="space-y-1 text-sm">
              {resolvingText ? (
                <p className="text-xs text-muted-foreground">Resolving QR link to text...</p>
              ) : null}
              <p className="whitespace-pre-wrap break-words">
                <span className="text-muted-foreground">Text:</span> {scanToRender.code}
              </p>
              {scanToRender.raw_code ? (
                <p className="break-words">
                  <span className="text-muted-foreground">Original QR value:</span> {scanToRender.raw_code}
                </p>
              ) : null}
              {scanToRender.resolved_from_url ? (
                <p className="break-words">
                  <span className="text-muted-foreground">Resolved from:</span> {scanToRender.resolved_from_url}
                </p>
              ) : null}
              <p><span className="text-muted-foreground">Type:</span> {scanToRender.type}</p>
              <p><span className="text-muted-foreground">Source:</span> {scanToRender.source}</p>
              <p><span className="text-muted-foreground">Preprocess:</span> {scanToRender.preprocess}</p>
              <p><span className="text-muted-foreground">Time:</span> {new Date(scanToRender.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No barcode confirmed yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
