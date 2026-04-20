import { create } from "zustand";
import type { Prompt } from "@/types";

interface PromptStore {
  prompts: Prompt[];
  searchQuery: string;
  selectedTag: string;
  selectedModel: string;
  isLoading: boolean;
  setPrompts: (p: Prompt[]) => void;
  setSearchQuery: (q: string) => void;
  setSelectedTag: (t: string) => void;
  setSelectedModel: (m: string) => void;
  setLoading: (v: boolean) => void;
  addPrompt: (p: Prompt) => void;
  updatePrompt: (p: Prompt) => void;
  deletePrompt: (id: number) => void;
}

export const usePromptStore = create<PromptStore>((set) => ({
  prompts: [],
  searchQuery: "",
  selectedTag: "All",
  selectedModel: "All",
  isLoading: false,
  setPrompts: (prompts) => set({ prompts }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setLoading: (isLoading) => set({ isLoading }),
  addPrompt: (p) => set((s) => ({ prompts: [p, ...s.prompts] })),
  updatePrompt: (p) => set((s) => ({ prompts: s.prompts.map((x) => x.id === p.id ? p : x) })),
  deletePrompt: (id) => set((s) => ({ prompts: s.prompts.filter((x) => x.id !== id) })),
}));
