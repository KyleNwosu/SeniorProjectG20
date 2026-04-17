import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskBuilder } from "@/components/TaskBuilder";
import { Scheduler } from "@/components/Scheduler";
import { Bot, ChevronDown } from "lucide-react";
import { useRobotTelemetry } from "@/hooks/useRobotTelemetry";
import { useRosConnection } from "@/hooks/useRosConnection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRobotStore } from "@/store/useRobotStore";
import { RobotStatus } from "@/components/RobotStatus";
import { CameraFeed } from "@/components/CameraFeed";
import { BarcodeScannerPanel } from "@/components/BarcodeScannerPanel";
import { SavedActionsPanel } from "@/components/SavedActionsPanel";
import { OperationsQuickControls } from "@/components/OperationsQuickControls";
import { ControlPanel } from "@/components/ControlPanel";
import { JointStatesPanel } from "@/components/JointStatesPanel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { robotStatus } = useRobotStore();
  const displayName = user?.fullName?.trim() || user?.email;

  useRobotTelemetry();
  useRosConnection();

  const handleSignOut = () => {
    signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#003A70]/10 p-2">
                <Bot className="h-7 w-7 text-[#003A70]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RoboControl</h1>
                <p className="text-sm text-muted-foreground">Consumer Robotics Interface</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {displayName ? <p className="hidden text-sm font-medium text-muted-foreground md:block">{displayName}</p> : null}
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="mb-6 rounded-lg border border-[#003A70]/20 bg-[#003A70]/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={robotStatus.connection === "connected" ? "default" : "destructive"}>
              Connection: {robotStatus.connection}
            </Badge>
            <Badge variant={robotStatus.status === "error" ? "destructive" : "secondary"}>
              Robot: {robotStatus.status}
            </Badge>
            <Badge variant={robotStatus.barcodeScannerRunning ? "default" : "secondary"}>
              Scanner: {robotStatus.barcodeScannerRunning ? "Running" : "Stopped"}
            </Badge>
            <Badge variant="outline">
              Last QR:{" "}
              {robotStatus.latestBarcode?.timestamp
                ? new Date(robotStatus.latestBarcode.timestamp).toLocaleTimeString()
                : "None"}
            </Badge>
          </div>
        </section>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 border border-[#003A70]/20 bg-[#003A70]/5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#003A70] data-[state=active]:text-white">
              Operations
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-[#003A70] data-[state=active]:text-white">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-[#003A70] data-[state=active]:text-white">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#003A70] data-[state=active]:text-white">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="space-y-6 lg:col-span-3">
                <CameraFeed />
                <OperationsQuickControls />
              </div>
              <div className="space-y-6 lg:col-span-2">
                <RobotStatus />
                <BarcodeScannerPanel />
                <SavedActionsPanel />
              </div>
            </div>

            <Collapsible className="rounded-lg border bg-card">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between rounded-lg px-4 py-3 text-base font-semibold">
                  Advanced Controls
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <ControlPanel />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="rounded-lg border bg-card">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between rounded-lg px-4 py-3 text-base font-semibold">
                  Diagnostics
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0">
                <JointStatesPanel />
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskBuilder />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Scheduler />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Event history and scan/task logs can be added here in a later iteration.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
