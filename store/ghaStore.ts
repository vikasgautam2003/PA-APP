import { create } from "zustand";
import type { GhaChapterProgress } from "@/types";

interface GhaStore {
  selectedChapter: number;
  progress: Record<number, GhaChapterProgress>;
  isLoading: boolean;
  setSelectedChapter: (n: number) => void;
  setProgress: (p: Record<number, GhaChapterProgress>) => void;
  upsertProgress: (p: GhaChapterProgress) => void;
  setLoading: (v: boolean) => void;
}

export const useGhaStore = create<GhaStore>((set) => ({
  selectedChapter: 1,
  progress: {},
  isLoading: false,
  setSelectedChapter: (selectedChapter) => set({ selectedChapter }),
  setProgress: (progress) => set({ progress }),
  upsertProgress: (p) =>
    set((s) => ({ progress: { ...s.progress, [p.chapter]: p } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
