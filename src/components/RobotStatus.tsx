import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Wifi, Activity } from "lucide-react";
import { useRobotStore } from "@/store/useRobotStore";
import { useQuery } from "@tanstack/react-query";
import { fetchRobotStatus } from "@/services/robotApi";

export const RobotStatus = () => {
  const { robotStatus } = useRobotStore();
  const { isLoading } = useQuery({
    queryKey: ["robotStatus"],
    queryFn: fetchRobotStatus,
    staleTime: 30000,
  });

  if (isLoading)
    return (
      <p className="text-sm text-muted-foreground p-4">Loading status...</p>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Robot Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="default">{robotStatus.status}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Battery
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${robotStatus.battery}%` }}
              />
            </div>
            <span className="text-sm font-medium">{robotStatus.battery}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Connection
          </span>
          <Badge variant="secondary">{robotStatus.connection}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current Task</span>
          <span className="text-sm font-medium">{robotStatus.currentTask}</span>
        </div>
      </CardContent>
    </Card>
  );
};
