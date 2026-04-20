import { create } from "zustand";
import type { PlannerTopicWithSubtopics, WeekPlan } from "@/types";

type PlannerTab = "plan" | "topics" | "calendar";

interface PlannerStore {
  activeTab: PlannerTab;
  topics: PlannerTopicWithSubtopics[];
  currentPlan: WeekPlan | null;
  isLoading: boolean;
  isGenerating: boolean;
  celebratingDay: string | null;
  setActiveTab: (t: PlannerTab) => void;
  setTopics: (t: PlannerTopicWithSubtopics[]) => void;
  setCurrentPlan: (p: WeekPlan | null) => void;
  setLoading: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setCelebratingDay: (d: string | null) => void;
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  activeTab: "plan",
  topics: [],
  currentPlan: null,
  isLoading: false,
  isGenerating: false,
  celebratingDay: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  setTopics: (topics) => set({ topics }),
  setCurrentPlan: (currentPlan) => set({ currentPlan }),
  setLoading: (isLoading) => set({ isLoading }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setCelebratingDay: (celebratingDay) => set({ celebratingDay }),
}));
