import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Wifi, Activity } from "lucide-react";

export const RobotStatus = () => {
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
          <Badge variant="default">Active</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Battery className="h-4 w-4" />
            Battery
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "85%" }} />
            </div>
            <span className="text-sm font-medium">85%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Connection
          </span>
          <Badge variant="secondary">Connected</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current Task</span>
          <span className="text-sm font-medium">Idle</span>
        </div>
      </CardContent>
    </Card>
  );
};
