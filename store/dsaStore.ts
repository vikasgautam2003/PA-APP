import { create } from "zustand";
import type { DSAQuestionWithProgress, TopicProgress, CompanyProgress, HeatmapEntry } from "@/types";

type FilterDifficulty = "All" | "Easy" | "Medium" | "Hard";
type FilterStatus = "All" | "todo" | "solving" | "done";
export type MainTab = "overview" | "topics" | "companies";

interface DSAStore {
  questions: DSAQuestionWithProgress[];
  topics: string[];
  selectedTopic: string;
  selectedCompany: string;
  filterDifficulty: FilterDifficulty;
  filterStatus: FilterStatus;
  searchQuery: string;
  topicProgress: TopicProgress[];
  companyProgress: CompanyProgress[];
  heatmap: HeatmapEntry[];
  isLoading: boolean;
  mainTab: MainTab;

  setQuestions: (q: DSAQuestionWithProgress[]) => void;
  setTopicProgress: (t: TopicProgress[]) => void;
  setCompanyProgress: (c: CompanyProgress[]) => void;
  setHeatmap: (h: HeatmapEntry[]) => void;
  setSelectedTopic: (t: string) => void;
  setSelectedCompany: (c: string) => void;
  setFilterDifficulty: (d: FilterDifficulty) => void;
  setFilterStatus: (s: FilterStatus) => void;
  setSearchQuery: (q: string) => void;
  setLoading: (v: boolean) => void;
  setMainTab: (t: MainTab) => void;
  updateQuestionStatus: (id: number, status: "todo" | "solving" | "done") => void;
}

export const useDSAStore = create<DSAStore>((set) => ({
  questions: [],
  topics: [],
  selectedTopic: "All",
  selectedCompany: "All",
  filterDifficulty: "All",
  filterStatus: "All",
  searchQuery: "",
  topicProgress: [],
  companyProgress: [],
  heatmap: [],
  isLoading: false,
  mainTab: "overview",

  setQuestions: (questions) => {
    const topics = ["All", ...Array.from(new Set(questions.map((q) => q.topic)))];
    set({ questions, topics });
  },
  setTopicProgress: (topicProgress) => set({ topicProgress }),
  setCompanyProgress: (companyProgress) => set({ companyProgress }),
  setHeatmap: (heatmap) => set({ heatmap }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
  setSelectedCompany: (selectedCompany) => set({ selectedCompany }),
  setFilterDifficulty: (filterDifficulty) => set({ filterDifficulty }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  setMainTab: (mainTab) => set({ mainTab }),
  updateQuestionStatus: (id, status) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === id
          ? { ...q, status, solved_at: status === "done" ? new Date().toISOString() : q.solved_at }
          : q
      ),
    })),
}));
