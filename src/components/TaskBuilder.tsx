import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  action: string;
  duration: string;
}

export const TaskBuilder = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const addTask = () => {
    setTasks([...tasks, { id: Date.now(), action: "move-forward", duration: "5" }]);
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id: number, field: keyof Task, value: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const executeSequence = () => {
    toast({
      title: "Task Sequence Started",
      description: `Executing ${tasks.length} tasks`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={task.id} className="flex gap-2 items-end p-3 border rounded-md bg-muted/30">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Step {index + 1}</Label>
                <Select
                  value={task.action}
                  onValueChange={(value) => updateTask(task.id, "action", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="move-forward">Move Forward</SelectItem>
                    <SelectItem value="move-backward">Move Backward</SelectItem>
                    <SelectItem value="turn-left">Turn Left</SelectItem>
                    <SelectItem value="turn-right">Turn Right</SelectItem>
                    <SelectItem value="wait">Wait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-24 space-y-2">
                <Label className="text-xs text-muted-foreground">Duration (s)</Label>
                <Input
                  type="number"
                  value={task.duration}
                  onChange={(e) => updateTask(task.id, "duration", e.target.value)}
                  min="1"
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
          <Button
            variant="outline"
            className="flex-1"
            onClick={addTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
          {tasks.length > 0 && (
            <Button
              className="flex-1"
              onClick={executeSequence}
            >
              Execute Sequence
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
