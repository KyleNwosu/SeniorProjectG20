import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RobotPanels } from "@/components/RobotPanels";
import { TaskBuilder } from "@/components/TaskBuilder";
import { Scheduler } from "@/components/Scheduler";
import { Bot } from "lucide-react";
import { useRobotTelemetry } from "@/hooks/useRobotTelemetry";
import { useRosConnection } from "@/hooks/useRosConnection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">RoboControl</h1>
                <p className="text-sm text-muted-foreground">Consumer Robotics Interface</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? <p className="hidden text-sm text-muted-foreground md:block">{user.email}</p> : null}
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="control">Control</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RobotPanels layout="dashboard" />
          </TabsContent>

          <TabsContent value="control" className="space-y-6">
            <RobotPanels layout="control" />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <TaskBuilder />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Scheduler />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
