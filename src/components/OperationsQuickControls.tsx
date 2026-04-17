import { ArrowDown, ArrowUp, Home, RotateCcw, RotateCw, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRobotCommandDispatcher } from "@/hooks/useRobotCommandDispatcher";
import { CONTROL_COMMANDS } from "@/constants/robotCommands";

export const OperationsQuickControls = () => {
  const { dispatchCommand, isSending } = useRobotCommandDispatcher();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button
          variant="destructive"
          className="h-14 w-full text-base font-bold"
          disabled={isSending}
          onClick={() => dispatchCommand(CONTROL_COMMANDS.stop)}
        >
          <Square className="mr-2 h-5 w-5" />
          Emergency Stop
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <div />
          <Button
            variant="outline"
            className="h-12"
            disabled={isSending}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.moveForward)}
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Forward
          </Button>
          <div />

          <Button
            variant="outline"
            className="h-12"
            disabled={isSending}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.baseRotateLeft)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Left
          </Button>
          <Button
            variant="outline"
            className="h-12"
            disabled={isSending}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.goHome)}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            variant="outline"
            className="h-12"
            disabled={isSending}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.baseRotateRight)}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Right
          </Button>

          <div />
          <Button
            variant="outline"
            className="h-12"
            disabled={isSending}
            onClick={() => dispatchCommand(CONTROL_COMMANDS.moveBackward)}
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Backward
          </Button>
          <div />
        </div>
      </CardContent>
    </Card>
  );
};
