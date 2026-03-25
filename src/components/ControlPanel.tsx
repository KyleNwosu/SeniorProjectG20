import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  RotateCcw, RotateCw, ChevronUp, ChevronDown,
  Home, Square,
} from "lucide-react";
import { useRobotCommandDispatcher } from "@/hooks/useRobotCommandDispatcher";
import { CONTROL_COMMANDS } from "@/constants/robotCommands";

const IconBtn = ({
  onClick, disabled, children, label,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <Button variant="outline" size="icon" disabled={disabled}
      className="w-12 h-12" onClick={onClick}>
      {children}
    </Button>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export const ControlPanel = () => {
  const { dispatchCommand, isSending } = useRobotCommandDispatcher();
  const d = isSending;
  const cmd = (c: typeof CONTROL_COMMANDS[keyof typeof CONTROL_COMMANDS]) =>
    () => dispatchCommand(c);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Row 1: Translation — extend/retract + up/down */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Translation
          </p>
          <div className="grid grid-cols-4 gap-2 justify-items-center">
            <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.moveForward)}  label="Extend">
              <ArrowUp className="h-5 w-5" />
            </IconBtn>
            <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.moveBackward)} label="Retract">
              <ArrowDown className="h-5 w-5" />
            </IconBtn>
            <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.moveUp)}       label="Up">
              <ChevronUp className="h-5 w-5" />
            </IconBtn>
            <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.moveDown)}     label="Down">
              <ChevronDown className="h-5 w-5" />
            </IconBtn>
          </div>
        </div>

        {/* Row 2: Rotation — base yaw, wrist pitch, wrist roll */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Rotation
          </p>
          <div className="grid grid-cols-3 gap-4 justify-items-center">

            {/* Base rotation */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground">Base</p>
              <div className="flex gap-2">
                <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.rotateLeft)}  label="Left">
                  <RotateCcw className="h-5 w-5" />
                </IconBtn>
                <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.rotateRight)} label="Right">
                  <RotateCw className="h-5 w-5" />
                </IconBtn>
              </div>
            </div>

            {/* Wrist pitch */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground">Tilt</p>
              <div className="flex gap-2">
                <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.tiltUp)}   label="Up">
                  <ArrowUp className="h-5 w-5" />
                </IconBtn>
                <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.tiltDown)} label="Down">
                  <ArrowDown className="h-5 w-5" />
                </IconBtn>
              </div>
            </div>

            {/* Wrist roll */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground">Roll</p>
              <div className="flex gap-2">
                <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.rollLeft)}  label="Left">
                  <RotateCcw className="h-5 w-5" />
                </IconBtn>
                <IconBtn disabled={d} onClick={cmd(CONTROL_COMMANDS.rollRight)} label="Right">
                  <RotateCw className="h-5 w-5" />
                </IconBtn>
              </div>
            </div>

          </div>
        </div>

        {/* Row 3: Gripper + Stop + Home */}
        <div className="flex gap-2 pt-4 border-t">
          <Button className="flex-1" disabled={d}
            onClick={cmd(CONTROL_COMMANDS.goHome)}>
            <Home className="h-4 w-4 mr-2" /> Home
          </Button>
          <Button variant="destructive" className="flex-1" disabled={d}
            onClick={cmd(CONTROL_COMMANDS.stop)}>
            <Square className="h-4 w-4 mr-2" /> Stop
          </Button>
          <Button variant="secondary" disabled={d}
            onClick={cmd(CONTROL_COMMANDS.gripperOpen)}>
            Open
          </Button>
          <Button variant="secondary" disabled={d}
            onClick={cmd(CONTROL_COMMANDS.gripperClose)}>
            Close
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};
