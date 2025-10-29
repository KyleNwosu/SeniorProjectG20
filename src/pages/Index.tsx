import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RobotStatus } from "@/components/RobotStatus";
import { ControlPanel } from "@/components/ControlPanel";
import { TaskBuilder } from "@/components/TaskBuilder";
import { Scheduler } from "@/components/Scheduler";
import { Bot } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">RoboControl</h1>
              <p className="text-sm text-muted-foreground">Consumer Robotics Interface</p>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <RobotStatus />
              <div className="md:col-span-2 lg:col-span-2">
                <ControlPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="control" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <RobotStatus />
              <ControlPanel />
            </div>
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
