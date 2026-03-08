import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task, RobotCommand } from "@/types";

interface TaskStore {
  tasks: Task[];
  addTask: () => void;
  removeTask: (id: number) => void;
  updateTask: (id: number, field: keyof Task, value: string | RobotCommand) => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: () =>
        set((state) => ({
          tasks: [...state.tasks, { id: Date.now(), action: "move-forward", duration: "5" }],
        })),
      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      updateTask: (id, field, value) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
        })),
      clearTasks: () => set({ tasks: [] }),
    }),
    { name: "task-storage" }
  )
);
