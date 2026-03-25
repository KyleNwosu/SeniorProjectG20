import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScheduleStore } from "@/store/useScheduleStore";
import type { ScheduledTask, ScheduleFrequency } from "@/types";

export const Scheduler = () => {
  const { schedules, addSchedule, removeSchedule, updateSchedule } = useScheduleStore();
  const { toast } = useToast();

  const saveSchedules = () => {
    toast({
      title: "Schedules Saved",
      description: `${schedules.length} schedule(s) saved locally`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex gap-2 items-end p-3 border rounded-md bg-muted/30">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Task</Label>
                <Select
                  value={schedule.task}
                  onValueChange={(value) =>
                    updateSchedule(schedule.id, "task", value as ScheduledTask)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Go to Home Position</SelectItem>
                    <SelectItem value="retract">Retract Arm</SelectItem>
                    <SelectItem value="custom">Custom Sequence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32 space-y-2">
                <Label className="text-xs text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => updateSchedule(schedule.id, "time", e.target.value)}
                />
              </div>

              <div className="w-32 space-y-2">
                <Label className="text-xs text-muted-foreground">Frequency</Label>
                <Select
                  value={schedule.frequency}
                  onValueChange={(value) =>
                    updateSchedule(schedule.id, "frequency", value as ScheduleFrequency)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                    <SelectItem value="once">Once</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSchedule(schedule.id)}
                className="mb-0.5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={addSchedule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
          {schedules.length > 0 && (
            <Button className="flex-1" onClick={saveSchedules}>
              Save Schedules
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
