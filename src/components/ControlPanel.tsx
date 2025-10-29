import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ControlPanel = () => {
  const { toast } = useToast();

  const handleControl = (action: string) => {
    toast({
      title: "Command Sent",
      description: `Robot ${action}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleControl("moving forward")}
            className="w-12 h-12"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControl("turning left")}
              className="w-12 h-12"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControl("stopped")}
              className="w-12 h-12"
            >
              <Square className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControl("turning right")}
              className="w-12 h-12"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleControl("moving backward")}
            className="w-12 h-12"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            className="flex-1"
            onClick={() => handleControl("started")}
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => handleControl("paused")}
          >
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
