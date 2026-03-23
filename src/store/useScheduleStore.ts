import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Schedule, ScheduledTask, ScheduleFrequency } from "@/types";

interface ScheduleStore {
  schedules: Schedule[];
  addSchedule: () => void;
  removeSchedule: (id: string) => void;
  updateSchedule: (
    id: string,
    field: keyof Schedule,
    value: string | ScheduledTask | ScheduleFrequency
  ) => void;
  clearSchedules: () => void;
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set) => ({
      schedules: [],
      addSchedule: () =>
        set((state) => ({
          schedules: [
            ...state.schedules,
            { id: crypto.randomUUID(), time: "09:00", task: "home", frequency: "daily" },
          ],
        })),
      removeSchedule: (id) =>
        set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) })),
      updateSchedule: (id, field, value) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, [field]: value } : s
          ),
        })),
      clearSchedules: () => set({ schedules: [] }),
    }),
    { name: "schedule-storage" }
  )
);
