import { create } from "zustand";
import type { DSAQuestionWithProgress, TopicProgress, HeatmapEntry } from "@/types";

type FilterDifficulty = "All" | "Easy" | "Medium" | "Hard";
type FilterStatus = "All" | "todo" | "solving" | "done";

interface DSAStore {
  questions: DSAQuestionWithProgress[];
  topics: string[];
  selectedTopic: string;
  filterDifficulty: FilterDifficulty;
  filterStatus: FilterStatus;
  searchQuery: string;
  topicProgress: TopicProgress[];
  heatmap: HeatmapEntry[];
  isLoading: boolean;

  setQuestions: (q: DSAQuestionWithProgress[]) => void;
  setTopicProgress: (t: TopicProgress[]) => void;
  setHeatmap: (h: HeatmapEntry[]) => void;
  setSelectedTopic: (t: string) => void;
  setFilterDifficulty: (d: FilterDifficulty) => void;
  setFilterStatus: (s: FilterStatus) => void;
  setSearchQuery: (q: string) => void;
  setLoading: (v: boolean) => void;
  updateQuestionStatus: (
    id: number,
    status: "todo" | "solving" | "done"
  ) => void;
}

export const useDSAStore = create<DSAStore>((set) => ({
  questions: [],
  topics: [],
  selectedTopic: "All",
  filterDifficulty: "All",
  filterStatus: "All",
  searchQuery: "",
  topicProgress: [],
  heatmap: [],
  isLoading: false,

  setQuestions: (questions) => {
    const topics = ["All", ...Array.from(new Set(questions.map((q) => q.topic)))];
    set({ questions, topics });
  },
  setTopicProgress: (topicProgress) => set({ topicProgress }),
  setHeatmap: (heatmap) => set({ heatmap }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
  setFilterDifficulty: (filterDifficulty) => set({ filterDifficulty }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  updateQuestionStatus: (id, status) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id
          ? { ...q, status, solved_at: status === "done" ? new Date().toISOString() : q.solved_at }
          : q
      ),
    })),
}));