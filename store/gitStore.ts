import { create } from "zustand";
import type { GitChapterProgress } from "@/types";

interface GitStore {
  selectedChapter: number;
  progress: Record<number, GitChapterProgress>;
  isLoading: boolean;
  setSelectedChapter: (n: number) => void;
  setProgress: (p: Record<number, GitChapterProgress>) => void;
  upsertProgress: (p: GitChapterProgress) => void;
  setLoading: (v: boolean) => void;
}

export const useGitStore = create<GitStore>((set) => ({
  selectedChapter: 1,
  progress: {},
  isLoading: false,
  setSelectedChapter: (selectedChapter) => set({ selectedChapter }),
  setProgress: (progress) => set({ progress }),
  upsertProgress: (p) =>
    set((s) => ({ progress: { ...s.progress, [p.chapter]: p } })),
  setLoading: (isLoading) => set({ isLoading }),
}));
