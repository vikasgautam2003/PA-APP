import { create } from "zustand";

interface SettingsStore {
  isDark: boolean;
  geminiKey: string;
  toggleTheme: () => void;
  setGeminiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isDark: true,
  geminiKey: "",
  toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
  setGeminiKey: (key) => set({ geminiKey: key }),
}));