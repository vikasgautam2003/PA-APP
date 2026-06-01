import { create } from "zustand";
import type { CourseWeekPlan } from "@/types";
import type { PlannerCourse } from "@/lib/courses-registry";

interface CoursePlannerStore {
  active: { course: PlannerCourse; done: number; total: number }[];
  currentPlan: CourseWeekPlan | null;
  isLoading: boolean;
  isGenerating: boolean;
  celebratingDay: string | null;
  setActive: (a: CoursePlannerStore["active"]) => void;
  setCurrentPlan: (p: CourseWeekPlan | null) => void;
  setLoading: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setCelebratingDay: (d: string | null) => void;
}

export const useCoursePlannerStore = create<CoursePlannerStore>((set) => ({
  active: [],
  currentPlan: null,
  isLoading: false,
  isGenerating: false,
  celebratingDay: null,
  setActive: (active) => set({ active }),
  setCurrentPlan: (currentPlan) => set({ currentPlan }),
  setLoading: (isLoading) => set({ isLoading }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setCelebratingDay: (celebratingDay) => set({ celebratingDay }),
}));
