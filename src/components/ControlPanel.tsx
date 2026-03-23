import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Square, Play, Pause, Home, ChevronUp, ChevronDown,
} from "lucide-react";
import { useRobotCommandDispatcher } from "@/hooks/useRobotCommandDispatcher";
import { CONTROL_COMMANDS } from "@/constants/robotCommands";

export const ControlPanel = () => {
  const { dispatchCommand, isSending } = useRobotCommandDispatcher();
  const disabled = isSending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Cartesian XY + rotation */}
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
            onClick={() => dispatchCommand(CONTROL_COMMANDS.moveForward)}>
            <ArrowUp className="h-5 w-5" />
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
              onClick={() => dispatchCommand(CONTROL_COMMANDS.rotateLeft)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
              onClick={() => dispatchCommand(CONTROL_COMMANDS.stop)}>
              <Square className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
              onClick={() => dispatchCommand(CONTROL_COMMANDS.rotateRight)}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <Button variant="outline" size="icon" disabled={disabled} className="w-12 h-12"
            onClick={() => dispatchCommand(CONTROL_COMMANDS.moveBackward)}>
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Z axis */}
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={disabled} className="flex-1"
            onClick={() => dispatchCommand(CONTROL_COMMANDS.moveUp)}>
            <ChevronUp className="h-4 w-4 mr-1" /> Up
          </Button>
          <Button variant="outline" size="sm" disabled={disabled} className="flex-1"
            onClick={() => dispatchCommand(CONTROL_COMMANDS.moveDown)}>
            <ChevronDown className="h-4 w-4 mr-1" /> Down
          </Button>
        </div>

        {/* Gripper + Home */}
        <div className="flex gap-2 pt-4 border-t">
          <Button className="flex-1" disabled={disabled}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.goHome)}>
            <Home className="h-4 w-4 mr-2" /> Home
          </Button>
          <Button variant="secondary" className="flex-1" disabled={disabled}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.gripperOpen)}>
            <Play className="h-4 w-4 mr-2" /> Open
          </Button>
          <Button variant="secondary" className="flex-1" disabled={disabled}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.gripperClose)}>
            <Pause className="h-4 w-4 mr-2" /> Close
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};
