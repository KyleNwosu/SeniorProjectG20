import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, ScanBarcode, Square, Trash2 } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [clearedScanKey, setClearedScanKey] = useState<string | null>(null);
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
  const currentScanKey = scanToRender ? `${scanToRender.timestamp}:${scanToRender.code}` : null;
  const visibleScan = currentScanKey && currentScanKey === clearedScanKey ? null : scanToRender;

  const handleCopyText = async () => {
    if (!visibleScan?.code) {
      return;
    }
    try {
      await navigator.clipboard.writeText(visibleScan.code);
      toast({ title: "QR text copied" });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy QR text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    if (currentScanKey) {
      setClearedScanKey(currentScanKey);
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
          <p className="text-sm font-medium mb-2">Latest QR Text</p>
          {visibleScan ? (
            <div className="space-y-1 text-sm">
              {resolvingText ? (
                <p className="text-xs text-muted-foreground">Resolving QR link to text...</p>
              ) : null}
              <p className="whitespace-pre-wrap break-words text-lg font-bold leading-relaxed">
                {visibleScan.code}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => void handleCopyText()}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                {(visibleScan.raw_code || visibleScan.resolved_from_url) ? (
                  <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <ChevronDown className="mr-2 h-4 w-4" />
                        {detailsOpen ? "Hide Details" : "Show Details"}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {visibleScan.raw_code ? <p>Raw URL: {visibleScan.raw_code}</p> : null}
                      {visibleScan.resolved_from_url ? <p>Resolved from: {visibleScan.resolved_from_url}</p> : null}
                    </CollapsibleContent>
                  </Collapsible>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No QR text available yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
