import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRobotStore } from "@/store/useRobotStore";
import { sendCommand } from "@/services/robotApi";
import type { CommandType, RobotOperationalStatus } from "@/types";
import type { ControlCommandConfig } from "@/constants/robotCommands";

export type DispatchCommandParams = ControlCommandConfig & { silent?: boolean };

export const useRobotCommandDispatcher = () => {
  const { toast } = useToast();
  const { setStatus, setCurrentTask } = useRobotStore();

  const mutation = useMutation({
    mutationFn: (type: CommandType) => sendCommand(type),
    onError: (error: Error) => {
      toast({
        title: "Command Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const dispatchCommand = ({
    type,
    label,
    status = "active",
    silent = false,
  }: DispatchCommandParams) => {
    // Optimistic store update keeps RobotStatus aligned with the latest action.
    setStatus(status);
    setCurrentTask(label);
    mutation.mutate(type);
    if (!silent) {
      toast({ title: "Command Sent", description: label });
    }
  };

  return {
    dispatchCommand,
    isSending: mutation.isPending,
  };
};
