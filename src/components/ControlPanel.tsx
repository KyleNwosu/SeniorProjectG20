import { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUp, ArrowDown,
  RotateCcw, RotateCw, ChevronUp, ChevronDown,
  Home, Square,
} from "lucide-react";
import { useRobotCommandDispatcher } from "@/hooks/useRobotCommandDispatcher";
import { CONTROL_COMMANDS } from "@/constants/robotCommands";
import type { ControlCommandConfig } from "@/constants/robotCommands";
import type { CommandType } from "@/types";

/** Translation + rotation: move while pointer is down, stop on release (matches twist-until-stop backend). */
const HoldMotionBtn = ({
  config,
  disabled,
  children,
  label,
  onHoldStart,
  onHoldEnd,
}: {
  config: ControlCommandConfig;
  disabled: boolean;
  children: React.ReactNode;
  label: string;
  onHoldStart: (c: ControlCommandConfig) => void;
  onHoldEnd: () => void;
}) => (
  <div className="flex flex-col items-center gap-1">
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={disabled}
      className="w-12 h-12 touch-none select-none"
      onPointerDown={(e) => {
        if (disabled) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onHoldStart(config);
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        onHoldEnd();
      }}
      onPointerCancel={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        onHoldEnd();
      }}
    >
      {children}
    </Button>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

export const ControlPanel = () => {
  const { dispatchCommand, isSending } = useRobotCommandDispatcher();
  const heldRef = useRef<CommandType | null>(null);
  const [heldCommand, setHeldCommand] = useState<CommandType | null>(null);

  const endHold = useCallback(() => {
    if (heldRef.current === null) return;
    heldRef.current = null;
    setHeldCommand(null);
    dispatchCommand({ ...CONTROL_COMMANDS.stop, silent: true });
  }, [dispatchCommand]);

  const beginHold = useCallback(
    (c: ControlCommandConfig) => {
      if (heldRef.current !== null) return;
      heldRef.current = c.type;
      setHeldCommand(c.type);
      dispatchCommand(c);
    },
    [dispatchCommand],
  );

  useEffect(() => {
    if (heldCommand === null) return;
    const onBlur = () => endHold();
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [heldCommand, endHold]);

  const holdActive = heldCommand !== null;
  const cmd = (c: ControlCommandConfig) => () => dispatchCommand(c);

  /** While a move is held, only that control stays active; otherwise block motion while a request is in flight. */
  const motionDisabled = (type: CommandType) =>
    (holdActive && heldCommand !== type) || (!holdActive && isSending);

  const dispatchStopClick = () => {
    heldRef.current = null;
    setHeldCommand(null);
    dispatchCommand(CONTROL_COMMANDS.stop);
  };

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
            <HoldMotionBtn
              config={CONTROL_COMMANDS.moveForward}
              disabled={motionDisabled(CONTROL_COMMANDS.moveForward.type)}
              label="Extend"
              onHoldStart={beginHold}
              onHoldEnd={endHold}
            >
              <ArrowUp className="h-5 w-5" />
            </HoldMotionBtn>
            <HoldMotionBtn
              config={CONTROL_COMMANDS.moveBackward}
              disabled={motionDisabled(CONTROL_COMMANDS.moveBackward.type)}
              label="Retract"
              onHoldStart={beginHold}
              onHoldEnd={endHold}
            >
              <ArrowDown className="h-5 w-5" />
            </HoldMotionBtn>
            <HoldMotionBtn
              config={CONTROL_COMMANDS.moveUp}
              disabled={motionDisabled(CONTROL_COMMANDS.moveUp.type)}
              label="Up"
              onHoldStart={beginHold}
              onHoldEnd={endHold}
            >
              <ChevronUp className="h-5 w-5" />
            </HoldMotionBtn>
            <HoldMotionBtn
              config={CONTROL_COMMANDS.moveDown}
              disabled={motionDisabled(CONTROL_COMMANDS.moveDown.type)}
              label="Down"
              onHoldStart={beginHold}
              onHoldEnd={endHold}
            >
              <ChevronDown className="h-5 w-5" />
            </HoldMotionBtn>
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
                <HoldMotionBtn
                  config={CONTROL_COMMANDS.rotateLeft}
                  disabled={motionDisabled(CONTROL_COMMANDS.rotateLeft.type)}
                  label="Left"
                  onHoldStart={beginHold}
                  onHoldEnd={endHold}
                >
                  <RotateCcw className="h-5 w-5" />
                </HoldMotionBtn>
                <HoldMotionBtn
                  config={CONTROL_COMMANDS.rotateRight}
                  disabled={motionDisabled(CONTROL_COMMANDS.rotateRight.type)}
                  label="Right"
                  onHoldStart={beginHold}
                  onHoldEnd={endHold}
                >
                  <RotateCw className="h-5 w-5" />
                </HoldMotionBtn>
              </div>
            </div>

            {/* Wrist pitch */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground">Tilt</p>
              <div className="flex gap-2">
                <HoldMotionBtn
                  config={CONTROL_COMMANDS.tiltUp}
                  disabled={motionDisabled(CONTROL_COMMANDS.tiltUp.type)}
                  label="Up"
                  onHoldStart={beginHold}
                  onHoldEnd={endHold}
                >
                  <ArrowUp className="h-5 w-5" />
                </HoldMotionBtn>
                <HoldMotionBtn
                  config={CONTROL_COMMANDS.tiltDown}
                  disabled={motionDisabled(CONTROL_COMMANDS.tiltDown.type)}
                  label="Down"
                  onHoldStart={beginHold}
                  onHoldEnd={endHold}
                >
                  <ArrowDown className="h-5 w-5" />
                </HoldMotionBtn>
              </div>
            </div>

            {/* Wrist roll */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground">Roll</p>
              <div className="flex gap-2">
                <HoldMotionBtn
                  config={CONTROL_COMMANDS.rollLeft}
                  disabled={motionDisabled(CONTROL_COMMANDS.rollLeft.type)}
                  label="Left"
                  onHoldStart={beginHold}
                  onHoldEnd={endHold}
                >
                  <RotateCcw className="h-5 w-5" />
                </HoldMotionBtn>
                <HoldMotionBtn
                  config={CONTROL_COMMANDS.rollRight}
                  disabled={motionDisabled(CONTROL_COMMANDS.rollRight.type)}
                  label="Right"
                  onHoldStart={beginHold}
                  onHoldEnd={endHold}
                >
                  <RotateCw className="h-5 w-5" />
                </HoldMotionBtn>
              </div>
            </div>

          </div>
        </div>

        {/* Row 3: Gripper + Stop + Home */}
        <div className="flex gap-2 pt-4 border-t">
          <Button className="flex-1" disabled={isSending || holdActive}
            onClick={cmd(CONTROL_COMMANDS.goHome)}>
            <Home className="h-4 w-4 mr-2" /> Home
          </Button>
          <Button variant="destructive" className="flex-1"
            disabled={!holdActive && isSending}
            onClick={dispatchStopClick}>
            <Square className="h-4 w-4 mr-2" /> Stop
          </Button>
          <Button variant="secondary" disabled={isSending || holdActive}
            onClick={cmd(CONTROL_COMMANDS.gripperOpen)}>
            Open
          </Button>
          <Button variant="secondary" disabled={isSending || holdActive}
            onClick={cmd(CONTROL_COMMANDS.gripperClose)}>
            Close
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};
