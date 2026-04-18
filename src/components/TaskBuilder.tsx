import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTaskStore } from "@/store/useTaskStore";
import { executeSequence, fetchSavedActions } from "@/services/robotApi";
import type { RobotCommand } from "@/types";
import { TASK_ACTION_LABELS } from "@/constants/robotCommands";

export const TaskBuilder = () => {
  const { tasks, addTask, removeTask, updateTask } = useTaskStore();
  const { toast } = useToast();

  const { data: savedActions = [], isLoading: actionsLoading } = useQuery({
    queryKey: ["savedActions"],
    queryFn: fetchSavedActions,
  });

  const mutation = useMutation({
    mutationFn: () =>
      executeSequence(
        tasks.map((t) => ({ action: t.action, duration: t.duration })),
      ),
    onSuccess: () =>
      toast({
        title: "Sequence Complete",
        description: `${tasks.length} steps executed`,
      }),
    onError: (error: Error) =>
      toast({
        title: "Sequence Failed",
        description: error.message,
        variant: "destructive",
      }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {savedActions.length > 0 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Load Preset</Label>
            <Select
              onValueChange={(name) => {
                const action = savedActions.find((a) => a.name === name);
                if (action)
                  toast({ title: "Preset Loaded", description: action.name });
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={actionsLoading ? "Loading…" : "Select a preset"}
                />
              </SelectTrigger>
              <SelectContent>
                {savedActions.map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="flex gap-2 items-end p-3 border rounded-md bg-muted/30"
            >
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Step {index + 1}
                </Label>
                <Select
                  value={task.action}
                  onValueChange={(value) =>
                    updateTask(task.id, "action", value as RobotCommand)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TASK_ACTION_LABELS) as RobotCommand[]).map(
                      (cmd) => (
                        <SelectItem key={cmd} value={cmd}>
                          {TASK_ACTION_LABELS[cmd]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Duration (s)
                </Label>
                <Input
                  type="number"
                  value={task.duration}
                  onChange={(e) =>
                    updateTask(task.id, "duration", e.target.valueAsNumber)
                  }
                  min={1}
                  max={300}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
                className="mb-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={addTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
          {tasks.length > 0 && (
            <Button
              className="flex-1"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Running…" : "Execute Sequence"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
