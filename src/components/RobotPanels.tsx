import { RobotStatus } from "@/components/RobotStatus";
import { ControlPanel } from "@/components/ControlPanel";
import { JointStatesPanel } from "@/components/JointStatesPanel";
import { CameraFeed } from "@/components/CameraFeed";
import { BarcodeScannerPanel } from "@/components/BarcodeScannerPanel";
import { SavedActionsPanel } from "@/components/SavedActionsPanel";

export type RobotPanelsLayout = "dashboard" | "control";

interface RobotPanelsProps {
  layout: RobotPanelsLayout;
}

export const RobotPanels = ({ layout }: RobotPanelsProps) => {
  if (layout === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            <RobotStatus />
            <JointStatesPanel />
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <ControlPanel />
          </div>
        </div>
        <CameraFeed />
        <BarcodeScannerPanel />
        <SavedActionsPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <RobotStatus />
          <JointStatesPanel />
        </div>
        <ControlPanel />
      </div>
      <CameraFeed />
      <BarcodeScannerPanel />
      <SavedActionsPanel />
    </div>
  );
};
