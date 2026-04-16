import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRobotStore } from "@/store/useRobotStore";
import {
  executeSavedAction,
  fetchSavedActions,
} from "@/services/robotApi";
import type { SavedRobotAction } from "@/types";

export const SavedActionsPanel = () => {
  const { toast } = useToast();
  const { robotStatus } = useRobotStore();
  const connected = robotStatus.connection === "connected";

  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<SavedRobotAction[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");

  const selected = useMemo(
    () => actions.find((a) => a.name === selectedName),
    [actions, selectedName],
  );

  const refreshActions = async () => {
    setLoading(true);
    try {
      const next = await fetchSavedActions();
      setActions(next);
      if (next.length > 0 && !next.some((a) => a.name === selectedName)) {
        setSelectedName(next[0].name);
      }
    } catch (error) {
      toast({
        title: "Failed to load saved actions",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!connected) return;
    refreshActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const handleRun = async () => {
    if (!selectedName) return;
    setLoading(true);
    try {
      await executeSavedAction(selectedName);
      toast({
        title: "Saved action started",
        description: selectedName,
      });
    } catch (error) {
      toast({
        title: "Failed to execute action",
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
        <CardTitle>Saved Robot Actions</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshActions}
          disabled={loading || !connected}
          title="Refresh action list"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          value={selectedName}
          onValueChange={setSelectedName}
          disabled={!connected || loading || actions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={connected ? "Select a saved action" : "Robot disconnected"} />
          </SelectTrigger>
          <SelectContent>
            {actions.map((action) => (
              <SelectItem key={`${action.name}-${action.handle_identifier}`} value={action.name}>
                {action.name} ({action.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xs text-muted-foreground">
          {actions.length} action{actions.length === 1 ? "" : "s"} loaded
          {selected ? ` • selected: ${selected.name}` : ""}
        </div>

        <Button
          className="w-full"
          onClick={handleRun}
          disabled={!connected || loading || !selectedName}
        >
          <Play className="h-4 w-4 mr-2" />
          Run Selected Action
        </Button>
      </CardContent>
    </Card>
  );
};
