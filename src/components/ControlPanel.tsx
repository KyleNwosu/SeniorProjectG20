import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Square, Play, Pause, Home, ChevronUp, ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRobotStore } from "@/store/useRobotStore";
import { useMutation } from "@tanstack/react-query";
import { sendCommand } from "@/services/robotApi";
import type { CommandType, RobotOperationalStatus } from "@/types";

export const ControlPanel = () => {
  const { toast } = useToast();
  const { setStatus, setCurrentTask } = useRobotStore();

  const mutation = useMutation({
    mutationFn: (type: CommandType) => sendCommand(type),
    onError: (error: Error) => {
      toast({
        title: "Command Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleControl = (
    type: CommandType,
    label: string,
    status: RobotOperationalStatus = "active",
  ) => {
    // Optimistic store update so RobotStatus reflects the action immediately
    setStatus(status);
    setCurrentTask(label);
    mutation.mutate(type);
    toast({ title: "Command Sent", description: label });
  };

  const disabled = mutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Cartesian XY + rotation */}
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
            onClick={() => handleControl("move_forward", "Moving Forward")}>
            <ArrowUp className="h-5 w-5" />
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
              onClick={() => handleControl("rotate_left", "Rotating Left")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
              onClick={() => handleControl("stop", "Stopped", "stopped")}>
              <Square className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
              onClick={() => handleControl("rotate_right", "Rotating Right")}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
            onClick={() => handleControl("move_backward", "Moving Backward")}>
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Z axis */}
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={disabled} className="flex-1"
            onClick={() => handleControl("move_up", "Moving Up")}>
            <ChevronUp className="h-4 w-4 mr-1" /> Up
          </Button>
          <Button variant="outline" size="sm" disabled={disabled} className="flex-1"
            onClick={() => handleControl("move_down", "Moving Down")}>
            <ChevronDown className="h-4 w-4 mr-1" /> Down
          </Button>
        </div>

        {/* Gripper + Home */}
        <div className="flex gap-2 pt-4 border-t">
          <Button className="flex-1" disabled={disabled}
            onClick={() => handleControl("go_home", "Going Home", "active")}>
            <Home className="h-4 w-4 mr-2" /> Home
          </Button>
          <Button variant="secondary" className="flex-1" disabled={disabled}
            onClick={() => handleControl("gripper_open", "Gripper Open")}>
            <Play className="h-4 w-4 mr-2" /> Open
          </Button>
          <Button variant="secondary" className="flex-1" disabled={disabled}
            onClick={() => handleControl("gripper_close", "Gripper Close")}>
            <Pause className="h-4 w-4 mr-2" /> Close
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};
