import { RobotStatus } from "@/components/RobotStatus";
import { ControlPanel } from "@/components/ControlPanel";

export type RobotPanelsLayout = "dashboard" | "control";

interface RobotPanelsProps {
  layout: RobotPanelsLayout;
}

/**
 * Shared composition of status + controls for the dashboard and control tabs.
 */
export const RobotPanels = ({ layout }: RobotPanelsProps) => {
  if (layout === "dashboard") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RobotStatus />
        <div className="md:col-span-2 lg:col-span-2">
          <ControlPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <RobotStatus />
      <ControlPanel />
    </div>
  );
};
