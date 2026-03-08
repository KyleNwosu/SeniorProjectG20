import { create } from "zustand";
import type { Schedule, ScheduledTask, ScheduleFrequency } from "@/types";

interface ScheduleStore {
  schedules: Schedule[];
  addSchedule: () => void;
  removeSchedule: (id: number) => void;
  updateSchedule: (id: number, field: keyof Schedule, value: string | ScheduledTask | ScheduleFrequency) => void;
  clearSchedules: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  schedules: [],
  addSchedule: () =>
    set((state) => ({
      schedules: [...state.schedules, { id: Date.now(), time: "09:00", task: "cleaning", frequency: "daily" }],
    })),
  removeSchedule: (id) =>
    set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) })),
  updateSchedule: (id, field, value) =>
    set((state) => ({
      schedules: state.schedules.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    })),
  clearSchedules: () => set({ schedules: [] }),
}));
