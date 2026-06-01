import { create } from "zustand";
import type { AiePhaseProgress } from "@/types";

interface SysdesStore {
  selectedPhase: number;
  progress: Record<number, AiePhaseProgress>;
  isLoading: boolean;
  setSelectedPhase: (n: number) => void;
  setProgress: (p: Record<number, AiePhaseProgress>) => void;
  upsertProgress: (p: AiePhaseProgress) => void;
  setLoading: (v: boolean) => void;
}

export const useSysdesStore = create<SysdesStore>((set) => ({
  selectedPhase: 1,
  progress: {},
  isLoading: false,
  setSelectedPhase: (selectedPhase) => set({ selectedPhase }),
  setProgress: (progress) => set({ progress }),
  upsertProgress: (p) =>
    set((s) => ({ progress: { ...s.progress, [p.phase]: p } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
