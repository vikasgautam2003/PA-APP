import { create } from "zustand";
import type { PlannerTopicWithSubtopics, WeekPlan, QuickSession } from "@/types";

type PlannerTab = "plan" | "topics" | "calendar";

interface PlannerStore {
  activeTab: PlannerTab;
  topics: PlannerTopicWithSubtopics[];
  currentPlan: WeekPlan | null;
  isLoading: boolean;
  isGenerating: boolean;
  celebratingDay: string | null;
  quickSession: QuickSession | null;
  isSessionLoading: boolean;
  setActiveTab: (t: PlannerTab) => void;
  setTopics: (t: PlannerTopicWithSubtopics[]) => void;
  setCurrentPlan: (p: WeekPlan | null) => void;
  setLoading: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setCelebratingDay: (d: string | null) => void;
  setQuickSession: (s: QuickSession | null) => void;
  setSessionLoading: (v: boolean) => void;
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  activeTab: "plan",
  topics: [],
  currentPlan: null,
  isLoading: false,
  isGenerating: false,
  celebratingDay: null,
  quickSession: null,
  isSessionLoading: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setTopics: (topics) => set({ topics }),
  setCurrentPlan: (currentPlan) => set({ currentPlan }),
  setLoading: (isLoading) => set({ isLoading }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setCelebratingDay: (celebratingDay) => set({ celebratingDay }),
  setQuickSession: (quickSession) => set({ quickSession }),
  setSessionLoading: (isSessionLoading) => set({ isSessionLoading }),
}));
