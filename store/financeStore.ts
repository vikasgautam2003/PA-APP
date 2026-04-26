import { create } from "zustand";
import type {
  FinanceData, SavingsProjection, ChatMessage,
  Transaction, CategorySummary, ScenarioProjection, MonthlySnapshot,
} from "@/types";

export type FinanceTab = "reality" | "crystal" | "guru";

interface FinanceStore {
  activeTab: FinanceTab;
  settingsOpen: boolean;
  data: FinanceData;
  projection: SavingsProjection | null;
  categorySummaries: CategorySummary[];
  transactions: Transaction[];
  snapshots: MonthlySnapshot[];
  scenarios: ScenarioProjection[];
  messages: ChatMessage[];
  isLoading: boolean;
  isChatLoading: boolean;

  setActiveTab: (t: FinanceTab) => void;
  setSettingsOpen: (v: boolean) => void;
  setData: (d: FinanceData) => void;
  setProjection: (p: SavingsProjection) => void;
  setCategorySummaries: (s: CategorySummary[]) => void;
  setTransactions: (t: Transaction[]) => void;
  setSnapshots: (s: MonthlySnapshot[]) => void;
  setScenarios: (s: ScenarioProjection[]) => void;
  addMessage: (m: ChatMessage) => void;
  clearChat: () => void;
  setLoading: (v: boolean) => void;
  setChatLoading: (v: boolean) => void;
}

const DEFAULT_DATA: FinanceData = {
  stipend: 0, rent: 0, food: 0, transport: 0,
  subscriptions: 0, misc: 0, savings_goal: 0,
  target_date: null, currency: "₹",
};

export const useFinanceStore = create<FinanceStore>((set) => ({
  activeTab: "reality",
  settingsOpen: false,
  data: DEFAULT_DATA,
  projection: null,
  categorySummaries: [],
  transactions: [],
  snapshots: [],
  scenarios: [],
  messages: [],
  isLoading: false,
  isChatLoading: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setData: (data) => set({ data }),
  setProjection: (projection) => set({ projection }),
  setCategorySummaries: (categorySummaries) => set({ categorySummaries }),
  setTransactions: (transactions) => set({ transactions }),
  setSnapshots: (snapshots) => set({ snapshots }),
  setScenarios: (scenarios) => set({ scenarios }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearChat: () => set({ messages: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setChatLoading: (isChatLoading) => set({ isChatLoading }),
}));
