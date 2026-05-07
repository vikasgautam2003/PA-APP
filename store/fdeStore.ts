import { create } from "zustand";
import type { FdeDayProgress } from "@/types";

interface FdeStore {
  selectedDay: number;
  progress: Record<number, FdeDayProgress>;
  isLoading: boolean;
  setSelectedDay: (d: number) => void;
  setProgress: (p: Record<number, FdeDayProgress>) => void;
  upsertProgress: (p: FdeDayProgress) => void;
  setLoading: (v: boolean) => void;
}

export const useFdeStore = create<FdeStore>((set) => ({
  selectedDay: 1,
  progress: {},
  isLoading: false,
  setSelectedDay: (selectedDay) => set({ selectedDay }),
  setProgress: (progress) => set({ progress }),
  upsertProgress: (p) =>
    set((s) => ({ progress: { ...s.progress, [p.day]: p } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
