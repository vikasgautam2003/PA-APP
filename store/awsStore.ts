import { create } from "zustand";
import type { AwsDayProgress } from "@/types";

interface AwsStore {
  selectedDay: number;
  progress: Record<number, AwsDayProgress>;
  isLoading: boolean;
  setSelectedDay: (d: number) => void;
  setProgress: (p: Record<number, AwsDayProgress>) => void;
  upsertProgress: (p: AwsDayProgress) => void;
  setLoading: (v: boolean) => void;
}

export const useAwsStore = create<AwsStore>((set) => ({
  selectedDay: 1,
  progress: {},
  isLoading: false,
  setSelectedDay: (selectedDay) => set({ selectedDay }),
  setProgress: (progress) => set({ progress }),
  upsertProgress: (p) =>
    set((s) => ({ progress: { ...s.progress, [p.day]: p } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
