import { create } from "zustand";
import type { FinanceData, SavingsProjection, ExpenseBreakdown, ChatMessage } from "@/types";

interface FinanceStore {
  data: FinanceData;
  projection: SavingsProjection | null;
  breakdown: ExpenseBreakdown[];
  messages: ChatMessage[];
  isLoading: boolean;
  isChatLoading: boolean;
  setData: (d: FinanceData) => void;
  setProjection: (p: SavingsProjection) => void;
  setBreakdown: (b: ExpenseBreakdown[]) => void;
  addMessage: (m: ChatMessage) => void;
  clearChat: () => void;
  setLoading: (v: boolean) => void;
  setChatLoading: (v: boolean) => void;
}

const DEFAULT_DATA: FinanceData = {
  stipend: 0, rent: 0, food: 0, transport: 0,
  subscriptions: 0, misc: 0, savings_goal: 0, target_date: null,
};

export const useFinanceStore = create<FinanceStore>((set) => ({
  data: DEFAULT_DATA,
  projection: null,
  breakdown: [],
  messages: [],
  isLoading: false,
  isChatLoading: false,
  setData: (data) => set({ data }),
  setProjection: (projection) => set({ projection }),
  setBreakdown: (breakdown) => set({ breakdown }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearChat: () => set({ messages: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setChatLoading: (isChatLoading) => set({ isChatLoading }),
}));